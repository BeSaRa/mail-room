module.exports = function (app) {
    app.factory('MailInbox', function (MailRoomModelInterceptor,
                                       dialog,
                                       mailRoomTemplate,
                                       configurationService,
                                       urlService,
                                       langService,
                                       lookupService,
                                       userInfoService,
                                       Indicator,
                                       printService) {
        'ngInject';
        return function MailInbox(model) {
            var self = this;

            self.id = null;
            self.addedBy = null;
            self.attachmentNo = null;
            self.barcode = null;
            self.isDeleted = false;
            self.isReturned = false;
            self.mailType = null;
            self.notes = null;
            self.postType = null;
            self.priority = null;
            self.receiverDep = null;
            self.receiverEntity = null;
            self.receiverEmployee = null;
            self.receiverID = null;
            self.receiverName = null;
            self.referenceNo = null;
            self.registerDate = null;
            self.relatedMailId = null;
            self.senderDep = null;
            self.senderEmployee = null;
            self.senderEntity = null;
            self.senderName = null;
            self.statusType = null;
            self.receiverNotes = null;
            self.sentDate = null;
            self.receivedDate = null;
            self.entryType = null;
            self.ownerEntity = null;
            self.email = null;
            self.mobile = null;
            self.idCopy = null;
            self.idType = null;
            self.signature = null;
            self.vsid = null;
            self.securityIntegration = 0;
            self.connectedPersonList = [];
            self.packageItemList = [];
            self.deliveryRequiredItemList = [];
            self.integratedSystemId = null;
            self.peerSysRefNo = null;
            self.integratedSystemInfo = null;

            if (model)
                angular.extend(this, model);

            /**
             * @description Contains the keys for popup header
             * @type {{addEdit: string, barcode: string, timeline: string, actionLog: string, send: string, receive: string}}
             */
            self.popupHeaderTypes = {
                addEdit: 'addEdit',
                barcode: 'barcode',
                timeline: 'timeline',
                actionLog: 'actionLog',
                send: 'send',
                receive: 'receive',
                tracking: 'tracking'
            };

            /**
             * @description Gets the text to be shown in the popup header
             * @param type
             * @param getKey
             * @returns {*}
             */
            MailInbox.prototype.getPopupHeaderText = function (type, getKey) {
                if (type === this.popupHeaderTypes.addEdit) {
                    if (getKey)
                        return this.isNewRecord() ? '' : 'lbl_edit';
                    return this.isNewRecord() ? langService.get('lbl_add_mail') : this.getMailReferenceNo();
                } else if (type === this.popupHeaderTypes.barcode || type === this.popupHeaderTypes.timeline || type === this.popupHeaderTypes.tracking || type === this.popupHeaderTypes.send || type === this.popupHeaderTypes.receive) {
                    return this.getMailReferenceNo();
                }
                return this.getNames();
            };

            /**
             * @description Gets the reference number of mail
             * @returns {string}
             */
            MailInbox.prototype.getNames = function () {
                return this.referenceNo;
            };

            /**
             * @description Gets the reference number of mail
             * @returns {string}
             */
            MailInbox.prototype.getTranslatedName = function () {
                return this.referenceNo;
            };

            MailInbox.prototype.getMailId = function () {
                return this.id;
            };

            MailInbox.prototype.getMailReferenceNo = function () {
                return this.referenceNo;
            };

            MailInbox.prototype.setRelatedMailId = function (relatedMailId) {
                return this.relatedMailId = relatedMailId;
            };

            MailInbox.prototype.setMailStatusType = function (statusId) {
                return this.statusType = statusId;
            };

            MailInbox.prototype.getRelatedMailId = function () {
                return this.relatedMailId;
            };

            /**
             * @description Determines if the record is current or already saved based on id
             * @returns {boolean}
             */
            MailInbox.prototype.isNewRecord = function () {
                return !this.id;
            };

            /**
             * @description Determines if the record is current or already saved based on id
             * @returns {boolean}
             */
            MailInbox.prototype.getReceiverEntity = function () {
                return this.receiverEntity;
            };

            /**
             * @description Gets the mail type of the mail
             * @returns {boolean}
             */
            MailInbox.prototype.getMailType = function () {
                return this.mailType;
            };

            MailInbox.prototype.isOutgoingMail = function () {
                return this.mailType === lookupService.getLookupByKeyName(lookupService.mailTypes, lookupService.mailTypesKeys.outgoing).getTypeId();
            };

            MailInbox.prototype.isIncomingMail = function () {
                return this.mailType === lookupService.getLookupByKeyName(lookupService.mailTypes, lookupService.mailTypesKeys.incoming).getTypeId();
            };

            MailInbox.prototype.isInternalMail = function () {
                return this.mailType === lookupService.getLookupByKeyName(lookupService.mailTypes, lookupService.mailTypesKeys.internal).getTypeId();
            };

            MailInbox.prototype.isNewMailStatus = function () {
                return this.statusType === lookupService.getLookupByKeyName(lookupService.statusTypes, lookupService.statusTypesKeys.new).getTypeId();
            };

            MailInbox.prototype.isSentMailStatus = function () {
                return this.statusType === lookupService.getLookupByKeyName(lookupService.statusTypes, lookupService.statusTypesKeys.sent).getTypeId();
            };

            MailInbox.prototype.isReceivedMailStatus = function () {
                return this.statusType === lookupService.getLookupByKeyName(lookupService.statusTypes, lookupService.statusTypesKeys.received).getTypeId();
            };

            MailInbox.prototype.isExpectedMailStatus = function () {
                return this.statusType === lookupService.getLookupByKeyName(lookupService.statusTypes, lookupService.statusTypesKeys.expected).getTypeId();
            };

            MailInbox.prototype.isNormalPriority = function () {
                return this.priority === lookupService.getLookupByKeyName(lookupService.priorityTypes, lookupService.priorityTypesKeys.normal).getTypeId();
            };

            MailInbox.prototype.isFastPriority = function () {
                return this.priority === lookupService.getLookupByKeyName(lookupService.priorityTypes, lookupService.priorityTypesKeys.fast).getTypeId();
            };

            MailInbox.prototype.isGeneralEntryType = function () {
                return this.entryType === lookupService.getLookupByKeyName(lookupService.entryTypes, lookupService.entryTypesKeys.general).getTypeId();
            };

            MailInbox.prototype.isCorrespondenceEntryType = function () {
                return this.entryType === lookupService.getLookupByKeyName(lookupService.entryTypes, lookupService.entryTypesKeys.correspondence).getTypeId();
            };

            MailInbox.prototype.isMailingRoomIntegratedSystem = function () {
                return this.integratedSystemId === configurationService.INTEGRATED_SYSTEM_MAILING_ROOM;
            };

            /**
             * @description Gets the url and model name for the mail
             * @param $event
             * @returns {*}
             */
            MailInbox.prototype.getUrlAndModelNameByMailType = function ($event) {
                if (this.isOutgoingMail()) {
                    return {url: urlService.outgoingMail, model: 'OutgoingMail', searchUrl: urlService.outgoingSearch};
                } else if (this.isIncomingMail()) {
                    return {url: urlService.incomingMail, model: 'IncomingMail', searchUrl: urlService.incomingSearch};
                }
                return {url: urlService.internalMail, model: 'InternalMail', searchUrl: urlService.internalSearch};
            };

            /**
             * @description Clears the fields from mail depending on current and target mail status
             * @param targetStatusKey
             */
            MailInbox.prototype.clearFields = function (targetStatusKey) {
                if (this.isSentMailStatus() && targetStatusKey === lookupService.statusTypesKeys.new) {
                    this.senderEmployee = null;
                    this.sentDate = null;
                } else if (this.isReceivedMailStatus() && targetStatusKey === lookupService.statusTypesKeys.new) {
                    this.senderEmployee = null;
                    this.sentDate = null;
                    this.receiverName = null;
                    this.receivedDate = null;
                    this.receiverNotes = null;
                } else if (this.isReceivedMailStatus() && targetStatusKey === lookupService.statusTypesKeys.sent) {
                    this.receiverName = null;
                    this.receivedDate = null;
                    this.receiverNotes = null;
                }
                return this;
            };

            /**
             * @description Opens the barcode dialog
             * @param $event
             */
            MailInbox.prototype.openBarcode = function ($event) {
                return dialog
                    .showDialog({
                        targetEvent: $event,
                        template: mailRoomTemplate.getPopup('barcode'),
                        controller: 'barcodePopCtrl',
                        controllerAs: 'ctrl',
                        bindToController: true,
                        escapeToClose: false,
                        locals: {
                            record: this
                        }
                    })

            };

            /**
             * @description Checks if the record value is equal to provided value
             * @param property
             * @param criteriaValue
             * @returns {boolean}
             */
            MailInbox.prototype.mailPropertyEquals = function (property, criteriaValue) {
                var recordValue = this[property];
                if (typeof recordValue !== 'undefined' && recordValue !== null) {
                    if (angular.isNumber(recordValue)) {
                        return Number(recordValue) === Number(criteriaValue);
                    } else if (angular.isString(recordValue)) {
                        return recordValue.toString().trim() === criteriaValue.toString().trim();
                    } else if (typeof (recordValue) === typeof (true)) {
                        return recordValue === criteriaValue;
                    }
                }
                return false;
            };

            /**
             * @description Checks if the record value contains provided value
             * @param property
             * @param criteriaValue
             * @returns {boolean}
             */
            MailInbox.prototype.mailPropertyContains = function (property, criteriaValue) {
                var recordValue = this[property];
                if (typeof recordValue !== 'undefined' && recordValue !== null) {
                    return recordValue.toString().trim().indexOf(criteriaValue.toString().trim()) > -1;
                }
                return false;
            };

            /**
             * @description Checks if the record value is between provided values
             * @param property
             * @param criteriaValue1
             * @param criteriaValue2
             * @returns {boolean}
             */
            MailInbox.prototype.mailPropertyDatesBetween = function (property, criteriaValue1, criteriaValue2) {
                var recordValue = this[property];
                if (typeof recordValue !== 'undefined' && recordValue !== null) {
                    if (!criteriaValue1)
                        return recordValue <= criteriaValue2;
                    else if (!criteriaValue2)
                        return recordValue >= criteriaValue1;
                    else
                        return recordValue >= criteriaValue1 && recordValue <= criteriaValue2;
                }
                return false;
            };

            var indicator = new Indicator();
            MailInbox.prototype.getMailTypeIndicator = function () {
                return indicator.getMailTypeIndicator(this);
            };

            MailInbox.prototype.getPriorityIndicator = function () {
                return indicator.getMailPriorityIndicator(this);
            };

            MailInbox.prototype.getMailStatusTypeIndicator = function () {
                return indicator.getMailStatusTypeIndicator(this);
            };

            MailInbox.prototype.getMailEntryTypeIndicator = function () {
                return indicator.getMailEntryTypeIndicator(this);
            };

            MailInbox.prototype.downloadIdCopy = function () {
                if (!this.idCopy) {
                    return;
                }
                printService.downloadFile(this.idCopy, 'Id_' + userInfoService.getTranslatedName(), 'png');
            };

            MailInbox.prototype.downloadSignature = function () {
                if (!this.signature) {
                    return;
                }
                printService.downloadFile(this.signature, 'Signature_' + userInfoService.getTranslatedName(), 'png');
            };

            MailRoomModelInterceptor.runEvent('MailInbox', 'init', this);

        }
    });
};
