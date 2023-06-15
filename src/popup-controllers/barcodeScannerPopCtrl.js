module.exports = function (app) {
    app.controller('barcodeScannerPopCtrl', function (statusTypesKey, dialog) {
        'ngInject';
        var self = this;
        self.controllerName = 'barcodeScannerPopCtrl';
        self.statusTypesKey = statusTypesKey;

        self.send = function ($event) {
            //ToDO open send bulk popup
            console.log("recieve");
        };

        /**
         * @description Close the dialog
         */
        self.closeDialog = function ($event) {
            dialog.cancel();
        }

    });
};