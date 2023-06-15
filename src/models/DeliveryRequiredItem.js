module.exports = function (app) {
    app.factory('DeliveryRequiredItem', function (MailRoomModelInterceptor, langService) {
        'ngInject';
        return function DeliveryRequiredItem(model) {
            var self = this;
            self.id = null;
            self.collected = false;
            self.keyStr = null;
            self.labelAr = null;
            self.labelEn = null;

            if (model)
                angular.extend(this, model);

            // every model has required fields
            // if you don't need to make any required fields leave it as an empty array
            var requiredFields = [
                'labelAr',
                'labelEn'
            ];

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            DeliveryRequiredItem.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            DeliveryRequiredItem.prototype.getTranslatedName = function (reverse) {
                return langService.current === 'ar'
                    ? (reverse ? this.labelEn : this.labelAr)
                    : (reverse ? this.labelAr : this.labelEn);
            };

            DeliveryRequiredItem.prototype.getTranslatedCollected = function () {
                return this.collected ? langService.get('lbl_yes') : langService.get('lbl_no');
            };

            /**
             * @description Returns the id of Connected Person
             * @returns {number}
             */
            DeliveryRequiredItem.prototype.getDeliveryRequiredItemId = function () {
                return this.id;
            };


            MailRoomModelInterceptor.runEvent('DeliveryRequiredItem', 'init', this);

        }
    });
};
