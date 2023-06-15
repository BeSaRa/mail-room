module.exports = function (app) {
    app.controller('loginCtrl', function (loginPage,
                                          mailRoomTemplate,
                                          $scope,
                                          dialog,
                                          FilterFactory,
                                          $state,
                                          $stateParams,
                                          $q,
                                          $timeout,
                                          _,
                                          Idle,
                                          $sce,
                                          $location,
                                          $cookies,
                                          generator,
                                          Credentials,
                                          langService,
                                          authenticationService,
                                          userInfoService) {
        'ngInject';
        var self = this;
        self.controllerName = 'loginCtrl';
        self.flipBg = loginPage.flip;
        self.loginStatus = false;

        self.credentials = new Credentials();


        function checkIfLogoutBySession() {
            if ($cookies.get(authenticationService.logoutBySessionsKey)) {
                $cookies.remove(authenticationService.logoutBySessionsKey);

                dialog
                    .infoMessage(langService.get('auth_you_are_logged_out_by_session'))
                    .then(function () {
                        Idle.watch();
                    })
            }
        }

        /**
         * @description set current user and permission to userInfoService.
         * @param result
         * @private
         */
        function _setEmployeeWithPermissions(result) {
            userInfoService.setCurrentUser(result);
        }

        function _redirect() {
            $state.go('app.landing-page');
        }


        function _completeLogin(callback, result) {
            _setEmployeeWithPermissions(result); // set current user
            if (!callback) {
                _redirect();
            } else {
                callback();
            }
        }

        /**
         * login method
         * @param event
         * @param callback
         */
        self.login = function (event, callback) {
            self.loginStatus = true;
            authenticationService.authenticate(self.credentials)
                .then(function (result) {
                    if (!result)
                        dialog.errorMessage(langService.get('error_update_password_to_complete_login'));

                    else {
                        _hideFixOverlay();
                        _completeLogin(callback, result);
                    }
                })
                .catch(function (error) {
                    self.loginStatus = false;
                    if (error === 'cancelFailUpdatePassword') {
                        dialog.errorMessage(langService.get('error_update_password_to_complete_login'))
                    }
                    else
                        dialog.errorMessage(langService.get('error_unauthorized'))
                });
        };
        /**
         * select organization method if user has more then one organization
         * @param result
         * @param event
         * @param callback
         */
        self.selectOrganizationToLogin = function (result, event, callback) {
            dialog
                .showDialog({
                    template: mailRoomTemplate.getPopup('select-organization-login'),
                    targetEvent: event,
                    bindToController: true,
                    multiple: true,
                    controller: function ($mdDialog) {
                        'ngInject';
                        var ctrl = this;
                        ctrl.selectOrganization = function (organization) {
                            $mdDialog.hide(organization);
                        }

                    },
                    controllerAs: 'ctrl',
                    locals: {
                        organizations: result.ouList
                    }
                })
                .then(function (organization) {
                    authenticationService
                        .selectEntityToLogin(organization)
                        .then(function (result) {
                            if (result.hasOwnProperty('globalSetting')) {
                                _completeLogin(callback, result);
                            }
                        });
                });
        };

        function _fixLoginOverlay() {
            $scope.hasOwnProperty('_loginDialog') && $scope._loginDialog ? angular.element('body').addClass('login-dialog') : null;
        }

        function _hideFixOverlay() {
            angular.element('body').removeClass('login-dialog');
        }

        checkIfLogoutBySession();
        _fixLoginOverlay()
    });
};