module.exports = function (app) {
    require('./outgoing-mails-grid-directive/01-index')(app);
    require('./incoming-mails-grid-directive/01-index')(app);
    require('./internal-mails-grid-directive/01-index')(app);
};