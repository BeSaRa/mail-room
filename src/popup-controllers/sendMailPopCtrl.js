module.exports = function (app) {
    app.controller('sendMailPopCtrl', function (dialog,
                                                mailService,
                                                toast,
                                                generator,
                                                langService) {
        'ngInject';
        var self = this;
        self.controllerName = 'sendMailPopCtrl';

        /**
         * @description Sends the mail
         * @param $event
         */
        self.send = function ($event) {
            self.mail.sentDate = generator.setCurrentTimeOfDate(self.mail.sentDate);
            self.callback(self.mail, $event)
                .then(function (result) {
                    if (result) {
                        dialog.hide(true);
                    }
                    else {
                        toast.error(langService.get('msg_error_occurred_while_processing_request'));
                    }
                }).catch(function (error) {
                toast.error(langService.get('msg_error_occurred_while_processing_request'));
            })
        };

        /**
         * @description Close the popup
         * @param $event
         */
        self.closePopup = function ($event) {
            dialog.cancel('close');
        }
    });
};
