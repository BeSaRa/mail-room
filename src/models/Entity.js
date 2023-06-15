module.exports = function (app) {
    app.factory('Entity', function (MailRoomModelInterceptor,
                                    EntityType,
                                    configurationService,
                                    langService,
                                    Indicator) {
        'ngInject';
        return function Entity(model) {
            var self = this, $http;
            self.id = null;
            self.arName = null;
            self.enName = null;
            self.active = true;
            self.deleted = null;
            self.entityLevel = null;
            self.entityType = new EntityType();
            self.entityTypeId = null;
            self.parentId = null;
            self.responsibleEmail = null;
            self.responsibleName = null;
            self.rootId = null;
            self.isUseSystem = true;
            self.entityCode = null;
            self.refId = null;
            self.integratedSystemId = null;

            if (model)
                angular.extend(this, model);

            // every model has required fields
            // if you don't need to make any required fields leave it as an empty array
            var requiredFields = [
                'arName',
                'enName',
                'entityTypeId',
                'responsibleEmail',
                'responsibleName',
                'active',
                'isUseSystem',
                'entityCode',
                'integratedSystemId'
            ];

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            Entity.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            /**
             * @description Contains the keys for popup header
             * @type {{addEdit: string, barcode: string, timeline: string, actionLog: string, send: string, receive: string}}
             */
            self.popupHeaderTypes = {
                addEditEntity: 'addEditEntity',
                addEditDep: 'addEditDepartment'
            };

            /**
             * @description Gets the text to be shown in the popup header
             * @param type
             * @param getKey
             * @returns {*}
             */
            Entity.prototype.getPopupHeaderText = function (type, getKey) {
                if (type === this.popupHeaderTypes.addEditEntity) {
                    if (getKey)
                        return this.isNewRecord() ? '' : 'lbl_edit';
                    return this.isNewRecord() ? langService.get('lbl_add_entity') : this.getTranslatedName();
                } else if (type === this.popupHeaderTypes.addEditDep) {
                    if (getKey)
                        return this.isNewRecord() ? '' : 'lbl_edit';
                    return this.isNewRecord() ? langService.get('lbl_add_department') : this.getTranslatedName();
                } else {
                    return this.getNames();
                }
            };

            /**
             * @description Determines if the record is current or already saved based on id
             * @returns {boolean}
             */
            Entity.prototype.isNewRecord = function () {
                return !this.id;
            };

            /**
             * @description Returns the id of entity
             * @returns {number}
             */
            Entity.prototype.getEntityId = function () {
                return this.id;
            };

            /**
             * @description Returns the id of entity type for this entity
             * @returns {number}
             */
            Entity.prototype.getEntityTypeId = function () {
                return this.entityTypeId;
            };

            /**
             * @description Gets the concatenated entity name
             * @param separator
             * If passed, it will add separator between arabic and english names.
             * Otherwise it will add hyphen(-)
             * @returns {string}
             */
            Entity.prototype.getNames = function (separator) {
                return this.arName + (separator ? separator : ' - ') + this.enName;
            };

            /**
             * @description Gets the entity name according to current language
             * @param reverse
             * If true, it will return name opposite to current language
             * @returns {string}
             */
            Entity.prototype.getTranslatedName = function (reverse) {
                return langService.current === 'ar'
                    ? (reverse ? this.enName : this.arName)
                    : (reverse ? this.arName : this.enName);
            };

            Entity.prototype.getTranslatedStatus = function () {
                return this.active ? langService.get('lbl_active') : langService.get('lbl_inactive');
            };

            Entity.prototype.getTranslatedIsUseSystem = function () {
                return this.isUseSystem ? langService.get('lbl_yes') : langService.get('lbl_no');
            };

            Entity.prototype.isActive = function () {
                return this.active;
            };

            Entity.prototype.checkIsUseSystem = function () {
                return this.isUseSystem;
            };

            Entity.prototype.hasParentEntity = function () {
                return !!this.parentId;
            };

            var indicator = new Indicator();
            Entity.prototype.getEntityUseSystemIndicator = function () {
                return indicator.getEntityUseSystemIndicator(this.checkIsUseSystem());
            };

            MailRoomModelInterceptor.runEvent('Entity', 'init', this);

        }
    });
};
