module.exports = function (app) {
    app.factory('InternalMail', function (MailRoomModelInterceptor,
                                          MailInbox,
                                          lookupService) {
        'ngInject';
        return function InternalMail(model) {
            var self = this;
            MailInbox.call(this);
            self.mailType = lookupService.getLookupByKeyName(lookupService.mailTypes, lookupService.mailTypesKeys.internal).getTypeId();

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
            InternalMail.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            MailRoomModelInterceptor.runEvent('InternalMail', 'init', this);

        }
    });
};