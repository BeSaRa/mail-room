module.exports = function (app) {
    app.factory('GeneralMail', function (MailRoomModelInterceptor,
                                          MailInbox) {
        'ngInject';
        return function GeneralMail(model) {
            var self = this;
            MailInbox.call(this);

            if (model)
                angular.extend(this, model);


            var requiredFields = [];

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            GeneralMail.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            MailRoomModelInterceptor.runEvent('GeneralMail', 'init', this);

        }
    });
};