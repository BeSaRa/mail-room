module.exports = function (app) {
    require('./grid-bulk-actions-directive-style.scss');
    app.directive('gridBulkActionsDirective', function () {
        'ngInject';
        return {
            restrict: 'E',
            template: require('./grid-bulk-actions-template.html'),
            controller: 'gridBulkActionsDirectiveCtrl',
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                grid: '='
            }
        }
    })
};