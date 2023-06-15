module.exports = function (app) {
    app.factory('SearchMail', function (MailRoomModelInterceptor,
                                        authenticationService,
                                        MailInbox) {
        'ngInject';
        return function SearchMail(model) {
            var self = this;
            //TODO: check the ownerEntity when permissions are implemented
            self.mail = new MailInbox({ownerEntity: Number(authenticationService.getLastLoginEntityId())});
            self.receivedDateFrom = null;
            self.receivedDateTo = null;
            self.registerDateFrom = null;
            self.registerDateTo = null;
            self.sentDateFrom = null;
            self.sentDateTo = null;

            if (model)
                angular.extend(this, model);

            var requiredFields = [];

            /**
             * @description Contains fields to check while checking the form disabled
             * @type {string[]}
             */
            var disableFormCheckFields = [
                'mail.mailType',
                'mail.priority',
                'mail.postType',
                'mail.senderEntity',
                'mail.receiverEntity',
                'mail.referenceNo',
                'mail.notes',
                'registerDateFrom',
                'registerDateTo',
                'sentDateFrom',
                'sentDateTo',
                'receivedDateFrom',
                'receivedDateTo'
            ];

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            SearchMail.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            /**
             * @description Get all fields to be checked when check disable form
             * @return {Array|disableFormCheckFields}
             */
            SearchMail.prototype.getFormDisableCheckFields = function () {
                return disableFormCheckFields;
            };

            /**
             * @description Checks if the search form is empty
             * @returns {boolean}
             */
            SearchMail.prototype.isSearchEmpty = function () {
                var isEmpty = true, value;
                var keys = this.getFormDisableCheckFields(), key, keySplit;
                for (var i = 0; i < keys.length; i++) {
                    key = keys[i];
                    if (key.indexOf('.') > -1) {
                        keySplit = key.split('.');
                        value = this;
                        for (var j = 0; j < keySplit.length; j++) {
                            value = value[keySplit[j]];
                        }
                    }
                    else {
                        value = this[key];
                    }

                    if (value !== undefined && value !== null && value !== '') {
                        isEmpty = false;
                        break;
                    }
                }
                return isEmpty;
            };


            MailRoomModelInterceptor.runEvent('SearchMail', 'init', this);

        }
    });
};
