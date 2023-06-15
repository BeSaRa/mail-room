module.exports = function (app) {
    app.factory('Response', function () {
        'ngInject';
        return function Response(response) {
            var self = this;
            /*self.count = 0;
            self.ec = null;
            self.rs = null;
            self.sc = null;*/
            self.data = null;

            if (response)
                self.data = response;

            Response.prototype.setResponse = function (response) {
                this.data = response;
                return this;
            }
        }
    })
};