module.exports = function (app) {
    require('./incoming-mails-grid-directive')(app);
    require('./incomingMailsGridDirectiveCtrl')(app);
};