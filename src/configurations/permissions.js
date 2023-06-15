module.exports = function (app) {
    app.config(function (permissionProvider) {
        'ngInject';


        var hasSysEntityPermission = function (currentUser, sysArr, entityArr) {
            var result = currentUser.hasThesePermissions(sysArr);

            if (!result)
                result = currentUser.hasThesePermissions(entityArr);

            return !!result;
        };

        permissionProvider
            .addMenuPermissions('menu_item_outgoing', ['ENT_SHOW_OUTGOING'])
            .addMenuPermissions('menu_item_incoming', ['ENT_SHOW_INCOMING'])
            .addMenuPermissions('menu_item_internal', ['ENT_SHOW_INTERNAL'])
            // group of system administration
            .addMenuPermissionGroup('menu_item_system_administration')
            .addMenuPermissions('menu_item_admin_employees', ['SYS_MANAGE_EMP'])
            .addMenuPermissions('menu_item_admin_entities', ['SYS_MANAGE_ENTITY'])
            .addMenuPermissions('menu_item_admin_entity_types', function () {
                return true;
            })
            .end()
            // group of report
            .addMenuPermissionGroup('menu_item_reports')
            .addMenuPermissions('menu_item_report_mail_details', function (currentUser) {
                return hasSysEntityPermission(currentUser, ['SYS_REPORT_ALL'], ['ENT_REPORT_ENTITY']);
            })
            .addMenuPermissions('menu_item_report_mail_action_details', function (currentUser) {
                return hasSysEntityPermission(currentUser, ['SYS_REPORT_ALL'], ['ENT_REPORT_ENTITY']);
            })
            .addMenuPermissions('menu_item_report_employee_details', function (currentUser) {
                return hasSysEntityPermission(currentUser, ['SYS_REPORT_ALL'], ['ENT_REPORT_ENTITY']);
            })
            .addMenuPermissions('menu_item_report_employee_statical', function (currentUser) {
                return hasSysEntityPermission(currentUser, ['SYS_REPORT_ALL'], ['ENT_REPORT_ENTITY']);
            })
            .addMenuPermissions('menu_item_report_department_statical', function (currentUser) {
                return hasSysEntityPermission(currentUser, ['SYS_REPORT_ALL'], ['ENT_REPORT_ENTITY']);
            })
            .end()
            .addMenuPermissions('menu_item_search', function (currentUser) {
                return hasSysEntityPermission(currentUser, ['SYS_SEARCH_ALL'], ['ENT_SEARCH_ENTITY']);
            });
    })
};
