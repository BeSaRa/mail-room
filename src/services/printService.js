module.exports = function (app) {
    app.service('printService', function (toast,
                                          langService,
                                          _,
                                          dialog) {
        'ngInject';
        var self = this;
        self.serviceName = 'printService';

        var printPages = {
            actionLogTimeline: 'print/print-timeline-template.html',
            actionLogGrid: 'print/print-action-log-template.html',
            generalSearch: 'print/print-general-search-template.html'
        };

        var _print = function (page) {
            localStorage.setItem('currentLang', langService.current);
            var printWindow = window.open(page, '', 'left=0,top=0,width=0,height=0,toolbar=0,scrollbars=0,status=0');
            if (!printWindow) {
                toast.error(langService.get('msg_error_occurred_while_processing_request'))
            }
        };

        var _printWithGraphicsInfoMessage = function (page) {
            dialog.infoMessage(langService.get('msg_enable_background_graphics_in_print_settings'), langService.get('btn_print'))
                .then(function () {
                    localStorage.setItem('currentLang', langService.current);
                    var printWindow = window.open(page, '', 'left=0,top=0,width=0,height=0,toolbar=0,scrollbars=0,status=0');
                    if (!printWindow) {
                        toast.error(langService.get('msg_error_occurred_while_processing_request'))
                    }
                });
        };

        /**
         * @description Prints the timeline of action log
         * @param mail
         * @param records
         * @param $event
         */
        self.printTimeline = function (mail, records, $event) {
            if (!records.length) {
                toast.info(langService.get('msg_no_records_to_print'));
            } else {
                var printData = [];
                _.map(records, function (record) {
                    printData.push({
                        referenceNoForPrint: mail.getMailReferenceNo(),
                        actionDateForPrint: record.actionDateFormatted,
                        actionLogTypeIdForPrint: record.actionLogType.typeId,
                        actionLogTypeForPrint: record.actionLogType.getTranslatedName(),
                        userNameForPrint: record.user.getTranslatedName()
                    })
                });
                localStorage.setItem('printData', JSON.stringify(printData));
                _printWithGraphicsInfoMessage(printPages.actionLogTimeline);
            }
        };

        /**
         * @description Prints the grid of action log
         * @param mail
         * @param records
         * @param grid
         * @param $event
         */
        self.printActionLog = function (mail, records, grid, $event) {
            if (!records.length) {
                toast.info(langService.get('msg_no_records_to_print'));
            } else {
                var data = _getRecordsDataActionLog(records, grid);
                data.mailData = {
                    referenceNo: {
                        header: langService.get('lbl_reference_number'),
                        value: mail.getMailReferenceNo()
                    },
                    entryType: {
                        header: langService.get('lbl_entry_type'),
                        value: mail.entryTypeLookup ? mail.entryTypeLookup.getTranslatedName() : ''
                    },
                    mailType: {
                        header: langService.get('lbl_mail_type'),
                        value: mail.mailTypeLookup.getTranslatedName()
                    },
                    sender: {
                        header: (mail.isInternalMail()) ? langService.get('lbl_sender_department') : langService.get('lbl_sender_entity'),
                        value: (mail.isInternalMail()) ? mail.senderDep.getTranslatedName() : mail.senderEntity.getTranslatedName()
                    },
                    receiver: {
                        header: (mail.isInternalMail()) ? langService.get('lbl_receiver_department') : langService.get('lbl_receiver_entity'),
                        value: (mail.isInternalMail()) ? mail.receiverDep.getTranslatedName() : mail.receiverEntity.getTranslatedName()
                    }
                };
                localStorage.setItem('printData', JSON.stringify(data));

                _print(printPages.actionLogGrid);
            }
        };

        /**
         * @description Prints the grid of general search result
         * @param records
         * @param grid
         * @param $event
         */
        self.printSearchGrid = function (records, grid, $event) {
            if (!records.length) {
                toast.info(langService.get('msg_no_records_to_print'));
            } else {
                var data = _getRecordsDataGeneralSearch(records, grid);
                localStorage.setItem('printData', JSON.stringify(data));
                _print(printPages.generalSearch);
            }
        };

        /**
         * @description Returns the data for print grids
         * @param records
         * @param grid
         * @returns {{header: Array, records: Array, indicators: Array}}
         * @private
         */
        var _getRecordsDataGeneralSearch = function (records, grid) {
            var columnsCopy = angular.copy(grid.columns);
            var data = {
                header: [],
                records: []
            };

            data.header.push('');
            // get columns which are shown in grid, and push the headers in the data headers
            var columns = _.filter(columnsCopy, function (col) {
                if (grid.showColumn(col) && col.hasOwnProperty('searchKey') && col.searchKey()) {
                    data.header.push(langService.get(col.langKey));
                    return col;
                }
            });


            // for each record, get the value and push in data records
            _.map(records, function (record) {
                var dataToPush = [];

                // push first column
                dataToPush.push({
                    value: '',
                    indicator: [_.result(record, 'mailTypeIndicator', ''), _.result(record, 'statusTypeIndicator', '')]
                });

                _.map(columns, function (column) {
                    var searchKey = column.searchKey();
                    var indicator = '';

                    if (searchKey.indexOf('receiverEntity') > -1)
                        indicator = _.result(record, 'receiverEntity.entityUseSystemIndicator', '');
                    else if (searchKey === 'referenceNo')
                        indicator = _.result(record, 'entryTypeIndicator', '');
                    else if (searchKey === 'registerDateFormatted')
                        indicator = _.result(record, 'priorityIndicator', '');

                    dataToPush.push({
                        value: _.result(record, searchKey, ''),
                        indicator: indicator
                    });
                });
                data.records.push(dataToPush);

            });

            return data;
        };


        var _getRecordsDataActionLog = function (records, grid) {
            var columnsCopy = angular.copy(grid.columns);
            var data = {
                header: [],
                records: []
            };

            // get columns which are shown in grid, and push the headers in the data headers
            var columns = _.filter(columnsCopy, function (col) {
                if (grid.showColumn(col) && col.hasOwnProperty('searchKey') && col.searchKey()) {
                    data.header.push(langService.get(col.langKey));
                    return col;
                }
            });

            // for each record, get the value and push in data records
            _.map(records, function (record) {
                var dataToPush = [];
                _.map(columns, function (column) {
                    dataToPush.push(_.result(record, column.searchKey(), ''));
                });
                data.records.push(dataToPush);
            });

            return data;
        };

        /**
         * @description Download the file from given url
         * @param url
         * @param fileName
         * @param extension
         */
        self.downloadFile = function (url, fileName, extension) {
            var link = document.createElement('a');
            extension = extension || 'pdf'
            extension = extension.indexOf('.') === 0 ? extension : ('.' + extension);
            link.download = (fileName || 'mailroom-download') + extension;
            link.href = url;
            //link.target = '_blank';
            link.click();
        };
    });
};
