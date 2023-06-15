module.exports = function (app) {
    app.directive('sidebarLeftDirective', function (mailRoomTemplate) {
        'ngInject';
        return {
            restrict: 'E',
            replace: true,
            controller: 'sidebarLeftDirectiveCtrl',
            controllerAs: 'sidebar',
            template: mailRoomTemplate.getDirective('sidebar-left-directive/sidebar-left-template')
        }
    });
};
