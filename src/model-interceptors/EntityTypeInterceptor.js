module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor,
                      langService,
                      generator) {
        'ngInject';
        var modelName = 'EntityType';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            model.setLangService(langService);
            return model;
        });

        MailRoomModelInterceptor.whenSendModel(modelName, function (model) {
            generator.deleteProperties(model, [
                'popupHeaderTypes'
            ]);
            return model;
        });

        MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
            return model;
        });

    })
};