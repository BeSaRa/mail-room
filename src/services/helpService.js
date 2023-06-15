module.exports = function (app) {
    app.service('helpService', function (dialog, langService) {
        'ngInject';
        var self = this;

        self.serviceName = 'helpService';

        self.defaultHelpUrl = 'help/';

        self.currentHelpUrl = null;

        self.setHelpTo = function (helpID) {
            self.currentHelpUrl = self.defaultHelpUrl + helpID;
        };

        /**
         * @description Display popup for help page
         */
        self.openContextHelp = function ($event) {
            return dialog
                .showDialog({
                    templateUrl: self.currentHelpUrl + '_' + langService.current + '_help.html',
                    targetEvent: $event || false,
                    controller: function (dialog) {
                        'ngInject';
                        var self = this;

                        self.closePopup = function () {
                            dialog.cancel();
                        }
                    },
                    controllerAs: 'ctrl'
                })
                .then(function () {

                })
                .catch(function () {

                });
        }

    })
};
