module.exports = function (app) {
    app.directive('barcodeScannerDirective', function () {
        'ngInject';
        return {
            restrict: 'E',
            template: require('./barcode-scanner-template.html'),
            controller: 'barcodeScannerDirectiveCtrl',
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                statusTypesKey: '='
            }
        }
    })
};