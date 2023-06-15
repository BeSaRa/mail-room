module.exports = function (app) {
    app.controller('receiveMailsBulkPopCtrl', function (dialog,
                                                        mailService,
                                                        toast,
                                                        generator,
                                                        langService,
                                                        gridService,
                                                        _,
                                                        $q) {
        'ngInject';
        var self = this;
        self.controllerName = 'receiveMailsBulkPopCtrl';

        self.receiverName = null;
        self.receivedDate = new Date();
        self.receiverNotes = null;

        /**
         * @description change all selected(receiver Name/Date/Notes) values
         */
        self.setReceiveBulk = function (property) {
            self.mails = _.map(self.mails, function (mail) {
                if (property === 'receiverName')
                    mail.receiverName = self.receiverName;
                else if (property === 'receivedDate') {
                    if (self.receivedDate.getDate() < mail.sentDate.getDate())
                        mail.receivedDate = null;
                    else
                        mail.receivedDate = self.receivedDate;
                }
                else if (property === 'receiverNotes')
                    mail.receiverNotes = self.receiverNotes;
                return mail;
            });
        };

        /**
         * @description Skip select mail
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

        /**
         * @description Receives the selected mails
         * @param $event
         */
        self.receive = function ($event) {
            self.mails = _.map(self.mails, function (mail) {
                mail.receivedDate = generator.setCurrentTimeOfDate(mail.receivedDate);
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
            name: 'receiveMailsBulk',
            progress: null,
            selectedRecords: [],
            limit: 5, // default limit
            page: 1, // first page
            order: '', // default sorting column with order(- for desc),
            limitOptions: gridService.getGridLimitOptions(self.mails),
            columns: {
                referenceNo: {
                    langKey: 'header_reference_no',
                    searchKey: function(){
                        return 'referenceNo';
                    },
                    sortKey: function(){
                        return 'referenceNo';
                    }
                },
                receiver: {
                    langKey: 'header_receiver',
                    searchKey: function(){
                        return 'receiverName';
                    },
                    sortKey: function(){
                        return 'receiverName';
                    }
                },
                receivedDate: {
                    langKey: 'header_received_date',
                    searchKey: function(){
                        return 'receivedDateFormatted';
                    },
                    sortKey: function(){
                        return 'receivedDateFormatted';
                    }
                },
                receiverNotes: {
                    langKey: 'header_receiver_notes',
                    searchKey: function(){
                        return 'receiverNotes';
                    },
                    sortKey: function(){
                        return 'receiverNotes';
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
