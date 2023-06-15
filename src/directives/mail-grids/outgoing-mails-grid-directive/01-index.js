module.exports = function (app) {
    require('./outgoing-mails-grid-directive')(app);
    require('./outgoingMailsGridDirectiveCtrl')(app);
};