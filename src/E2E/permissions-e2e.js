module.exports = function (app) {
    app.run(function ($httpBackend,
                      urlService,
                      Permission,
                      generator,
                      _) {
        'ngInject';

        var urlWithId = new RegExp(urlService.permissions + '\/(\\d+)$');

        /**
         * List of fake permissions
         * @type {*[]}
         */
        var permissions = [
            {
                "id": 1,
                "arName": "تقارير النظام",
                "enName": "Report On all",
                "permissionKey": "SYS_REPORT_ALL"
            },
            {
                "arName": "البحث في الكل",
                "enName": "Search on all",
                "id": 2,
                "permissionKey": "SYS_SEARCH_ALL"
            },
            {
                "arName": "ادارة الموظفين",
                "enName": "Manage employee",
                "id": 3,
                "permissionKey": "SYS_MANAGE_EMP"
            },
            {
                "arName": "ادارة الجهات",
                "enName": "Manage entities",
                "id": 4,
                "permissionKey": "SYS_MANAGE_ENTITY"
            },
            {
                "arName": "اضافة بريد",
                "enName": "Add mail",
                "id": 5,
                "permissionKey": "ENT_ADD_MAIL"
            },
            {
                "arName": "تقارير العمليات",
                "enName": "Report operation",
                "id": 6,
                "permissionKey": "ENT_AUDIT_REPORT"
            },
            {
                "arName": "تعديل بريد",
                "enName": "Update mail",
                "id": 7,
                "permissionKey": "ENT_UPDATE_MAIL"
            },
            {
                "arName": "حذف بريد",
                "enName": "Delete mail",
                "id": 8,
                "permissionKey": "ENT_DELETE_MAIL"
            },
            {
                "arName": "البحث في الجهة",
                "enName": "Search entity",
                "id": 9,
                "permissionKey": "ENT_SEARCH_ENTITY"
            },
            {
                "arName": "تقارير الجهة",
                "enName": "Report entity",
                "id": 10,
                "permissionKey": "ENT_REPORT_ENTITY"
            },
            {
                "arName": "تقارير عمليات النظام",
                "enName": "Report operation",
                "id": 11,
                "permissionKey": "SYS_AUDIT_REPORT"
            }
        ];

        /**
         * Interceptor to fake get request and respond with the list of fake permissions
         */
        $httpBackend.whenGET(urlService.permissions).respond(function () {
            return [200, permissions];
        });

        // add new permission
        $httpBackend
            .whenPOST(urlService.permissions)
            .respond(function (method, url, data) {
                var permission = JSON.parse(data);
                // create new id for model
                permission.id = generator.createNewID(permissions, 'id');
                // push model to collections
                permissions.push(permission);
                return [200, permission];
            });

        // edit permission
        $httpBackend.whenPUT(urlService.permissions)
            .respond(function (method, url, data) {
                var permission = new Permission(JSON.parse(data));

                for (var i = 0; i < permissions.length; i++) {
                    if (permissions[i].id === permission.id) {
                        permissions[i] = permission;
                        break;
                    }
                }
                return [200, permission];
            });

        // delete permission single
        $httpBackend.whenDELETE(function (url) {
            return urlWithId.test(url);
        }).respond(function (method, url, data) {
            var id = url.split('/').pop();
            for (var i = 0; i < permissions.length; i++) {
                if (permissions[i].id === id) {
                    permissions.splice(i, 1);
                }
            }
            return [200];
        });


    })
};