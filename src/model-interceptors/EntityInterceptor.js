module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor,
                      generator,
                      EntityType) {
        'ngInject';
        var modelName = 'Entity';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            return model;
        });

        MailRoomModelInterceptor.whenSendModel(modelName, function (model) {
            generator.deleteProperties(model, [
                'popupHeaderTypes',
                'entityType'
            ]);
            generator.deletePropertiesEndsWith(model, ['Indicator', 'ForPrint']);
            // model.refId = model.refId;
            return model;
        });

        MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
            model.entityType = new EntityType(model.entityType);
            model.entityUseSystemIndicator = model.getEntityUseSystemIndicator();
            return model;
        });

    })
};
