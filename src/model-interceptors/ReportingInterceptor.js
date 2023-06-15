module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor,
                      generator,
                      lookupService,
                      langService) {
        'ngInject';
        var modelName = 'Reporting';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            return model;
        });

        MailRoomModelInterceptor.whenSendModel(modelName, function (model) {
            model.mail.mailType = lookupService.getLookupTypeId(model.mail.mailType);
            model.mail.priority = lookupService.getLookupTypeId(model.mail.priority);

            model.actionLogType = lookupService.getLookupTypeId(model.actionLogType);

            model.registerDateFrom = generator.getTimeStampFromDate(model.registerDateFrom);
            model.registerDateTo = generator.getTimeStampFromDate(generator.setEndTimeOfDate(model.registerDateTo));
            model.sentDateFrom = generator.getTimeStampFromDate(model.sentDateFrom);
            model.sentDateTo = generator.getTimeStampFromDate(generator.setEndTimeOfDate(model.sentDateTo));
            model.receivedDateFrom = generator.getTimeStampFromDate(model.receivedDateFrom);
            model.receivedDateTo = generator.getTimeStampFromDate(generator.setEndTimeOfDate(model.receivedDateTo));

            model.dateFrom = generator.getTimeStampFromDate(model.dateFrom);
            model.dateTo = generator.getTimeStampFromDate(generator.setEndTimeOfDate(model.dateTo));
            model.local = langService.getCurrentLang();

            generator.deleteProperties(model, [
                'entity',
                'mail.receivedDateFrom',
                'mail.receivedDateTo',
                'mail.sentDateFrom',
                'mail.sentDateTo',
                'mail.registerDateFrom',
                'mail.registerDateTo'
            ]);

            return model;
        });

        MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
            return model;
        });

    })
};