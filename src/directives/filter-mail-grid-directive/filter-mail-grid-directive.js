module.exports = function (app) {
    require('./filter-mail-grid-template-style.scss');
    app.directive('filterMailGridDirective', function () {
        'ngInject';
        return {
            restrict: 'E',
            template: require('./filter-mail-grid-template.html'),
            controller: 'filterGridDirectiveCtrl',
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                criteria: '=',
                formControl: '=',
                resetForm: '='
            }
        }
    });
};