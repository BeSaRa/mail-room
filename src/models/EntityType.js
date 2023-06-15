module.exports = function (app) {
    app.factory('EntityType', function (MailRoomModelInterceptor) {
        'ngInject';
        return function EntityType(model) {
            var self = this, $http, langService;
            self.id = null;
            self.arName = null;
            self.enName = null;

            if (model)
                angular.extend(this, model);

            // every model has required fields
            // if you don't need to make any required fields leave it as an empty array
            var requiredFields = [
                'arName',
                'enName'
            ];

            EntityType.prototype.setLangService = function (service) {
                langService = service;
                return this;
            };

            self.popupHeaderTypes = {
                addEdit: 'addEditEntityType'
            };

            /**
             * @description Gets the text to be shown in the popup header
             * @param type
             * @param getKey
             * @returns {*}
             */
            EntityType.prototype.getPopupHeaderText = function (type, getKey) {
                if (type === this.popupHeaderTypes.addEdit) {
                    if (getKey)
                        return this.isNewRecord() ? '' : 'lbl_edit';
                    return this.isNewRecord() ? langService.get('lbl_add_entity_type') : this.getTranslatedName();
                }
                return this.getNames();
            };

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            EntityType.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            /**
             * @description Determines if the record is current or already saved based on id
             * @returns {boolean}
             */
            EntityType.prototype.isNewRecord = function () {
                return !this.id;
            };

            /**
             * @description Returns the id of entity type
             * @returns {number}
             */
            EntityType.prototype.getEntityTypeId = function () {
                return this.id;
            };

            /**
             * @description Gets the concatenated entity type name
             * @param separator
             * If passed, it will add separator between arabic and english names.
             * Otherwise it will add hyphen(-)
             * @returns {string}
             */
            EntityType.prototype.getNames = function (separator) {
                return this.arName + (separator ? separator : ' - ') + this.enName;
            };

            /**
             * @description Gets the entity type name according to current language
             * @param reverse
             * If true, it will return name opposite to current language
             * @returns {string}
             */
            EntityType.prototype.getTranslatedName = function (reverse) {
                return langService.current === 'ar'
                    ? (reverse ? this.enName : this.arName)
                    : (reverse ? this.arName : this.enName);
            };

            MailRoomModelInterceptor.runEvent('EntityType', 'init', this);

        }
    });
};