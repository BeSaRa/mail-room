module.exports = function (app) {
    app.factory('OutgoingMail', function (MailRoomModelInterceptor,
                                          MailInbox,
                                          lookupService) {
        'ngInject';
        return function OutgoingMail(model) {
            var self = this;
            MailInbox.call(this);
            self.mailType = lookupService.getLookupByKeyName(lookupService.mailTypes,lookupService.mailTypesKeys.outgoing).getTypeId();

            if (model)
                angular.extend(this, model);

            var requiredFields = [
                'senderEntity',
                'senderDep',
                'receiverEntity',
                'receiverDep',
                'priority',
                'registerDate',
                'attachmentNo'
            ];

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            OutgoingMail.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            MailRoomModelInterceptor.runEvent('OutgoingMail', 'init', this);

        }
    });
};