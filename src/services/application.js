module.exports = function (app) {
    app.service('application', function ($location, $state, tokenService) {
        'ngInject';
        var self = this, ready = false;
        self.url = {
            type: 'state',
            url: 'app.landing-page'
        };
        self.isReadyStatus = function () {
            return ready;
        };

        self.setUrl = function (url) {
            self.url.type = 'url';
            self.url.url = url;
        };

        self.setReadyStatus = function () {
            ready = true;
            if (self.url.type === 'url') {
                $location.path(self.url.url);
            } else {
                tokenService
                    .tokenRefresh()
                    .then(function () {
                        $state.go(self.url.url);
                    })
                    .catch(function () {
                        $state.go('login');
                    })
            }
        };

    })
};