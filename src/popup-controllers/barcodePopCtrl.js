module.exports = function (app) {
    app.controller('barcodePopCtrl', function (dialog, $timeout, $element, reportService, printService, langService, mailRoomTemplate) {
        'ngInject';
        var self = this;
        self.controllerName = 'barcodePopCtrl';
        self.reportFormats = reportService.reportFormats;

        self.printBarcode = function ($event) {
            var WinPrint = window.open('', '', 'left=0,top=0,width=0,height=0,toolbar=0,scrollbars=0,status=0');
            WinPrint.document.write($element.find("#barcode-image")[0].innerHTML);
            $timeout(function () {
                WinPrint.print();
                WinPrint.close();
            });
        }

        self.close = function ($event) {
            dialog.hide();
        };
    });
};
