var UploadExcelRunner = Class.create();
UploadExcelRunner.prototype = Object.extendsObject(AbstractAjaxProcessor, {

    runImport: function() {
        var dataSourceId = this.getParameter("sysparm_data_source_id");
        var fileName     = this.getParameter("sysparm_file_name");

        var dataSource = new GlideRecord("sys_data_source");
        if (!dataSource.get(dataSourceId)) {
            return "Data source not found: " + dataSourceId;
        }

        // Keep connection_url in sync with the uploaded filename
        var currentFile = "" + dataSource.getValue("file_path");
        if (fileName && currentFile !== fileName) {
            dataSource.setValue("file_path", fileName);
            dataSource.setValue("connection_url",
                "attachment://sys_data_source:" + dataSourceId + "/" + fileName);
            dataSource.update();
        }

        try {
            var loader      = new GlideImportSetLoader();
            var importSetGr = loader.getImportSetGr(dataSource);
            if (!importSetGr) {
                return "Failed to create import set";
            }
            var tableLoader = new GlideImportSetTableLoader(dataSource);
            tableLoader.execute(importSetGr);
            return "Import completed. Import set: " + importSetGr.getDisplayValue();
        } catch (ex) {
            return "Import error: " + ex;
        }
    },

    type: "UploadExcelRunner"
});
