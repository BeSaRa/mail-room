module.exports = function (app) {
    app.factory('errorCode', function ($q) {
        'ngInject';

        var errorCodes = {
            UNAUTHORIZED: 401,
            REQUEST_FORBIDDEN: 403,
            EMPTY_RESULT: 500
        };

        return {
            checkIf: function (error, errorCode, callback) {
                var code = error.hasOwnProperty('data') ? error.data.ec : error;
                if (code === errorCodes[errorCode]) {
                    if (callback)
                        return callback();
                    return true;
                }
                return $q.reject(error);
            }
        }
    })
};