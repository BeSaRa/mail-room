module.exports = function (app) {
    app.factory('MailRoomInterceptor', function (tokenService, loadingIndicatorService, exception, $q) {
        'ngInject';
        var countRequests = {}, id = 0;

        function RequestItem(url) {
            this.url = url;
        }

        function uniqID() {
            return ++id;
        }

        function checkCount() {
            return Object.keys(countRequests).length;
        }

        return {
            // to adjust the request before sending.
            request: function (config) {
                exception.request(config);
                if (!config.hasOwnProperty('excludeLoading')) {
                    var uid = uniqID();
                    config.uniqID = uid;
                    countRequests[uid] = new RequestItem(config.url);
                    loadingIndicatorService.startLoading();
                }
                return tokenService.setTokenForHeader(config);
            },
            // when request has an error while send process.
            requestError: function (result) {
                exception.requestError(result);
                if (!result.config.hasOwnProperty('excludeLoading')) {
                    delete countRequests[result.config.uniqID];
                }
                !checkCount() ? loadingIndicatorService.endLoading() : null;
                return $q.reject(result);
            },
            // after getting response
            response: function (result) {
                exception.response(result);
                if (!result.config.hasOwnProperty('excludeLoading')) {
                    delete countRequests[result.config.uniqID];
                }
                !checkCount() ? loadingIndicatorService.endLoading() : null;
                return result;
            },

            // when response has an error.
            responseError: function (result) {
                try {
                    exception.responseError(result);
                } catch (e) {
                    countRequests = {};
                }
                if (result.hasOwnProperty('config') && !result.config.hasOwnProperty('excludeLoading')) {
                    delete countRequests[result.config.uniqID];
                }
                !checkCount() ? loadingIndicatorService.endLoading() : null;
                return $q.reject(result);
            }
        }
    })
};