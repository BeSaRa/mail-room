module.exports = function (app) {
    app.controller('trackingSheetPopCtrl', function (gridService,
                                                     generator,
                                                     $q,
                                                     $filter,
                                                     dialog,
                                                     trackingSheetService) {
        'ngInject';
        var self = this;
        self.controllerName = 'trackingSheetPopCtrl';

        //load from service
        self.trackingRecords = trackingSheetService.trackingSheets;

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
            name: 'trackingSheet',
            progress: null,
            selectedRecords: [],
            limit: 5, // default limit
            page: 1, // first page
            order: '', // default sorting column with order(- for desc),
            limitOptions: gridService.getGridLimitOptions(self.trackingRecords),
            columns: {
                sequence: {
                    langKey: 'header_sequence',
                    searchKey: function () {
                        return 'sequence';
                    }
                },
                userName: {
                    langKey: 'header_username',
                    searchKey: function () {
                        return self.getSortingKey('user', 'Employee');
                    }
                },
                actionDate: {
                    langKey: 'header_action_date',
                    searchKey: function () {
                        return 'actionDateFormatted';
                    }
                },
                actionType: {
                    langKey: 'header_action_type',
                    searchKey: function () {
                        return self.getSortingKey('actionLogType', 'Lookup');
                    }
                },

                mailType: {
                    langKey: 'header_mail_type',
                    searchKey: function () {
                        return self.getSortingKey('mailType', 'Lookup');
                    }
                },
                entryType: {
                    langKey: 'header_entry_type',
                    searchKey: function () {
                        return self.getSortingKey('entryType', 'Lookup');
                    }
                },
                receiverEntity: {
                    langKey: 'header_receiver_entity',
                    searchKey: function () {
                        return self.getSortingKey('receiverEntity', 'Entity');
                    }
                },
                senderEntity: {
                    langKey: 'header_sender_entity',
                    searchKey: function () {
                        return self.getSortingKey('senderEntity', 'Entity');
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
                self.trackingRecords = gridService.sortGridData(self.grid, self.trackingRecords);
            },
            searchText: '',
            searchCallback: function () {
                self.trackingRecords = gridService.searchGridData(self.grid, self.trackingRecords);
                gridService.resetSorting(self.grid);
                self.grid.sortCallback();
            },
            reload: function (pageNumber, $event) {
                var defer = $q.defer();
                self.grid.progress = defer.promise;

                /* return trckingService.loadTrackingSheetRecords($event)
                     .then(function (result) {
                         self.trackingRecords = result;
                         self.grid.selectedRecords = [];
                         defer.resolve(true);
                         if (pageNumber)
                             self.grid.page = pageNumber;
                         gridService.resetSorting(self.grid);
                         self.grid.sortCallback();
                         return result;
                     });*/
            }
        };

        /**
         * @description Close the dialog
         */
        self.closeDialog = function ($event) {
            dialog.cancel();
        };

        /**
         * Print
         * @param $event
         */
        self.print = function ($event) {

        };

    });
};