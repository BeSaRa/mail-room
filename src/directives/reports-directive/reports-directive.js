module.exports = function (app) {
    app.directive('reportsDirective', function () {
        'ngInject';
        return {
            restrict: "E",
            template: require('./reports-template.html'),
            replace: true,
            scope: {
                criteria: '=',
                formControl: '=',
                reportType: '='
            },
            bindToController: true,
            controller: 'reportsDirectiveCtrl',
            controllerAs: 'ctrl'
        }
    })
};