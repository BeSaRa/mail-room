module.exports = function (app) {
    app.controller('searchFilterDirectiveCtrl', function (LangWatcher,
                                                          $scope) {
        'ngInject';
        var self = this;
        self.controllerName = 'searchFilterDirectiveCtrl';

        LangWatcher($scope);

        self.closeStatus = true;

    });
};