module.exports = function (app) {
    app.controller('receiveMailPopCtrl', function (dialog,
                                                   mailService,
                                                   toast,
                                                   generator,
                                                   userInfoService,
                                                   langService) {
        'ngInject';
        var self = this;
        self.controllerName = 'receiveMailPopCtrl';

        self.tabsToShow = {
            basicInfo: {
                name: 'basic',
                key: 'lbl_basic_info'
            },
            collectedItems: {
                name: 'collected',
                key: 'lbl_delivery_required_items',
                hide: function () {
                    return self.mail.deliveryRequiredItemList.length === 0;
                }
            }
        };
        self.showTab = function (tab) {
            if (!tab.hasOwnProperty('hide')) {
                return true;
            } else {
                if (typeof tab.hide === 'function') {
                    return !tab.hide();
                }
                return !tab.hide;
            }
        };
        self.selectedTabName = self.tabsToShow.basicInfo.name.toLowerCase();
        self.selectedTabIndex = 0;
        self.setCurrentTab = function (tab, $event) {
            self.selectedTabName = tab.name.toLowerCase();
        };
        self.isTabSelected = function (tab) {
            return self.selectedTabName.toLowerCase() === tab.name.toLowerCase()
        };
        self.changeTab = function (tab) {
            Object.keys(self.tabsToShow).forEach(function (key, index) {
                if (self.tabsToShow[key].name.toLowerCase() === tab.name.toLowerCase()) {
                    self.selectedTabIndex = index;
                }
            });
        };

        /**
         * @description Receive mail
         * @param $event
         */
        self.receive = function ($event) {
            self.mail.receivedDate = generator.setCurrentTimeOfDate(self.mail.receivedDate);
            self.callback(self.mail, $event)
                .then(function (result) {
                    if (result) {
                        dialog.hide(true);
                    } else {
                        toast.error(langService.get('msg_error_occurred_while_processing_request'));
                    }
                }).catch(function (error) {
                toast.error(langService.get('msg_error_occurred_while_processing_request'));
            })
        };

        /**
         * @description Close the popup
         * @param $event
         */
        self.closePopup = function ($event) {
            dialog.cancel('close');
        }

    });
};
