module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor,
                      $http,
                      entityService) {
        'ngInject';
        var modelName = 'CurrentUser';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            model.setHttpService($http);
            model.setEntityService(entityService);
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