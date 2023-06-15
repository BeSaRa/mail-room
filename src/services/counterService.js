module.exports = function (app) {
    app.service('counterService', function (urlService,
                                            errorCode,
                                            $http,
                                            $q,
                                            generator,
                                            Counter,
                                            _) {
        'ngInject';
        var self = this;
        self.serviceName = 'counterService';
        self.counter = {};
        /**
         * load all counters for service
         */
        self.loadCounters = function () {
            return $http.get(urlService.mailCounter, {
                excludeLoading: true
            }).then(function (result) {
                self.counter = generator.interceptReceivedInstance('Counter', generator.generateInstance(result.data, Counter));
                return self.counter;
            }).catch(function (error) {

            });
        };
    });
};
