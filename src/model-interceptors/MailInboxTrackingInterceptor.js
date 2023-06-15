module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor,
                      lookupService,
                      generator,
                      entityService,
                      employeeService,
                      _,
                      Employee,
                      EmployeePermission) {
        'ngInject';
        var modelName = 'MailInboxTracking';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            return model;
        });

        MailRoomModelInterceptor.whenSendModel(modelName, function (model) {
            model.registerDate = generator.getTimeStampFromDate(model.registerDate);
            model.sentDate = generator.getTimeStampFromDate(model.sentDate);
            model.receivedDate = generator.getTimeStampFromDate(model.receivedDate);

            model.senderEntity = model.senderEntity && model.senderEntity.hasOwnProperty('id') ? model.senderEntity.getEntityId() : model.senderEntity;
            model.senderDep = model.senderDep && model.senderDep.hasOwnProperty('id') ? model.senderDep.getEntityId() : model.senderDep;
            model.senderEmployee = model.senderEmployee instanceof EmployeePermission ? model.senderEmployee.getEmployeeId() : model.senderEmployee;

            model.receiverEntity = model.receiverEntity && model.receiverEntity.hasOwnProperty('id') ? model.receiverEntity.getEntityId() : model.receiverEntity;
            model.receiverDep = model.receiverDep && model.receiverDep.hasOwnProperty('id') ? model.receiverDep.getEntityId() : model.receiverDep;

            model.addedBy = model.addedBy instanceof EmployeePermission ? model.addedBy.getEmployeeId() : model.addedBy;
            model.mailType = model.mailType && model.mailType.hasOwnProperty('typeId') ? model.mailType.typeId : model.mailType;
            model.entryType = model.entryType && model.entryType.hasOwnProperty('typeId') ? model.entryType.typeId : model.entryType;
            model.postType = model.postType && model.postType.hasOwnProperty('typeId') ? model.postType.typeId : model.postType;
            model.priority = model.priority && model.priority.hasOwnProperty('typeId') ? model.priority.typeId : model.priority;
            generator.deleteProperties(model, [
                'popupHeaderTypes',
                'registerDateFormatted',
                'mailTypeLookup',
                'statusTypeLookup',
                'entryTypeLookup',
                'postTypeLookup',
                'priorityTypeLookup',
                'numberOfDays',
                'numberOfDaysTooltip',
                'outgoingMailReference',
                'sentDateFormatted',
                'receivedDateFormatted',
                'senderEmployeeEmpPermission',
                'receiverNameToDisplay'
            ]);
            generator.deletePropertiesEndsWith(model, ['Indicator', 'ForPrint']);
            return model;
        });

        MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
            model.registerDateFormatted = generator.getDateStringFromTimeStamp(model.registerDate, true);
            model.sentDateFormatted = generator.getDateStringFromTimeStamp(model.sentDate, true);
            model.receivedDateFormatted = generator.getDateStringFromTimeStamp(model.receivedDate, true);
            model.senderEntity = _.find(entityService.entities, {'id': model.senderEntity});
            model.senderDep = _.find(entityService.allEntities, {'id': model.senderDep});
            if (model.senderEmployee) {
                model.senderEmployeeEmpPermission = _.find(employeeService.employees, function (employee) {
                    return employee.getEmployeeId() === Number(model.senderEmployee);
                });
            }
            model.receiverEntity = _.find(entityService.entities, {'id': model.receiverEntity});
            model.receiverDep = _.find(entityService.allEntities, {'id': model.receiverDep});
            if (model.addedBy) {
                model.addedBy = _.find(employeeService.employees, function (employee) {
                    return employee.getEmployeeId() === Number(model.addedBy);
                });
            }
            else {
                model.addedBy = new EmployeePermission();
            }
            model.mailTypeLookup = lookupService.getLookupByTypeId(lookupService.mailTypes, model.mailType);
            model.statusTypeLookup = lookupService.getLookupByTypeId(lookupService.statusTypes, model.statusType);
            model.entryTypeLookup = lookupService.getLookupByTypeId(lookupService.entryTypes, model.entryType);
            model.postTypeLookup = lookupService.getLookupByTypeId(lookupService.postTypes, model.postType);
            model.priorityTypeLookup = lookupService.getLookupByTypeId(lookupService.priorityTypes, model.priority);

            if (model.receivedDate) {
                model.numberOfDays = generator.getNumberOfDays(model.receivedDate);
                model.numberOfDaysTooltip = 'indicator_received_days_ago';
            }
            else if (model.sentDate) {
                model.numberOfDays = generator.getNumberOfDays(model.sentDate);
                model.numberOfDaysTooltip = 'indicator_sent_days_ago';
            }
            else {
                model.numberOfDays = generator.getNumberOfDays(model.registerDate);
                model.numberOfDaysTooltip = 'indicator_added_days_ago';
            }

            if (model.receiverEmployee) {
                model.receiverNameToDisplay = _.find(employeeService.employees, function (employee) {
                    return employee.getEmployeeId() === Number(model.receiverEmployee);
                });
            }
            else {
                model.receiverNameToDisplay = new EmployeePermission({
                    employee: new Employee({
                        arName: model.receiverName,
                        enName: model.receiverName
                    })
                });
            }

            model.idCopy = (model.idCopy) ? generator.convertBinaryDataToURL(model.idCopy) : null;
            model.signature = (model.signature) ? generator.convertBinaryDataToURL(model.signature) : null;


            return model;
        });

    })
};
