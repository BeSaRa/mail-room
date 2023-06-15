module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor,
                      generator,
                      Lookup,
                      Employee) {
        'ngInject';
        var modelName = 'ActionLog', sequence;

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            sequence = 0;
            return model;
        });

        MailRoomModelInterceptor.whenSendModel(modelName, function (model) {
            model.actionLogType = model.actionLogType.getTypeId();
            model.user = model.user.getEmployeeId();

            generator.deleteProperties(model, [
                'actionDateFormatted',
                'actionLogSequence'
            ]);
            generator.deletePropertiesEndsWith(model, ['Indicator', 'ForPrint']);

            return model;
        });

        MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
            model.actionDateFormatted = generator.getDateStringFromTimeStamp(model.actionDate, true);
            model.actionLogType = new Lookup(model.actionLogType);
            model.user = new Employee(model.user);

            model.actionLogSequence = ++sequence;

            return model;
        });

    })
};