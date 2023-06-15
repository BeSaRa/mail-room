module.exports = function (app) {
    app.controller('generalSearchCtrl', function ($q,
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
                                                  reportService,
                                                  outgoingMailService) {
        'ngInject';
        var self = this;

        self.controllerName = 'generalSearchCtrl';
        helpService.setHelpTo('general-search');

        self.records = [];
        self.recordsCopy = generator.shallowCopyArray(self.records);
        self.criteria = new SearchMail();
        self.isResultTabVisible = false;

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
            mailService.searchGeneralMails(self.criteria, $event)
                .then(function (result) {
                    self.isResultTabVisible = true;
                    self.records = result;
                    self.recordsCopy = generator.shallowCopyArray(self.records);
                    self.changeTab(self.tabsToShow.result);
                });
        };

        /**
         * @description Resets the form
         */
        self.resetForm = function ($event) {
            self.criteria = new SearchMail();
            self.records = [];
            self.recordsCopy = generator.shallowCopyArray(self.records);
            self.changeTab(self.tabsToShow.search);
            gridService.resetSearchText(self.grid);
            gridService.resetSorting(self.grid);
            self.grid.page = 1;
            self.grid.limit = 5;
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
         * @description Show Timeline
         * @param mail
         * @param grid
         * @param $event
         */
        self.showTimeline = function (mail, grid, $event) {
            mailService.openTimelineDialog(mail, $event);
        };

        /**
         * @description Shows the barcode for the mail
         * @param mail
         * @param grid
         * @param $event
         */
        self.showBarcode = function (mail, grid, $event) {
            mailService.selectBarcodeOrSummaryReport(mail, $event);
        };

        /***
         * @description Show Action logs
         * @param mail
         * @param grid
         * @param $event
         */
        self.showActionLogs = function (mail, grid, $event) {
            mailService.openActionLogsDialog(mail, $event);
        };

        /**
         * @description show delivery report
         * @param mail
         * @param grid
         * @param $event
         */
        self.showDeliveryReport = function (mail, grid, $event) {
            reportService.generateDeliveryReport($event, mail)
                .then(function (result) {
                    reportService.openReportDialog($event, result.trustedUrl, mail, langService.get('show_delivery_report'));
                });
        }

        /**
         * @description Prints the action logs from grid
         * @param $event
         */
        self.print = function ($event) {
            printService.printSearchGrid(self.records, self.grid, $event);
        };

        /**
         * @description show document
         * @param mail
         * @param grid
         * @param $event
         */
        self.viewMail = function (mail, grid, $event) {
            outgoingMailService.controllerMethod.editDialog(mail, grid, true, $event);
        };


        /**
         * @description Contains options for grid configuration
         * @type {{limit: number, page: number, order: string, limitOptions: *[], columns: string[], showColumn: (function(*=): boolean), sortCallback: sortCallback}}
         */
        self.grid = {
            name: 'generalSearch',
            progress: null,
            selectedRecords: [],
            limit: 5, // default limit
            page: 1, // first page
            order: '', // default sorting column with order(- for desc),
            limitOptions: gridService.getGridLimitOptions(self.records),
            columns: {
                indicators: {
                    langKey: '',
                    searchKey: function () {
                        return '';
                    },
                    sortKey: function () {
                        return '';
                    }
                },
                referenceNo: {
                    langKey: 'header_reference_no',
                    searchKey: function () {
                        return 'referenceNo';
                    },
                    sortKey: function () {
                        return 'referenceNo';
                    }
                },
                registerDate: {
                    langKey: 'header_register_date',
                    searchKey: function () {
                        return 'registerDateFormatted';
                    },
                    sortKey: function () {
                        return 'registerDate';
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
                    },
                    hide: true
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
                    },
                    hide: true
                },
                sentDate: {
                    langKey: 'header_sent_date',
                    searchKey: function () {
                        return 'sentDateFormatted';
                    },
                    sortKey: function () {
                        return 'sentDate';
                    }
                },
                receivedDate: {
                    langKey: 'header_received_date',
                    searchKey: function () {
                        return 'receivedDateFormatted';
                    },
                    sortKey: function () {
                        return 'receivedDate';
                    }
                },
                entryType: {
                    langKey: 'header_entry_type',
                    searchKey: function () {
                        return self.getSortingKey('entryTypeLookup', 'Lookup');
                    },
                    sortKey: function () {
                        return self.getSortingKey('entryTypeLookup', 'Lookup');
                    },
                    hide: true
                },
                priority: {
                    langKey: 'header_priority',
                    searchKey: function () {
                        return self.getSortingKey('priorityTypeLookup', 'Lookup');
                    },
                    sortKey: function () {
                        return self.getSortingKey('priorityTypeLookup', 'Lookup');
                    },
                    hide: true
                },
                addedBy: {
                    langKey: 'header_entered_by',
                    searchKey: function () {
                        return self.getSortingKey('addedBy', 'EmployeePermission');
                    },
                    sortKey: function () {
                        return self.getSortingKey('addedBy', 'EmployeePermission');
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
                receiver: {
                    langKey: 'header_receiver',
                    searchKey: function () {
                        return self.getSortingKey('receiverNameToDisplay', 'EmployeePermission');
                    },
                    sortKey: function () {
                        return '';//self.getSortingKey('receiverNameToDisplay', 'EmployeePermission');
                    }
                },
                statusType: {
                    langKey: 'header_status',
                    searchKey: function () {
                        return self.getSortingKey('statusTypeLookup', 'Lookup');
                    },
                    sortKey: function () {
                        return self.getSortingKey('statusTypeLookup', 'Lookup');
                    },
                    hide: true
                },
                notes: {
                    langKey: 'header_notes',
                    searchKey: function () {
                        return 'notes';
                    },
                    sortKey: function () {
                        return 'notes';
                    }
                },
                numberOfDays: {
                    langKey: 'header_number_of_days',
                    searchKey: function () {
                        return 'numberOfDays';
                    },
                    sortKey: function () {
                        return 'numberOfDays';
                    }
                },
                gridActions: {
                    langKey: 'header_actions',
                    searchKey: function () {
                        return '';
                    },
                    hide: function () {
                        return !self.records.length;
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
                self.records = gridService.sortGridData(self.grid, self.records);
            },
            searchText: '',
            searchCallback: function () {
                self.records = gridService.searchGridData(self.grid, self.recordsCopy);
                gridService.resetSorting(self.grid);
                self.grid.sortCallback();
            },
            reload: function (pageNumber, $event) {
                var defer = $q.defer();
                self.grid.progress = defer.promise;

                return mailService.searchGeneralMails(self.criteria, $event)
                    .then(function (result) {
                        self.records = result;
                        self.recordsCopy = generator.shallowCopyArray(self.records);
                        self.grid.selectedRecords = [];
                        defer.resolve(true);
                        if (pageNumber)
                            self.grid.page = pageNumber;
                        gridService.resetSearchText(self.grid);
                        gridService.resetSorting(self.grid);
                        self.grid.sortCallback();
                        return result;
                    });
            },
            actions: [
                // view document
                {
                    type: 'action',
                    icon: 'book-open-page-variant',
                    text: 'grid_action_view',
                    callback: self.viewMail,
                    grid: function () {
                        return self.grid;
                    },
                    class: "action-green",
                    checkShow: gridService.checkToShowAction
                },
                // Separator
                {
                    type: 'separator',
                    checkShow: gridService.checkToShowAction,
                    showInView: false
                },
                // Show Barcode
                {
                    type: 'action',
                    icon: 'barcode',
                    text: 'grid_action_show_barcode',
                    shortcut: true,
                    callback: self.showBarcode,
                    grid: function () {
                        return self.grid;
                    },
                    class: "action-green",
                    checkShow: gridService.checkToShowAction
                },
                // show delivery report
                {
                    type: 'action',
                    icon: 'chart-bar',
                    text: 'show_delivery_report',
                    shortcut: true,
                    callback: self.showDeliveryReport,
                    class: "action-green",
                    grid: function () {
                        return self.grid;
                    },
                    checkShow: function (action, model) {
                        return gridService.checkToShowAction && model.isReceivedMailStatus();
                    }
                },
                // Action Log
                {
                    type: 'action',
                    icon: 'history',
                    text: 'grid_action_action_logs',
                    shortcut: true,
                    callback: self.showActionLogs,
                    grid: function () {
                        return self.grid;
                    },
                    class: "action-green",
                    checkShow: gridService.checkToShowAction
                },
                // Show Timeline
                {
                    type: 'action',
                    icon: 'timeline-text-outline',
                    text: 'grid_action_timeline',
                    shortcut: true,
                    callback: self.showTimeline,
                    grid: function () {
                        return self.grid;
                    },
                    class: "action-green",
                    checkShow: gridService.checkToShowAction
                }
            ],
            bulkActions: []
        };

    });
};
