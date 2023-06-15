module.exports = function (app) {
    app.factory('TrackingSheet', function (MailRoomModelInterceptor) {
        'ngInject';
        return function TrackingSheet(model) {
            var self = this;
            self.actionDate = null;
            self.actionLogType = null;
            self.id = null;
            self.mailId = null;
            self.mailType = null;
            self.entryType = null;
            self.user = null;
            self.receiverEntity = null;
            self.senderEntity = null;

            if (model)
                angular.extend(this, model);

            // every model has required fields
            // if you don't need to make any required fields leave it as an empty array
            var requiredFields = [];
            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            TrackingSheet.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            MailRoomModelInterceptor.runEvent('TrackingSheet', 'init', this);

        }
    });
};