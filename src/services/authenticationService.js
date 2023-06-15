module.exports = function (app) {
    app.service('authenticationService', function ($http,
                                                   $cookies,
                                                   lookupService,
                                                   tokenService,
                                                   base64Factory,
                                                   localStorageService,
                                                   urlService,
                                                   Credentials,
                                                   generator,
                                                   LoginResponse,
                                                   titleService,
                                                   langService,
                                                   dialog,
                                                   $q,
                                                   userInfoService,
                                                   mailRoomTemplate) {
        'ngInject';
        var self = this, cacheCredentials = new Credentials();
        self.logoutBySessionsKey = 'logoutSession';

        function _saveToStorage(credentials) {
            //var c = angular.copy(credentials);
            //delete c.ouId;
            localStorageService.set('MR', base64Factory.encode(JSON.stringify(credentials)));
        }

        function _getFromStorage() {
            return JSON.parse(base64Factory.decode(localStorageService.get('MR')));
        }

        /**
         * this method to make authentication by given credentials
         * @param credentials
         */
        self.authenticate = function (credentials) {
            // check if the login came from inside application.
            if (credentials instanceof Credentials === false) {
                return;
            }
            cacheCredentials = angular.copy(credentials);
            // call backend service to login.
            return $http.post(urlService.login, credentials)
                .then(function (result) {
                    result.data = generator.interceptReceivedInstance('LoginResponse', new LoginResponse(result.data));
                    var resultCopy = angular.copy(result.data);
                    resultCopy.employee.password = credentials.password;
                    if (result.data.shouldChangePassword()) {
                        if (result.data && result.data.hasOwnProperty('token')) {
                            tokenService.setToken(result.data.token);
                        }
                        //open popup and set new password and then finalize authenticate and return result.data
                        return self.openChangePasswordPopup(resultCopy, true, false).then(function (cpResult) {
                            if (!cpResult) {
                                tokenService.destroy();
                                return false;
                            } else {
                                _finalizeAuthenticate(result, credentials);
                                return result.data;
                            }

                        }).catch(function (error) {
                            tokenService.destroy();
                            return $q.reject(error);
                        })
                    } else {
                        _finalizeAuthenticate(result, credentials);
                        return result.data;
                    }
                })
                .catch(function (error) {
                    tokenService.destroy();
                    return $q.reject(error);
                });
        };

        var _finalizeAuthenticate = function (result, credentials) {
            _saveToStorage(credentials);
            if (result.data && result.data.hasOwnProperty('token')) {
                tokenService.setToken(result.data.token);
            }
            if (result.data.hasOwnProperty('currentEntity')) {
                self.setLastLoginEntityId(result.data.currentEntity);
            }
            titleService.setTitle(langService.get('application_title'));
        };

        self.changePassword = function (credentials, adminChange, beforeLogin) {
            return $http.put((adminChange) ? urlService.adminchangePass : urlService.changePass, credentials)
                .then(function (result) {
                    return result.data
                })
                .catch(function (error) {
                    return $q.reject();
                });
        };

        /**
         * to select entity to login
         * @param entity
         */
        self.selectEntityToLogin = function (entity) {
            var entityId = entity.hasOwnProperty("id") ? entity.id : entity;

            return $http.post(urlService.selectEntityLogin + "?entityID=" + entityId).then(function (result) {
                result = generator.interceptReceivedInstance('LoginResponse', new LoginResponse(result.data));
                self.setLastLoginEntityId(result.currentEntity);
                userInfoService.setCurrentUser(result);
                tokenService.setToken(result.token);
                return result;
            });
        };
        /**
         * @description Set last login entity cookies
         * @param entity
         */
        self.setLastLoginEntityId = function (entity) {
            var date = (new Date());
            date.setYear(date.getFullYear() + 1);
            entity = entity.hasOwnProperty('id') ? entity.getEntityId() : entity;
            $cookies.put(tokenService.getLastLoginEntityIdKey(), entity, {
                expires: date
            });
        };
        /**
         * get last login entity from cookies
         * @returns {*|string}
         */
        self.getLastLoginEntityId = function () {
            return $cookies.get(tokenService.getLastLoginEntityIdKey());
        };
        /**
         * remove last login entity id
         */
        self.removeLastLoginEntityId = function () {
            $cookies.remove(tokenService.getLastLoginEntityIdKey());
        };
        /**
         * logout from application and destroy current session.
         */
        self.logout = function (showConfirm, $event) {
            var defer = $q.defer();
            if (showConfirm) {
                dialog
                    .confirmMessage(langService.get('auth_confirm_logout'), null, null, $event)
                    .then(function () {
                        defer.resolve(true);
                    });
            } else {
                defer.resolve(true);
            }
            return defer.promise.then(function () {
                localStorageService.remove('MR');
                return $http.post(urlService.logout, null)
                    .then(function (result) {
                        tokenService.destroy(); // destroy the current sessions
                        //TODO: destroy current user data
                        return result.data;
                    })
                    .catch(function () {
                        tokenService.destroy(); // destroy the current sessions
                        //TODO: destroy current user data
                        return true;
                    });
            });
        };

        self.getUserData = function () {
            return _getFromStorage();
        };

        self.openChangePasswordPopup = function (result, withOldPass, adminChange, $event) {
            return dialog
                .showDialog({
                    targetEvent: $event,
                    template: mailRoomTemplate.getPopup('change-password'),
                    controller: 'changePasswordPopCtrl',
                    controllerAs: 'ctrl',
                    bindToController: true,
                    locals: {
                        employee: (result.hasOwnProperty("employee")) ? result.employee : result,
                        withOldPass: withOldPass,
                        adminChange: adminChange
                    }
                })
        };

        /*
         if user remove last login organization from cookies still he can login if has the token
         TODO : we need to prevent the user from complete the session if last login id removed discuss with the backend-team
         */
    });
};
