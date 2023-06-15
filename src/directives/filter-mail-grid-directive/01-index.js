module.exports = function (app) {
    require('./filter-mail-grid-directive')(app);
    require('./filterMailGridDirectiveCtrl')(app);
};