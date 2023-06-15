module.exports = function (app) {
    app.factory('Employee', function (MailRoomModelInterceptor,
                                      langService) {
        'ngInject';
        return function Employee(model) {
            var self = this;
            self.id = null;
            self.arName = null;
            self.enName = null;
            self.userName = null;
            self.password = null;
            self.mobileNumber = null;
            self.active = true;
            self.deleted = false;
            self.defaultEntity = null;

            if (model)
                angular.extend(this, model);

            // every model has required fields
            // if you don't need to make any required fields leave it as an empty array
            var requiredFields = [
                'arName',
                'enName',
                'userName',
                'password',
                'mobileNumber',
                'active'
            ];

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            Employee.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            /**
             * @description Determines if the record is current or already saved based on id
             * @returns {boolean}
             */
            Employee.prototype.isNewRecord = function () {
                return !this.id;
            };

            /**
             * @description Returns the id of employee
             * @returns {number}
             */
            Employee.prototype.getEmployeeId = function () {
                return this.id;
            };

            /**
             * @description Returns the username of employee
             * @returns {number}
             */
            Employee.prototype.getUsername = function () {
                return this.userName;
            };

            /**
             * @description Gets the concatenated employee name
             * @param separator
             * If passed, it will add separator between arabic and english names.
             * Otherwise it will add hyphen(-)
             * @returns {string}
             */
            Employee.prototype.getNames = function (separator) {
                return this.arName + (separator ? separator : ' - ') + this.enName;
            };

            /**
             * @description Gets the employee name according to current language
             * @param reverse
             * If true, it will return name opposite to current language
             * @returns {string}
             */
            Employee.prototype.getTranslatedName = function (reverse) {
                return langService.current === 'ar'
                    ? (reverse ? this.enName : this.arName)
                    : (reverse ? this.arName : this.enName);
            };

            Employee.prototype.getTranslatedStatus = function () {
                return this.active ? langService.get('lbl_active') : langService.get('lbl_inactive');
            };

            /**
             * @description Checks if the employee is active
             * @returns {boolean}
             */
            Employee.prototype.isActive = function () {
                return this.active;
            };

            /**
             * @description Gets the mobile number of employee
             * @returns {string}
             */
            Employee.prototype.getMobileNumber = function () {
                return this.mobileNumber;
            };

            MailRoomModelInterceptor.runEvent('Employee', 'init', this);

        }
    });
};