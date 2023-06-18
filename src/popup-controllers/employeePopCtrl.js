module.exports = function (app) {
    app.controller('employeePopCtrl', function (employeeService,
                                                employeePermission,
                                                $q,
                                                _,
                                                langService,
                                                toast,
                                                dialog,
                                                editMode,
                                                Employee,
                                                validationService,
                                                permissionService,
                                                generator,
                                                userInfoService,
                                                employeeEntities) {
        'ngInject';
        var self = this;
        self.controllerName = 'employeePopCtrl';
        self.editMode = editMode;
        self.employeePermission = employeePermission;
        self.employeeEntities = employeeEntities;
        self.model = angular.copy(self.employeePermission);

        self.tabsToShow = {
            basicInfo: {
                name: 'basic',
                key: 'lbl_basic_info'
            },
            sysPermissions: {
                name: 'system-permissions',
                key: 'lbl_system_permissions'
            }
        };
        self.showTab = function (tab) {
            return !tab.hide;
        };
        self.selectedTabName = self.tabsToShow.basicInfo.name.toLowerCase();
        self.selectedTabIndex = 0;
        self.setCurrentTab = function (tab, $event) {
            self.selectedTabName = tab.name.toLowerCase();
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

        self.fieldsAndLabelsToValidate = {
            arName: 'lbl_arabic_name',
            enName: 'lbl_english_name',
            username: 'lbl_username',
            password: 'lbl_password',
            mobileNumber: 'lbl_mobile_number',
            active: 'lbl_status'
        };

        var permissionChunkSize = 3;
        self.permissions = _.chunk(permissionService.permissions.system, permissionChunkSize);

        self.getEmptyChunkElements = function (chunk) {
            var diff = permissionChunkSize - chunk.length;
            return (new Array(diff));
        };

        self.selectedPermissions = _.map(self.model.permissions, 'id');

        self.isPermissionSelected = function (permission) {
            permission = permission.hasOwnProperty('id') ? permission.id : permission;
            return self.selectedPermissions.indexOf(permission) > -1;
        };

        self.togglePermission = function (permission) {
            permission = permission.hasOwnProperty('id') ? permission.id : permission;
            var idx = self.selectedPermissions.indexOf(permission);
            if (idx > -1) {
                self.selectedPermissions.splice(idx, 1);
            } else {
                self.selectedPermissions.push(permission);
            }
        };

        self.checkRequiredFields = function (model) {
            model = model.hasOwnProperty('employee') ? model.employee : model;
            var required = model.getRequiredFields(), spliceIndex, result = [];
            if (self.editMode) {
                spliceIndex = required.indexOf('password');
                (spliceIndex !== -1) ? required.splice(required.indexOf('password'), 1) : null;
            }
            _.map(required, function (property) {
                if (!generator.validRequired(model[property]))
                    result.push(property);
            });
            return result;
        };

        /**
         * @description Adds new employee
         * @param $event
         */
        self.addEmployee = function ($event) {
            self.employeePermission.permissions = self.selectedPermissions;
            validationService
                .createValidation('ADD_EMPLOYEE_PERMISSION')
                .addStep('check_required', true, self.checkRequiredFields, self.employeePermission, function (result) {
                    return !result.length;
                })
                .notifyFailure(function (step, result) {
                    var labels = _.map(result, function (label) {
                        return self.fieldsAndLabelsToValidate[label];
                    });
                    generator.generateErrorFields('lbl_check_these_fields', labels);
                })
                .addStep('check_duplicate', true, employeeService.checkDuplicate, [self.employeePermission, false], function (result) {
                    return !result;
                }, true)
                .notifyFailure(function () {
                    toast.error(langService.get('error_username_mobile_duplicate'));
                })
                .validate()
                .then(function () {
                    employeeService.addEmployee(self.employeePermission)
                        .then(function (result) {
                            dialog.hide(result);
                        });
                })
                .catch(function () {

                })
        };

        /**
         * @description Updates the existing employee
         * @param $event
         */
        self.saveEmployee = function ($event) {
            self.employeePermission.permissions = self.selectedPermissions;
            validationService
                .createValidation('UPDATE_EMPLOYEE_PERMISSION')
                .addStep('check_required', true, self.checkRequiredFields, self.employeePermission, function (result) {
                    return !result.length;
                })
                .notifyFailure(function (step, result) {
                    var labels = _.map(result, function (label) {
                        return self.fieldsAndLabelsToValidate[label];
                    });
                    generator.generateErrorFields('lbl_check_these_fields', labels);
                })
                .addStep('check_duplicate', true, employeeService.checkDuplicate, [self.employeePermission, true], function (result) {
                    return !result;
                }, true)
                .notifyFailure(function () {
                    toast.error(langService.get('error_username_mobile_duplicate'));
                })
                .validate()
                .then(function () {
                    employeeService.updateEmployee(self.employeePermission)
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
        self.resetEmployeeForm = function (form, $event) {
            generator.resetFields(self.employeePermission, angular.copy(self.model));
            form.$setUntouched();
            self.changeTab(self.tabsToShow.basicInfo);
        };


        self.isCurrentEmployee = function () {
            if (!self.editMode)
                return false;

            return userInfoService.isCurrentEmployee(self.employeePermission.employee);
        };

        /**
         * @description Close the dialog
         */
        self.closeDialog = function ($event) {
            dialog.cancel();
        }
    });
};
