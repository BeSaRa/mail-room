module.exports = function (app) {
    require('./barcode-directive')(app);
    require('./barcodeDirectiveCtrl')(app);
};