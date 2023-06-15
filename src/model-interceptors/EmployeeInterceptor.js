module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor,
                      generator) {
        'ngInject';
        var modelName = 'Employee';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
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