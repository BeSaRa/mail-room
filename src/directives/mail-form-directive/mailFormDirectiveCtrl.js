module.exports = function (app) {
    app.controller('mailFormDirectiveCtrl', function ($scope,
                                                      LangWatcher,
                                                      entityService,
                                                      lookupService,
                                                      incomingMailService,
                                                      $timeout,
                                                      mailService,
                                                      _,
                                                      employeeService,
                                                      userInfoService,
                                                      generator,
                                                      langService,
                                                      $q) {
        'ngInject';
        var self = this;
        self.controllerName = 'mailFormDirectiveCtrl';
        LangWatcher($scope);
        self.notesMaxLength = 500;
        self.mainEntities = []; //entityService.entities;
        self.senderDepartments = [];
        self.receiverDepartments = [];

        self.priorityTypes = lookupService.returnLookups(lookupService.priorityTypes);
        // self.entryTypes = lookupService.returnLookups(lookupService.entryTypes);
        self.integratedSystemList = lookupService.returnLookups(lookupService.integratedSystems);
        self.postTypes = lookupService.returnLookups(lookupService.postTypes);
        self.senders = employeeService.employees;
        self.now = new Date();
        self.mailUpdated = false;
        self.currentEntity = userInfoService.getCurrentUser().currentEntity;
        /**
         * @description Checks if form is disabled(read-only)
         * @returns {boolean}
         */
        self.formDisabled = function () {
            return self.disableAll;
        };

        /**
         * @description Skips selected sender entity from receiver entity list
         * @param entity
         * @returns {boolean}
         */
        self.isNotReceiverEntity = function (entity) {
            if (typeof self.mail.receiverEntity !== 'undefined' && self.mail.receiverEntity != null) {
                var receiverEntity = self.mail.receiverEntity;
                if (receiverEntity.hasOwnProperty('id')) {
                    receiverEntity = receiverEntity.getEntityId();
                }
                if (entity.hasOwnProperty('id'))
                    entity = entity.getEntityId();

                return receiverEntity !== entity;
            }
            return true;
        };

        /**
         * @description Skips selected receiver entity from sender entity list
         * @param entity
         * @returns {boolean}
         */
        self.isNotSenderEntity = function (entity) {
            if (typeof self.mail.senderEntity !== 'undefined' && self.mail.senderEntity != null) {
                var senderEntity = self.mail.senderEntity;
                if (senderEntity.hasOwnProperty('id')) {
                    senderEntity = senderEntity.getEntityId();
                }
                if (entity.hasOwnProperty('id'))
                    entity = entity.getEntityId();

                return senderEntity !== entity;
            }
            return true;
        };


        /**
         * @description Skips selected sender department from receiver department list
         * @param department
         * @returns {boolean}
         */
        self.isNotReceiverDepartment = function (department) {
            if (typeof self.mail.receiverDep !== 'undefined' && self.mail.receiverDep != null) {
                var receiverDepartment = self.mail.receiverDep;
                if (receiverDepartment.hasOwnProperty('id')) {
                    receiverDepartment = receiverDepartment.getEntityId();
                }
                if (department.hasOwnProperty('id'))
                    department = department.getEntityId();

                return receiverDepartment !== department;
            }
            return true;
        };

        /**
         * @description Skips selected receiver department from sender department list
         * @param department
         * @returns {boolean}
         */
        self.isNotSenderDepartment = function (department) {
            if (typeof self.mail.senderDep !== 'undefined' && self.mail.senderDep != null) {
                var senderDepartment = self.mail.senderDep;
                if (senderDepartment.hasOwnProperty('id')) {
                    senderDepartment = senderDepartment.getEntityId();
                }
                if (department.hasOwnProperty('id'))
                    department = department.getEntityId();

                return senderDepartment !== department;
            }
            return true;
        };

        /**
         * @description Checks if swap entities button is disabled
         * @returns {boolean}
         */
        self.swapEntitiesDisabled = function () {
            return !(self.mail.senderEntity || self.mail.receiverEntity);
        };

        /**
         * @description Swaps the selected sender entity and receiver entity
         * @returns {boolean}
         */
        self.swapEntities = function ($event) {
            var senderEntity = angular.copy(self.mail.senderEntity);
            var receiverEntity = angular.copy(self.mail.receiverEntity);

            self.mail.senderEntity = receiverEntity;
            self.mail.receiverEntity = senderEntity;
            self.getSenderDepartments(true);
            self.getReceiverDepartments(true);
        };

        /**
         * @description Swaps the selected sender department and receiver department
         * @returns {boolean}
         */
        self.swapDepartments = function ($event) {
            var senderDepartment = angular.copy(self.mail.senderDep);
            var receiverDepartment = angular.copy(self.mail.receiverDep);

            self.mail.senderDep = receiverDepartment;
            self.mail.receiverDep = senderDepartment;
        };

        /**
         * @description Gets the list of sender departments based on selected sender entity
         * @param resetDep
         * @param $event
         * @returns {*}
         */
        self.getSenderDepartments = function (resetDep, $event) {
            if (resetDep)
                self.mail.senderDep = null;

            return entityService.loadDepartmentsByParentId(self.mail.senderEntity, $event)
                .then(function (result) {
                    self.senderDepartments = result;
                    return result;
                });
        };

        /**
         * @description Gets the list of receiver departments based on selected receiver entity
         * @param resetDep
         * @param $event
         * @returns {*}
         */
        self.getReceiverDepartments = function (resetDep, $event) {
            if (resetDep)
                self.mail.receiverDep = null;

            return entityService.loadDepartmentsByParentId(self.mail.receiverEntity, $event)
                .then(function (result) {
                    self.receiverDepartments = result;
                    return result;
                });
        };

        var _filterEntitiesByIntegratedSystem = function () {
            self.mainEntities = (self.mail.integratedSystemId !== null && typeof self.mail.integratedSystemId !== 'undefined') ? entityService.categorizedEntities[self.mail.integratedSystemId] : [];
        }

        var _setDefaultMailRoomEntities = function () {
            Object.keys(self.entityDefaults).forEach(function (key) {
                self.mail[key] = self.entityDefaults[key];
            });
            // Fetch the sender departments and receiver departments based on existing sender and receiver entity values
            self.getSenderDepartments(false);
            self.getReceiverDepartments(false);
        }

        /**
         * @description Get record from other integrated systems
         */
        self.handleChangeIntegratedSystem = function ($event) {
            self.mailUpdated = false;
            _filterEntitiesByIntegratedSystem();

            if (self.mail.isMailingRoomIntegratedSystem()) {
                _setDefaultMailRoomEntities();
                return;
            }
            mailService.openIntegrationDialog($event, self.mail).then(function (result) {
                self.mail = result;
                self.mail.ownerEntity = self.currentEntity.hasOwnProperty('id') ? self.currentEntity.id : self.currentEntity;
                self.mailUpdated = true;
            }).catch(function () {
                self.mail.integratedSystemId = self.integratedSystemIdCopy;
                _filterEntitiesByIntegratedSystem();
            });
        }

        self.isSenderEntityDisabled = function () {
            return self.formDisabled() || self.mail.isOutgoingMail() || self.mail.isExpectedMailStatus();
        }

        self.isReceiverEntityDisabled = function () {
          return  self.formDisabled() || self.mail.isIncomingMail() || self.mail.isExpectedMailStatus();
        }

        self.querySearchSenderEntity = function (searchText) {
            searchText = searchText ? searchText.toLowerCase() : null;
            var result = searchText ? self.mainEntities.filter(function (entity) {
                return entity.getTranslatedName().toLowerCase().indexOf(searchText) !== -1 &&
                    self.isNotReceiverEntity(entity) && entity.isActive();
            }) : self.mainEntities.filter(entity => {
                return self.isNotReceiverEntity(entity) && entity.isActive();
            });

            var defer = $q.defer();
            $timeout(function () {
                defer.resolve(result);
            });
            return defer.promise;
        };

        self.querySearchReceiverEntity = function (searchText) {
            searchText = searchText ? searchText.toLowerCase() : null;
            var result = searchText ? self.mainEntities.filter(function (entity) {
                return entity.getTranslatedName().toLowerCase().indexOf(searchText) !== -1 &&
                    self.isNotSenderEntity(entity) && entity.isActive();
            }) : self.mainEntities.filter(entity => {
                return self.isNotSenderEntity(entity) && entity.isActive();
            });

            var defer = $q.defer();
            $timeout(function () {
                defer.resolve(result);
            });
            return defer.promise;
        };

        self.$onInit = function () {
            _filterEntitiesByIntegratedSystem();

            // Fetch the sender departments and receiver departments based on existing sender and receiver entity values
            self.getSenderDepartments(false);
            self.getReceiverDepartments(false);
            self.integratedSystemIdCopy = self.mail.integratedSystemId;

        };

    });
};
