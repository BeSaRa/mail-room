module.exports = function (app) {
    app.controller('barcodeDirectiveCtrl', function () {
        'ngInject';
        var self = this;
        self.controllerName = 'barcodeDirectiveCtrl';

        var barcodeTypes = {
            code128: 'CODE128',
            code128A: 'CODE128A',
            code128B: 'CODE128B',
            code128C: 'CODE128C',
            ean: 'EAN',
            code39: 'CODE39',
            itf14: 'ITF-14',
            msi: 'MSI',
            pharmacode: 'Pharmacode',
            codabar: 'Codabar'
        };

        var fonts = {
            monospace: 'monospace',
            fantasy: 'fantasy',
            cursive: 'cursive',
            sans_serif: 'sans-serif',
            serif: 'serif'
        };

        var alignment = {
            left: 'left',
            right: 'right',
            center: 'center'
        };

        var fontOptions = {
            none: '',
            bold: 'bold',
            italic: 'italic',
            bold_italic: 'bold italic'
        };

        var textPositions = {
          bottom: 'bottom',
          top: 'top'
        };

        self.generatedType = {
            png: 'png',
            svg: 'svg'
        };

        /**
         * @description Options for the barcode generation
         * @type {{format: string, lineColor: string, width: number, height: number, displayValue: boolean, fontOptions: string, font: string, textAlign: string, textPosition: string, textMargin: number, fontSize: number, background: null, margin: number, marginTop: number, marginBottom: number, marginLeft: number, marginRight: number, valid: valid}}
         */
        self.options = {
            format: barcodeTypes.code128,
            lineColor: '#000000',
            width: 1,
            height: 100,
            displayValue: true,
            fontOptions: fontOptions.none,
            font: fonts.monospace,
            textAlign: alignment.center,
            textPosition: textPositions.bottom,
            textMargin: 2,
            fontSize: 20,
            background: null,//css color
            margin: 10,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
            valid: function (valid) {
            }
        };
    });
};	