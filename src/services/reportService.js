module.exports = function (app) {
    app.service('reportService', function (urlService,
                                           $http,
                                           $q,
                                           $sce,
                                           langService,
                                           mailRoomTemplate,
                                           dialog,
                                           generator) {
        'ngInject';
        var self = this;
        self.serviceName = 'reportService';

        self.reportingTypes = {
            mailDetails: 'MAIL_DETAILS_REPORT',
            mailActionDetails: 'MAIL_ACTION_DETAILS_REPORT',
            employeeDetails: 'USER_OPERATION_DETAILS_REPORT',
            employeeStatical: 'USER_STATICAL_REPORT',
            departmentStatical: 'DEP_STATIC_REPORT'
        };

        self.reportFormats = {
            PDF: {key: 'pdf', extension: '.pdf'},
            EXCEL: {key: 'excel', extension: '.xlsx'}
        };

        /**
         * @description Generate Report
         * @param $event
         * @param criteria
         * @param reportType
         * @returns {Promise}
         */
        self.generateReport = function ($event, criteria, reportType) {
            return $http
                .put(urlService.report + '?reportType=' + reportType, generator.interceptSendInstance('Reporting', criteria), {
                    responseType: 'blob'
                })
                .then(function (result) {
                    var url = window.URL.createObjectURL(result.data);
                    return {
                        data: result.data,
                        url: url,
                        trustedUrl: $sce.trustAsResourceUrl(url)
                    };
                })
                .catch(function (error) {

                });
        };

        self.viewSummaryReport = function (mail, $event) {
            self.generateSummaryReport($event, mail)
                .then(function (result) {
                    self.openReportDialog($event, result.trustedUrl, mail, langService.get('summary_report'))
                });
        }

        /**
         *@description generate summary report
         * @param $event
         * @param mail
         * @returns {*}
         */
        self.generateSummaryReport = function ($event, mail) {
            return $http
                .get(urlService.summaryReport + langService.current + '/' + mail.id, {
                    responseType: 'blob'
                })
                .then(function (result) {
                    var url = window.URL.createObjectURL(result.data);
                    return {
                        data: result.data,
                        url: url,
                        trustedUrl: $sce.trustAsResourceUrl(url)
                    };
                })
                .catch(function (error) {

                });
        };

        /**
         *@description generate delivery report
         * @param $event
         * @param mail
         * @returns {*}
         */
        self.generateDeliveryReport = function ($event, mail) {
            return $http
                .get(urlService.deliveryReport + langService.current + '/' + mail.id, {
                    responseType: 'blob'
                })
                .then(function (result) {
                    var url = window.URL.createObjectURL(result.data);
                    return {
                        data: result.data,
                        url: url,
                        trustedUrl: $sce.trustAsResourceUrl(url)
                    };
                })
                .catch(function (error) {

                });
        };

        self.openReportDialog = function ($event, trustedUrl, record, title) {
            return dialog
                .showDialog({
                    targetEvent: $event,
                    template: mailRoomTemplate.getPopup('view-report'),
                    controller: function (dialog, $timeout, $element) {
                        'ngInject';
                        var self = this;
                        self.fullScreen = true;
                        self.closeDialog = function ($event) {
                            dialog.hide();
                        };
                    },
                    controllerAs: 'ctrl',
                    bindToController: true,
                    escapeToClose: false,
                    locals: {
                        mail: record,
                        reportUrl: trustedUrl,
                        title: title
                    }
                });
        }
    });
};
