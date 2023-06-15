module.exports = function (app) {
    app.controller('filterGridDirectiveCtrl', function ($scope,
                                                        LangWatcher,
                                                        entityService,
                                                        lookupService,
                                                        $timeout,
                                                        employeeService,
                                                        authenticationService,
                                                        _,
                                                        $q) {
        'ngInject';
        var self = this;
        self.controllerName = 'filterGridDirectiveCtrl';
        LangWatcher($scope);

        self.mainEntities = entityService.entities;
        self.senderDepartments = [];
        self.receiverDepartments = [];

        self.priorityTypes = lookupService.returnLookups(lookupService.priorityTypes);
        self.entryTypes = lookupService.returnLookups(lookupService.entryTypes);
        self.integratedSystemList = lookupService.returnLookups(lookupService.integratedSystems);
        self.employees = employeeService.employees;

        /**
         * @description fetch the sender departments and receiver departments based on existing sender and receiver entity values
         */
        $timeout(function () {
            self.getSenderDepartments(false);
            self.getReceiverDepartments(false);
            //self.isFormReady = true;
        });

        /**
         * @description Skips selected sender entity from receiver entity list
         * @param entity
         * @returns {boolean}
         */
        self.isNotReceiverEntity = function (entity) {
            if (typeof self.criteria.receiverEntity !== 'undefined' && self.criteria.receiverEntity != null) {
                var receiverEntity = self.criteria.receiverEntity;
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
            if (typeof self.criteria.senderEntity !== 'undefined' && self.criteria.senderEntity != null) {
                var senderEntity = self.criteria.senderEntity;
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
         * @description Checks if swap entities button is disabled
         * @returns {boolean}
         */
        self.swapEntitiesDisabled = function () {
            return !(self.criteria.senderEntity || self.criteria.receiverEntity);
        };

        /**
         * @description Swaps the selected sender entity and receiver entity
         * @returns {boolean}
         */
        self.swapEntities = function ($event) {
            var senderEntity = angular.copy(self.criteria.senderEntity);
            var receiverEntity = angular.copy(self.criteria.receiverEntity);

            self.criteria.senderEntity = receiverEntity;
            self.criteria.receiverEntity = senderEntity;
            self.getSenderDepartments(true);
            self.getReceiverDepartments(true);
        };

        /**
         * @description Gets the list of sender departments based on selected sender entity
         * @param resetDep
         * @param $event
         * @returns {*}
         */
        self.getSenderDepartments = function (resetDep, $event) {
            if (resetDep)
                self.criteria.senderDep = null;

            if (!self.criteria.senderEntity) {
                self.senderDepartments = [];
                return;
            }
            return entityService.loadDepartmentsByParentId(self.criteria.senderEntity, $event)
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
                self.criteria.receiverDep = null;

            if (!self.criteria.receiverEntity) {
                self.receiverDepartments = [];
                return;
            }
            return entityService.loadDepartmentsByParentId(self.criteria.receiverEntity, $event)
                .then(function (result) {
                    self.receiverDepartments = result;
                    return result;
                });
        };

        self.handleChangeIntegratedSystem = function ($event) {
            _resetEntities();
            _filterEntitiesByIntegratedSystem();
        }

        var _resetEntities = function () {
            self.criteria.senderEntity = null;
            self.criteria.senderDep = null;
            self.criteria.receiverEntity = null;
            self.criteria.receiverDep = null;
        }

        var _filterEntitiesByIntegratedSystem = function () {
            self.mainEntities = _.filter(entityService.entities, function (entity) {
                return entity.integratedSystemId === self.criteria.integratedSystemId;
            });
        }
    });
};