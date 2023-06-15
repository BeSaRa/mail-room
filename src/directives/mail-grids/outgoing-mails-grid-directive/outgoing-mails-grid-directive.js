module.exports = function (app) {
    // require('./outgoing-mails-grid-template-style.scss');
    app.directive('outgoingMailsGridDirective', function () {
        'ngInject';
        return {
            restrict: 'E',
            template: require('./outgoing-mails-grid-template.html'),
            controller: 'outgoingMailsGridDirectiveCtrl',
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