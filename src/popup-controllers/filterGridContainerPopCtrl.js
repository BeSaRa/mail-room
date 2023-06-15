module.exports = function (app) {
    app.controller('filterGridContainerPopCtrl', function (dialog,
                                                              // $timeout,
                                                              generator,
                                                              toast,
                                                              langService) {
        'ngInject';
        var self = this;
        self.controllerName = 'filterGridContainerPopCtrl';

        self.filterMailForm = null;

        /*$timeout(function () {
            self.model = angular.copy(self.grid.filterGridCriteria.criteria);
        });*/

        /**
         * @description Searches the mails
         */
        self.filter = function ($event) {
            self.grid.filterGridCriteria.reset = false;
            self.callback(self.grid, self.mailStatusKey, $event)
                .then(function (result) {
                    dialog.hide(result);
                }).catch(function () {
                toast.error(langService.get('msg_error_occurred_while_processing_request'));
            });
        };

        /**
         * @description Resets the form
         */
        self.resetForm = function ($event) {
            self.grid.filterGridCriteria.reset = true;
            //self.grid.filterGridCriteria.criteria = angular.copy(self.grid.filterGridCriteria.defaultCriteria);
            self.callback(self.grid, self.mailStatusKey, $event)
                .then(function (result) {
                    dialog.hide(result);
                }).catch(function () {
                toast.error(langService.get('msg_error_occurred_while_processing_request'));
            });
        };

        /**
         * @description Closes the dialog
         * @param $event
         */
        self.closePopup = function ($event) {
            dialog.cancel($event);
        }

    });
};
