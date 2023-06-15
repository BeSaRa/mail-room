module.exports = function (app) {
    app.factory('Credentials', function () {
        'ngInject';
        return function Credentials(model) {
            var self = this;

            self.username = null;
            self.password = null;
            self.tawasolEntityId = null;
            self.lang = 0;
            self.permissionList = [];
            self.token = null;
            self.userOuList = [0];
            self.loginUsingDefaultOu = true;
            //self.ouId = null;

            if (model)
                angular.extend(this, model);

            Credentials.prototype.setTawasolEntityId = function (identifier) {
                this.tawasolEntityId = identifier;
                return this;
            };
            Credentials.prototype.setOuId = function (ouId) {
                this.ouId = typeof ouId === 'object' ? ouId.id : ouId;
                return this;
            };
            Credentials.prototype.setUserName = function (username) {
                this.username = username;
                return this;
            };
            Credentials.prototype.setToken = function (token) {
                this.token = token;
                return this;
            }
        }
    })
};