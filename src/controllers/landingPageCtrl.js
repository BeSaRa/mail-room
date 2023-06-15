module.exports = function (app) {
    app.controller('landingPageCtrl', function (_,
                                                langService,
                                                helpService,
                                                $location,
                                                userInfoService,
                                                counterService) {
        'ngInject';
        var self = this;
        helpService.setHelpTo('landing-page');
        self.controllerName = 'landingPageCtrl';
        self.counterService = counterService;
        self.currentUser = userInfoService.getCurrentUser();

        self.outgoingMails = function () {
            $location.path('/outgoing/mails');
        };
        self.incomingMails = function () {
            $location.path('/incoming/mails');
        };
        self.internalMails = function () {
            $location.path('/internal/mails');
        };
    });
};