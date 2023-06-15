module.exports = function (app) {
    app.controller('employeeCtrl', function (employeeService,
                                             $q,
                                             _,
                                             langService,
                                             $filter,
                                             toast,
                                             generator,
                                             helpService,
                                             gridService,
                                             authenticationService,
                                             userInfoService,
                                             $state) {
        'ngInject';
        var self = this;

        self.controllerName = 'employeeCtrl';
        helpService.setHelpTo('employees');

        self.employees = employeeService.employees;
        self.employeesCopy = generator.shallowCopyArray(self.employees);

        /**
         * @description Contains options for grid configuration
         * @type {{limit: number, page: number, order: string, limitOptions: *[], columns: string[], showColumn: (function(*=): boolean), sortCallback: sortCallback}}
         */
        self.grid = {
            name: 'employees',
            progress: null,
            selectedRecords: [],
            limit: 5, // default limit
            page: 1, // first page
            order: '', // default sorting column with order(- for desc),
            limitOptions: gridService.getGridLimitOptions(self.employees),
            columns: {
                arabicName: {
                    langKey: 'header_arabic_name',
                    searchKey: function () {
                        return 'employee.arName';
                    },
                    sortKey: function () {
                        return 'employee.arName';
                    }
                },
                englishName: {
                    langKey: 'header_english_name',
                    searchKey: function () {
                        return 'employee.enName';
                    },
                    sortKey: function () {
                        return 'employee.enName';
                    }
                },
                userName: {
                    langKey: 'header_username',
                    searchKey: function () {
                        return 'employee.userName';
                    },
                    sortKey: function () {
                        return 'employee.userName';
                    }
                },
                status: {
                    langKey: 'header_status',
                },
                mobileNumber: {
                    langKey: 'header_mobile_number',
                    searchKey: function () {
                        return 'employee.mobileNumber';
                    },
                    sortKey: function () {
                        return 'employee.mobileNumber';
                    }
                },
                permissions: {
                    langKey: 'header_permissions'
                },
                gridActions: {
                    langKey: 'header_actions',
                    hide: function () {
                        return !self.employees.length;
                    }
                }
            },
            columnsCount: function (includeHidden) {
                return gridService.getColumnsCount(self.grid, includeHidden);
            },
            colSpan: function () {
                return gridService.getColSpan(self.grid);
            },
            showColumn: function (column, isHeader) {
                return gridService.isShowColumn(self.grid, column, isHeader);
            },
            sortCallback: function (sortKey) {
                self.employees = gridService.sortGridData(self.grid, self.employees);
            },
            searchText: '',
            searchCallback: function () {
                self.employees = gridService.searchGridData(self.grid, self.employeesCopy);
                gridService.resetSorting(self.grid);
                self.grid.sortCallback();
            },
            reload: function (pageNumber, $event) {
                var defer = $q.defer();
                self.grid.progress = defer.promise;

                return employeeService.loadEmployees($event)
                    .then(function (result) {
                        self.employees = result;
                        self.employeesCopy = generator.shallowCopyArray(self.employees);
                        self.grid.selectedRecords = [];
                        defer.resolve(true);
                        if (pageNumber)
                            self.grid.page = pageNumber;
                        gridService.resetSearchText(self.grid);
                        gridService.resetSorting(self.grid);
                        self.grid.sortCallback();
                        return result;
                    });
            }
        };

        /**
         *@description Contains methods for CRUD operations for job titles
         */
        self.statusServices = {
            activate: employeeService.activateBulkEmployees,
            deactivate: employeeService.deactivateBulkEmployees,
            /*true: employeeService.activateEmployee,
            false: employeeService.deactivateEmployee,*/
            single: employeeService.changeEmployeeStatus
        };

        /**
         * @description Opens the read-only permissions dialog
         * @param employee
         * @param $event
         * @returns {*}
         */
        self.openPermissionsDialog = function (employee, $event) {
            return employeeService.controllerMethod.openPermissionsDialog(employee, $event);
        };

        /**
         * @description Opens the dialog to add employee.
         * @param $event
         */
        self.openAddEmployeeDialog = function ($event) {
            return employeeService.controllerMethod.addDialog($event)
                .then(function (result) {
                    self.grid.reload(self.grid.page)
                        .then(function () {
                            result = result.hasOwnProperty('employee') ? result.employee : result;
                            toast.success(langService.get('msg_add_success').change({name: result.getNames()}));
                        })
                })
        };

        /**
         * @description Opens the dialog to edit employee.
         * @param employee
         * @param $event
         */
        self.openEditEmployeeDialog = function (employee, $event) {
            return employeeService.controllerMethod.editDialog(employee, $event)
                .then(function (result) {
                    self.grid.reload(self.grid.page)
                        .then(function () {
                            result = result.hasOwnProperty('employee') ? result.employee : result;
                            toast.success(langService.get('msg_edit_specific_success').change({name: result.getNames()}));
                        })
                })
        };

        /**
         * @description Change the status of employee from grid
         * @param employee
         * @param $event
         */
        self.changeEmployeeStatus = function (employee, $event) {
            self.statusServices.single(employee, $event)
                .then(function (result) {
                    if (result)
                        toast.success(langService.get('msg_status_success'));
                    else {
                        employee.employee.active = !employee.employee.active;
                        dialog.errorMessage(langService.get('msg_something_happened_when_update_status'));
                    }
                })
                .catch(function () {
                    employee.employee.active = !employee.employee.active;
                    dialog.errorMessage(langService.get('msg_something_happened_when_update_status'));
                });
        };

        /**
         * @description Change the status of selected employees
         * @param status
         * @param $event
         */
        self.changeBulkEmployeesStatus = function (status, $event) {
            var updatedStatus = (status === 'activate');
            var selectedEmployees = _.map(self.grid.selectedRecords, 'employee');
            if (!generator.checkCollectionStatus(selectedEmployees, updatedStatus, 'active')) {
                toast.success(langService.get(updatedStatus ? 'msg_success_activate_selected' : 'msg_success_deactivate_selected'));
                return;
            }
            self.statusServices[status](self.grid.selectedRecords, $event).then(function () {
                self.grid.reload(self.grid.page);
            });
        };

        /**
         * @description Removes the given employee
         * @param employee
         * @param $event
         */
        self.removeEmployee = function (employee, $event) {
            employeeService.controllerMethod.delete(employee, $event)
                .then(function (result) {
                    if (result) {
                        self.grid.reload(self.grid.page).then(function () {
                            toast.success(langService.get("msg_delete_specific_success").change({name: employee.getNames()}));
                        });
                    }
                })
                .catch(function (error) {
                    toast.error(langService.get('msg_error_occurred_while_processing_request'));
                });
        };

        /**
         * @description Removes the selected employees
         * @param $event
         */
        self.removeBulkEmployees = function ($event) {
            employeeService.controllerMethod.deleteBulk(self.grid.selectedRecords, $event)
                .then(function (result) {
                    self.grid.reload(self.grid.page);
                })
                .catch(function (error) {

                });
        };


        /**
         * @description
         * @param employee
         * @param $event
         */
        self.changePassword = function (employee, $event) {
            authenticationService.openChangePasswordPopup(employee, true, true, $event)
                .then(function () {
                    toast.success(langService.get("msg_successfully_password_changed"));
                }).catch(function (error) {
                if (error === 'error_update_password')
                    toast.error(langService.get('error_update_password'))
            });
        }

        self.isCurrentEmployee = function (employee) {
            return userInfoService.isCurrentEmployee(employee);
        }
    });
};
