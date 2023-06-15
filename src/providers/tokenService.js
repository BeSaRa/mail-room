module.exports = function (app) {
    app.provider('tokenService', function () {
        'ngInject';
        var self = this,
            token = false,
            headerTokenKey = 'tawasol-auth-header',
            tokenKey = 'mailRoomToken',
            lastLoginEntityIdKey = 'lastLoginEntityId',
            defaultExpiryValue = 60,
            refresh = true,
            urls = [],
            $http = null, // set from langDirective
            authenticationService = null; // set from langDirective
        /**
         * @description Sets last Login organization id Key
         * @param key
         */
        self.setLastLoginEntityIdKey = function (key) {
            lastLoginEntityIdKey = key;
        };

        /**
         * @description Gets last login entity id Key
         * @returns {string}
         */
        self.getLastLoginEntityIdKey = function () {
            return lastLoginEntityIdKey;
        };
        /**
         * to change header token key if need
         * @param key
         * @returns {*}
         */
        self.setHeaderTokenKey = function (key) {
            headerTokenKey = key;
            return self;
        };
        /**
         * get header token key
         * @returns {string}
         */
        self.getHeaderTokenKey = function () {
            return headerTokenKey;
        };
        /**
         * set token key in cookies
         * @param key
         * @returns {*}
         */
        self.setTokenKey = function (key) {
            tokenKey = key;
            return self;
        };
        /**
         * to get refresh status for application
         */
        self.getRefreshStatus = function () {
            return refresh;
        };
        /**
         * get token for current logged in user
         * @returns {string}
         */
        self.getTokenKey = function () {
            return tokenKey;
        };
        /**
         * get token for current logged in user
         * @returns {boolean}
         */
        self.getToken = function () {
            return token;
        };
        /**
         * set token for current logged in user
         * @param yourToken
         * @returns {*}
         */
        self.setToken = function (yourToken) {
            token = yourToken;
            refresh = false;
            return self;
        };
        /**
         * destroy current session
         */
        self.destroy = function () {
            token = null;
            refresh = true;
        };
        /**
         * to exclude url from sending token
         * @param url
         * @returns {*}
         */
        self.excludeTokenFromUrl = function (url) {
            urls.push(url);
            return self;
        };
        /**
         * get excluded urls token
         * @returns {Array}
         */
        self.getExcludedUrls = function () {
            return urls;
        };

        self.$get = function ($cookies, $q, urlService, userInfoService, generator, LoginResponse) {
            'ngInject';
            return {
                tokenRefresh: function () {
                    var service = this;
                    var defer = $q.defer();
                    if (!self.getRefreshStatus() && service.getToken()) {
                        defer.resolve(service.getToken());
                    } else if (self.getRefreshStatus() && service.getToken()) {
                        $http
                            .get(urlService.validateToken)
                            .then(function (result) {
                                result = generator.interceptReceivedInstance('LoginResponse', new LoginResponse(result.data));
                                //result = result.data;
                                if (result.hasOwnProperty('token')) {
                                    userInfoService.setCurrentUser(result);
                                    service.setToken(service.getToken());
                                    defer.resolve(service.getToken());
                                } else {
                                    defer.reject(false);
                                }
                            })
                            .catch(function () {
                                defer.reject(false);
                            })
                    } else {
                        defer.reject(true);
                    }
                    return defer.promise;
                },
                getToken: function () {
                    var currentToken = $cookies.get(self.getTokenKey());
                    return currentToken ? (self.getRefreshStatus() ? currentToken : (currentToken === self.getToken() ? currentToken : false)) : false;
                },
                setToken: function (token, expiry) {
                    var date = (new Date());
                    date.setMinutes(date.getMinutes() + (expiry || defaultExpiryValue));
                    $cookies.put(self.getTokenKey(), token, {
                        expires: date
                    });
                    self.setToken(token);
                },
                destroy: function () {
                    self.destroy();
                    $cookies.remove(self.getTokenKey());
                },
                setTokenForHeader: function (config) {
                    if (self.getExcludedUrls().indexOf(config.url) > -1) {
                        delete config.headers[self.getHeaderTokenKey()];
                        return config;
                    }

                    if (this.getToken())
                        config.headers[self.getHeaderTokenKey()] = this.getToken();

                    return config;
                },
                getLastLoginEntityIdKey: function () {
                    return self.getLastLoginEntityIdKey();
                },
                setRequireServices: function (http, authentication, theme, entity) {
                    $http = http;
                    authenticationService = authentication;
                },
                getRefreshStatus: function () {
                    return self.getRefreshStatus();
                },
                forceTokenRefresh: function () {
                    refresh = true;
                    return this.tokenRefresh();
                }

            }
        }
    });


};