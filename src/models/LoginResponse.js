module.exports = function (app) {
    app.factory('LoginResponse', function (MailRoomModelInterceptor) {
        'ngInject';
        return function LoginResponse(model) {
            var self = this;
            self.currentEntity = null;
            self.employee = null;
            self.entityPermissions = [];
            self.shouldChange = false;
            self.sysPermissions = [];
            self.employeeEntites = [];
            self.token = null;

            if (model)
                angular.extend(this, model);

            LoginResponse.prototype.shouldChangePassword = function () {
                return this.shouldChange;
            };

            MailRoomModelInterceptor.runEvent('LoginResponse', 'init', this);

        }
    });
};