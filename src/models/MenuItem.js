module.exports = function (app) {
    app.factory('MenuItem', function (MailRoomModelInterceptor) {
        'ngInject';
        return function MenuItem(model) {
            var self = this;
            self.ID = null;
            self.lang_key = null;
            self.icon = null;
            self.parent = null;
            self.link = null;
            self.state = null;
            self.icon_type = null;
            self.sort_order = null;
            self.active = null;
            self.open = false;
            self.children = [];

            if (model)
                angular.extend(this, model);

            MenuItem.prototype.hasChildrenItems = function () {
                return !!this.children.length;
            };
            MenuItem.prototype.toggleItem = function () {
                this.open = !this.open;
                return this;
            };
            MenuItem.prototype.closeItem = function () {
                this.open = false;
                return this;
            };

            MailRoomModelInterceptor.runEvent('MenuItem', 'init', this);

        }
    })
};