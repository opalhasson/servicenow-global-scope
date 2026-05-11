function goToCalendarView() {
    var tgtInstance = g_form.getValue('target_instance');
    var scheduledTime = g_form.getValue('scheduled');
    var cloneRecSysId = g_form.getValue('cloneRecordSysId');
    if (!tgtInstance) {
        alert('Target instance is required to use conflict calendar.');
        return false;
    }

    var ga = new GlideAjax('InstanceCloneManagerAjax');
    ga.addParam('sysparm_name', 'getCalendarParams');
    ga.addParam('sysparm_tgtInstance', tgtInstance);
    ga.addParam('sysparm_scheduled', scheduledTime);
    ga.addParam('sysparm_cloneRecSysId', cloneRecSysId);
    ga.getXML(function(response) {
        var answer = response.responseXML.documentElement.getAttribute("answer") || '';
        if (answer) {
            answer = answer.evalJSON();
            g_navigation.openPopup("clone_request_calendar_view.do?sysparm_instanceId=" + answer.instanceId + "&sysparm_startDate=" + answer.start_date + "&sysparm_endDate=" + answer.end_date);
        }
    });
}