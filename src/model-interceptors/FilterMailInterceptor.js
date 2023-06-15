module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor,
                      generator,
                      EmployeePermission) {
            'ngInject';
            var modelName = 'FilterMail';

            MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
                return model;
            });

            MailRoomModelInterceptor.whenSendModel(modelName, function (model) {
                if (model.registerDateFormatted) {
                    model.registerDate = generator.getTimeStampFromDate(model.registerDateFormatted);
                }
                model.registerDateFrom = model.registerDateFrom ? generator.getTimeStampFromDate(model.registerDateFrom) : null;
                model.registerDateTo = model.registerDateTo ? generator.getTimeStampFromDate(generator.setEndTimeOfDate(model.registerDateTo)) : null;

                if (model.sentDateFormatted) {
                    model.sentDate = generator.getTimeStampFromDate(model.sentDateFormatted);
                }
                model.sentDateFrom = model.sentDateFrom ? generator.getTimeStampFromDate(model.sentDateFrom) : null;
                model.sentDateTo = model.sentDateTo ? generator.getTimeStampFromDate(generator.setEndTimeOfDate(model.sentDateTo)) : null;

                if (model.receivedDateFormatted) {
                    model.receivedDate = generator.getTimeStampFromDate(model.receivedDateFormatted);
                }
                model.receivedDateFrom = model.receivedDateFrom ? generator.getTimeStampFromDate(model.receivedDateFrom) : null;
                model.receivedDateTo = model.receivedDateTo ? generator.getTimeStampFromDate(generator.setEndTimeOfDate(model.receivedDateTo)) : null;

                    model.senderEntity = model.senderEntity ? (model.senderEntity.hasOwnProperty('id') ? model.senderEntity.getEntityId() : model.senderEntity) : null;
                    model.senderDep = model.senderDep ? (model.senderDep.hasOwnProperty('id') ? model.senderDep.getEntityId() : model.senderDep) : null;
                    model.senderEmployee = model.senderEmployee ? (model.senderEmployee instanceof EmployeePermission ? model.senderEmployee.getEmployeeId() : model.senderEmployee) : null;

                    model.receiverEntity = model.receiverEntity ? (model.receiverEntity.hasOwnProperty('id') ? model.receiverEntity.getEntityId() : model.receiverEntity) : null;
                    model.receiverDep = model.receiverDep ? (model.receiverDep.hasOwnProperty('id') ? model.receiverDep.getEntityId() : model.receiverDep) : null;

                    model.addedBy = model.addedBy ? (model.addedBy instanceof EmployeePermission ? model.addedBy.getEmployeeId() : model.addedBy) : null;
                    model.mailType = model.mailType ? (model.mailType.hasOwnProperty('typeId') ? model.mailType.typeId : model.mailType) : null;
                    model.entryType = model.entryType ? (model.entryType.hasOwnProperty('typeId') ? model.entryType.typeId : model.entryType) : null;
                    model.postType = model.postType ? (model.postType.hasOwnProperty('typeId') ? model.postType.typeId : model.postType) : null;
                    model.priority = model.priority ? (model.priority.hasOwnProperty('typeId') ? model.priority.typeId : model.priority) : null;

                return model;
            });

            MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
                return model;
            });

        }
    )
}
;