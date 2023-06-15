module.exports = function (app) {
    app.controller('incomingMailsGridDirectiveCtrl', function ($scope,
                                                               LangWatcher,
                                                               gridService) {
        'ngInject';
        var self = this;
        self.controllerName = 'incomingMailsGridDirectiveCtrl';
        LangWatcher($scope);
        self.gridService = gridService;

    });
};