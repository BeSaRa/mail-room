module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor) {
        'ngInject';
        var modelName = 'IncomingMailFilter';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
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