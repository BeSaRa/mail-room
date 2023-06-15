module.exports = function (app) {
    app.directive('packageItemListDirective', function () {
        'ngInject';
        return {
            restrict: 'E',
            template: require('./package-item-list-template.html'),
            controller: 'packageItemListDirectiveCtrl',
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                mail: '=',
                disableAll: '=',
                resetForm: '=',
                editMode: '=',
                mailUpdated: '='
            }
        }
    });
};
