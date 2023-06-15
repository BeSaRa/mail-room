module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor,
                      generator,
                      _,
                      Employee,
                      Permission) {
        'ngInject';
        var modelName = 'EmployeePermission';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            return model;
        });

        MailRoomModelInterceptor.whenSendModel(modelName, function (model) {
            if (model.employee.id) {
                model.updatePermission = true;
            }
            if (model.permissions.length) {
                if (model.permissions[0].hasOwnProperty('id'))
                    model.permissions = _.map(model.permissions, function (permission) {
                        return {id: permission.id};
                    });
                else {
                    model.permissions = _.map(model.permissions, function (permission) {
                        return {id: permission};
                    })
                }
            }
            generator.deleteProperties(model, [
                'popupHeaderTypes'
            ]);
            return model;
        });

        MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
            model.employee = generator.interceptReceivedInstance('Employee', new Employee(model.employee));
            model.permissions = generator.interceptReceivedCollection('Permission', generator.generateCollection(model.permissions, Permission));
            return model;
        });

    })
};