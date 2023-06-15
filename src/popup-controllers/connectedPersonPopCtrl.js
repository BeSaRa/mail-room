module.exports = function (app) {
    app.controller('connectedPersonPopCtrl', function (dialog,
                                                       connectedPersonList,
                                                       generator,
                                                       connectedPerson,
                                                       $scope,
                                                       langService,
                                                       disableAll,
                                                       editMode,
                                                       _,
                                                       toast) {
        'ngInject';
        var self = this;
        self.controllerName = 'connectedPersonPopCtrl';

        self.connectedPersonList = angular.copy(connectedPersonList);
        self.connectedPerson = connectedPerson;
        self.connectedPersonCopy = angular.copy(self.connectedPerson);
        self.editMode = editMode;
        self.disableAll = disableAll;

        self.addConnectedPerson = function ($event) {
            self.connectedPerson.customId = Date.now();
            self.connectedPersonList.push(angular.copy(self.connectedPerson));
            // toast.success(langService.get('msg_add_success').change({name: self.connectedPerson.getFullName()}));
            dialog.cancel(self.connectedPersonList);
        }

        self.saveConnectedPerson = function ($event) {
            var identifier = self.connectedPerson.hasOwnProperty('customId') && self.connectedPerson.customId ? 'customId' : 'id',
                index = _.findIndex(self.connectedPersonList, function (item) {
                    return item[identifier] === self.connectedPerson[identifier];
                });
            self.connectedPersonList.splice(index, 1, self.connectedPerson);

            // toast.success(langService.get('msg_edit_specific_success').change({name: self.connectedPerson.getFullName()}));
            dialog.cancel(self.connectedPersonList);
        }

        self.resetConnectedPersonForm = function (form, $event) {
            generator.resetFields(self.connectedPerson, angular.copy(self.connectedPersonCopy));
            form.$setUntouched();
        }

        self.closeDialog = function () {
            dialog.cancel(self.connectedPersonList);
        }

        /**
         * @description Checks if form is disabled(read-only)
         * @returns {boolean}
         */
        self.formDisabled = function () {
            return self.disableAll;
        };
    });
}
