module.exports = function (app) {
    app.factory('Lookup', function (MailRoomModelInterceptor,
                                    generator) {
        'ngInject';
        return function Lookup(model) {
            var self = this, langService;
            self.typeId = null;
            self.keyName = null;
            self.enName = null;
            self.arName = null;

            // alternate properties because lookup service returns few lookups with different structure
            self.nameAr = null;
            self.nameEn = null;
            self.id = null;

            if (model)
                angular.extend(this, model);

            Lookup.prototype.setLangService = function (lang) {
                langService = lang;
            };

            /**
             * @description Gets the concatenated lookup name
             * @param separator
             * If passed, it will add separator between arabic and english names.
             * Otherwise it will add hyphen(-)
             * @returns {string}
             */
            Lookup.prototype.getNames = function (separator) {
                var arName = this.arName || this.nameAr,
                    enName = this.enName || this.nameEn;
                return arName + (separator ? separator : '-') + enName;
            };

            /**
             * @description Gets the lookup name according to current language
             * @param reverse
             * If true, it will return name opposite to current language
             * @returns {string}
             */
            Lookup.prototype.getTranslatedName = function (reverse) {
                var arName = this.arName || this.nameAr,
                    enName = this.enName || this.nameEn;
                return langService.current === 'ar' ? (reverse ? enName : arName) : (reverse ? arName : enName);
            };

            /**
             * @description Gets the key name of lookup
             * @returns {string}
             */
            Lookup.prototype.getKeyName = function () {
                return this.keyName;
            };

            /**
             * @description Gets the type id of lookup
             * @returns {string}
             */
            Lookup.prototype.getTypeId = function () {
                return generator.validRequired(this.typeId) ? this.typeId : this.id;
            };

            // don't remove MailRoomModelInterceptor from last line
            // should be always at last thing after all methods and properties.
            MailRoomModelInterceptor.runEvent('Lookup', 'init', this);
        }
    })
};
