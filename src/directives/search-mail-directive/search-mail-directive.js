module.exports = function (app) {
    app.directive('searchMailDirective', function () {
        'ngInject';
        return {
            restrict: 'E',
            template: require('./search-mail-template.html'),
            controller: 'searchMailDirectiveCtrl',
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                criteria: '=',
                formControl: '='
            }
        }
    });
};