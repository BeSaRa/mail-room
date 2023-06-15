module.exports = function (app) {
    app.controller('trackingMailCtrl', function ($q,
                                                 _,
                                                 langService,
                                                 $filter,
                                                 toast,
                                                 generator,
                                                 helpService,
                                                 gridService,
                                                 SearchMail,
                                                 mailService,
                                                 printService,
                                                 outgoingMailService,
                                                 actionLogService) {
        'ngInject';
        var self = this;

        self.controllerName = 'trackingMailCtrl';
        helpService.setHelpTo('tracking-mail');

        self.records = [];
        self.recordsCopy = generator.shallowCopyArray(self.records);
        self.criteria = new SearchMail();

        //tabs
        self.tabsToShow = {
            search: {
                name: 'search',
                key: 'lbl_search'
            },
            result: {
                name: 'result',
                key: 'lbl_search_result'
            }
        };
        self.selectedTabName = self.tabsToShow.search.name;
        self.selectedTabIndex = 0;

        self.showTab = function (tab) {
            return !tab.hide;
        };
        self.setCurrentTab = function (tab, $event) {
            self.selectedTabName = tab.name;
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
         *  Search result criteria
         * @param $event
         */
        self.search = function ($event) {
            mailService.getMailByReferenceNumber(self.referenceNo, true, $event)
                .then(function (mail) {
                    self.mail = mail;
                    actionLogService.loadTimeline(mail, $event).then(function (timelineRecords) {
                        self.timelineRecords = timelineRecords;
                        self.changeTab(self.tabsToShow.result);
                    });
                });
        };

        /**
         * @description Resets the form
         */
        self.resetForm = function ($event) {
            self.referenceNo = null;
            self.mail = null;
            self.timelineRecords = null;
            self.changeTab(self.tabsToShow.search);
        };

        /**
         * @description Prints the timeline from grid
         * @param $event
         */
        self.print = function ($event) {
            printService.printTimeline(self.mail, self.timelineRecords, $event);
        };

    });
};
