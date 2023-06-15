module.exports = function (app) {
    app.service('actionLogService', function ($http,
                                              urlService,
                                              generator,
                                              $q,
                                              ActionLog) {
        'ngInject';
        var self = this;

        self.actionLogs = [];
        self.timelineRecords = [];

        /**
         * @description Load the Action Logs from server.
         * @param mailId
         * @param $event
         * @returns {*}
         */
        self.loadActionLogs = function (mailId, $event) {
            mailId = mailId.hasOwnProperty('id') ? mailId.getMailId() : mailId;

            return $http.get(urlService.actionLog.change({id: mailId}))
                .then(function (result) {
                    self.actionLogs = generator.generateCollection(result.data, ActionLog, self._sharedMethods);
                    self.actionLogs = generator.interceptReceivedCollection('ActionLog', self.actionLogs);
                    return self.actionLogs;
                })
                .catch(function (error) {
                    return [];
                });
        };

        /**
         * @description Get action Log from self.actionLogs if found and if not load it from server again.
         * @returns {Promise|actionLogs}
         */
        self.getActionLogs = function ($event) {
            return self.actionLogs.length ? $q.when(self.actionLogs) : self.loadActionLogs($event);
        };


        /**
         * @description Load Timeline log from the server
         * @param mailId
         * @param $event
         * @returns {*}
         */
        self.loadTimeline = function (mailId, $event) {
            mailId = mailId.hasOwnProperty('id') ? mailId.getMailId() : mailId;

            return $http.get(urlService.timeline.change({id: mailId}))
                .then(function (result) {
                    self.timelineRecords = generator.generateCollection(result.data, ActionLog, self._sharedMethods);
                    self.timelineRecords = generator.interceptReceivedCollection('ActionLog', self.timelineRecords);
                    return self.timelineRecords;
                })
                .catch(function (error) {
                    return [];
                });
        }

    })
};