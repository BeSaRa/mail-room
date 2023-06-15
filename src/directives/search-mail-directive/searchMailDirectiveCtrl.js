module.exports = function (app) {
    app.controller('searchMailDirectiveCtrl', function (LangWatcher,
                                                        $scope,
                                                        _,
                                                        entityService,
                                                        lookupService,
                                                        $timeout,
                                                        employeeService,
                                                        authenticationService,
                                                        userInfoService) {
        'ngInject';
        var self = this;
        self.controllerName = 'searchMailDirectiveCtrl';
        LangWatcher($scope);

        self.mainEntities = entityService.entities;
        self.senderDepartments = [];
        self.receiverDepartments = [];

        self.priorityTypes = lookupService.returnLookups(lookupService.priorityTypes);
        self.entryTypes = lookupService.returnLookups(lookupService.entryTypes);
        self.mailTypes = lookupService.returnLookups(lookupService.mailTypes);
        self.statusTypes = lookupService.returnLookups(lookupService.statusTypes);
        self.postTypes = lookupService.returnLookups(lookupService.postTypes);
        self.hasSearchAllPermission = userInfoService.getCurrentUser().hasPermissionTo('SYS_SEARCH_ALL');

        self.employees = employeeService.employees;
        self.currentDate = new Date();
        /**
         * @description Skips selected sender entity from receiver entity list
         * @param entity
         * @returns {boolean}
         */
        self.isNotReceiverEntity = function (entity) {
            if (self.criteria.mail.isInternalMail() || !self.hasSearchAllPermission) {
                return true;
            }
            if (typeof self.criteria.mail.receiverEntity !== 'undefined' && self.criteria.mail.receiverEntity != null) {
                var receiverEntity = self.criteria.mail.receiverEntity;
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
            if (self.criteria.mail.isInternalMail() || !self.hasSearchAllPermission) {
                return true;
            }
            if (typeof self.criteria.mail.senderEntity !== 'undefined' && self.criteria.mail.senderEntity != null) {
                var senderEntity = self.criteria.mail.senderEntity;
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
         * @description Gets the list of sender departments based on selected sender entity
         * @param resetDep
         * @param $event
         * @returns {*}
         */
        self.getSenderDepartments = function (resetDep, $event) {
            if (resetDep)
                self.criteria.mail.senderDep = null;

            if (!self.criteria.mail.senderEntity) {
                self.senderDepartments = [];
                return;
            }
            entityService.loadDepartmentsByParentId(self.criteria.mail.senderEntity, $event)
                .then(function (result) {
                    self.senderDepartments = result;
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
                self.criteria.mail.receiverDep = null;

            if (!self.criteria.mail.receiverEntity) {
                self.receiverDepartments = [];
                return;
            }
            entityService.loadDepartmentsByParentId(self.criteria.mail.receiverEntity, $event)
                .then(function (result) {
                    self.receiverDepartments = result;
                });
        };

        /**
         * @description Skips selected sender department from receiver department list
         * @param department
         * @returns {boolean}
         */
        self.isNotReceiverDepartment = function (department) {
            if (typeof self.criteria.mail.receiverDep !== 'undefined' && self.criteria.mail.receiverDep != null) {
                var receiverDepartment = self.criteria.mail.receiverDep;
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
            if (typeof self.criteria.mail.senderDep !== 'undefined' && self.criteria.mail.senderDep != null) {
                var senderDepartment = self.criteria.mail.senderDep;
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
         * @description Set the sender entity, receiver entity on basis of mail type
         * @param $event
         */
        self.changeMailType = function ($event) {
            self.criteria.mail.senderEntity = null;
            self.criteria.mail.receiverEntity = null;
            var currentEntity = Number(authenticationService.getLastLoginEntityId());
            /*var currentEntity = _.find(self.mainEntities, function (entity) {
                return entity.getEntityId() === Number(authenticationService.getLastLoginEntityId());
            });*/
            if (!self.hasSearchAllPermission && !self.criteria.mail.mailType) {
                self.criteria.mail.senderEntity = currentEntity;
                self.criteria.mail.receiverEntity = currentEntity;
            } else {
                if (self.criteria.mail.isOutgoingMail()) {
                    self.criteria.mail.senderEntity = currentEntity;
                } else if (self.criteria.mail.isIncomingMail()) {
                    self.criteria.mail.receiverEntity = currentEntity;
                } else if (self.criteria.mail.isInternalMail()) {
                    self.criteria.mail.senderEntity = currentEntity;
                    self.criteria.mail.receiverEntity = currentEntity;
                }
            }
            self.getSenderDepartments(true);
            self.getReceiverDepartments(true);
        };

        self.checkSenderEntityDisabled = function () {
            if (self.hasSearchAllPermission) {
                return false;
            } else {
                return !self.criteria.mail.mailType || self.criteria.mail.isOutgoingMail() || self.criteria.mail.isInternalMail();
            }
        }

        self.checkReceiverEntityDisabled = function () {
            /*(!ctrl.hasSearchAllPermission && !ctrl.criteria.mail.mailType)||
            (ctrl.criteria.mail.isIncomingMail() || ctrl.criteria.mail.isInternalMail())*/

            if (self.hasSearchAllPermission) {
                return false;
            } else {
                return !self.criteria.mail.mailType || self.criteria.mail.isIncomingMail() || self.criteria.mail.isInternalMail();
            }
        }

        $timeout(function () {
            self.changeMailType();
        })
    });
};
