module.exports = function (app) {
    require('./reports-directive')(app);
    require('./reportsDirectiveCtrl')(app);
};