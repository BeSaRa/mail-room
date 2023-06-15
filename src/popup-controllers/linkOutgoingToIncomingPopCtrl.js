module.exports = function (app) {
    app.controller('linkOutgoingToIncomingPopCtrl', function (dialog,
                                                              $timeout,
                                                              outgoingMailService,
                                                              langService) {
        'ngInject';
        var self = this;
        self.controllerName = 'linkOutgoingToIncomingPopCtrl';

        self.inputId = "relationText";
        self.relationText = null;

        $timeout(function () {
            angular.element('#' + self.inputId)[0].focus();
        }, 500);

        /**
         * @description Gets the outgoing mail by reference number and fills the incoming mail data
         * @param $event
         */
        self.getMailByReferenceNumber = function ($event) {
            outgoingMailService.loadMailByReferenceNo(self.relationText, $event)
                .then(function (result) {
                    if (result) {
                        dialog.hide(result);
                    }
                    else {
                        dialog.alertMessage(langService.get('msg_no_mail_found'));
                    }
                })
                .catch(function (error) {
                    dialog.alertMessage(langService.get('msg_no_mail_found'));
                })
        };

        /**
         * @description Gets the outgoing mail by mail id and fills the incoming mail data
         * @param $event
         */
        self.getMailByMailId = function ($event) {
            outgoingMailService.loadMailById(self.relationText, false)
                .then(function (result) {
                    if (result) {
                        dialog.hide(result);
                    }
                    else {
                        dialog.alertMessage(langService.get('msg_no_mail_found'));
                    }
                })
                .catch(function (error) {
                    dialog.alertMessage(langService.get('msg_no_mail_found'));
                })
        };

        self.searchBy = {
            referenceNo: {
                label: 'lbl_reference_number',
                callback: self.getMailByReferenceNumber
            },
            mailId: {
                label: 'lbl_mail_id',
                callback: self.getMailByMailId
            }
        };
        self.searchByCriteria = self.searchBy.referenceNo;


        self.closePopup = function ($event) {
            dialog.cancel();
        }
    });
};