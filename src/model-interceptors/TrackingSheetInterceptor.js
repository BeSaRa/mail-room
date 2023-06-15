module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor,
                      generator,
                      Lookup,
                      Employee,
                      Entity) {
        'ngInject';
        var modelName = 'TrackingSheet';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            return model;
        });

        MailRoomModelInterceptor.whenSendModel(modelName, function (model) {
            model.actionLogType = model.actionLogType.getTypeId();
            model.user = model.user.getEmployeeId();
            model.mailType = model.mailType.getTypeId();
            model.entryType = model.entryType.getTypeId();
            model.receiverEntity = model.receiverEntity.getEntityId();
            model.senderEntity = model.senderEntity.getEntityId();

            generator.deleteProperties(model, [
                'actionDateFormatted'
            ]);

            return model;
        });

        MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
            model.actionDateFormatted = generator.getDateStringFromTimeStamp(model.actionDate, true);
            model.actionLogType = new Lookup(model.actionLogType);
            model.user = new Employee(model.user);
            model.mailType = new Lookup(model.mailType);
            model.entryType = new Lookup(model.entryType);
            model.receiverEntity = new Entity(model.receiverEntity);
            model.senderEntity = new Entity(model.senderEntity);

            return model;
        });

    })
};