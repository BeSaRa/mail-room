module.exports = function (app) {
    app.factory('InternalMailFilter', function (MailRoomModelInterceptor,
                                                FilterMail,
                                                lookupService) {
        'ngInject';
        return function InternalMailFilter(model) {
            var self = this;
            FilterMail.call(this);
            self.mailType = lookupService.getLookupByKeyName(lookupService.mailTypes, lookupService.mailTypesKeys.internal).getTypeId();

            if (model)
                angular.extend(this, model);

            var requiredFields = [];

            var disableFormSkipFields = [
                'isDeleted',
                'statusType',
                'mailType',
                'senderEntity',
                'receiverEntity',
                'popupHeaderTypes'
            ];

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            InternalMailFilter.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            /**
             * @description Get all fields to be skipped when check disable form
             * @return {Array|disableFormSkipFields}
             */
            InternalMailFilter.prototype.getFormDisableSkippingFields = function () {
                return disableFormSkipFields;
            };

            MailRoomModelInterceptor.runEvent('InternalMailFilter', 'init', this);

        }
    });
};