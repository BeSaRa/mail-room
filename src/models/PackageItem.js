module.exports = function (app) {
    app.factory('PackageItem', function (MailRoomModelInterceptor,
                                         langService) {
        'ngInject';
        return function PackageItem(model) {
            var self = this;
            self.id = null;
            self.categoryId = null;
            self.description = null;
            self.description = null;
            self.height = null;
            self.heightUnitId = null;
            self.length = null;
            self.lengthUnitId = null;
            self.notes = null;
            self.quantity = null;
            self.quantityUnitId = null;
            self.weightUnitId = null;
            self.width = null;
            self.oneItemWeight = null;
            self.widthUnitId = null;


            if (model)
                angular.extend(this, model);


            MailRoomModelInterceptor.runEvent('PackageItem', 'init', this);
        }
    })
};
