module.exports = function (app) {
    app.controller('sidebarRightDirectiveCtrl', function ($scope, LangWatcher) {
        'ngInject';
        var self = this;
        self.controllerName = 'sidebarRightDirectiveCtrl';
        LangWatcher($scope); // watch the languages.
    });
};