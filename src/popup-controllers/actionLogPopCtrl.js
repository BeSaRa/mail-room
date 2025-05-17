module.exports = function (app) {
    app.controller('actionLogPopCtrl', function (gridService,
                                                 generator,
                                                 $q,
                                                 $filter,
                                                 dialog,
                                                 actionLogService,
                                                 langService,
                                                 _,
                                                 mailService,
                                                 printService) {
        'ngInject';
        var self = this;
        self.controllerName = 'actionLogPopCtrl';

        //load from service
        self.actionLogs = actionLogService.actionLogs;

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
            name: 'actionLogs',
            progress: null,
            selectedRecords: [],
            limit: 5, // default limit
            page: 1, // first page
            order: '', // default sorting column with order(- for desc),
            limitOptions: gridService.getGridLimitOptions(self.actionLogs),
            columns: {
                sequence: {
                    langKey: 'header_sequence',
                    searchKey: function () {
                        return 'actionLogSequence';
                    },
                    sortKey: function () {
                        return 'actionLogSequence';
                    }
                },
                actionType: {
                    langKey: 'header_action_type',
                    searchKey: function () {
                        return self.getSortingKey('actionLogType', 'Lookup');
                    },
                    sortKey: function () {
                        return self.getSortingKey('actionLogType', 'Lookup');
                    }
                },
                actionDate: {
                    langKey: 'header_action_date',
                    searchKey: function () {
                        return 'actionDateFormatted';
                    },
                    sortKey: function () {
                        return 'actionDateFormatted';
                    }
                },
                userName: {
                    langKey: 'header_username',
                    searchKey: function () {
                        return self.getSortingKey('user', 'Employee');
                    },
                    sortKey: function () {
                        return self.getSortingKey('user', 'Employee');
                    }
                },
                actionDetails: {
                    langKey: 'header_action_details',
                    searchKey: function () {
                        return 'actionDetails';
                    },
                    sortKey: function () {
                        return 'actionDetails';
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
                self.actionLogs = gridService.sortGridData(self.grid, self.actionLogs);
            },
            searchText: '',
            searchCallback: function () {
                self.actionLogs = gridService.searchGridData(self.grid, self.actionLogs);
                gridService.resetSorting(self.grid);
                self.grid.sortCallback();
            },
            reload: function (pageNumber, $event) {
                /*var defer = $q.defer();
                self.grid.progress = defer.promise;

                return actionLogService.loadActionLogs($event)
                    .then(function (result) {
                        self.actionLogs = result;
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
         * @description Prints the action logs from grid
         * @param $event
         */
        self.print = function ($event) {
            printService.printActionLog(self.mail, self.actionLogs, self.grid, $event);
        };

        /**
         * @description Show Comment
         * @param actionLog
         * @param $event
         */
        self.showActionDetails = function (actionLog, $event) {
            mailService.openShowCommentDialog(actionLog.actionDetails, $event);
        };

        /**
         * @description Close the dialog
         */
        self.closeDialog = function ($event) {
            dialog.cancel();
        }
    });
};
