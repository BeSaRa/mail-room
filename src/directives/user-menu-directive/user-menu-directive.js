module.exports = function (app) {
    app.directive('userMenuDirective', function (mailRoomTemplate) {
        'ngInject';
        return {
            replace: true,
            restrict: 'E',
            controller: 'userMenuDirectiveCtrl',
            controllerAs: 'userMenu',
            template: mailRoomTemplate.getDirective('user-menu-directive/user-menu-template')
        }
    });


};