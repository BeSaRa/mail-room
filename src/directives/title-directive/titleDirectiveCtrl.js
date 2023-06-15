module.exports = function (app) {
    app.controller('titleDirectiveCtrl', function ($element, titleService, $timeout, langService, $compile, $scope) {
        'ngInject';
        var self = this;
        self.service = titleService;

        $timeout(function () {
            titleService.setTitle(langService.get('application_title'));
        }, 1000);
    });
};