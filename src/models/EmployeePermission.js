module.exports = function (app) {
    app.factory('EmployeePermission', function (MailRoomModelInterceptor,
                                                langService,
                                                Employee) {
        'ngInject';
        return function EmployeePermission(model) {
            var self = this;
            self.employee = new Employee();
            self.permissions = [];

            // every model has required fields
            // if you don't need to make any required fields leave it as an empty array
            var requiredFields = [];

            if (model)
                angular.extend(this, model);


            /**
             * @description Contains the keys for popup header
             * @type {{addEdit: string, barcode: string, timeline: string, actionLog: string, send: string, receive: string}}
             */
            self.popupHeaderTypes = {
                addEditEmployee: 'addEditEmployee'
            };

            /**
             * @description Gets the text to be shown in the popup header
             * @param type
             * @param getKey
             * @returns {*}
             */
            EmployeePermission.prototype.getPopupHeaderText = function (type, getKey) {
                if (type === this.popupHeaderTypes.addEditEmployee) {
                    if (getKey)
                        return this.employee.isNewRecord() ? '' : 'lbl_edit';
                    return this.employee.isNewRecord() ? langService.get('lbl_add_employee') : this.getTranslatedName();
                }
                else {
                    return this.getNames();
                }
            };

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            EmployeePermission.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            EmployeePermission.prototype.getEmployeeId = function () {
                return this.employee.id;
            };

            /**
             * @description Checks if the employee is active
             * @returns {boolean}
             */
            EmployeePermission.prototype.isActive = function () {
                return this.employee.active;
            };

            /**
             * @description Gets the concatenated employee name
             * @param separator
             * If passed, it will add separator between arabic and english names.
             * Otherwise it will add hyphen(-)
             * @returns {string}
             */
            EmployeePermission.prototype.getNames = function (separator) {
                return this.employee.arName + ' ' + (separator ? separator : '-') + ' ' + this.employee.enName;
            };

            /**
             * @description Gets the employee name according to current language
             * @param reverse
             * If true, it will return name opposite to current language
             * @returns {string}
             */
            EmployeePermission.prototype.getTranslatedName = function (reverse) {
                return langService.current === 'ar'
                    ? (reverse ? this.employee.enName : this.employee.arName)
                    : (reverse ? this.employee.arName : this.employee.enName);
            };

            /**
             * @description Get the status of entity name as Active or Inactive instead of true or false.
             * @returns {string}
             */
            EmployeePermission.prototype.getTranslatedStatus = function () {
                return this.employee.active
                    ? langService.get('lbl_active')
                    : langService.get('lbl_inactive');
            };


            // don't remove MailRoomModelInterceptor from last line
            // should be always at last thing after all methods and properties.
            MailRoomModelInterceptor.runEvent('EmployeePermission', 'init', this);
        }
    })
};