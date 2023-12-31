module.exports = function (app) {
    app.controller('bodyDirectiveCtrl', function ($mdSidenav,
                                                  $rootScope,
                                                  $timeout,
                                                  $state,
                                                  $element,
                                                  tokenService,
                                                  authenticationService,
                                                  loadingIndicatorService,
                                                  idleCounterService,
                                                  dialog,
                                                  Idle,
                                                  $location,
                                                  $cookies,
                                                  $http,
                                                  mailRoomTemplate,
                                                  versionService,
                                                  $mdMedia,
                                                  $scope) {
        'ngInject';
        var self = this;

        self.controllerName = 'bodyDirectiveCtrl';

        self.loadingService = loadingIndicatorService;

        self.isSidebarOpen = function () {
            return $mdSidenav('main-sidebar').isLockedOpen();
        };

        $rootScope.mediaSize = function (mediaSize) {
            return $mdMedia(mediaSize);
        };

        $scope.$on('IdleStart', function () {
            // the user appears to have gone idle
            if (!tokenService.getToken()) {
                return;
            }

            dialog.showDialog({
                template: mailRoomTemplate.getPopup('idle'),
                controller: function (idleCounterService) { // for binding purpose
                    var ctrl = this;
                    ctrl.counter = idleCounterService;
                },
                controllerAs: 'ctrl',
                bindToController: true
            });
        });

        $scope.$on('IdleWarn', function (e, countdown) {
            // follows after the IdleStart event, but includes a countdown until the user is considered timed out
            // the countdown arg is the number of seconds remaining until then.
            // you can change the title or display a warning dialog from here.
            // you can let them resume their session by calling Idle.watch()
            $scope.$apply(function () {
                idleCounterService.setCounter(countdown);
            });
        });

        $scope.$on('IdleTimeout', function () {
            // the user has timed out (meaning idleDuration + timeout has passed without any activity)
            // this is where you'd log them
            dialog.hide().then(function () {
                authenticationService.logout(false).then(function () {
                    $timeout(function () {
                        $cookies.put(authenticationService.logoutBySessionsKey, 'true');
                        $state.go('login');
                    });
                });
            });

        });

        $scope.$on('IdleEnd', function () {
            // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
            dialog.hide();
        });

        $scope.bundleVersion = versionService.getVersionNumber();
        $scope.buildNumber = ' ' + versionService.getBuildNumber();
    });
};
