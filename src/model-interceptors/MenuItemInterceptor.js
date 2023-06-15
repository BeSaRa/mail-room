module.exports = function (app) {
    app.run(function (MailRoomModelInterceptor,
                      $rootScope,
                      sidebarService,
                      langService) {
        'ngInject';

        var modelName = 'MenuItem';

        MailRoomModelInterceptor.whenInitModel(modelName, function (model) {
            model.translate = langService.get(model.lang_key);
            $rootScope.$watch(function () {
                return langService.current;
            }, function () {
                model.translate = langService.get(model.lang_key);
            });
            return model;
        });

        MailRoomModelInterceptor.whenReceivedModel(modelName, function (model) {
            if (!model.parent) {
                model.parent = '';
            }
            model.myParent = angular.copy(sidebarService.getMenuItemByID(model.parent));
            return model;
        });
    })
};