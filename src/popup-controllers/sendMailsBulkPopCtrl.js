module.exports = function (app) {
    app.controller('sendMailsBulkPopCtrl', function (dialog,
                                                     mailService,
                                                     toast,
                                                     generator,
                                                     langService,
                                                     gridService,
                                                     $q) {
        'ngInject';
        var self = this;
        self.controllerName = 'sendMailsBulkPopCtrl';

        self.senderEmployee = null;
        self.sentDate = new Date();

        /**
         * @description change all selected(sender Name/Date) values
         */
        self.setSenderBulk = function (property) {
            self.mails = _.map(self.mails, function (mail) {
                if (property === 'senderEmployee')
                    mail.senderEmployee = self.senderEmployee;
                if (property === 'sentDate') {
                    if (self.sentDate.getDate() < mail.registerDate.getDate())
                        mail.sentDate = null;
                    else
                        mail.sentDate = self.sentDate;
                }

                return mail;
            });
        };

        /**
         * @description remove select mail
         * @param mail
         * @param $event
         */
        self.skipSelectedMail = function (mail, $event) {
            dialog.confirmMessage(langService.get('msg_confirm_skip_mail').change({ref: mail.getMailReferenceNo()}))
                .then(function () {
                    self.mails = _.filter(self.mails, function (m) {
                        return m.id !== mail.id;
                    });
                }).catch(function () {
                return $q.reject('cancel');
            });
        };

        self.send = function ($event) {

            self.mails = _.map(self.mails, function (mail) {
                mail.sentDate = generator.setCurrentTimeOfDate(mail.sentDate);
                return mail;
            });

            self.callback(self.mails, $event)
                .then(function (result) {
                    dialog.hide(result);

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
        };

        /**
         * @description Gets the sorting key for given column
         * @param property
         * @param modelType
         * @returns {*}
         */
        self.getSortingKey = function (property, modelType) {
            return generator.getColumnSortingKey(property, modelType);
        };

        /**
         * @description Contains options for grid configuration
         * @type {{limit: number, page: number, order: string, limitOptions: *[], columns: string[], showColumn: (function(*=): boolean), sortCallback: sortCallback}}
         */
        self.grid = {
            name: 'sendMailsBulk',
            progress: null,
            selectedRecords: [],
            limit: 5, // default limit
            page: 1, // first page
            order: '', // default sorting column with order(- for desc),
            limitOptions: gridService.getGridLimitOptions(self.mails),
            columns: {
                referenceNo: {
                    langKey: 'header_reference_no',
                    searchKey: function () {
                        return 'referenceNo';
                    },
                    sortKey: function () {
                        return 'referenceNo';
                    }
                },
                sender: {
                    langKey: 'header_sender',
                    searchKey: function () {
                        return self.getSortingKey('senderEmployeeEmpPermission', 'EmployeePermission');
                    },
                    sortKey: function () {
                        return self.getSortingKey('senderEmployeeEmpPermission', 'EmployeePermission');
                    }
                },
                sentDate: {
                    langKey: 'header_sent_date',
                    searchKey: function () {
                        return 'sentDateFormatted';
                    },
                    sortKey: function () {
                        return 'sentDateFormatted';
                    }
                },
                gridActions: {
                    langKey: 'header_actions',
                    hide: function () {
                        return !self.mails.length;
                    }
                }
            },
            columnsCount: function (includeHidden) {
                return gridService.getColumnsCount(self.grid, includeHidden);
            },
            colSpan: function () {
                return gridService.getColSpan(self.grid);
            },
            showColumn: function (column, isHeader) {
                return gridService.isShowColumn(self.grid, column, isHeader);
            },
            sortCallback: function (sortKey) {
                self.mails = gridService.sortGridData(self.grid, self.mails);
            },
            searchText: '',
            searchCallback: function () {
                self.mails = gridService.searchGridData(self.grid, self.mails);
                gridService.resetSorting(self.grid);
                self.grid.sortCallback();
            },
            reload: function (pageNumber, $event) {
            }
        };


    });
};
