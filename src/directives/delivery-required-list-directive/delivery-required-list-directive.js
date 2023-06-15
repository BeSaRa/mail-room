module.exports = function (app) {
    require('./delivery-required-list-template-style.scss');
    app.directive('deliveryRequiredListDirective', function () {
        'ngInject';
        return {
            restrict: 'E',
            template: require('./delivery-required-list-template.html'),
            controller: 'deliveryRequiredListDirectiveCtrl',
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                mail: '=',
                resetForm: '=',
                disableAll: '=',
                editMode: '=',
                isMobileReceive: '=?',
                mailUpdated: '=?'
            }
        }
    });
};
