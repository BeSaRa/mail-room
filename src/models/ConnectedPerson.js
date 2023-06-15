module.exports = function (app) {
    app.factory('ConnectedPerson', function (MailRoomModelInterceptor) {
        'ngInject';
        return function ConnectedPerson(model) {
            var self = this;
            self.id = null;
            self.personalId = null;
            self.fullName = null;
            self.address1 = null;
            self.address2 = null;
            self.mobile1 = null;
            self.mobile2 = null;
            self.notes = null;

            if (model)
                angular.extend(this, model);

            // every model has required fields
            // if you don't need to make any required fields leave it as an empty array
            var requiredFields = [
                'fullName'
            ];

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            ConnectedPerson.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            ConnectedPerson.prototype.getFullName = function () {
                return this.fullName;
            };

            /**
             * @description Returns the id of Connected Person
             * @returns {number}
             */
            ConnectedPerson.prototype.getConnectedPersonId = function () {
                return this.id;
            };


            MailRoomModelInterceptor.runEvent('ConnectedPerson', 'init', this);

        }
    });
};
