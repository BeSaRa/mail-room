module.exports = function (app) {
    app.service('employeeService', function ($http,
                                             urlService,
                                             generator,
                                             langService,
                                             mailRoomTemplate,
                                             dialog,
                                             toast,
                                             $q,
                                             _,
                                             Employee,
                                             EmployeePermission,
                                             EntityPermission,
                                             permission,
                                             userInfoService,
                                             CurrentUser) {
        'ngInject';
        var self = this;

        self.employees = [];

        /**
         * @description Load the employees from server.
         * @param $event
         * @returns {Promise|employees}
         */
        self.loadEmployees = function ($event) {
            return $http.get(urlService.employees)
                .then(function (result) {
                    self.employees = generator.generateCollection(result.data, EmployeePermission, self._sharedMethods);
                    self.employees = generator.interceptReceivedCollection('EmployeePermission', self.employees);
                    return self.employees;
                })
                .catch(function (error) {
                    return [];
                });
        };

        /**
         * @description Get employees from self.employees if found and if not load it from server again.
         * @returns {Promise|employees}
         */
        self.getEmployees = function ($event) {
            return self.employees.length ? $q.when(self.employees) : self.loadEmployees($event);
        };

        /**
         * @description Loads the employee from database by id.
         * @param {Employee | number} employeeId
         * @param {boolean} updateEmployees
         * Indicates if newly fetched employee will be updated in the existing employees list.
         * @returns {Employee}
         */
        self.loadEmployeeById = function (employeeId, updateEmployees) {
            employeeId = employeeId instanceof Employee ? employeeId.id : employeeId;
            return $http.get(urlService.employees + '/' + employeeId)
                .then(function (result) {
                    result = generator.generateInstance(result.data.rs, Employee, self._sharedMethods);
                    result = generator.interceptReceivedInstance('Employee', result);

                    if (updateEmployees) {
                        if (self.employees.length) {
                            self.employees = _.map(self.employees, function (employee) {
                                if (employee.id === result.id) {
                                    employee = result;
                                }
                                return employee;
                            });
                        }
                        else {
                            self.employees.push(result);
                        }
                    }
                    return result;
                })
                .catch(function (error) {

                });
        };

        /**
         * @description Gets the employee from existing employees by id.
         * If employees list is empty, it will fetch from server and find employee by id.
         * @param {Employee | number} employeeId
         * @param {boolean} fetchNew
         * Indicates if employee will be fetched from server instead of finding from existing list of employees.
         * @param {boolean} updateEmployeesIfFetchNew
         * Indicates if newly fetched employee will be updated in the existing employees list.
         * It is used if fetchNew = true
         * @returns {Employee}
         */
        self.getEmployeeById = function (employeeId, fetchNew, updateEmployeesIfFetchNew) {
            employeeId = employeeId instanceof Employee ? employeeId.id : employeeId;
            if (fetchNew) {
                return self.loadEmployeeById(employeeId, updateEmployeesIfFetchNew)
                    .then(function (result) {
                        return result;
                    })
                    .catch(function (error) {

                    });
            }
            else {
                return _.find(self.employees, function (employee) {
                    return Number(employee.id) === Number(employeeId);
                });
            }
        };

        /**
         * @description Get the entities and employee permissions in them for the given employee
         * @param employeeId
         * @returns {*}
         */
        self.getEntitiesByEmployeeId = function (employeeId) {
            employeeId = employeeId.hasOwnProperty('id') ? employeeId.id : employeeId;
            return $http.get(urlService.employees + '/' + employeeId + '/entities')
                .then(function (result) {
                    result = generator.generateCollection(result.data, EntityPermission);
                    result = generator.interceptReceivedCollection('EntityPermission', result);
                    return result;
                });
        };

        /**
         * @description Contains methods for CRUD operations for employees
         */
        self.controllerMethod = {
            addDialog: function ($event) {
                return dialog
                    .showDialog({
                        targetEvent: $event,
                        template: mailRoomTemplate.getPopup('employee'),
                        controller: 'employeePopCtrl',
                        controllerAs: 'ctrl',
                        locals: {
                            editMode: false,
                            employeePermission: new EmployeePermission(),
                            employeeEntities: []
                        }
                    })
            },
            editDialog: function (employeePermission, $event) {
                return dialog
                    .showDialog({
                        targetEvent: $event,
                        template: mailRoomTemplate.getPopup('employee'),
                        controller: 'employeePopCtrl',
                        controllerAs: 'ctrl',
                        locals: {
                            editMode: true,
                            employeePermission: angular.copy(employeePermission)
                        },
                        resolve: {
                            employeeEntities: function () {
                                'ngInject';
                                return self.getEntitiesByEmployeeId(employeePermission.getEmployeeId());
                            }
                        }
                    })
            },
            delete: function (employee, $event) {
                employee = employee.hasOwnProperty('employee') ? employee.employee : employee;
                return dialog.confirmMessage(langService.get('msg_confirm_delete').change({name: employee.getNames()}))
                    .then(function () {
                        return self.deleteEmployee(employee);
                    });
            },
            deleteBulk: function (employees, $event) {
                return dialog.confirmMessage(langService.get('msg_confirm_delete_selected_multiple'))
                    .then(function (result) {
                        return self.deleteBulkEmployees(employees);
                    });
            },
            openPermissionsDialog: function (employeePermission, $event) {
                if (!employeePermission.permissions.length)
                    return;

                return dialog
                    .showDialog({
                        template: mailRoomTemplate.getPopup('employee-permissions'),
                        bindToController: true,
                        escToCancel: true,
                        targetEvent: $event,
                        controller: function () {
                        },
                        controllerAs: 'ctrl',
                        locals: {
                            employeePermission: angular.copy(employeePermission)
                        }
                    })
            }
        };

        /**
         * @description Adds new employee
         * @param employee
         * @returns {*}
         */
        self.addEmployee = function (employee) {
            return $http.post(urlService.employees, generator.interceptSendInstance('EmployeePermission', employee))
                .then(function (result) {
                    result = generator.generateInstance(result.data, EmployeePermission, self._sharedMethods);
                    return generator.interceptReceivedInstance('EmployeePermission', result);
                })
                .catch(function (error) {

                });
        };

        /**
         * @description Update the given employee.
         * @param employee
         * @returns {*}
         */
        self.updateEmployee = function (employee) {
            var id = employee.getEmployeeId();
            return $http.put(urlService.employees + '/' + id, generator.interceptSendInstance('EmployeePermission', employee))
                .then(function (result) {
                    result = generator.generateInstance(result.data, EmployeePermission, self._sharedMethods);
                    result = generator.interceptReceivedInstance('EmployeePermission', result);
                    // update system permissions in current user
                    if (userInfoService.isCurrentEmployee(result.employee)) {
                        userInfoService.setCurrentUser(result);
                    }
                    return result;
                })
                .catch(function (error) {

                });
        };

        /**
         * @description Delete given employee.
         * @param employee
         * @returns {HttpPromise}
         */
        self.deleteEmployee = function (employee) {
            employee = employee.getEmployeeId();
            return $http.delete(urlService.employees + '/' + employee)
                .then(function (result) {
                    if (result.status === 200)
                        return true;
                    else {
                        toast.error(langService.get('msg_error_occurred_while_processing_request'));
                        return false;
                    }
                })
                .catch(function (error) {
                    toast.error(langService.get('msg_error_occurred_while_processing_request'));
                    return false;
                });
        };

        /**
         * @description delete bulk employees.
         * @param employees
         * @return {Promise|null}
         */
        self.deleteBulkEmployees = function (employees) {
            //var bulkIds = employees[0].hasOwnProperty('id') ? _.map(employees, 'id') : employees;
            var bulkIds = [];
            if (employees[0].hasOwnProperty('employee')) {
                bulkIds = _.map(_.map(employees, 'employee'), 'id');
            }
            else {
                bulkIds = employees[0].hasOwnProperty('id') ? _.map(employees, 'id') : employees;
            }
            return $http({
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                url: urlService.employees + '/bulk',
                data: bulkIds
            }).then(function (result) {
                return generator.getBulkActionResponse(result, employees, false, 'msg_failed_delete_selected', 'msg_delete_success', 'msg_delete_success_except_following');
            });
        };

        /**
         * @description activate employee
         * @param employee
         * @param $event
         */
        self.changeEmployeeStatus = function (employee, $event) {
            var id = employee.getEmployeeId();
            return $http
                .put(urlService.employees + '/change-status/' + id)
                .then(function (result) {
                    if (result.status === 200)
                        return true;
                    else
                        return false;
                })
                .catch(function (error) {
                    return false;
                });
        };

        /**
         * @description Activate bulk of employees
         * @param employees
         * @param $event
         */
        self.activateBulkEmployees = function (employees, $event) {
            employees = employees[0].hasOwnProperty('employee') ? _.map(employees, 'employee') : employees;
            return $http
                .put(urlService.employees + '/activate/bulk', _.map(employees, 'id'))
                .then(function (result) {
                    return generator.getBulkActionResponse(result, employees, false, 'msg_failed_activate_selected', 'msg_success_activate_selected', 'msg_success_activate_selected_except_following');
                });
        };

        /**
         * @description Deactivate bulk of employees
         * @param employees
         * @param $event
         */
        self.deactivateBulkEmployees = function (employees, $event) {
            employees = employees[0].hasOwnProperty('employee') ? _.map(employees, 'employee') : employees;
            return $http
                .put(urlService.employees + '/deactivate/bulk', _.map(employees, 'id'))
                .then(function (result) {
                    return generator.getBulkActionResponse(result, employees, false, 'msg_failed_deactivate_selected', 'msg_success_deactivate_selected', 'msg_success_deactivate_selected_except_following');
                });
        };

        /**
         * @description Checks if record with same name exists. Returns true if exists
         * @param employee
         * @param editMode
         * @returns {boolean}
         */
        self.checkDuplicate = function (employee, editMode) {
            var employeesToFilter = self.employees;
            if (editMode) {
                employeesToFilter = _.filter(employeesToFilter, function (employeeToFilter) {
                    return employeeToFilter.employee.id !== employee.employee.id;
                });
            }
            return _.some(_.map(employeesToFilter, function (existingEmployee) {
                return existingEmployee.employee.getUsername().toLowerCase() === employee.employee.getUsername().toLowerCase()
                    || existingEmployee.employee.getMobileNumber() === employee.employee.getMobileNumber();
            }), function (matchingResult) {
                return matchingResult === true;
            });
        };

        /**
         * @description create the shared method to the model.
         * @type {{delete: generator.delete, update: generator.update}}
         * @private
         */
        self._sharedMethods = generator.generateSharedMethods(self.deleteEmployee, self.updateEmployee);

    })
};