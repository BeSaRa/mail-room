module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor,
                      langService) {
        'ngInject';

        var modelName = 'Lookup';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            model.setLangService(langService);
            return model;
        });

        MailRoomModelInterceptor.whenSendModel(modelName, function (model) {
            return model;
        });

        MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
            return model;
        });

    })
};