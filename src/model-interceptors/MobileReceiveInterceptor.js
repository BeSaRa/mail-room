module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor) {
        'ngInject';

        var modelName = 'MobileReceive';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            return model;
        });

        MailRoomModelInterceptor.whenSendModel(modelName, function (model) {
            model.mailId = model.id;

            delete model.id
            return model;
        });

        MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
            return model;
        });
    })
};
