module.exports = function (app) {
    require('./barcode-scanner-directive')(app);
    require('./barcodeScannerDirectiveCtrl')(app);
};