module.exports = function (app) {
    app.controller('barcodeScannerDirectiveCtrl', function (LangWatcher,
                                                            $scope,
                                                            $window,
                                                            dialog,
                                                            mailService,
                                                            gridService,
                                                            langService,
                                                            generator) {
        'ngInject';
        var self = this;
        self.controllerName = 'barcodeScannerDirectiveCtrl';
        LangWatcher($scope);
        self.mails = [];

        self.scanBarcode = function ($event) {
            console.log(self.statusTypesKey);
            mailService.getBarcodeMailByReferenceNumber(self.referenceNo, self.statusTypesKey ,$event)
                .then(function (result) {
                    if (result) {
                        self.mails.push(result);
                        self.referenceNo = '';
                    }
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
            name: 'scannedMails',
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
                senderEntity: {
                    langKey: 'header_sender_entity',
                    searchKey: function () {
                        return self.getSortingKey('senderEntity', 'Entity');
                    },
                    sortKey: function () {
                        return self.getSortingKey('senderEntity', 'Entity');
                    }
                },
                senderDepartment: {
                    langKey: 'header_sender_department',
                    searchKey: function () {
                        return self.getSortingKey('senderDep', 'Entity');
                    },
                    sortKey: function () {
                        return self.getSortingKey('senderDep', 'Entity');
                    }
                },
                receiverEntity: {
                    langKey: 'header_receiver_entity',
                    searchKey: function () {
                        return self.getSortingKey('receiverEntity', 'Entity');
                    },
                    sortKey: function () {
                        return self.getSortingKey('receiverEntity', 'Entity');
                    }
                },
                receiverDepartment: {
                    langKey: 'header_receiver_department',
                    searchKey: function () {
                        return self.getSortingKey('receiverDep', 'Entity');
                    },
                    sortKey: function () {
                        return self.getSortingKey('receiverDep', 'Entity');
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

    })
};