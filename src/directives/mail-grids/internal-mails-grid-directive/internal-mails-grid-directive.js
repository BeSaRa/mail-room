module.exports = function (app) {
    // require('./internal-mails-grid-template-style.scss');
    app.directive('internalMailsGridDirective', function () {
        'ngInject';
        return {
            restrict: 'E',
            template: require('./internal-mails-grid-template.html'),
            controller: 'internalMailsGridDirectiveCtrl',
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                records: '=',
                grid: '=',
                totalRecords: '='
            }
        }
    });
};