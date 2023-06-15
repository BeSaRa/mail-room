module.exports = function (app) {
    app.factory('Permission', function (MailRoomModelInterceptor) {
        'ngInject';
        return function Permission(model) {
            var self = this,
                langService;
            self.id = null;
            self.arName = null;
            self.enName = null;
            self.value = true;

            // every model has required fields
            // if you don't need to make any required fields leave it as an empty array
            var requiredFields = [];

            if (model)
                angular.extend(this, model);


            /**
             * @description Set langService
             * @return {Array|requiredFields}
             */
            Permission.prototype.setLangService = function (service) {
                langService = service;
                return this;
            };

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            Permission.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            /**
             * @description Determines if the record is current or already saved based on id
             * @returns {boolean}
             */
            Permission.prototype.isNewRecord = function () {
                return !this.id;
            };

            /**
             * @description Gets the concatenated permission name
             * @param separator
             * If passed, it will add separator between arabic and english names.
             * Otherwise it will add hyphen(-)
             * @returns {string}
             */
            Permission.prototype.getNames = function (separator) {
                return this.arName + ' ' + (separator ? separator : '-') + ' ' + this.enName;
            };

            /**
             * @description Gets the permission name according to current language
             * @param reverse
             * If true, it will return name opposite to current language
             * @returns {string}
             */
            Permission.prototype.getTranslatedName = function (reverse) {
                return langService.current === 'ar'
                    ? (reverse ? this.enName : this.arName)
                    : (reverse ? this.arName : this.enName);
            };

            /**
             * @description Get the status of entity name as Active or Inactive instead of true or false.
             * @returns {string}
             */
            Permission.prototype.getTranslatedStatus = function () {
                return this.status ? langService.get('lbl_active') : langService.get('lbl_inactive');
            };

            /**
             * @description Get the globalization of entity name as Yes or No instead of true or false.
             * @returns {string}
             */
            Permission.prototype.getTranslatedGlobal = function () {
                return this.global ? langService.get('lbl_yes') : langService.get('lbl_no');
            };

            // don't remove MailRoomModelInterceptor from last line
            // should be always at last thing after all methods and properties.
            MailRoomModelInterceptor.runEvent('Permission', 'init', this);
        }
    })
};