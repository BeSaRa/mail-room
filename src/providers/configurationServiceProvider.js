module.exports = function (app) {
    app.provider('configurationService', function () {
        'ngInject';
        var provider = this, configuration = {
            INTEGRATED_SYSTEM_MAILING_ROOM: 0,

        };
        var configurationServiceProvider = provider;

        /**
         *
         * @param key
         * @param value
         * @param unionArray
         * @return {configurationServiceProvider}
         */
        provider.updateConfiguration = function (key, value, unionArray) {
            if (configuration.hasOwnProperty(key)) {
                if (angular.isArray(configuration[key]) && unionArray) {
                    configuration[key] = configuration[key].concat(value);
                } else {
                    configuration[key] = value;
                }
            }
            return this;
        };

        provider.$get = function () {
            'ngInject';
            return configuration;
        }
    });
};
