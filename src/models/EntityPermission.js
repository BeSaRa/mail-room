module.exports = function (app) {
    app.factory('EntityPermission', function (MailRoomModelInterceptor,
                                            langService) {
        'ngInject';
        return function EntityPermission(model) {
            var self = this;
            self.id = null;
            self.arName = null;
            self.enName = null;
            self.permissions = [];

            if (model)
                angular.extend(this, model);

            // every model has required fields
            // if you don't need to make any required fields leave it as an empty array
            var requiredFields = [];

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            EntityPermission.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            /**
             * @description Returns the id of employee
             * @returns {number}
             */
            EntityPermission.prototype.getEntityPermissionId = function () {
                return this.id;
            };

            /**
             * @description Gets the concatenated entity permission name
             * @param separator
             * If passed, it will add separator between arabic and english names.
             * Otherwise it will add hyphen(-)
             * @returns {string}
             */
            EntityPermission.prototype.getNames = function (separator) {
                return this.arName + (separator ? separator : ' - ') + this.enName;
            };

            /**
             * @description Gets the entity permission name according to current language
             * @param reverse
             * If true, it will return name opposite to current language
             * @returns {string}
             */
            EntityPermission.prototype.getTranslatedName = function (reverse) {
                return langService.current === 'ar'
                    ? (reverse ? this.enName : this.arName)
                    : (reverse ? this.arName : this.enName);
            };

            MailRoomModelInterceptor.runEvent('EntityPermission', 'init', this);

        }
    });
};