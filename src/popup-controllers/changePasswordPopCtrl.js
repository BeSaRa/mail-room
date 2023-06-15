module.exports = function (app) {
    app.controller('changePasswordPopCtrl', function (authenticationService, employee, $q, dialog, withOldPass, adminChange) {
        'ngInject';
        var self = this;
        self.controllerName = 'changePasswordPopCtrl';

        self.matchedPassword = false;
        self.employeeName = employee.getTranslatedName();

        self.change = function () {
            var defer = $q.defer();

            var newPasswordCredentials = {
                id: employee.id,
                oldPass: (!adminChange) ? ((withOldPass) ? employee.password : self.password.oldPassword) : null,
                newPass: self.password.newPassword
            };

            return authenticationService.changePassword(newPasswordCredentials, adminChange).then(function (isSuccess) {
                dialog.hide(isSuccess);
            }).catch(function () {
                //if forced login then return cancelFailUpdatePassword
                (adminChange && !withOldPass) ? dialog.cancel('cancelFailUpdatePassword') : dialog.cancel('error_update_password');
            });
        };

        self.validatePassword = function () {
            self.matchedPassword = self.password.newPassword === self.password.confirmPassword;
        };
        /**
         * @description Close the dialog
         */
        self.closeDialog = function ($event) {
            (adminChange && !withOldPass) ? dialog.cancel('cancelFailUpdatePassword') : dialog.cancel();
        }
    });
};
