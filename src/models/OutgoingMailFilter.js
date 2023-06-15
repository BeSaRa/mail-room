module.exports = function (app) {
    app.factory('OutgoingMailFilter', function (MailRoomModelInterceptor,
                                                FilterMail,
                                                lookupService) {
        'ngInject';
        return function OutgoingMailFilter(model) {
            var self = this;
            FilterMail.call(this);
            // self.mailType = 1;
            self.mailType = lookupService.getLookupByKeyName(lookupService.mailTypes,lookupService.mailTypesKeys.outgoing).getTypeId();

            if (model)
                angular.extend(this, model);

            var requiredFields = [];

            var disableFormSkipFields = [
                'isDeleted',
                'statusType',
                'mailType',
                'senderEntity',
                'popupHeaderTypes'
            ];

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            OutgoingMailFilter.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            /**
             * @description Get all fields to be skipped when check disable form
             * @return {Array|disableFormSkipFields}
             */
            OutgoingMailFilter.prototype.getFormDisableSkippingFields = function () {
                return disableFormSkipFields;
            };

            MailRoomModelInterceptor.runEvent('OutgoingMailFilter', 'init', this);

        }
    });
};