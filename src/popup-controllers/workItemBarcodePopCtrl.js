module.exports = function (app) {
    app.controller('workItemBarcodePopCtrl', function (mailService,
                                                          toast,
                                                          mail,
                                                          dialog,
                                                          langService) {
        'ngInject';
        var self = this;

        /**
         * @description
         * @param $event
         * @returns {Promise<any>}
         */
        self.loadWorkItemByBarcode = function ($event) {
            return mailService.loadWorkItemByBarcode($event, self.barcode, mail)
                .then(function (result) {
                    if (!result)
                        toast.error(langService.get('msg_no_mail_found'));

                    else
                        dialog.hide(result);
                }).catch(function () {
                    toast.error(langService.get('msg_no_mail_found'))
                });
        };

        self.closePopup = function ($event) {
            dialog.cancel($event);
        }

    })
};
