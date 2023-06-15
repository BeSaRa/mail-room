module.exports = function (app) {
    require('./internal-mails-grid-directive')(app);
    require('./internalMailsGridDirectiveCtrl')(app);
};