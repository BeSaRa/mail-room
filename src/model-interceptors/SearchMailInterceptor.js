module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor,
                      generator,
                      lookupService) {
        'ngInject';
        var modelName = 'SearchMail';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            return model;
        });

        MailRoomModelInterceptor.whenSendModel(modelName, function (model) {
            model.mail = generator.interceptSendInstance('MailInbox', model.mail);
            model.registerDateFrom = generator.getTimeStampFromDate(model.registerDateFrom);
            model.registerDateTo = generator.getTimeStampFromDate(generator.setEndTimeOfDate(model.registerDateTo));
            model.sentDateFrom = generator.getTimeStampFromDate(model.sentDateFrom);
            model.sentDateTo = generator.getTimeStampFromDate(generator.setEndTimeOfDate(model.sentDateTo));
            model.receivedDateFrom = generator.getTimeStampFromDate(model.receivedDateFrom);
            model.receivedDateTo = generator.getTimeStampFromDate(generator.setEndTimeOfDate(model.receivedDateTo));

            generator.deleteProperties(model, [
                'mail.receivedDateFrom',
                'mail.receivedDateTo',
                'mail.sentDateFrom',
                'mail.sentDateTo',
                'mail.registerDateFrom',
                'mail.registerDateTo',
                'mail.popupHeaderTypes'
            ]);

            return model;
        });

        MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
            return model;
        });

    })
};