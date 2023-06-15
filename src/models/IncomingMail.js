module.exports = function (app) {
    app.factory('IncomingMail', function (MailRoomModelInterceptor,
                                          MailInbox,
                                          lookupService) {
        'ngInject';
        return function IncomingMail(model) {
            var self = this;
            MailInbox.call(this);
            self.mailType = lookupService.getLookupByKeyName(lookupService.mailTypes,lookupService.mailTypesKeys.incoming).getTypeId();

            if (model)
                angular.extend(this, model);


            var requiredFields = [
                'senderEntity',
                'senderDep',
                'receiverEntity',
                'receiverDep',
                'priority',
                'postType',
                'registerDate',
                'attachmentNo'
            ];

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            IncomingMail.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            MailRoomModelInterceptor.runEvent('IncomingMail', 'init', this);

        }
    });
};