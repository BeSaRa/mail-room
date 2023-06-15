module.exports = function (app) {
    app.service('trackingSheetService', function ($http,
                                                  urlService,
                                                  generator,
                                                  $q,
                                                  TrackingSheet) {
        'ngInject';
        var self = this;

        self.trackingSheets = [];

        /**
         * @description Load the Tracking Sheet from server.
         * @param mailId
         * @param $event
         * @returns {*}
         */
        self.loadTrackingSheets = function (mailId, $event) {
            mailId = mailId.hasOwnProperty('id') ? mailId.getMailId() : mailId;

            return $http.get(urlService.trackingSheet.change({id: mailId}))
                .then(function (result) {
                    self.trackingSheets = generator.generateCollection(result.data, TrackingSheet, self._sharedMethods);
                    self.trackingSheets = generator.interceptReceivedCollection('TrackingSheet', self.trackingSheets);
                    return self.trackingSheets;
                })
                .catch(function (error) {
                    return [];
                });
        };

        /**
         * @description Get Tracking Sheets from self.trackingSheets if found and if not load it from server again.
         * @returns {Promise|trackingSheets}
         */
        self.getTrackingSheets = function ($event) {
            return self.trackingSheets.length ? $q.when(self.trackingSheets) : self.loadTrackingSheets($event);
        };


    })
};