module.exports = function (app) {
    require('./mail-form-template-style.scss');
    app.directive('mailFormDirective', function () {
        'ngInject';
        return {
            restrict: 'E',
            template: require('./mail-form-template.html'),
            controller: 'mailFormDirectiveCtrl',
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                mail: '=',
                entityDefaults: '=',
                formControl: '=',
                disableAll: '=',
                resetForm: '=',
                editMode: '=',
                mailUpdated: '='
            }
        }
    });
};
