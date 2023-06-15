module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor) {
        'ngInject';
        var modelName = 'ConnectedPerson';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            return model;
        });

        MailRoomModelInterceptor.whenSendModel(modelName, function (model) {
            delete model.customId;
            return model;
        });

        MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
            return model;
        });

    })
};
