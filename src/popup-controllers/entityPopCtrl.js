module.exports = function (app) {
    app.controller('entityPopCtrl', function ($q,
                                              _,
                                              toast,
                                              $filter,
                                              $timeout,
                                              $scope,
                                              langService,
                                              dialog,
                                              entityService,
                                              lookupService,
                                              entity,
                                              editMode,
                                              entityTypeService,
                                              Entity,
                                              validationService,
                                              employeeService,
                                              permissionService,
                                              generator,
                                              EntityPermission,
                                              parentEntity,
                                              userInfoService,
                                              gridService) {
        'ngInject';
        var self = this;
        self.controllerName = 'entityPopCtrl';
        self.editMode = editMode;
        self.parentEntity = parentEntity;
        self.entity = entity;
        self.model = angular.copy(self.entity);

        self.employees = employeeService.employees;

        self.entityEmployees = [];
        self.entityEmployeesCopy = generator.shallowCopyArray(self.entityEmployees);

        self.departments = [];
        self.departmentsCopy = generator.shallowCopyArray(self.departments);

        self.tabsToShow = {
            basicInfo: {
                name: 'basic',
                key: 'lbl_basic_info'
            },
            employees: {
                name: 'employees',
                key: 'lbl_employees',
                hide: !!parentEntity
            },
            departments: {
                name: 'departments',
                key: 'lbl_departments',
                hide: !!parentEntity
            }
        };
        self.showTab = function (tab) {
            return !tab.hide;
        };
        self.selectedTabName = self.tabsToShow.basicInfo.name.toLowerCase();
        self.selectedTabIndex = 0;
        self.setCurrentTab = function (tab, $event) {
            self.selectedTabName = tab.name.toLowerCase();
            var grid = null;
            if (self.isTabSelected(self.tabsToShow.employees)) {
                grid = self.entityEmployeesGrid;
            } else if (self.isTabSelected(self.tabsToShow.departments)) {
                grid = self.departmentsGrid;
            }
            if (grid) {
                grid.reload();
            }
        };
        self.isTabSelected = function (tab) {
            return self.selectedTabName.toLowerCase() === tab.name.toLowerCase()
        };
        self.changeTab = function (tab) {
            Object.keys(self.tabsToShow).forEach(function (key, index) {
                if (self.tabsToShow[key].name.toLowerCase() === tab.name.toLowerCase()) {
                    self.selectedTabIndex = index;
                }
            });
        };

        self.entityTypes = entityTypeService.entityTypes;

        self.fieldsAndLabelsToValidate = {
            arName: 'lbl_arabic_name',
            enName: 'lbl_english_name',
            responsibleName: 'lbl_responsible_name',
            responsibleEmail: 'lbl_responsible_email',
            active: 'lbl_status',
            entityTypeId: 'lbl_entity_type',
            isUseSystem: 'lbl_use_system'
        };

        /**
         * @description Adds the new entity
         * @param $event
         */
        self.addEntity = function ($event) {
            validationService
                .createValidation('ADD_ENTITY')
                .addStep('check_required', true, generator.checkRequiredFields, self.entity, function (result) {
                    return !result.length;
                })
                .notifyFailure(function (step, result) {
                    var labels = _.map(result, function (label) {
                        return self.fieldsAndLabelsToValidate[label];
                    });
                    generator.generateErrorFields('lbl_check_these_fields', labels);
                })
                .addStep('check_duplicate', true, entityService.checkDuplicate, [self.entity, false], function (result) {
                    return !result;
                }, true)
                .notifyFailure(function () {
                    toast.error(langService.get('error_name_code_duplicate'));
                })
                .validate()
                .then(function () {
                    entityService.addEntity(self.entity)
                        .then(function (result) {
                            dialog.hide(result);
                        });
                })
                .catch(function () {

                })
        };

        /**
         * @description Updates the existing entity
         * @param $event
         */
        self.saveEntity = function ($event) {
            validationService
                .createValidation('UPDATE_ENTITY')
                .addStep('check_required', true, generator.checkRequiredFields, self.entity, function (result) {
                    return !result.length;
                })
                .notifyFailure(function (step, result) {
                    var labels = _.map(result, function (label) {
                        return self.fieldsAndLabelsToValidate[label];
                    });
                    generator.generateErrorFields('lbl_check_these_fields', labels);
                })
                .addStep('check_duplicate', true, entityService.checkDuplicate, [self.entity, true], function (result) {
                    return !result;
                }, true)
                .notifyFailure(function () {
                    toast.error(langService.get('error_name_code_duplicate'));
                })
                .validate()
                .then(function () {
                    entityService.updateEntity(self.entity)
                        .then(function (result) {
                            dialog.hide(result);
                        });
                })
                .catch(function () {

                })
        };

        /**
         * @description Resets the form
         * @param form
         * @param $event
         */
        self.resetEntityForm = function (form, $event) {
            generator.resetFields(self.entity, angular.copy(self.model));
            form.$setUntouched();
        };

        /**
         * @description Contains options for entityEmployeesGrid configuration
         * @type {{limit: number, page: number, order: string, limitOptions: *[], columns: string[], showColumn: (function(*=): boolean), sortCallback: sortCallback}}
         */
        self.entityEmployeesGrid = {
            name: 'entityEmployees',
            progress: null,
            selectedRecords: [],
            limit: 5, // default limit
            page: 1, // first page
            order: '', // default sorting column with order(- for desc),
            limitOptions: gridService.getGridLimitOptions(self.entityEmployees),
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
                    },
                    hide: true
                },
                status: {
                    langKey: 'header_status',
                    hide: true
                },
                mobileNumber: {
                    langKey: 'header_mobile_number',
                    searchKey: function () {
                        return 'employee.mobileNumber';
                    },
                    sortKey: function () {
                        return 'employee.mobileNumber';
                    },
                    hide: true
                },
                permissions: {
                    langKey: 'header_permissions'
                },
                gridActions: {
                    langKey: 'header_actions',
                    hide: function () {
                        return !self.entityEmployees.length;
                    }
                }
            },
            columnsCount: function (includeHidden) {
                return gridService.getColumnsCount(self.entityEmployeesGrid, includeHidden);
            },
            colSpan: function () {
                return gridService.getColSpan(self.entityEmployeesGrid);
            },
            showColumn: function (column, isHeader) {
                return gridService.isShowColumn(self.entityEmployeesGrid, column, isHeader);
            },
            sortCallback: function (sortKey) {
                self.entityEmployees = gridService.sortGridData(self.entityEmployeesGrid, self.entityEmployees);
            },
            searchText: '',
            searchCallback: function () {
                self.entityEmployees = gridService.searchGridData(self.entityEmployeesGrid, self.entityEmployeesCopy);
                gridService.resetSorting(self.entityEmployeesGrid);
                self.entityEmployeesGrid.sortCallback();
            },
            reload: function (pageNumber, $event) {
                var defer = $q.defer();
                self.entityEmployeesGrid.progress = defer.promise;

                return entityService.employeeMethods.loadEmployeesByEntityId(self.model.getEntityId(), $event)
                    .then(function (result) {
                        self.entityEmployees = result;
                        self.entityEmployeesCopy = generator.shallowCopyArray(self.entityEmployees);
                        self.entityEmployeesGrid.selectedRecords = [];
                        defer.resolve(true);
                        if (pageNumber)
                            self.entityEmployeesGrid.page = pageNumber;
                        gridService.resetSearchText(self.entityEmployeesGrid);
                        gridService.resetSorting(self.entityEmployeesGrid);
                        self.entityEmployeesGrid.sortCallback();
                        return result;
                    });
            }
        };

        self.showEntityEmployeeForm = false;

        /**
         * @description Opens the add employee to entity form.
         * @param $event
         */
        self.openAddEntityEmployeeForm = function ($event) {
            self.showEntityEmployeeForm = true;
            self.entityEmployeeEditMode = false;
        };

        /**
         * @description Opens the edit entity employee form.
         * @param entityEmployee
         * @param $event
         */
        self.openEditEntityEmployeeForm = function (entityEmployee, $event) {
            self.showEntityEmployeeForm = true;
            self.entityEmployeeEditMode = true;
            $timeout(function () {
                self.entityEmployeeCopy = angular.copy(entityEmployee);
                self.selectedAvailableEmployee = self.entityEmployeeCopy;
                self.selectedPermissions = self.entityEmployeeCopy.permissions;
            });
        };

        /**
         * @description Close the add employee to entity form
         * @param $event
         */
        self.hideEntityEmployeeForm = function ($event) {
            _resetEntityEmployeeForm();
            self.showEntityEmployeeForm = false;
        };

        /**
         * @description Resets the entity employee form
         * @param $event
         */
        var _resetEntityEmployeeForm = function ($event) {
            self.selectedAvailableEmployee = null;
            self.resetPermissions();
        };

        self.selectedAvailableEmployee = null;

        var permissionChunkSize = 3;
        self.permissions = _.chunk(permissionService.permissions.entity, permissionChunkSize);
        self.getEmptyChunkElements = function (chunk) {
            var diff = permissionChunkSize - chunk.length;
            return (new Array(diff));
        };

        /**
         * @description Checks if the employee is available to add to entity.
         * Employee is only available if he is not already added to this entity or is not disabled.
         * @param employee
         * @returns {boolean}
         */
        self.isEmployeeAvailable = function (employee) {
            if (self.entityEmployeeEditMode) {
                return employee.employee.isActive();
            }
            return _.findIndex(self.entityEmployees, function (emp) {
                return emp.employee.id === employee.employee.id;
            }) < 0 && employee.employee.isActive();
        };

        /**
         * @description Checks if the permission can be selected by default
         * @param permission
         * @returns {boolean}
         */
        self.isPermissionSelected = function (permission) {
            return _.findIndex(self.selectedPermissions, function (sp) {
                return sp.id === permission.id;
            }) > -1;
        };

        /**
         * @description Toggles the permission when user select/de-select the permission
         * @param permission
         */
        self.togglePermission = function (permission) {
            var index = _.findIndex(self.selectedPermissions, function (sp) {
                return sp.id === permission.id;
            });
            if (index > -1) {
                self.selectedPermissions.splice(index, 1);
            } else {
                self.selectedPermissions.push(permission);
            }
        };

        /**
         * @description Resets the selected permissions on change of employee
         * @param $event
         */
        self.resetPermissions = function ($event) {
            self.selectedPermissions = [];
        };

        self.checkSaveEmployeeDisabled = function () {
            return !self.selectedAvailableEmployee || !self.selectedPermissions.length;
        };

        /**
         * @description Adds the employee to entity.
         * @param $event
         */
        self.addEntityEmployee = function ($event) {
            var model = new EntityPermission({
                id: self.model.getEntityId(),
                arName: self.model.arName,
                enName: self.model.enName,
                permissions: self.selectedPermissions
            });
            entityService.employeeMethods.addEmployeeToEntity(self.selectedAvailableEmployee, model, $event)
                .then(function (result) {
                    self.entityEmployeesGrid.reload(self.entityEmployeesGrid.page)
                        .then(function () {
                            toast.success(langService.get('msg_add_success').change({name: self.selectedAvailableEmployee.getNames()}));
                            self.hideEntityEmployeeForm();
                        });
                })
        };

        /**
         * @description Update the entity employee
         * @param $event
         */
        self.saveEntityEmployee = function ($event) {
            var model = new EntityPermission({
                id: self.model.getEntityId(),
                arName: self.model.arName,
                enName: self.model.enName,
                permissions: self.selectedPermissions
            });
            entityService.employeeMethods.updateEntityEmployee(self.selectedAvailableEmployee, model, $event)
                .then(function (result) {
                    self.entityEmployeesGrid.reload(self.entityEmployeesGrid.page)
                        .then(function () {
                            toast.success(langService.get('msg_edit_specific_success').change({name: self.selectedAvailableEmployee.getNames()}));
                            self.hideEntityEmployeeForm();
                        });
                })
        };

        /**
         * @description Removes the entity employee
         * @param employee
         * @param $event
         */
        self.removeEmployeeFromEntity = function (employee, $event) {
            entityService.employeeMethods.removeEntityEmployee(employee, self.model.getEntityId())
                .then(function (result) {
                    if (result) {
                        self.entityEmployeesGrid.reload(self.entityEmployeesGrid.page);
                    }
                })
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
         * @description Contains options for grid configuration
         * @type {{limit: number, page: number, order: string, limitOptions: *[], columns: string[], showColumn: (function(*=): boolean), sortCallback: sortCallback}}
         */
        self.departmentsGrid = {
            name: 'departments',
            progress: null,
            selectedRecords: [],
            limit: 5, // default limit
            page: 1, // first page
            order: '', // default sorting column with order(- for desc),
            limitOptions: gridService.getGridLimitOptions(self.departments),
            columns: {
                arabicName: {
                    langKey: 'header_arabic_name',
                    searchKey: function () {
                        return 'arName'
                    },
                    sortKey: function () {
                        return 'arName';
                    }
                },
                englishName: {
                    langKey: 'header_english_name',
                    searchKey: function () {
                        return 'enName'
                    },
                    sortKey: function () {
                        return 'enName';
                    }
                },
                responsibleName: {
                    langKey: 'header_responsible_name',
                    searchKey: function () {
                        return 'responsibleName'
                    },
                    sortKey: function () {
                        return 'responsibleName';
                    }
                },
                responsibleEmail: {
                    langKey: 'header_responsible_email',
                    searchKey: function () {
                        return 'responsibleEmail'
                    },
                    sortKey: function () {
                        return 'responsibleEmail';
                    }
                },
                entityCode: {
                    langKey: 'header_code',
                    searchKey: function () {
                        return 'code'
                    },
                    sortKey: function () {
                        return 'code';
                    }
                },
                useSystem: {
                    langKey: 'header_use_system'
                },
                status: {
                    langKey: 'header_status'
                },
                gridActions: {
                    langKey: 'header_actions',
                    hide: function () {
                        return !self.departments.length;
                    }
                }
            },
            columnsCount: function (includeHidden) {
                return gridService.getColumnsCount(self.departmentsGrid, includeHidden);
            },
            colSpan: function () {
                return gridService.getColSpan(self.departmentsGrid);
            },
            showColumn: function (column, isHeader) {
                return gridService.isShowColumn(self.departmentsGrid, column, isHeader);
            },
            sortCallback: function (sortKey) {
                self.departments = gridService.sortGridData(self.departmentsGrid, self.departments);
            },
            searchText: '',
            searchCallback: function () {
                self.departments = gridService.searchGridData(self.departmentsGrid, self.departmentsCopy);
                gridService.resetSorting(self.departmentsGrid);
                self.departmentsGrid.sortCallback();
            },
            reload: function (pageNumber, $event) {
                var defer = $q.defer();
                self.departmentsGrid.progress = defer.promise;

                return entityService.loadDepartmentsByParentId(self.model.getEntityId(), $event)
                    .then(function (result) {
                        self.departments = result;
                        self.departmentsCopy = generator.shallowCopyArray(self.departments);
                        self.departmentsGrid.selectedRecords = [];
                        defer.resolve(true);
                        if (pageNumber)
                            self.departmentsGrid.page = pageNumber;
                        gridService.resetSearchText(self.departmentsGrid);
                        gridService.resetSorting(self.departmentsGrid);
                        self.departmentsGrid.sortCallback();
                        return result;
                    });
            }
        };

        /**
         * @description Opens the add department form.
         * @param $event
         */
        self.openAddDepartmentDialog = function ($event) {
            return entityService.controllerMethod.addDialog(self.model, entity.integratedSystemId, $event)
                .then(function (result) {
                    self.departmentsGrid.reload(self.departmentsGrid.page)
                        .then(function () {
                            toast.success(langService.get('msg_add_success').change({name: result.getNames()}));
                        })
                })
        };

        /**
         * @description Opens the edit department form.
         * @param department
         * @param $event
         */
        self.openEditDepartmentDialog = function (department, $event) {
            return entityService.controllerMethod.editDialog(department, self.model, $event)
                .then(function (result) {
                    self.departmentsGrid.reload(self.departmentsGrid.page)
                        .then(function () {
                            toast.success(langService.get('msg_edit_specific_success').change({name: result.getNames()}));
                        })
                })
        };

        /**
         * @description Removes the given department
         * @param department
         * @param $event
         */
        self.removeDepartment = function (department, $event) {
            entityService.controllerMethod.delete(department, $event)
                .then(function (result) {
                    if (result)
                        self.departmentsGrid.reload(self.departmentsGrid.page);
                })
                .catch(function (error) {

                });
        };


        /**
         *@description Contains methods for CRUD operations for job titles
         */
        self.statusServices = {
            activate: entityService.activateBulkEntities,
            deactivate: entityService.deactivateBulkEntities,
            single: entityService.changeEntityStatus
        };

        /**
         * @description Change the status of department from grid
         * @param department
         * @param $event
         */
        self.changeEntityStatus = function (department, $event) {
            self.statusServices.single(department, $event)
                .then(function (result) {
                    if (result)
                        toast.success(langService.get('msg_status_success'));
                    else {
                        department.active = !department.active;
                        dialog.errorMessage(langService.get('msg_something_happened_when_update_status'));
                    }
                })
                .catch(function () {
                    department.active = !department.active;
                    dialog.errorMessage(langService.get('msg_something_happened_when_update_status'));
                });
        };

        /**
         * @description Changes the is use system value for department
         * @param department
         * @param $event
         * @returns {boolean}
         */
        self.changeIsUseSystem = function (department, $event) {
            entityService.changeIsUseSystem(department, $event)
                .then(function (result) {
                    if (result)
                        toast.success(langService.get('msg_use_system_success'));
                    else {
                        department.isUseSystem = !department.isUseSystem;
                        dialog.errorMessage(langService.get('msg_something_wrong'));
                    }
                })
                .catch(function () {
                    department.isUseSystem = !department.isUseSystem;
                    dialog.errorMessage(langService.get('msg_something_wrong'));
                });
        };

        self.isCurrentEntity = function () {
            if (!self.editMode)
                return false;

            return userInfoService.isCurrentEntity(self.entity);
        };


        /**
         * @description Close the dialog
         */
        self.closeDialog = function ($event) {
            dialog.cancel();
        };

        self.$onInit = function () {
            self.integratedSystem = lookupService.returnLookups(lookupService.integratedSystems).find(x => x.id === entity.integratedSystemId);
        }
    });
};
