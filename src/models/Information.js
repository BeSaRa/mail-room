module.exports = function (app) {
    app.factory('Information', function (MailRoomModelInterceptor, langService) {
        'ngInject';
        return function Information(model) {
            var self = this;
            self.id = null;
            self.arName = null;
            self.enName = null;
            self.parent = null;

            // every model has required fields
            // if you don't need to make any required fields leave it as an empty array
            var requiredFields = [];

            if (model)
                angular.extend(this, model);

            /**
             * get all required fields
             * @return {Array|requiredFields}
             */
            Information.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            /**
             * @description Gets the record name according to current language
             * @param reverse
             * If true, it will return name opposite to current language
             * @returns {string}
             */
            Information.prototype.getTranslatedName = function (reverse) {
                return langService.current === 'ar' ? (reverse ? this.enName : this.arName) : (reverse ? this.arName : this.enName);
            };

            // don't remove MailRoomModelInterceptor from last line
            // should be always at last thing after all methods and properties.
            MailRoomModelInterceptor.runEvent('Information', 'init', this);
        }
    })
};