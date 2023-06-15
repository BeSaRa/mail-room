module.exports = function (app) {
    app.run(function (application,
                      $stateParams,
                      loginDialogService,
                      loadingIndicatorService,
                      stateHelperService,
                      $transitions,
                      $timeout,
                      errorCode,
                      $state,
                      $q,
                      $location,
                      authenticationService,
                      urlService,
                      $rootScope,
                      Idle,
                      exception,
                      userInfoService,
                      // $templateRequest,
                      dialog,
                      langService) {
        'ngInject';
        // start watching when the app runs. also starts the Keepalive service by default.
        Idle.watch();

        exception.addGeneralExceptionHandler(401, function (xhr) {
            var url = xhr.config.url;
            if (url === urlService.login) {
                dialog
                    .errorMessage(langService.get('auth_access_denied'))
            } else {
                loadingIndicatorService.forceEndLoading();
            }
        });

        exception.addGeneralExceptionHandler(500, function (xhr) {
            var url = xhr.config.url;
            if (url === urlService.login) {
                dialog
                    .errorMessage(langService.get('internal_server_error'))
            }
        });

        exception.addGeneralExceptionHandler(500, function (xhr) {
            var errorCode = xhr.data.ec;
            if (errorCode === 1005 && xhr.config.method === 'DELETE')
                dialog.errorMessage(langService.get('record_has_related_records'));

        });

        $transitions.onStart({}, function (transition) {
            if (!application.isReadyStatus() && transition.to().name !== 'loading') {
                if ($location.path().indexOf('404') === -1 && $location.path().indexOf('access-denied') === -1) {
                    application.setUrl($location.url());
                }
                return transition.router.stateService.target('loading');
            }
        });

        $transitions.onStart({to: 'app.**'}, function (transition) {
            var spinnerService = transition.injector().get('loadingIndicatorService');
            var tokenService = transition.injector().get('tokenService');
            var loginDialogService = transition.injector().get('loginDialogService');

            spinnerService.startLoading();
            transition.promise.finally(spinnerService.endLoading);

            return tokenService.tokenRefresh()
                .then(function () {
                    return true;
                })
                .catch(function () {
                    return loginDialogService
                        .openLoginDialog(true);
                });
        });

        $transitions.onEnter({to: 'app.**'}, function (transition) {
            var permission = transition.to().permission,
                params = transition.injector().get('$stateParams');

            if (!permission)
                return;

            if (userInfoService && !userInfoService.employeeHasPermissionTo(permission)) {
                // redirect to the 'access-denied' state
                return transition.router.stateService.target('app.access-denied', params);
            }
        });

        $transitions.onEnter({to: 'app.landing-page'}, function (transition) {
            return $timeout(function () {
                return true;
            }, 100).catch(angular.noop);
        });

    });
};