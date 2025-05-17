module.exports = function (app) {
    app.controller('contentViewerPopCtrl', function (dialog, $sce) {
        'ngInject';
        var self = this;
        self.controllerName = 'contentViewerPopCtrl';

        self.closeDialog = function () {
            dialog.cancel();
        }
    });
}
