module.exports = function (app) {
    app.controller('integrationSystemPopCtrl', function (mailService,
                                                         toast,
                                                         mail,
                                                         dialog,
                                                         langService) {
        'ngInject';
        var self = this;

        self.referenceNumber = '';

        /**
         * @description Loads the mail information from integration system
         * @param $event
         * @returns {Promise<any>}
         */
        self.loadItemByReferenceNumber = function ($event) {
            return mailService.loadItemByReferenceNumber($event, self.referenceNumber, mail)
                .then(function (result) {
                    if (!result) {
                        toast.error(langService.get('msg_no_mail_found'));
                    } else {
                        dialog.hide(result);
                    }
                }).catch(function () {
                    toast.error(langService.get('msg_no_mail_found'))
                });
        };

        self.closePopup = function ($event) {
            dialog.cancel($event);
        };

    })
};
