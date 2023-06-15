module.exports = function (app) {
    // require('./incoming-mails-grid-template-style.scss');
    app.directive('incomingMailsGridDirective', function () {
        'ngInject';
        return {
            restrict: 'E',
            template: require('./incoming-mails-grid-template.html'),
            controller: 'incomingMailsGridDirectiveCtrl',
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