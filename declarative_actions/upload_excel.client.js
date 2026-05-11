function onClick() {
    var DATA_SOURCE_ID = '181fa161c3f803101c70bf0d050131b7';

    var input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', function() {
        var file = input.files[0];
        document.body.removeChild(input);
        if (!file) return;

        var token = window.g_ck ||
            (window.NOW && window.NOW.session && window.NOW.session.token) || '';
        var authHeaders = { 'Accept': 'application/json', 'X-UserToken': token };

        fetch('/api/now/attachment?sysparm_query=table_name%3Dsys_data_source%5Etable_sys_id%3D' + DATA_SOURCE_ID, {
            headers: authHeaders
        })
        .then(function(r) { return r.json(); })
        .then(function(data) {
            var atts = data.result || [];
            return Promise.all(atts.map(function(a) {
                return fetch('/api/now/attachment/' + a.sys_id, {
                    method: 'DELETE', headers: authHeaders
                });
            }));
        })
        .then(function() {
            var fd = new FormData();
            fd.append('file', file, file.name);
            return fetch(
                '/api/now/attachment/file?table_name=sys_data_source&table_sys_id=' +
                    DATA_SOURCE_ID + '&file_name=' + encodeURIComponent(file.name),
                { method: 'POST', headers: { 'X-UserToken': token, 'Accept': 'application/json' }, body: fd }
            );
        })
        .then(function(r) { return r.json(); })
        .then(function(att) {
            if (!att.result) throw new Error('Upload failed: ' + JSON.stringify(att));
            var ga = new GlideAjax('UploadExcelRunner');
            ga.addParam('sysparm_name', 'runImport');
            ga.addParam('sysparm_data_source_id', DATA_SOURCE_ID);
            ga.addParam('sysparm_file_name', file.name);
            ga.getXMLAnswer(function(answer) { alert(answer); });
        })
        .catch(function(err) {
            alert('Error: ' + (err.message || err));
        });
    });

    input.click();
}
