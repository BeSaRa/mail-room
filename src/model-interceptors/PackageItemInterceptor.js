module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor,
                      Lookup) {
        'ngInject';
        var modelName = 'PackageItem';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            return model;
        });

        MailRoomModelInterceptor.whenSendModel(modelName, function (model) {
            model.quantityUnitId = model.quantityUnitId && model.quantityUnitId.typeId ? model.quantityUnitId : null;
            model.weightUnitId = model.weightUnitId && model.weightUnitId.typeId ? model.weightUnitId : null;
            model.lengthUnitId = model.lengthUnitId && model.lengthUnitId.typeId ? model.lengthUnitId : null;
            model.heightUnitId = model.heightUnitId && model.heightUnitId.typeId ? model.heightUnitId : null;
            model.widthUnitId = model.widthUnitId && model.widthUnitId.typeId ? model.widthUnitId : null;

            delete model.customId;
            return model;
        });

        MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
            model.quantityUnitId = new Lookup(model.quantityUnitId);
            model.categoryId = new Lookup(model.categoryId);
            model.weightUnitId = new Lookup(model.weightUnitId);
            model.lengthUnitId = new Lookup(model.lengthUnitId);
            model.heightUnitId = new Lookup(model.heightUnitId);
            model.widthUnitId = new Lookup(model.widthUnitId);
            return model;
        });

    })
};
