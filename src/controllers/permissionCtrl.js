module.exports = function (app) {
    app.controller('permissionCtrl', function (helpService) {
        'ngInject';
        var self = this;

        self.controllerName = 'permissionCtrl';
        helpService.setHelpTo('permissions');

    });
};