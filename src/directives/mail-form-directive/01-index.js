module.exports = function (app) {
    require('./mail-form-directive')(app);
    require('./mailFormDirectiveCtrl')(app);
};