module.exports = function (app) {
    app.controller('outgoingMailsGridDirectiveCtrl', function ($scope,
                                                               LangWatcher,
                                                               gridService) {
        'ngInject';
        var self = this;
        self.controllerName = 'outgoingMailsGridDirectiveCtrl';
        LangWatcher($scope);
        self.gridService = gridService;
    });
};