module.exports = function (app) {
    app.controller('entityTypePopCtrl', function (entityTypeService,
                                                  entityType,
                                                  $q,
                                                  _,
                                                  langService,
                                                  toast,
                                                  dialog,
                                                  editMode,
                                                  EntityType,
                                                  validationService,
                                                  generator) {
        'ngInject';
        var self = this;
        self.controllerName = 'entityTypePopCtrl';
        self.editMode = editMode;
        self.entityType = entityType;
        self.model = angular.copy(self.entityType);

        self.entityTypes = entityTypeService.entityTypes;


        self.fieldsAndLabelsToValidate = {
            arName: 'lbl_arabic_name',
            enName: 'lbl_english_name'
        };

        self.tabsToShow = {
            basicInfo: {
                name: 'basic',
                key: 'lbl_basic_info'
            },
            entities: {
                name: 'entities',
                key: 'lbl_entities',
                hide: true
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

        self.addEntityType = function ($event) {
            validationService
                .createValidation('ADD_ENTITY_TYPE')
                .addStep('check_required', true, generator.checkRequiredFields, self.entityType, function (result) {
                    return !result.length;
                })
                .notifyFailure(function (step, result) {
                    var labels = _.map(result, function (label) {
                        return self.fieldsAndLabelsToValidate[label];
                    });
                    generator.generateErrorFields('lbl_check_these_fields', labels);
                })
                .addStep('check_duplicate', true, entityTypeService.checkDuplicate, [self.entityType, false], function (result) {
                    return !result;
                }, true)
                .notifyFailure(function () {
                    toast.error(langService.get('error_name_duplicate'));
                })
                .validate()
                .then(function () {
                    entityTypeService.addEntityType(self.entityType)
                        .then(function (result) {
                            dialog.hide(result);
                        });
                })
                .catch(function () {

                })
        };

        self.saveEntityType = function ($event) {
            validationService
                .createValidation('UPDATE_ENTITY_TYPE')
                .addStep('check_required', true, generator.checkRequiredFields, self.entityType, function (result) {
                    return !result.length;
                })
                .notifyFailure(function (step, result) {
                    var labels = _.map(result, function (label) {
                        return self.fieldsAndLabelsToValidate[label];
                    });
                    generator.generateErrorFields('lbl_check_these_fields', labels);
                })
                .addStep('check_duplicate', true, entityTypeService.checkDuplicate, [self.entityType, true], function (result) {
                    return !result;
                }, true)
                .notifyFailure(function () {
                    toast.error(langService.get('error_name_duplicate'));
                })
                .validate()
                .then(function () {
                    entityTypeService.updateEntityType(self.entityType)
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
        self.resetEntityTypeForm = function (form, $event) {
            generator.resetFields(self.entityType, angular.copy(self.model));
            form.$setUntouched();
        };

        /**
         * @description Close the dialog
         */
        self.closeDialog = function ($event) {
            dialog.cancel();
        }
    });
};