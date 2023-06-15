module.exports = function (app) {
    require('./lang-module')(app);
    require('./dialog-module')(app);
    require('./accordion-module/01-index')(app);
    // require('./scanner-module/models/MailRoomScanner')(app);
};