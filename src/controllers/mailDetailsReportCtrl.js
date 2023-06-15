module.exports = function (app) {
    app.controller('mailDetailsReportCtrl', function (Reporting,
                                                      reportService,
                                                      langService,
                                                      helpService,
                                                      printService) {
        'ngInject';
        var self = this;

        self.controllerName = 'mailDetailsReportCtrl';
        helpService.setHelpTo('mail-details-report');

        self.criteria = new Reporting();
        self.pageHeadTextLangKey = 'menu_item_report_mail_details';
        self.reportType = reportService.reportingTypes.mailDetails;
        self.reportFormats = reportService.reportFormats;
        self.reportUrl = '';
        self.isResultTabVisible = false;

        //tabs
        self.tabsToShow = {
            search: {
                name: 'search',
                key: 'lbl_search'
            },
            view: {
                name: 'view',
                key: 'lbl_view_report'
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
         *  view result criteria
         * @param $event
         */
        self.viewReport = function ($event) {
            self.criteria.resultFormat = self.reportFormats.PDF.key;
            reportService.generateReport($event, self.criteria, self.reportType)
                .then(function (result) {
                    self.isResultTabVisible = true;
                    self.reportUrl = result.trustedUrl;
                    self.changeTab(self.tabsToShow.view);
                });
        };

        /**
         * @description Prints the report
         * @param $event
         * @param reportFormat
         */
        self.printReport = function ($event, reportFormat) {
            self.criteria.resultFormat = reportFormat.key;
            reportService.generateReport($event, self.criteria, self.reportType)
                .then(function (result) {
                    printService.downloadFile(result.url, langService.get(self.pageHeadTextLangKey), reportFormat.extension);
                });
        };

        /**
         * @description Resets the form
         */
        self.resetForm = function ($event) {
            self.criteria = new Reporting();
        };

    });
};
