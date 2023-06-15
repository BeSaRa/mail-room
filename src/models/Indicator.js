module.exports = function (app) {
    app.factory('Indicator', function (MailRoomModelInterceptor,
                                       langService) {
        'ngInject';
        return function Indicator(model) {
            var self = this;
            self.key = null;
            self.class = null;
            self.text = null;
            self.icon = null;
            self.tooltip = null;
            self.value = null;
            self.svgIcon = null;

            if (model)
                angular.extend(this, model);

            self.icons = {};
            self.icons.isUseSystem = {
                icon: 'email-check',
                svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false"><g id="email-check"><path d="M21,13.34C20.37,13.12 19.7,13 19,13A6,6 0 0,0 13,19C13,19.34 13.03,19.67 13.08,20H3A2,2 0 0,1 1,18V6C1,4.89 1.89,4 3,4H19A2,2 0 0,1 21,6V13.34M23.5,17L18.5,22L15,18.5L16.5,17L18.5,19L22,15.5L23.5,17M3,6V8L11,13L19,8V6L11,11L3,6Z"></path></g></svg>'
            };
            self.icons.isNotUseSystem = {
                icon: 'mail-cancel',
                svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24;" xml:space="preserve" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" focusable="false">\n' +
                    '<path d="M3,4C1.9,4,1,4.9,1,6v12c0,1.1,0.9,2,2,2h11.1C14,19.5,14,19.1,14,18.6c0.2-2.9,2.6-5.3,5.5-5.5c0.5,0,1,0,1.4,0.1V6\n' +
                    '\tc0-1.1-0.9-2-2-2H3 M3,6l8,5l8-5v2l-8,5L3,8V6 M16.2,17.3l2.4,1.8l-1.8,2.4l1.6,1.2l1.8-2.4l2.4,1.8l1.2-1.6l-2.4-1.8l1.8-2.4\n' +
                    '\tl-1.6-1.2l-1.8,2.4l-2.4-1.8L16.2,17.3z"></path>\n' +
                    '</svg>'
            };
            self.icons.outgoingMail = {
                icon: 'arrow-up-bold-box',
                svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false"><g id="arrow-up-bold-box"><path d="M19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21M12,7L7,12H10V16H14V12H17L12,7Z"></path></g></svg>'
            };
            self.icons.incomingMail = {
                icon: 'arrow-down-bold-box',
                svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false"><g id="arrow-down-bold-box"><path d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M12,17L17,12H14V8H10V12H7L12,17Z"></path></g></svg>'
            };
            self.icons.internalMail = {
                icon: 'recycle',
                svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false"><g id="recycle"><path d="M21.82,15.42L19.32,19.75C18.83,20.61 17.92,21.06 17,21H15V23L12.5,18.5L15,14V16H17.82L15.6,12.15L19.93,9.65L21.73,12.77C22.25,13.54 22.32,14.57 21.82,15.42M9.21,3.06H14.21C15.19,3.06 16.04,3.63 16.45,4.45L17.45,6.19L19.18,5.19L16.54,9.6L11.39,9.69L13.12,8.69L11.71,6.24L9.5,10.09L5.16,7.59L6.96,4.47C7.37,3.64 8.22,3.06 9.21,3.06M5.05,19.76L2.55,15.43C2.06,14.58 2.13,13.56 2.64,12.79L3.64,11.06L1.91,10.06L7.05,10.14L9.7,14.56L7.97,13.56L6.56,16H11V21H7.4C6.47,21.07 5.55,20.61 5.05,19.76Z"></path></g></svg>'
            };
            self.icons.generalEntryType = {
                icon: 'mailbox',
                svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false"><g id="mailbox"><path d="M20,6H10V12H8V4H14V0H6V6H4A2,2 0 0,0 2,8V20A2,2 0 0,0 4,22H20A2,2 0 0,0 22,20V8A2,2 0 0,0 20,6Z"></path></g></svg>'
            };
            self.icons.correspondenceEntryType = {
                icon: 'email',
                svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false"><g id="email"><path d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4Z"></path></g></svg>'
            };
            self.icons.fastMailPriority = {
                icon: 'clock-fast',
                svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false"><g id="clock-fast"><path d="M15,4A8,8 0 0,1 23,12A8,8 0 0,1 15,20A8,8 0 0,1 7,12A8,8 0 0,1 15,4M15,6A6,6 0 0,0 9,12A6,6 0 0,0 15,18A6,6 0 0,0 21,12A6,6 0 0,0 15,6M14,8H15.5V11.78L17.83,14.11L16.77,15.17L14,12.4V8M2,18A1,1 0 0,1 1,17A1,1 0 0,1 2,16H5.83C6.14,16.71 6.54,17.38 7,18H2M3,13A1,1 0 0,1 2,12A1,1 0 0,1 3,11H5.05L5,12L5.05,13H3M4,8A1,1 0 0,1 3,7A1,1 0 0,1 4,6H7C6.54,6.62 6.14,7.29 5.83,8H4Z"></path></g></svg>'
            };
            self.icons.normalMailPriority = {
                icon: 'clock-outline',
                svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false"><g id="clock-outline"><path d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"></path></g></svg>'
            };
            self.icons.newMailStatus = {
                icon: 'new-box',
                svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false"><g id="new-box"><path d="M20,4C21.11,4 22,4.89 22,6V18C22,19.11 21.11,20 20,20H4C2.89,20 2,19.11 2,18V6C2,4.89 2.89,4 4,4H20M8.5,15V9H7.25V12.5L4.75,9H3.5V15H4.75V11.5L7.3,15H8.5M13.5,10.26V9H9.5V15H13.5V13.75H11V12.64H13.5V11.38H11V10.26H13.5M20.5,14V9H19.25V13.5H18.13V10H16.88V13.5H15.75V9H14.5V14A1,1 0 0,0 15.5,15H19.5A1,1 0 0,0 20.5,14Z"></path></g></svg>'
            };//'email-plus';
            self.icons.sentMailStatus = {
                icon: 'call-made',
                svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false"><g id="call-made"><path d="M9,5V7H15.59L4,18.59L5.41,20L17,8.41V15H19V5"></path></g></svg>'
            };
            self.icons.receivedMailStatus = {
                icon: 'call-received',
                svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false"><g id="call-received"><path d="M20,5.41L18.59,4L7,15.59V9H5V19H15V17H8.41"></path></g></svg>'
            };
            self.icons.expectedMailStatus = {
                icon: 'alert-decagram',
                svgIcon: '<svg xmlns="http://www.w3.org/2000/svg" fit="" height="100%" width="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24" focusable="false"><g id="alert-decagram"><path d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12M13,17H11V15H13V17M13,13H11V7H13V13Z"></path></g></svg>'
            };

            /**
             * @description Returns the mail type indicator and description
             * @param mail
             * @returns {Indicator|*}
             */
            self.getMailTypeIndicator = function (mail) {
                var icon = mail.isOutgoingMail() ? self.icons.outgoingMail : (mail.isIncomingMail() ? self.icons.incomingMail : self.icons.internalMail);
                var text = mail.isOutgoingMail() ? 'indicator_outgoing_mail' : (mail.isIncomingMail() ? 'indicator_incoming_mail' : 'indicator_internal_mail');

                return new Indicator({
                    class: 'indicator',
                    text: text,
                    icon: icon.icon,
                    tooltip: text,
                    svgIcon: icon.svgIcon
                });
            };

            /**
             * @description Returns the use system indicator and description
             * @param isUseSystem
             * @returns {Indicator|*}
             */
            self.getEntityUseSystemIndicator = function (isUseSystem) {
                if (isUseSystem) {
                    return new Indicator({
                        class: 'indicator green',
                        text: 'indicator_entity_using_system',
                        icon: self.icons.isUseSystem.icon,
                        tooltip: 'indicator_entity_using_system',
                        svgIcon: self.icons.isUseSystem.svgIcon
                    });
                }
                else {
                    return new Indicator({
                        class: 'indicator red',
                        text: 'indicator_entity_not_using_system',
                        icon: self.icons.isNotUseSystem.icon,
                        tooltip: 'indicator_entity_not_using_system',
                        svgIcon: self.icons.isNotUseSystem.svgIcon
                    });
                }
            };

            /**
             * @description Returns the entry type indicator and description
             * @param mail
             * @returns {Indicator|*}
             */
            self.getMailEntryTypeIndicator = function (mail) {
                if (mail.isCorrespondenceEntryType()) {
                    return new Indicator({
                        class: 'indicator',
                        text: 'indicator_entry_type_correspondence',
                        icon: self.icons.correspondenceEntryType.icon,
                        tooltip: 'indicator_entry_type_correspondence',
                        svgIcon: self.icons.correspondenceEntryType.svgIcon
                    });
                }
                else if (mail.isGeneralEntryType()) {
                    return new Indicator({
                        class: 'indicator',
                        text: 'indicator_entry_type_general',
                        icon: self.icons.generalEntryType.icon,
                        tooltip: 'indicator_entry_type_general',
                        svgIcon: self.icons.generalEntryType.svgIcon
                    });
                }
                return null;
            };

            /**
             * @description Returns the priority indicator and description
             * @param mail
             * @returns {Indicator|*}
             */
            self.getMailPriorityIndicator = function (mail) {
                if (mail.isNormalPriority()) {
                    return new Indicator({
                        class: 'indicator green',
                        text: 'indicator_priority_normal',
                        icon: self.icons.normalMailPriority.icon,
                        tooltip: 'indicator_priority_normal',
                        svgIcon: self.icons.normalMailPriority.svgIcon
                    });
                }
                else if (mail.isFastPriority()) {
                    return new Indicator({
                        class: 'indicator red',
                        text: 'indicator_priority_fast',
                        icon: self.icons.fastMailPriority.icon,
                        tooltip: 'indicator_priority_fast',
                        svgIcon: self.icons.fastMailPriority.svgIcon
                    });
                }
                return null;
            };

            /**
             * @description Returns the mail status type indicator and description
             * @param mail
             * @returns {Indicator|*}
             */
            self.getMailStatusTypeIndicator = function (mail) {
                if (mail.isNewMailStatus()) {
                    return new Indicator({
                        class: 'indicator',
                        text: 'indicator_new_mail_status',
                        icon: self.icons.newMailStatus.icon,
                        tooltip: 'indicator_new_mail_status',
                        svgIcon: self.icons.newMailStatus.svgIcon
                    });
                }
                else if (mail.isSentMailStatus()) {
                    return new Indicator({
                        class: 'indicator',
                        text: 'indicator_sent_mail_status',
                        icon: self.icons.sentMailStatus.icon,
                        tooltip: 'indicator_sent_mail_status',
                        svgIcon: self.icons.sentMailStatus.svgIcon
                    });
                }
                else if (mail.isReceivedMailStatus()) {
                    return new Indicator({
                        class: 'indicator',
                        text: 'indicator_received_mail_status',
                        icon: self.icons.receivedMailStatus.icon,
                        tooltip: 'indicator_received_mail_status',
                        svgIcon: self.icons.receivedMailStatus.svgIcon
                    });
                }
                else if (mail.isExpectedMailStatus()) {
                    return new Indicator({
                        class: 'indicator',
                        text: 'indicator_expected_mail_status',
                        icon: self.icons.expectedMailStatus.icon,
                        tooltip: 'indicator_expected_mail_status',
                        svgIcon: self.icons.expectedMailStatus.svgIcon
                    });
                }
                return null;
            };

            // don't remove MailRoomModelInterceptor from last line
            // should be always at last thing after all methods and properties.
            MailRoomModelInterceptor.runEvent('Indicator', 'init', this);
        }
    })
};