module.exports = function (app) {
    require('./connected-person-list-template-style.scss');
    app.directive('connectedPersonListDirective', function () {
        'ngInject';
        return {
            restrict: 'E',
            template: require('./connected-person-list-template.html'),
            controller: 'connectedPersonListDirectiveCtrl',
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                mail: '=',
                resetForm: '=',
                disableAll: '=',
                editMode: '=',
                mailUpdated: '='
            }
        }
    });
};
