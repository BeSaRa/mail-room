module.exports = function (app) {
    //require('./barcode-directive-style.scss');
    app.directive('barcodeDirective', function () {
        'ngInject';
        return {
            restrict: 'E',
            template: require('./barcode-template.html'),
            controller: 'barcodeDirectiveCtrl',
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                value: '@'
            }
        }
    })
};