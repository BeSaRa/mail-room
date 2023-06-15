module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor) {
        'ngInject';

        var modelName = 'Counter';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            return model;
        });

        MailRoomModelInterceptor.whenSendModel(modelName, function (model) {
            return model;
        });

        MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
            model.mapCounter();
            return model;
        });

    });
};