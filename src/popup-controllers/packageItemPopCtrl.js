module.exports = function (app) {
    app.controller('packageItemPopCtrl', function (dialog,
                                                   packageItemList,
                                                   generator,
                                                   packageItem,
                                                   editMode,
                                                   lookupService,
                                                   disableAll,
                                                   $scope,
                                                   _) {
        'ngInject';
        var self = this;
        self.controllerName = 'packageItemPopCtrl';

        self.packageItem = packageItem;
        self.packageItemClone = angular.copy(self.packageItem);
        self.packageItemList = angular.copy(packageItemList);
        self.editMode = editMode;
        self.disableAll = disableAll;

        self.categoryList = lookupService.returnLookups('packageItemCategory');
        self.weightUnitList = lookupService.returnLookups('weightUnits');
        self.lengthUnitList = lookupService.returnLookups('lengthUnits');
        self.quantityUnitList = lookupService.returnLookups('otherMeasurementUnits').concat(self.weightUnitList).concat(self.lengthUnitList);

        self.addPackageItem = function ($event) {
            self.packageItem.customId = Date.now();
            self.packageItemList.push(angular.copy(self.packageItem));
            // toast.success(langService.get('msg_add_success_only'));
            dialog.cancel(self.packageItemList);
        };

        self.savePackageItem = function ($event) {
            var identifier = self.packageItem.hasOwnProperty('customId') && self.packageItem.customId ? 'customId' : 'id',
                index = _.findIndex(self.packageItemList, function (item) {
                    return item[identifier] === self.packageItem[identifier];
                });
            self.packageItemList.splice(index, 1, self.packageItem);

            // toast.success(langService.get('msg_edit_success'));
            dialog.cancel(self.packageItemList);
        };

        self.resetPackageForm = function (form, $event) {
            generator.resetFields(self.packageItem, angular.copy(self.packageItemClone));
            form.$setUntouched();
        };

        /**
         * @description Checks if form is disabled(read-only)
         * @returns {boolean}
         */
        self.formDisabled = function () {
            return self.disableAll;
        };

        self.closeDialog = function () {
            dialog.cancel(self.packageItemList);
        };
    });
}
