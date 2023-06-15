module.exports = function (app) {
    app.factory('FilterMail', function (MailRoomModelInterceptor,
                                        MailInbox) {
        'ngInject';
        return function FilterMail(model) {
            var self = this, filterComparisonMap = {
                equals: {
                    callback: 'mailPropertyEquals',
                    fields: ['addedBy', 'attachmentNo', 'isDeleted', 'mailType', 'postType', 'entryType',
                        'status', 'priority', 'receiverDep', 'receiverEntity', 'senderEmployee',
                        'senderEntity', 'senderDep'
                    ]
                },
                contains: {
                    callback: 'mailPropertyContains',
                    fields: ['referenceNo', 'notes', 'receiverName', 'receiverNotes']
                },
                datesBetween: {
                    callback: 'mailPropertyDatesBetween',
                    fields: ['registerDateFrom', 'registerDateTo', 'sentDateFrom', 'sentDateTo', 'receivedDateFrom', 'receivedDateTo']
                }
            };
            MailInbox.call(this);

            self.registerDateFrom = null;
            self.registerDateTo = null;

            self.sentDateFrom = null;
            self.sentDateTo = null;

            self.receivedDateFrom = null;
            self.receivedDateTo = null;



            if (model)
                angular.extend(this, model);

            /**
             * @description Gets the comparison map
             * @returns {{equals: {callback: string, fields: string[]}, contains: {callback: string, fields: string[]}, datesBetween: {callback: string, fields: string[]}}}
             */
            FilterMail.prototype.getComparisonMap = function () {
                return filterComparisonMap;
            };

            /**
             * @description Returns object containing field and callback function.
             */
            FilterMail.prototype.getComparisonMapSimplified = function () {
                var map = {};
                for (var key in filterComparisonMap) {
                    for (var i = 0; i < filterComparisonMap[key].fields.length; i++) {
                        map[filterComparisonMap[key].fields[i]] = filterComparisonMap[key].callback;
                    }
                }
                return map;
            };

            /**
             * @description Checks if the filter form is empty
             * @returns {boolean}
             */
            FilterMail.prototype.isFilterEmpty = function () {
                var isEmpty = true;
                var keys = Object.keys(this), key;
                for (var i = 0; i < keys.length; i++) {
                    key = keys[i];
                    // field should be added to skip array in model.
                    // this array contains fields which we can skip while checking form disabled.
                    if (this.getFormDisableSkippingFields().indexOf(key) === -1) {
                        if (this[key] !== undefined && this[key] !== null && this[key] !== '') {
                            isEmpty = false;
                            break;
                        }
                    }
                }
                return isEmpty;
            };

            /**
             * @description Gets the properties in object that have value
             * @returns {Array}
             */
            FilterMail.prototype.getPropertiesWithValue = function () {
                var finalKeys = [];
                var keys = Object.keys(this), key;
                for (var i = 0; i < keys.length; i++) {
                    key = keys[i];
                    if (this[key] !== undefined && this[key] !== null && this[key] !== '') {
                        finalKeys.push(key);
                    }
                }
                return finalKeys;
            };
        }
    });
};