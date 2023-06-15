module.exports = function (app) {
    app.controller('reportsDirectiveCtrl', function (employeeService,
                                                     lookupService,
                                                     entityService,
                                                     $scope,
                                                     LangWatcher,
                                                     $timeout,
                                                     authenticationService) {
        'ngInject';
        var self = this;
        self.controllerName = 'reportsDirectiveCtrl';
        LangWatcher($scope);

        self.mainEntities = entityService.entities;
        self.employees = employeeService.employees;
        self.allEmployees = angular.copy(self.employees);

        // self.senderDepartments = [];
        // self.receiverDepartments = [];

        self.departments = [];

        self.priorityTypes = lookupService.returnLookups(lookupService.priorityTypes);
        self.entryTypes = lookupService.returnLookups(lookupService.entryTypes);
        self.mailTypes = lookupService.returnLookups(lookupService.mailTypes);
        self.statusTypes = lookupService.returnLookups(lookupService.statusTypes);
        self.actionLogTypes = lookupService.returnLookups(lookupService.actionLogTypes);

        /**
         * @description fetch the sender departments and receiver departments based on existing sender and receiver entity values
         */
        $timeout(function () {
            if (self.isSelectedReport('DEP_STATIC_REPORT'))
                self.getDepartments(false);
        });

        /**
         * @description Skips selected sender entity from receiver entity list
         * @param entity
         * @returns {boolean}
         */
        self.isNotReceiverEntity = function (entity) {
            if (self.criteria.mail.isInternalMail()) {
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
            if (self.criteria.mail.isInternalMail()) {
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
        /* self.getSenderDepartments = function (resetDep, $event) {
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
         };*/

        /**
         * @description Gets the list of receiver departments based on selected receiver entity
         * @param resetDep
         * @param $event
         * @returns {*}
         */
        /*self.getReceiverDepartments = function (resetDep, $event) {
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
        };*/

        /**
         * @description Skips selected sender department from receiver department list
         * @param department
         * @returns {boolean}
         */
        /*self.isNotReceiverDepartment = function (department) {
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
        };*/

        /**
         * @description Skips selected receiver department from sender department list
         * @param department
         * @returns {boolean}
         */
        /*self.isNotSenderDepartment = function (department) {
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
        };*/


        /**
         * @description Gets the list of sender departments based on selected sender entity
         * @param resetDep
         * @param $event
         * @returns {*}
         */
        self.getDepartments = function (resetDep, $event) {
            if (resetDep)
                self.criteria.department = null;

            if (!self.criteria.entity) {
                self.departments = [];
                return;
            }
            entityService.loadDepartmentsByParentId(self.criteria.entity, $event)
                .then(function (result) {
                    self.departments = result;
                });
        };

        /**
         * @description enable expected status type if selected mail type is incoming
         * @param option
         * @returns {boolean}
         */
        self.isExpectedOptionStatus = function (option) {
            if (typeof self.criteria.mail.mailType !== 'undefined' && self.criteria.mail.mailType !== null && self.criteria.mail.mailType !== 0)
                return option.getTypeId() === lookupService.getLookupByKeyName(lookupService.statusTypes, lookupService.statusTypesKeys.expected).getTypeId();

            return false;
        };

        /**
         * @description check current report
         * @param report
         * @returns {boolean}
         */
        self.isSelectedReport = function (report) {
            return self.reportType.toLocaleLowerCase() === report.toLowerCase()
        };

        /**
         * @description reset entities if no mail type
         */
        self.changeMailType = function () {
            self.criteria.mail.senderEntity = null;
            self.criteria.mail.receiverEntity = null;

            if (!self.criteria.mail.isIncomingMail() &&
                self.criteria.mail.mailType &&
                self.criteria.mail.statusType === lookupService.getLookupByKeyName(lookupService.statusTypes, lookupService.statusTypesKeys.expected).getTypeId())
                self.criteria.mail.statusType = null;

            var currentEntity = Number(authenticationService.getLastLoginEntityId());

            if (self.criteria.mail.isOutgoingMail()) {
                self.criteria.mail.senderEntity = currentEntity;
            }
            else if (self.criteria.mail.isIncomingMail()) {
                self.criteria.mail.receiverEntity = currentEntity;
            }
            else if (self.criteria.mail.isInternalMail()) {
                self.criteria.mail.senderEntity = currentEntity;
                self.criteria.mail.receiverEntity = currentEntity;
            }

            // self.getSenderDepartments(true);
            // self.getReceiverDepartments(true);
        };

        /**
         * @description get all employees when entity changed
         * @param resetEmp
         * @param $event
         * @returns {*}
         */
        self.getEmployees = function (resetEmp, $event) {
            if (resetEmp)
                self.criteria.employee = null;

            if (!self.criteria.entity) {
                self.employees = [];
                return;
            }
            entityService.employeeMethods.loadEmployeesByEntityId(self.criteria.entity, $event)
                .then(function (result) {
                    self.employees = result;
                });
        }
    });
};