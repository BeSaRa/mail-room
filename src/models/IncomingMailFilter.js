module.exports = function (app) {
    app.factory('IncomingMailFilter', function (MailRoomModelInterceptor,
                                                FilterMail,
                                                lookupService) {
        'ngInject';
        return function IncomingMailFilter(model) {
            var self = this;
            FilterMail.call(this);
            self.mailType = lookupService.getLookupByKeyName(lookupService.mailTypes,lookupService.mailTypesKeys.incoming).getTypeId();

            if (model)
                angular.extend(this, model);


            var requiredFields = [];

            var disableFormSkipFields = [
                'isDeleted',
                'statusType',
                'mailType',
                'receiverEntity',
                'popupHeaderTypes'
            ];

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            IncomingMailFilter.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            /**
             * @description Get all fields to be skipped when check disable form
             * @return {Array|disableFormSkipFields}
             */
            IncomingMailFilter.prototype.getFormDisableSkippingFields = function () {
                return disableFormSkipFields;
            };

            MailRoomModelInterceptor.runEvent('IncomingMailFilter', 'init', this);

        }
    });
};