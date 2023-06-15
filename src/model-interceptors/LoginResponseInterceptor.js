module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor,
                      Employee,
                      EntityPermission,
                      generator) {
        'ngInject';
        var modelName = 'LoginResponse';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            return model;
        });

        MailRoomModelInterceptor.whenSendModel(modelName, function (model) {
            delete model.employeeEntites;
            return model;
        });

        MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
            model.employee = new Employee(model.employee);
            model.employeeEntites = model.entityPermissions;
            model.entityPermissions = generator.interceptReceivedCollection('EntityPermission', generator.generateCollection(model.entityPermissions, EntityPermission));
            return model;
        });

    })
};