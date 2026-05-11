# ServiceNow Global Scope — dev388586

Customizations exported from the ServiceNow instance `dev388586.service-now.com`.

## Structure

```
declarative_actions/
  send_calendar_invitation.json          # Record metadata
  send_calendar_invitation.server.js     # Server-side script
  send_calendar_invitation.client.js     # Client-side script

ui_actions/
  conflict_calendar.json                 # Record metadata
  conflict_calendar.js                   # Script
```

## Declarative Actions

### Send Calendar Invitation
- **Table:** `task` (applies to incidents, changes, problems)
- **Type:** Server Script
- **Trigger:** List action — select one or more records and click the button
- **Behaviour:**
  - Resolves recipient emails from `caller_id`, `assigned_to`, `opened_by`, `requested_for`
  - Picks the best date field (`start_date`, `due_date`, etc.) or defaults to tomorrow 09:00 UTC
  - Builds a valid RFC 5545 `.ics` calendar file (1-hour event)
  - Inserts a `sys_email` record (`type=send-ready`, `state=ready`) and attaches the `.ics` via `GlideSysAttachment`

## Deployment

To redeploy any record, use the ServiceNow REST Table API:

```bash
# PATCH declarative action
curl -u "admin:<password>" \
  -H "Content-Type: application/json" \
  -X PATCH \
  "https://dev388586.service-now.com/api/now/table/sys_declarative_action_assignment/84b2e461c3b003101c70bf0d05013130" \
  -d '{"server_script": "<contents of .server.js>"}'
```
