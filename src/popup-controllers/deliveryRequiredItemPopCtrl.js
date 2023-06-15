module.exports = function (app) {
    app.controller('deliveryRequiredItemPopCtrl', function (dialog,
                                                            deliveryRequiredItemList,
                                                            generator,
                                                            deliveryRequiredItem,
                                                            isMobileReceive,
                                                            $scope,
                                                            langService,
                                                            disableAll,
                                                            editMode,
                                                            _,
                                                            validationService,
                                                            toast) {
        'ngInject';
        var self = this;
        self.controllerName = 'deliveryRequiredItemPopCtrl';

        self.deliveryRequiredItemList = angular.copy(deliveryRequiredItemList);
        self.deliveryRequiredItem = deliveryRequiredItem;
        self.deliveryRequiredItemCopy = angular.copy(self.deliveryRequiredItem);
        self.editMode = editMode;
        self.disableAll = disableAll;
        self.isMobileReceive = isMobileReceive;

        self.addDeliveryRequiredItem = function ($event) {
            validationService
                .createValidation('ADD_REQUIRED_ITEMS')
                .addStep('check_duplicate', true, self.checkDuplicateKeyStr, [self.deliveryRequiredItem, false], function (result) {
                    return !result;
                }, true)
                .notifyFailure(function () {
                    toast.error(langService.get('code_duplicate'));
                })
                .validate()
                .then(function () {
                    self.deliveryRequiredItem.customId = Date.now();
                    self.deliveryRequiredItemList.push(angular.copy(self.deliveryRequiredItem));
                    // toast.success(langService.get('msg_add_success').change({name: self.deliveryRequiredItem.getTranslatedName()}));
                    dialog.cancel(self.deliveryRequiredItemList);
                });
        }

        self.saveDeliveryRequiredItem = function ($event) {
            validationService
                .createValidation('UPDATE_REQUIRED_ITEM')
                .addStep('check_duplicate', true, self.checkDuplicateKeyStr, [self.deliveryRequiredItem, true], function (result) {
                    return !result;
                }, true)
                .notifyFailure(function () {
                    toast.error(langService.get('code_duplicate'));
                })
                .validate()
                .then(function () {
                    var identifier = self.deliveryRequiredItem.hasOwnProperty('customId') && self.deliveryRequiredItem.customId ? 'customId' : 'id',
                        index = _.findIndex(self.deliveryRequiredItemList, function (item) {
                            return item[identifier] === self.deliveryRequiredItem[identifier];
                        });
                    self.deliveryRequiredItemList.splice(index, 1, self.deliveryRequiredItem);

                    // toast.success(langService.get('msg_edit_specific_success').change({name: self.deliveryRequiredItem.getTranslatedName()}));
                    dialog.cancel(self.deliveryRequiredItemList);
                });
        }

        self.resetDeliveryRequiredForm = function (form, $event) {
            generator.resetFields(self.deliveryRequiredItem, angular.copy(self.deliveryRequiredItemCopy));
            form.$setUntouched();
        }

        self.closeDialog = function () {
            dialog.cancel(self.deliveryRequiredItemList);
        }

        /**
         * @description Checks if form is disabled(read-only)
         * @returns {boolean}
         */
        self.formDisabled = function () {
            return self.disableAll;
        };

        self.checkDuplicateKeyStr = function (deliveryRequiredItem, editMode) {
            var itemsToFilter = self.deliveryRequiredItemList;
            if (editMode) {
                itemsToFilter = _.filter(itemsToFilter, function (item) {
                    return deliveryRequiredItem.id !== item.id;
                });
            }
            return _.some(_.map(itemsToFilter, function (existingItem) {
                return existingItem.keyStr.toLowerCase() === deliveryRequiredItem.keyStr.toLowerCase();
            }), function (matchingResult) {
                return matchingResult === true;
            });
        };
    });
}
