module.exports = function (app) {
    app.factory('MobileReceive', function (MailRoomModelInterceptor,
                                           dialog,
                                           mailRoomTemplate,
                                           urlService,
                                           langService,
                                           lookupService,
                                           userInfoService,
                                           Indicator,
                                           printService) {
        'ngInject';
        return function MobileReceive(model) {
            var self = this;

            self.receiverNotes = null;
            self.receiverName = null;
            self.receivedDate = null;
            self.idCopy = null;
            self.deliveryRequiredItemList = [];
            self.mailId = null;
            self.mailType = null;
            self.signature = null;
            self.statusType = null;

            if (model)
                angular.extend(this, model);

            /**
             * @description Contains the keys for popup header
             * @type {{addEdit: string, barcode: string, timeline: string, actionLog: string, send: string, receive: string}}
             */
            self.popupHeaderTypes = {};

            MailRoomModelInterceptor.runEvent('MobileReceive', 'init', this);

        }
    });
};
