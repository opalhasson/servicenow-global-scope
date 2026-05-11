var gr = current;

var emailFields = ["caller_id", "assigned_to", "opened_by", "requested_for"];
var emails = [];
for (var i = 0; i < emailFields.length; i++) {
    var field = emailFields[i];
    if (gr.isValidField(field) && gr[field].sys_id) {
        var user = new GlideRecord("sys_user");
        if (user.get(gr[field].sys_id.toString())) {
            var addr = user.getValue("email");
            if (addr && emails.indexOf(addr) === -1) {
                emails.push(addr);
            }
        }
    }
}

if (emails.length === 0) {
    gs.addErrorMessage("No user email found for record: " + gr.getDisplayValue());
} else {
    var startDT;
    var dateFields = ["u_scheduled_date", "start_date", "due_date", "u_due_date", "planned_start_date", "schedule_start"];
    for (var d = 0; d < dateFields.length; d++) {
        if (gr.isValidField(dateFields[d]) && gr.getValue(dateFields[d])) {
            var candidate = new GlideDateTime(gr.getValue(dateFields[d]));
            if (candidate.isValid()) { startDT = candidate; break; }
        }
    }
    if (!startDT) {
        startDT = new GlideDateTime();
        startDT.addDays(1);
        startDT.setValue(startDT.getDate() + " 09:00:00");
    }
    var endDT = new GlideDateTime(startDT.getValue());
    endDT.addSeconds(3600);

    var fmt = function(gdt) {
        var s = "" + gdt.getValue();
        return s.split("-").join("").split(":").join("").split(" ").join("T") + "Z";
    };

    var icalEscape = function(str) {
        var s = "" + (str || "");
        return s.split("\\").join("\\\\").split(";").join("\;").split(",").join("\\,").split("\n").join("\\n");
    };

    var summary     = icalEscape(gr.getDisplayValue("short_description") || gr.getDisplayValue("name") || gr.getValue("number") || gr.getUniqueValue());
    var description = icalEscape("Record: " + gr.getValue("number") + "\nTable: " + gr.getTableName());
    var uid         = gs.generateGUID() + "@dev388586.service-now.com";

    var attendeeLines = "";
    for (var a = 0; a < emails.length; a++) {
        attendeeLines += "ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;RSVP=TRUE:mailto:" + emails[a] + "\r\n";
    }

    var ics = "BEGIN:VCALENDAR\r\n" +
              "VERSION:2.0\r\n" +
              "PRODID:-//ServiceNow//CalendarInvite//EN\r\n" +
              "METHOD:REQUEST\r\n" +
              "BEGIN:VEVENT\r\n" +
              "UID:" + uid + "\r\n" +
              "DTSTAMP:" + fmt(new GlideDateTime()) + "\r\n" +
              "DTSTART:" + fmt(startDT) + "\r\n" +
              "DTEND:" + fmt(endDT) + "\r\n" +
              "SUMMARY:" + summary + "\r\n" +
              "DESCRIPTION:" + description + "\r\n" +
              attendeeLines +
              "STATUS:CONFIRMED\r\n" +
              "SEQUENCE:0\r\n" +
              "END:VEVENT\r\n" +
              "END:VCALENDAR";

    var subject = "Calendar Invitation: " + (gr.getDisplayValue("short_description") || gr.getValue("number"));
    var body    = "You have received a calendar invitation for:\n\n" +
                  "Record:     " + gr.getValue("number") + "\n" +
                  "Summary:    " + gr.getDisplayValue("short_description") + "\n" +
                  "Start Time: " + startDT.getDisplayValue() + "\n\n" +
                  "Open the attached .ics file to add this event to your calendar.";

    for (var e = 0; e < emails.length; e++) {
        var emailGR = new GlideRecord("sys_email");
        emailGR.setValue("type", "send-ready");
        emailGR.setValue("state", "ready");
        emailGR.setValue("to", emails[e]);
        emailGR.setValue("subject", subject);
        emailGR.setValue("body_text", body);
        emailGR.setValue("body", body);
        emailGR.insert();

        // Attach .ics directly to emailGR — no re-fetch needed after insert()
        var sa = new GlideSysAttachment();
        sa.write(emailGR, "invite.ics", "text/calendar", ics);
    }

    gs.addInfoMessage("Calendar invitation sent to: " + emails.join(", "));
}