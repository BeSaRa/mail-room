module.exports = function (app) {
    app.run(function ($httpBackend,
                      urlService,
                      Employee,
                      generator,
                      _) {
        'ngInject';

        var urlWithId = new RegExp(urlService.employees + '\/(\\d+)$');
        var urlChangeStatus = new RegExp(urlService.employees + '/change-status' + '\/(\\d+)');
        /**
         * @description List of fake employees
         * @type {*[]}
         */
        var employees = [
            {
                "employee": {
                    "active": true,
                    "mobileNumber": "+97412345678",
                    "deleted": false,
                    "defaultEntity": 19,
                    "id": 29,
                    "arName": " اسم عربي",
                    "enName": "new engl66ish",
                    "userName": "user2"
                },
                "permissions": [
                    {
                        "permissionKey": "ENT_ADD_MAIL",
                        "authority": "ENT_ADD_MAIL",
                        "id": 5,
                        "arName": "اضافة بريد",
                        "enName": "add mail"
                    },
                    {
                        "permissionKey": "SYS_REPORT_ALL",
                        "authority": "SYS_REPORT_ALL",
                        "id": 1,
                        "arName": "تقارير النظام",
                        "enName": "report on all"
                    },
                    {
                        "permissionKey": "SYS_SEARCH_ALL",
                        "authority": "SYS_SEARCH_ALL",
                        "id": 2,
                        "arName": "البحث في الكل",
                        "enName": "search on all"
                    }
                ]
            },
            {
                "employee": {
                    "active": false,
                    "mobileNumber": "+97412345678",
                    "deleted": false,
                    "defaultEntity": 19,
                    "id": 38,
                    "arName": "ش1",
                    "enName": "a1",
                    "userName": "emp1"
                },
                "permissions": [
                    {
                        "permissionKey": "SYS_SEARCH_ALL",
                        "authority": "SYS_SEARCH_ALL",
                        "id": 2,
                        "arName": "البحث في الكل",
                        "enName": "search on all"
                    },
                    {
                        "permissionKey": "SYS_AUDIT_REPORT",
                        "authority": "SYS_AUDIT_REPORT",
                        "id": 11,
                        "arName": "تقارير عمليات النظام",
                        "enName": "report operation"
                    },
                    {
                        "permissionKey": "SYS_REPORT_ALL",
                        "authority": "SYS_REPORT_ALL",
                        "id": 1,
                        "arName": "تقارير النظام",
                        "enName": "report on all"
                    }
                ]
            },
            {
                "employee": {
                    "active": true,
                    "mobileNumber": "+97412345679",
                    "deleted": false,
                    "defaultEntity": 19,
                    "id": 39,
                    "arName": "ش2",
                    "enName": "a2",
                    "userName": "emp2"
                },
                "permissions": [
                    {
                        "permissionKey": "SYS_REPORT_ALL",
                        "authority": "SYS_REPORT_ALL",
                        "id": 1,
                        "arName": "تقارير النظام",
                        "enName": "report on all"
                    },
                    {
                        "permissionKey": "SYS_MANAGE_ENTITY",
                        "authority": "SYS_MANAGE_ENTITY",
                        "id": 4,
                        "arName": "ادارة الجهات",
                        "enName": "manage entities"
                    }
                ]
            },
            {
                "employee": {
                    "active": true,
                    "mobileNumber": "+97412345678",
                    "deleted": false,
                    "defaultEntity": null,
                    "id": 40,
                    "arName": "ش3",
                    "enName": "a3",
                    "userName": "emp3"
                },
                "permissions": [
                    {
                        "permissionKey": "SYS_MANAGE_ENTITY",
                        "authority": "SYS_MANAGE_ENTITY",
                        "id": 4,
                        "arName": "ادارة الجهات",
                        "enName": "manage entities"
                    },
                    {
                        "permissionKey": "SYS_REPORT_ALL",
                        "authority": "SYS_REPORT_ALL",
                        "id": 1,
                        "arName": "تقارير النظام",
                        "enName": "report on all"
                    },
                    {
                        "permissionKey": "SYS_SEARCH_ALL",
                        "authority": "SYS_SEARCH_ALL",
                        "id": 2,
                        "arName": "البحث في الكل",
                        "enName": "search on all"
                    },
                    {
                        "permissionKey": "SYS_AUDIT_REPORT",
                        "authority": "SYS_AUDIT_REPORT",
                        "id": 11,
                        "arName": "تقارير عمليات النظام",
                        "enName": "report operation"
                    }
                ]
            },
            {
                "employee": {
                    "active": true,
                    "mobileNumber": "+97412345678",
                    "deleted": false,
                    "defaultEntity": null,
                    "id": 41,
                    "arName": "ثةح4",
                    "enName": "emp4",
                    "userName": "emp4"
                },
                "permissions": [
                    {
                        "permissionKey": "SYS_REPORT_ALL",
                        "authority": "SYS_REPORT_ALL",
                        "id": 1,
                        "arName": "تقارير النظام",
                        "enName": "report on all"
                    }
                ]
            },
            {
                "employee": {
                    "active": true,
                    "mobileNumber": "+97412345678",
                    "deleted": false,
                    "defaultEntity": 40,
                    "id": 42,
                    "arName": "ثةح5",
                    "enName": "emp5",
                    "userName": "emp5"
                },
                "permissions": [
                    {
                        "permissionKey": "SYS_AUDIT_REPORT",
                        "authority": "SYS_AUDIT_REPORT",
                        "id": 11,
                        "arName": "تقارير عمليات النظام",
                        "enName": "report operation"
                    },
                    {
                        "permissionKey": "SYS_MANAGE_ENTITY",
                        "authority": "SYS_MANAGE_ENTITY",
                        "id": 4,
                        "arName": "ادارة الجهات",
                        "enName": "manage entities"
                    }
                ]
            }
        ];

        /**
         * Interceptor to fake get request and respond with the list of fake employees
         */
        $httpBackend.whenGET(urlService.employees).respond(function () {
            return [200, employees];
        });

        // add new employee
        $httpBackend
            .whenPOST(urlService.employees)
            .respond(function (method, url, data) {
                var employee = JSON.parse(data);
                // create new id for model
                employee.employee.id = generator.createNewID(_.map(employees, 'employee'), 'id');
                // push model to collections
                employees.push(employee);
                return [200, employee];
            });

        // edit employee
        $httpBackend.whenPUT(function (url) {
            return urlWithId.test(url);
        }).respond(function (method, url, data) {
            var employee = new Employee(JSON.parse(data));
            var id = url.split('/').pop();
            for (var i = 0; i < employees.length; i++) {
                if (employees[i].employee.id === parseInt(id)) {
                    employees[i] = employee;
                    break;
                }
            }
            return [200, employee];
        });

        // delete employee single
        $httpBackend.whenDELETE(function (url) {
            return urlWithId.test(url);
        }).respond(function (method, url, data) {
            var id = url.split('/').pop();
            for (var i = 0; i < employees.length; i++) {
                if (employees[i].employee.id === parseInt(id)) {
                    employees.splice(i, 1);
                }
            }
            return [200];
        });

        /*  // delete employee bulk
          $httpBackend.whenDELETE(urlService.employees + '/bulk').respond(function (method, url, data) {
              var employeesToDelete = JSON.parse(data);

              for (var i = 0; i < employeesToDelete.length; i++) {
                  for (var j = 0; j < employees.length; j++) {
                      if (employees[j].id === employees[i]) {
                          employees.splice(j, 1);
                          break;
                      }
                  }
              }
              return [200, true];
          });*/


        // change status for single employee
        $httpBackend.whenPUT(function (url) {
            return urlChangeStatus.test(url);
        }).respond(function (method, url, data) {
            var id = url.split('/').pop();

            var employee = _.find(employees, function (ent) {
                return ent.employee.id === parseInt(id);
            });

            employee.employee.active = !employee.employee.active;

            return [200];
        });
        /*

                // activate employee status bulk
                $httpBackend.whenPUT((urlService.employees + '/activate/bulk')).respond(function (method, url, data) {
                    var employeesToActivate = JSON.parse(data);
                    for (var i = 0; i < employeesToActivate.length; i++) {
                        for (var j = 0; j < employees.length; j++) {
                            if (employees[j].id === employeesToActivate[i]) {
                                employees[j].active = true;
                                break;
                            }
                        }
                    }
                    return [200, response.setResponse(true)];
                });

                // Deactivate employee status bulk
                $httpBackend.whenPUT((urlService.employees + '/deactivate/bulk')).respond(function (method, url, data) {
                    var employeesToDeactivate = JSON.parse(data);
                    for (var i = 0; i < employeesToDeactivate.length; i++) {
                        for (var j = 0; j < employeesToDeactivate.length; j++) {
                            if (employees[j].id === employeesToDeactivate[i]) {
                                employees[j].status = false;
                                break;
                            }
                        }
                    }
                    return [200, response.setResponse(true)];
                });*/


    })
};