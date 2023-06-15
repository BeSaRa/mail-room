module.exports = function (app) {
    app.directive('popupToolbarDirective', function () {
        'ngInject';
        return {
            restrict: 'E',
            template: require('./popup-toolbar-template.html'),
            replace: true,
            controller: 'popupToolbarDirectiveCtrl',
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                headerText: '@',
                showTooltip: '=',
                hideClose: '=?',
                closeCallback: '=?',
                fullScreenButton: '=?',
                fullScreen: '=?'
            }
        }
    })
};
