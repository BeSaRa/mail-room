module.exports = function (app) {
    app.controller('internalMailsGridDirectiveCtrl', function ($scope,
                                                               LangWatcher,
                                                               gridService) {
        'ngInject';
        var self = this;
        self.controllerName = 'internalMailsGridDirectiveCtrl';
        LangWatcher($scope);
        self.gridService = gridService;

    });
};