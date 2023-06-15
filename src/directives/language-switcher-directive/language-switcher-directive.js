module.exports = function (app) {
    app.directive('languageSwitcherDirective', function (mailRoomTemplate) {
        'ngInject';
        return {
            replace: true,
            restrict: 'E',
            controller: 'languageSwitcherDirectiveCtrl',
            controllerAs: 'language',
            template: mailRoomTemplate.getDirective('language-switcher-directive/language-switcher-template')
        }
    })
};