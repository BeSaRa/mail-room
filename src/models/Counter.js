module.exports = function (app) {
    app.factory('Counter', function (MailRoomModelInterceptor,
                                     _) {
        'ngInject';
        return function Counter(model) {
            var self = this,
                maps = {
                    menu_item_outgoing: ['totalOutgoing'],
                    menu_item_incoming: ['totalIncoming'],
                    menu_item_internal: ['totalInternal'],
                    lbl_outgoing_new_mails: ['newOutgoing'],
                    lbl_outgoing_sent_mails: ['sendOutgoing'],
                    lbl_outgoing_not_delivered_mails: ['notDeliveredOutgoing'],
                    lbl_incoming_expected_mails: ['expectedIncoming'],
                    lbl_incoming_new_mails: ['newIncoming'],
                    lbl_incoming_sent_mails: ['sendIncoming'],
                    lbl_internal_new_mails: ['newInternal'],
                    lbl_internal_sent_mails: ['sendInternal']
                };

            self.expectedIncoming = 0;
            self.newIncoming = 0;
            self.newInternal = 0;
            self.newOutgoing = 0;
            self.notDeliveredOutgoing = 0;
            self.sendIncoming = 0;
            self.sendInternal = 0;
            self.sendOutgoing = 0;
            self.totalIncoming = 0;
            self.totalInternal = 0;
            self.totalOutgoing = 0;

            self.mappedCounters = {};

            if (model)
                angular.extend(this, model);


            Counter.prototype.getCount = function (propertyName) {
                return this.mappedCounters.hasOwnProperty(propertyName) ? this.mappedCounters[propertyName] : 0;
            };

            Counter.prototype.mapCounter = function () {
                var self = this;
                _.map(maps, function (items, property) {
                    self.mappedCounters[property] = _.reduce(items, function (oldValue, currentValue) {
                        return (oldValue + self[currentValue]);
                    }, 0);
                });
            };

            // don't remove MailRoomModelInterceptor from last line
            // should be always at last thing after all methods and properties.
            MailRoomModelInterceptor.runEvent('Counter', 'init', this);
        }
    })
};
