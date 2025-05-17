module.exports = function (app) {
    app.factory('ActionLog', function (MailRoomModelInterceptor) {
        'ngInject';
        return function ActionLog(model) {
            var self = this;
            self.actionDate = null;
            self.actionLogType = null;
            self.mailId = null;
            self.user = null;
            self.actionDetails = null;
            self.bySystem = null;
            self.notes = null;
            self.systemNotes = null;


            if (model)
                angular.extend(this, model);

            // every model has required fields
            // if you don't need to make any required fields leave it as an empty array
            var requiredFields = [];
            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            ActionLog.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            ActionLog.prototype.getTimelineStatusColor = function () {
                return 'color-' + this.actionLogType.getTypeId();
            };

            ActionLog.prototype.isNotDeliveredActionLogType = function () {
                return this.actionLogType.getTypeId() === 5;
            };

            MailRoomModelInterceptor.runEvent('ActionLog', 'init', this);

        }
    });
};
