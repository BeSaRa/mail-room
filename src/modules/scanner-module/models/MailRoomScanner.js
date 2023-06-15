module.exports = function () {
    var app = angular.module('MailRoomScanner', []);
    require('../01-index')(app);
};