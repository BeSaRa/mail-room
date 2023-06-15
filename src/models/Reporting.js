module.exports = function (app) {
    app.factory('Reporting', function (MailInbox,
                                       MailRoomModelInterceptor) {
        'ngInject';
        return function Reporting(model) {
            var self = this;
            self.mail = new MailInbox();
            self.receivedDateFrom = null;
            self.receivedDateTo = null;
            self.registerDateFrom = null;
            self.registerDateTo = null;
            self.sentDateFrom = null;
            self.sentDateTo = null;

            self.actionLogType = null;
            self.employee = null;
            self.department = null;
            self.dateFrom = null;
            self.dateTo = null;
            self.local = null;
            self.resultFormat = ''; // PDF/EXCEL

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
                'mail.senderEntity',
                'mail.receiverEntity',
                'mail.referenceNo',
                'mail.senderEmployee',
                'mail.postType',
                'mail.entryType',
                'mail.statusType',
                'registerDateFrom',
                'registerDateTo',
                'sentDateFrom',
                'sentDateTo',
                'receivedDateFrom',
                'receivedDateTo',
                'actionLogType',
                'employee',
                'department',
                //   'dateFrom',
                // 'dateTo'
            ];

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            Reporting.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            /**
             * @description Get all fields to be checked when check disable form
             * @return {Array|disableFormCheckFields}
             */
            Reporting.prototype.getFormDisableCheckFields = function () {
                return disableFormCheckFields;
            };

            /**
             * @description Checks if the search form is empty
             * @returns {boolean}
             */
            Reporting.prototype.isSearchEmpty = function () {
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


            MailRoomModelInterceptor.runEvent('Reporting', 'init', this);

        }
    });
};
