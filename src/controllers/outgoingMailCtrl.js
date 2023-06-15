module.exports = function (app) {
    app.controller('outgoingMailCtrl', function (outgoingMailService,
                                                 $q,
                                                 _,
                                                 helpService,
                                                 mailService,
                                                 generator,
                                                 lookupService,
                                                 gridService,
                                                 toast,
                                                 langService,
                                                 counterService,
                                                 printService,
                                                 reportService,
                                                 userInfoService) {
        'ngInject';
        var self = this;

        self.controllerName = 'outgoingMailCtrl';
        helpService.setHelpTo('outgoing-mails');
        self.counterService = counterService;
        self.hasPermissionToAdd = userInfoService.getCurrentUser().hasPermissionTo('SYS_ADD_MAIL');

        self.newMails = [];
        self.sentMails = [];
        self.receivedMails = [];

        /**
         * @description Contains the grid maps by mail status
         * @type {{}}
         * @private
         */
        var _gridsByStatus = {};
        var _updateGridByStatusMap = function () {
            _gridsByStatus[lookupService.statusTypesKeys.new] = self.grid.newMails;
            _gridsByStatus[lookupService.statusTypesKeys.received] = self.grid.receivedMails;
            _gridsByStatus[lookupService.statusTypesKeys.sent] = self.grid.sentMails;
        };

        self.tabsToShow = {
            newMails: {
                name: 'newMails',
                key: 'lbl_outgoing_new_mails'
            },
            sentMails: {
                name: 'sentMails',
                key: 'lbl_outgoing_sent_mails'
            },
            receivedMails: {
                name: 'receivedMails',
                key: 'lbl_outgoing_received_mails'
            }
        };
        self.showTab = function (tab) {
            return !tab.hide;
        };
        self.selectedTabName = self.tabsToShow.newMails.name;
        self.selectedTabIndex = 0;
        self.setCurrentTab = function (tab, $event) {
            // reset the sort order, page and limit
            var grid = self.grid[tab.name];
            grid.order = '-' + self.grid[tab.name].columns.registerDate.sortKey();
            grid.page = 1;
            grid.limit = 5;
            gridService.resetSearchText(grid);
            gridService.resetFilter(grid);
            grid.reload(grid.page)
                .then(function () {
                    self.selectedTabName = tab.name;
                });
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
         * @description Check if all given mails have receiver entity using system
         * @param mails
         * @returns {boolean}
         */
        self.checkBulkEntitiesNotUseSystem = function (mails) {
            var response = true;
            for (var i = 0; i < mails.length; i++) {
                response = !mails[i].getReceiverEntity().checkIsUseSystem();
                if (!response)
                    break;
            }
            return response;
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
         * @description Opens the popup for adding new mail
         * @param $event
         */
        self.openAddMailDialog = function ($event) {
            outgoingMailService.controllerMethod.addDialog(self.grid.newMails, $event);
        };

        /**
         * @description Opens the mail for edit
         * @param mail
         * @param grid
         * @param $event
         */
        self.openEditMailDialog = function (mail, grid, $event) {
            outgoingMailService.controllerMethod.editDialog(mail, grid, false, $event);
        };

        /**
         * @description Deletes the mail
         * @param mail
         * @param grid
         * @param $event
         */
        self.deleteMail = function (mail, grid, $event) {
            mailService.deleteMail(mail, $event)
                .then(function (result) {
                    if (result) {
                        self.reloadGrid($event).then(function () {
                            toast.success(langService.get("msg_delete_success"));
                        });
                    }
                });
        };

        /**
         * @description Deletes selected mails
         * @param grid
         * @param $event
         */
        self.deleteMailBulk = function (grid, $event) {
            mailService.deleteBulkMails(grid.selectedRecords, $event)
                .then(function () {
                    self.reloadGrid($event);
                });
        };

        /**
         * @description Change the status of mail
         * @param mail
         * @param grid
         * @param targetStatusKey
         * @param $event
         */
        self.changeMailStatus = function (mail, grid, targetStatusKey, $event) {
            mailService.changeStatus(mail, targetStatusKey, $event)
                .then(function (result) {
                    if (result) {
                        self.reloadGrid($event);
                    }
                });
        };

        /**
         * @description Change the status of mails bulk
         * @param grid
         * @param targetStatusKey
         * @param $event
         */
        self.changeMailStatusBulk = function (grid, targetStatusKey, $event) {
            mailService.changeStatusBulk(grid.selectedRecords, targetStatusKey, $event)
                .then(function (result) {
                    self.reloadGrid($event);
                });
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
         * @description show document
         * @param mail
         * @param grid
         * @param $event
         */
        self.viewMail = function (mail, grid, $event) {
            outgoingMailService.controllerMethod.editDialog(mail, grid, true, $event);
        };

        /***
         * @description show tracking history
         * @param mail
         * @param grid
         * @param $event
         */
        self.showTrackingSheet = function (mail, grid, $event) {
            mailService.openTrackingSheetDialog(mail, $event);
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
         * @description Show Timeline
         * @param mail
         * @param grid
         * @param $event
         */
        self.showTimeline = function (mail, grid, $event) {
            mailService.openTimelineDialog(mail, $event);
        };

        /**
         * @description Set the mails for new/sent/received
         * @param statusType
         * @param mails
         * @param skipOverrideCopy
         * skip override of copy of original records(in case of search).
         * we need original records to return in case of clear search text.
         */
        self.setMailsByStatusType = function (statusType, mails, skipOverrideCopy) {
            if (statusType) {
                self.totalRecords = mails.hasOwnProperty('totalRecords') ? mails.totalRecords : mails.length;
                mails = mails.hasOwnProperty('mails') ? mails.mails : mails;
                if (statusType === lookupService.statusTypesKeys.new) {
                    self.newMails = mailService.categorizeMailsByStatusType(mails, statusType);
                    if (!skipOverrideCopy)
                        self.newMailsCopy = generator.shallowCopyArray(self.newMails);
                } else if (statusType === lookupService.statusTypesKeys.received) {
                    self.receivedMails = mailService.categorizeMailsByStatusType(mails, statusType);
                    if (!skipOverrideCopy)
                        self.receivedMailsCopy = generator.shallowCopyArray(self.receivedMails);
                } else if (statusType === lookupService.statusTypesKeys.sent) {
                    self.sentMails = mailService.categorizeMailsByStatusType(mails, statusType);
                    if (!skipOverrideCopy)
                        self.sentMailsCopy = generator.shallowCopyArray(self.sentMails);
                }
            }
        };

        /**
         * @description Contains options for grid configuration
         * @type {{limit: number, page: number, order: string, limitOptions: *[], columns: string[], showColumn: (function(*=): boolean), sortCallback: sortCallback}}
         */
        self.grid = {
            // New Mails
            newMails: {
                name: 'newMails',
                progress: null,
                selectedRecords: [],
                limit: 5, // default limit
                page: 1, // first page
                order: '-registerDate', // default sorting column with order(- for desc),
                limitOptions: gridService.getGridLimitOptions(self.newMails),
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
                    postType: {
                        langKey: 'header_post_type',
                        searchKey: function () {
                            return self.getSortingKey('postTypeLookup', 'Lookup');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.newMails.sortScope)) {
                                return 'postType' + 'Embedded.' + (langService.current + 'Name');
                            }
                            return self.getSortingKey('postTypeLookup', 'Lookup');
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
                    senderDepartment: {
                        langKey: 'header_sender_department',
                        searchKey: function () {
                            return self.getSortingKey('senderDep', 'Entity');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.newMails.sortScope)) {
                                // if english language, concat "En" at last, otherwise nothing
                                return 'senderDep' + 'Embedded.entityName' + (langService.current === 'en' ? 'En' : '');
                            }
                            return self.getSortingKey('senderDep', 'Entity');
                        }
                    },
                    receiverEntity: {
                        langKey: 'header_receiver_entity',
                        searchKey: function () {
                            return self.getSortingKey('receiverEntity', 'Entity');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.newMails.sortScope)) {
                                // if english language, concat "En" at last, otherwise nothing
                                return 'receiverEntity' + 'Embedded.entityName' + (langService.current === 'en' ? 'En' : '');
                            }
                            return self.getSortingKey('receiverEntity', 'Entity');
                        }
                    },
                    receiverDepartment: {
                        langKey: 'header_receiver_department',
                        searchKey: function () {
                            return self.getSortingKey('receiverDep', 'Entity');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.newMails.sortScope)) {
                                // if english language, concat "En" at last, otherwise nothing
                                return 'receiverDep' + 'Embedded.entityName' + (langService.current === 'en' ? 'En' : '');
                            }
                            return self.getSortingKey('receiverDep', 'Entity');
                        }
                    },
                    entryType: {
                        langKey: 'header_entry_type',
                        searchKey: function () {
                            return self.getSortingKey('entryTypeLookup', 'Lookup');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.newMails.sortScope)) {
                                return 'entryType' + 'Embedded.' + (langService.current + 'Name');
                            }
                            return self.getSortingKey('entryTypeLookup', 'Lookup');
                        },
                        hide: true
                    },
                    integratedSystem: {
                        langKey: 'lbl_integrated_system',
                        searchKey: function () {
                            return self.getSortingKey('integratedSystemInfo', 'Lookup');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.newMails.sortScope)) {
                                return 'integratedSystem' + 'Embedded.' + (langService.current + 'Name');
                            }
                            return self.getSortingKey('integratedSystemInfo', 'Lookup');
                        }
                    },
                    priority: {
                        langKey: 'header_priority',
                        searchKey: function () {
                            return self.getSortingKey('priorityTypeLookup', 'Lookup');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.newMails.sortScope)) {
                                return 'priorityType' + 'Embedded.' + (langService.current + 'Name');
                            }
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
                            if (gridService.isGridServerScope(self.grid.newMails.sortScope)) {
                                // if english language, concat "En" at last, otherwise nothing
                                return 'addedBy' + 'Embedded.employeeName' + (langService.current === 'en' ? 'En' : '');
                            }
                            return self.getSortingKey('addedBy', 'EmployeePermission');
                        }
                    },
                    numberOfDays: {
                        langKey: 'header_number_of_days',
                        searchKey: function () {
                            return 'numberOfDays';
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.newMails.sortScope)) {
                                return '';
                            }
                            return 'numberOfDays';
                        }
                    },
                    gridActions: {
                        langKey: 'header_actions',
                        hide: function () {
                            return !self.newMails.length;
                        }
                    }
                },
                columnsCount: function (includeHidden) {
                    return gridService.getColumnsCount(self.grid.newMails, includeHidden);
                },
                colSpan: function () {
                    return gridService.getColSpan(self.grid.newMails);
                },
                showColumn: function (column, isHeader) {
                    return gridService.isShowColumn(self.grid.newMails, column, isHeader);
                },
                searchText: '',
                searchCallback: function () {
                    var searchedRecords = mailService.searchMailGridData(self.grid.newMails, self.newMailsCopy, outgoingMailService.totalRecords);
                    self.setMailsByStatusType(lookupService.statusTypesKeys.new, searchedRecords, true);
                },
                sortScope: gridService.gridScope.server,
                sortCallback: function (sortKey) {
                    if (gridService.isGridServerScope(self.grid.newMails.sortScope)) {
                        // if grid is already filtered, call the _filterCallback function from service, search again in case user has searched before sort and resolve the progress
                        // otherwise, call the reload method of grid and search again in case user has searched before sort
                        if (self.grid.newMails.filterGridCriteria.criteria) {
                            var defer = $q.defer();
                            self.grid.newMails.progress = defer.promise;
                            outgoingMailService._filterCallback(self.grid.newMails, lookupService.statusTypesKeys.new)
                                .then(function (result) {
                                    self.grid.newMails.selectedRecords = [];
                                    // result will contain only records with this status but to assign to variable, call setMailsByStatusType method
                                    self.setMailsByStatusType(lookupService.statusTypesKeys.new, result);
                                    self.grid.newMails.searchCallback();
                                    self.grid.newMails.progress = defer.promise;
                                    defer.resolve(true);
                                });
                        } else {
                            self.grid.newMails.reload(self.grid.newMails.page)
                                .then(function () {
                                    self.grid.newMails.searchCallback();
                                });
                        }
                    } else {
                        self.newMails = gridService.sortGridData(self.grid.newMails, self.newMails);
                    }
                },
                filterGridCriteria: {reset: false, showReset: false, filterScope: gridService.gridScope.server},
                filterGridCallback: function ($event) {
                    var defer = $q.defer();
                    self.grid.newMails.page = 1;
                    outgoingMailService.controllerMethod.filterGridDialog(lookupService.statusTypesKeys.new, self.grid.newMails, $event)
                        .then(function (result) {
                            counterService.loadCounters();
                            self.grid.newMails.selectedRecords = [];
                            // result will contain only records with this status but to assign to variable, call setMailsByStatusType method
                            self.setMailsByStatusType(lookupService.statusTypesKeys.new, result);
                            gridService.resetSearchText(self.grid.newMails);
                            self.grid.newMails.progress = defer.promise;
                            defer.resolve(true);
                        }).catch(function (error) {
                        return [];
                    });
                },
                printFilterCallback: function ($event) {
                    printService.printSearchGrid(self.newMailsCopy, self.grid.newMails, $event);
                },
                pagingScope: gridService.gridScope.server,
                pagingCallback: function (pageNumber, limit) {
                    if (gridService.isGridServerScope(self.grid.newMails.pagingScope) && self.isTabSelected(self.tabsToShow.newMails)) {
                        // if grid is filtered, call the filterCallback function
                        // otherwise, call the reload method of grid
                        if (self.grid.newMails.filterGridCriteria.criteria) {
                            var defer = $q.defer();
                            self.grid.newMails.progress = defer.promise;
                            outgoingMailService._filterCallback(self.grid.newMails, lookupService.statusTypesKeys.new)
                                .then(function (result) {
                                    self.grid.newMails.selectedRecords = [];
                                    // result will contain only records with this status but to assign to variable, call setMailsByStatusType method
                                    self.setMailsByStatusType(lookupService.statusTypesKeys.new, result);
                                    defer.resolve(true);
                                });
                        } else {
                            self.grid.newMails.reload(pageNumber);
                        }
                    } else {
                        // do nothing
                    }
                },
                ScanCallback: function ($event) {
                    //open scan dialog
                    var statusTypesKey = lookupService.getLookupTypeId(lookupService.statusTypesKeys.new, lookupService.statusTypes);
                    mailService.openScanMailsDialog(self.grid.newMails, statusTypesKey, $event).then(function () {
                        self.reloadGrid($event);
                    });
                },
                reload: function (pageNumber, $event) {
                    var defer = $q.defer(), loadDefer = $q.defer();
                    self.grid.newMails.progress = defer.promise;
                    if (self.isHardReload) {
                        gridService.resetSorting(self.grid.newMails, '-registerDate');
                        gridService.resetSearchText(self.grid.newMails);
                    }
                    if (pageNumber)
                        self.grid.newMails.page = pageNumber;

                    if (self.grid.newMails.filterGridCriteria.criteria) {
                        outgoingMailService._filterCallback(self.grid.newMails, lookupService.statusTypesKeys.new, $event)
                            .then(function (result) {
                                loadDefer.resolve(result);
                            })
                            .catch(function (error) {
                                loadDefer.reject(error);
                            });
                    } else {
                        outgoingMailService.loadMails(lookupService.statusTypesKeys.new, self.grid.newMails, $event)
                            .then(function (result) {
                                loadDefer.resolve(result);
                            })
                            .catch(function (error) {
                                loadDefer.reject(error);
                            });
                    }
                    return loadDefer.promise.then(function (result) {
                        counterService.loadCounters();
                        self.grid.newMails.progress = defer.promise;
                        self.grid.newMails.selectedRecords = [];
                        // result will contain only records with this status but to assign to variable, call setMailsByStatusType method
                        self.setMailsByStatusType(lookupService.statusTypesKeys.new, result);
                        defer.resolve(true);
                        self.isHardReload = false;
                        return result;
                    }).catch(function (error) {
                        defer.resolve(true);
                        return [];
                    })
                },
                actions: [
                    // Mail Information Text
                    {
                        type: 'text',
                        icon: 'information-variant',
                        text: function (model) {
                            return {
                                shortcutText: model.getTranslatedName(),
                                contextText: model.getTranslatedName()
                            };
                        },
                        shortcut: true,
                        grid: function () {
                            return self.grid.newMails;
                        },
                        class: "action-green",
                        checkShow: gridService.checkToShowAction
                    },
                    // view document
                    {
                        type: 'action',
                        icon: 'book-open-page-variant',
                        text: 'grid_action_view',
                        callback: self.viewMail,
                        grid: function () {
                            return self.grid.newMails;
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
                    // Edit
                    {
                        type: 'action',
                        icon: 'pencil',
                        text: 'grid_action_edit',
                        shortcut: true,
                        callback: self.openEditMailDialog,
                        permissionKey: 'SYS_UPDATE_MAIL',
                        grid: function () {
                            return self.grid.newMails;
                        },
                        class: "action-green",
                        checkShow: gridService.checkToShowAction
                    },
                    // Delete
                    {
                        type: 'action',
                        icon: 'delete',
                        text: 'grid_action_delete',
                        shortcut: true,
                        callback: self.deleteMail,
                        permissionKey: 'SYS_DELETE_MAIL',
                        grid: function () {
                            return self.grid.newMails;
                        },
                        class: "action-green",
                        checkShow: gridService.checkToShowAction
                    },
                    // Send
                    {
                        type: 'action',
                        icon: 'file-send',
                        text: 'grid_action_send',
                        shortcut: true,
                        callback: self.changeMailStatus,
                        grid: function () {
                            return self.grid.newMails;
                        },
                        params: lookupService.statusTypesKeys.sent,
                        class: "action-green",
                        checkShow: gridService.checkToShowAction
                    },
                    // Show Barcode
                    {
                        type: 'action',
                        icon: 'barcode',
                        text: 'grid_action_show_barcode',
                        shortcut: true,
                        callback: self.showBarcode,
                        grid: function () {
                            return self.grid.newMails;
                        },
                        class: "action-green",
                        checkShow: gridService.checkToShowAction
                    },
                    // Show Tracking History
                    {
                        type: 'action',
                        icon: 'history',
                        text: 'grid_action_tracking',
                        shortcut: true,
                        hide: true,
                        callback: self.showTrackingSheet,
                        grid: function () {
                            return self.grid.newMails;
                        },
                        class: "action-green",
                        checkShow: gridService.checkToShowAction
                    },
                    // Show Actions
                    {
                        type: 'action',
                        icon: 'history',
                        text: 'grid_action_action_logs',
                        shortcut: true,
                        callback: self.showActionLogs,
                        grid: function () {
                            return self.grid.newMails;
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
                            return self.grid.newMails;
                        },
                        class: "action-green",
                        checkShow: gridService.checkToShowAction
                    }
                ],
                bulkActions: [
                    // Delete
                    {
                        type: 'action',
                        icon: 'delete',
                        text: 'grid_action_delete',
                        shortcut: true,
                        callback: self.deleteMailBulk,
                        permissionKey: 'SYS_DELETE_MAIL',
                        grid: function () {
                            return self.grid.newMails;
                        },
                        class: "action-green",
                        checkShow: function () {
                            return (this.grid().selectedRecords.length) && gridService.checkToShowAction;
                        }
                    },
                    // Send
                    {
                        type: 'action',
                        icon: 'file-send',
                        text: 'grid_action_send',
                        shortcut: true,
                        callback: self.changeMailStatusBulk,
                        grid: function () {
                            return self.grid.newMails;
                        },
                        params: lookupService.statusTypesKeys.sent,
                        class: "action-green",
                        checkShow: function () {
                            return (this.grid().selectedRecords.length);
                        }
                    }
                ]
            },
            // Sent Mails
            sentMails: {
                name: 'sentMails',
                progress: null,
                selectedRecords: [],
                limit: 5, // default limit
                page: 1, // first page
                order: '-registerDate', // default sorting column with order(- for desc),
                limitOptions: gridService.getGridLimitOptions(self.sentMails),
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
                    postType: {
                        langKey: 'header_post_type',
                        searchKey: function () {
                            return self.getSortingKey('postTypeLookup', 'Lookup');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.sentMails.sortScope)) {
                                return 'postType' + 'Embedded.' + (langService.current + 'Name');
                            }
                            return self.getSortingKey('postTypeLookup', 'Lookup');
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
                    senderDepartment: {
                        langKey: 'header_sender_department',
                        searchKey: function () {
                            return self.getSortingKey('senderDep', 'Entity');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.sentMails.sortScope)) {
                                // if english language, concat "En" at last, otherwise nothing
                                return 'senderDep' + 'Embedded.entityName' + (langService.current === 'en' ? 'En' : '');
                            }
                            return self.getSortingKey('senderDep', 'Entity');
                        }
                    },
                    sender: {
                        langKey: 'header_sender',
                        searchKey: function () {
                            return self.getSortingKey('senderEmployeeEmpPermission', 'EmployeePermission');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.sentMails.sortScope)) {
                                // if english language, concat "En" at last, otherwise nothing
                                return 'senderEmployee' + 'Embedded.employeeName' + (langService.current === 'en' ? 'En' : '');
                            }
                            return self.getSortingKey('senderEmployeeEmpPermission', 'EmployeePermission');
                        }
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
                    receiverEntity: {
                        langKey: 'header_receiver_entity',
                        searchKey: function () {
                            return self.getSortingKey('receiverEntity', 'Entity');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.sentMails.sortScope)) {
                                // if english language, concat "En" at last, otherwise nothing
                                return 'receiverEntity' + 'Embedded.entityName' + (langService.current === 'en' ? 'En' : '');
                            }
                            return self.getSortingKey('receiverEntity', 'Entity');
                        }
                    },
                    receiverDepartment: {
                        langKey: 'header_receiver_department',
                        searchKey: function () {
                            return self.getSortingKey('receiverDep', 'Entity');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.sentMails.sortScope)) {
                                // if english language, concat "En" at last, otherwise nothing
                                return 'receiverDep' + 'Embedded.entityName' + (langService.current === 'en' ? 'En' : '');
                            }
                            return self.getSortingKey('receiverDep', 'Entity');
                        }
                    },
                    entryType: {
                        langKey: 'header_entry_type',
                        searchKey: function () {
                            return self.getSortingKey('entryTypeLookup', 'Lookup');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.sentMails.sortScope)) {
                                return 'entryType' + 'Embedded.' + (langService.current + 'Name');
                            }
                            return self.getSortingKey('entryTypeLookup', 'Lookup');
                        },
                        hide: true
                    },
                    integratedSystem: {
                        langKey: 'lbl_integrated_system',
                        searchKey: function () {
                            return self.getSortingKey('integratedSystemInfo', 'Lookup');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.sentMails.sortScope)) {
                                return 'integratedSystem' + 'Embedded.' + (langService.current + 'Name');
                            }
                            return self.getSortingKey('integratedSystemInfo', 'Lookup');
                        }
                    },
                    priority: {
                        langKey: 'header_priority',
                        searchKey: function () {
                            return self.getSortingKey('priorityTypeLookup', 'Lookup');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.sentMails.sortScope)) {
                                return 'priorityType' + 'Embedded.' + (langService.current + 'Name');
                            }
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
                            if (gridService.isGridServerScope(self.grid.sentMails.sortScope)) {
                                // if english language, concat "En" at last, otherwise nothing
                                return 'addedBy' + 'Embedded.employeeName' + (langService.current === 'en' ? 'En' : '');
                            }
                            return self.getSortingKey('addedBy', 'EmployeePermission');
                        }
                    },
                    numberOfDays: {
                        langKey: 'header_number_of_days',
                        searchKey: function () {
                            return 'numberOfDays';
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.sentMails.sortScope)) {
                                return '';
                            }
                            return 'numberOfDays';
                        }
                    },
                    gridActions: {
                        langKey: 'header_actions',
                        hide: function () {
                            return !self.sentMails.length;
                        }
                    }
                },
                columnsCount: function (includeHidden) {
                    return gridService.getColumnsCount(self.grid.sentMails, includeHidden);
                },
                colSpan: function () {
                    return gridService.getColSpan(self.grid.sentMails);
                },
                showColumn: function (column, isHeader) {
                    return gridService.isShowColumn(self.grid.sentMails, column, isHeader);
                },
                sortCallback: function (sortKey) {
                    if (gridService.isGridServerScope(self.grid.sentMails.sortScope)) {
                        // if grid is already filtered, call the _filterCallback function from service, search again in case user has searched before sort and resolve the progress
                        // otherwise, call the reload method of grid and search again in case user has searched before sort
                        if (self.grid.sentMails.filterGridCriteria.criteria) {
                            var defer = $q.defer();
                            self.grid.sentMails.progress = defer.promise;
                            outgoingMailService._filterCallback(self.grid.sentMails, lookupService.statusTypesKeys.sent)
                                .then(function (result) {
                                    self.grid.sentMails.selectedRecords = [];
                                    // result will contain only records with this status but to assign to variable, call setMailsByStatusType method
                                    self.setMailsByStatusType(lookupService.statusTypesKeys.sent, result);
                                    self.grid.sentMails.searchCallback();
                                    defer.resolve(true);
                                });
                        } else {
                            self.grid.sentMails.reload(self.grid.sentMails.page)
                                .then(function () {
                                    self.grid.sentMails.searchCallback();
                                });
                        }
                    } else {
                        self.sentMails = gridService.sortGridData(self.grid.sentMails, self.sentMails);
                    }
                },
                sortScope: gridService.gridScope.server,
                searchText: '',
                searchCallback: function () {
                    var searchedRecords = mailService.searchMailGridData(self.grid.sentMails, self.sentMailsCopy, outgoingMailService.totalRecords);
                    self.setMailsByStatusType(lookupService.statusTypesKeys.sent, searchedRecords, true);
                },
                filterGridCriteria: {reset: false, showReset: false, filterScope: gridService.gridScope.server},
                filterGridCallback: function ($event) {
                    var defer = $q.defer();
                    self.grid.sentMails.page = 1;
                    gridService.resetSorting(self.grid.sentMails, self.grid.order);
                    outgoingMailService.controllerMethod.filterGridDialog(lookupService.statusTypesKeys.sent, self.grid.sentMails, $event)
                        .then(function (result) {
                            counterService.loadCounters();
                            self.grid.sentMails.selectedRecords = [];
                            // result will contain only records with this status but to assign to variable, call setMailsByStatusType method
                            self.setMailsByStatusType(lookupService.statusTypesKeys.sent, result);
                            gridService.resetSearchText(self.grid.sentMails);
                            self.grid.sentMails.progress = defer.promise;
                            defer.resolve(true);
                        }).catch(function (error) {
                        return [];
                    });
                },
                printFilterCallback: function ($event) {
                    printService.printSearchGrid(self.sentMailsCopy, self.grid.sentMails, $event);
                },
                pagingScope: gridService.gridScope.server,
                pagingCallback: function (pageNumber, limit) {
                    if (gridService.isGridServerScope(self.grid.sentMails.pagingScope) && self.isTabSelected(self.tabsToShow.sentMails)) {
                        // if grid is filtered, call the filterCallback function
                        // otherwise, call the reload method of grid
                        if (self.grid.sentMails.filterGridCriteria.criteria) {
                            var defer = $q.defer();
                            self.grid.sentMails.progress = defer.promise;
                            outgoingMailService._filterCallback(self.grid.sentMails, lookupService.statusTypesKeys.sent)
                                .then(function (result) {
                                    self.grid.sentMails.selectedRecords = [];
                                    // result will contain only records with this status but to assign to variable, call setMailsByStatusType method
                                    self.setMailsByStatusType(lookupService.statusTypesKeys.sent, result);
                                    defer.resolve(true);
                                });
                        } else {
                            self.grid.sentMails.reload(pageNumber);
                        }
                    } else {
                        // do nothing
                    }
                },
                ScanCallback: function ($event) {
                    //open scan dialog
                    var statusTypesKey = lookupService.getLookupTypeId(lookupService.statusTypesKeys.sent, lookupService.statusTypes);
                    mailService.openScanMailsDialog(self.grid.sentMails, statusTypesKey, $event).then(function () {
                        self.reloadGrid($event);
                    });
                },
                reload: function (pageNumber, $event) {
                    var defer = $q.defer(), loadDefer = $q.defer();
                    self.grid.sentMails.progress = defer.promise;
                    if (self.isHardReload) {
                        gridService.resetSorting(self.grid.sentMails, '-registerDate');
                        gridService.resetSearchText(self.grid.sentMails);
                    }

                    if (pageNumber)
                        self.grid.sentMails.page = pageNumber;

                    if (self.grid.sentMails.filterGridCriteria.criteria) {
                        outgoingMailService._filterCallback(self.grid.sentMails, lookupService.statusTypesKeys.sent, $event)
                            .then(function (result) {
                                loadDefer.resolve(result);
                            })
                            .catch(function (error) {
                                loadDefer.reject(error);
                            });
                    } else {
                        outgoingMailService.loadMails(lookupService.statusTypesKeys.sent, self.grid.sentMails, $event)
                            .then(function (result) {
                                loadDefer.resolve(result);
                            })
                            .catch(function (error) {
                                loadDefer.reject(error);
                            });
                    }
                    return loadDefer.promise.then(function (result) {
                        counterService.loadCounters();
                        self.grid.sentMails.progress = defer.promise;
                        self.grid.sentMails.selectedRecords = [];
                        // result will contain only records with this status but to assign to variable, call setMailsByStatusType method
                        self.setMailsByStatusType(lookupService.statusTypesKeys.sent, result);
                        defer.resolve(true);
                        self.isHardReload = false;
                        return result;
                    }).catch(function (error) {
                        defer.resolve(true);
                        return [];
                    })
                },
                actions: [
                    // Mail Information Text
                    {
                        type: 'text',
                        icon: 'information-variant',
                        text: function (model) {
                            return {
                                shortcutText: model.getTranslatedName(),
                                contextText: model.getTranslatedName()
                            };
                        },
                        shortcut: true,
                        grid: function () {
                            return self.grid.sentMails;
                        },
                        class: "action-green",
                        checkShow: gridService.checkToShowAction
                    },
                    // view document
                    {
                        type: 'action',
                        icon: 'book-open-page-variant',
                        text: 'grid_action_view',
                        callback: self.viewMail,
                        grid: function () {
                            return self.grid.sentMails;
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
                    // Edit
                    {
                        type: 'action',
                        icon: 'pencil',
                        text: 'grid_action_edit',
                        shortcut: true,
                        callback: self.openEditMailDialog,
                        permissionKey: 'SYS_UPDATE_MAIL',
                        grid: function () {
                            return self.grid.sentMails;
                        },
                        class: "action-green",
                        checkShow: function (action, model) {
                            // edit only if receiver entity is not using system
                            return gridService.checkToShowAction(action, model) && !model.getReceiverEntity().checkIsUseSystem();
                        }
                    },
                    // Receive
                    {
                        type: 'action',
                        icon: 'call-received',
                        text: 'grid_action_receive',
                        shortcut: true,
                        callback: self.changeMailStatus,
                        grid: function () {
                            return self.grid.sentMails;
                        },
                        params: lookupService.statusTypesKeys.received,
                        class: "action-green",
                        checkShow: function (action, model) {
                            // receive only if receiver entity is not using system
                            // if receiver entity is already using system, they can accept from expected and it will be automatically marked as received
                            return gridService.checkToShowAction(action, model) && !model.getReceiverEntity().checkIsUseSystem();
                        }
                    },
                    // Return to New
                    {
                        type: 'action',
                        icon: 'reply',
                        text: 'grid_action_return',
                        shortcut: true,
                        callback: self.changeMailStatus,
                        grid: function () {
                            return self.grid.sentMails;
                        },
                        params: lookupService.statusTypesKeys.new,
                        class: "action-green",
                        /*checkShow: function (action, model) {
                            // return only if receiver entity is not using system
                            // if receiver entity is already using system, they can accept from expected and it will be automatically marked as received
                            return gridService.checkToShowAction(action, model) && !model.getReceiverEntity().checkIsUseSystem();
                        }*/
                        checkShow: gridService.checkToShowAction
                    },
                    // Show Barcode
                    {
                        type: 'action',
                        icon: 'barcode',
                        text: 'grid_action_show_barcode',
                        shortcut: true,
                        callback: self.showBarcode,
                        grid: function () {
                            return self.grid.sentMails;
                        },
                        class: "action-green",
                        checkShow: gridService.checkToShowAction
                    },
                    // Show Tracking History
                    {
                        type: 'action',
                        icon: 'history',
                        text: 'grid_action_tracking',
                        shortcut: true,
                        hide: true,
                        callback: self.showTrackingSheet,
                        grid: function () {
                            return self.grid.sentMails;
                        },
                        class: "action-green",
                        checkShow: gridService.checkToShowAction
                    },
                    // Show Actions
                    {
                        type: 'action',
                        icon: 'history',
                        text: 'grid_action_action_logs',
                        shortcut: true,
                        callback: self.showActionLogs,
                        grid: function () {
                            return self.grid.sentMails;
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
                            return self.grid.sentMails;
                        },
                        class: "action-green",
                        checkShow: gridService.checkToShowAction
                    }
                ],
                bulkActions: [
                    // Receive
                    {
                        type: 'action',
                        icon: 'call-received',
                        text: 'grid_action_receive',
                        shortcut: true,
                        callback: self.changeMailStatusBulk,
                        grid: function () {
                            return self.grid.sentMails;
                        },
                        params: lookupService.statusTypesKeys.received,
                        class: "action-green",
                        checkShow: function () {
                            if (this.grid().selectedRecords.length) {
                                return self.checkBulkEntitiesNotUseSystem(this.grid().selectedRecords);
                            }
                            return true;
                        }
                    },
                    // Return to New
                    {
                        type: 'action',
                        icon: 'reply',
                        text: 'grid_action_return',
                        shortcut: true,
                        callback: self.changeMailStatusBulk,
                        grid: function () {
                            return self.grid.sentMails;
                        },
                        params: lookupService.statusTypesKeys.new,
                        class: "action-green",
                        /*checkShow: function () {
                            if (this.grid().selectedRecords.length) {
                                return self.checkBulkEntitiesNotUseSystem(this.grid().selectedRecords);
                            }
                            return true;
                        }*/
                        checkShow: function () {
                            return this.grid().selectedRecords && this.grid().selectedRecords.length > 0;
                        }
                    }
                ]
            },
            // Received Mails
            receivedMails: {
                name: 'receivedMails',
                progress: null,
                selectedRecords: [],
                limit: 5, // default limit
                page: 1, // first page
                order: '-registerDate', // default sorting column with order(- for desc),
                limitOptions: gridService.getGridLimitOptions(self.receivedMails),
                columns: {
                    referenceNo: {
                        langKey: 'header_reference_no',
                        searchKey: function () {
                            return 'referenceNo'
                        },
                        sortKey: function () {
                            return 'referenceNo';
                        }
                    },
                    postType: {
                        langKey: 'header_post_type',
                        searchKey: function () {
                            return self.getSortingKey('postTypeLookup', 'Lookup');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.receivedMails.sortScope)) {
                                return 'postType' + 'Embedded.' + (langService.current + 'Name');
                            }
                            return self.getSortingKey('postTypeLookup', 'Lookup');
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
                    senderDepartment: {
                        langKey: 'header_sender_department',
                        searchKey: function () {
                            return self.getSortingKey('senderDep', 'Entity');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.receivedMails.sortScope)) {
                                // if english language, concat "En" at last, otherwise nothing
                                return 'senderDep' + 'Embedded.entityName' + (langService.current === 'en' ? 'En' : '');
                            }
                            return self.getSortingKey('senderDep', 'Entity');
                        }
                    },
                    sender: {
                        langKey: 'header_sender',
                        searchKey: function () {
                            return self.getSortingKey('senderEmployeeEmpPermission', 'EmployeePermission');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.receivedMails.sortScope)) {
                                // if english language, concat "En" at last, otherwise nothing
                                return 'senderEmployee' + 'Embedded.employeeName' + (langService.current === 'en' ? 'En' : '');
                            }
                            return self.getSortingKey('senderEmployeeEmpPermission', 'EmployeePermission');
                        }
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
                    receiverEntity: {
                        langKey: 'header_receiver_entity',
                        searchKey: function () {
                            return self.getSortingKey('receiverEntity', 'Entity');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.receivedMails.sortScope)) {
                                // if english language, concat "En" at last, otherwise nothing
                                return 'receiverEntity' + 'Embedded.entityName' + (langService.current === 'en' ? 'En' : '');
                            }
                            return self.getSortingKey('receiverEntity', 'Entity');
                        }
                    },
                    receiverDepartment: {
                        langKey: 'header_receiver_department',
                        searchKey: function () {
                            return self.getSortingKey('receiverDep', 'Entity');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.receivedMails.sortScope)) {
                                // if english language, concat "En" at last, otherwise nothing
                                return 'receiverDep' + 'Embedded.entityName' + (langService.current === 'en' ? 'En' : '');
                            }
                            return self.getSortingKey('receiverDep', 'Entity');
                        }
                    },
                    receiver: {
                        langKey: 'header_receiver',
                        searchKey: function () {
                            return self.getSortingKey('receiverNameToDisplay', 'EmployeePermission');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.receivedMails.sortScope)) {
                                return '';
                            }
                            return self.getSortingKey('receiverNameToDisplay', 'EmployeePermission');
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
                            if (gridService.isGridServerScope(self.grid.receivedMails.sortScope)) {
                                return 'entryType' + 'Embedded.' + (langService.current + 'Name');
                            }
                            return self.getSortingKey('entryTypeLookup', 'Lookup');
                        },
                        hide: true
                    },
                    integratedSystem: {
                        langKey: 'lbl_integrated_system',
                        searchKey: function () {
                            return self.getSortingKey('integratedSystemInfo', 'Lookup');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.receivedMails.sortScope)) {
                                return 'integratedSystem' + 'Embedded.' + (langService.current + 'Name');
                            }
                            return self.getSortingKey('integratedSystemInfo', 'Lookup');
                        }
                    },
                    priority: {
                        langKey: 'header_priority',
                        searchKey: function () {
                            return self.getSortingKey('priorityTypeLookup', 'Lookup');
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.receivedMails.sortScope)) {
                                return 'priorityType' + 'Embedded.' + (langService.current + 'Name');
                            }
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
                            if (gridService.isGridServerScope(self.grid.receivedMails.sortScope)) {
                                // if english language, concat "En" at last, otherwise nothing
                                return 'addedBy' + 'Embedded.employeeName' + (langService.current === 'en' ? 'En' : '');
                            }
                            return self.getSortingKey('addedBy', 'EmployeePermission');
                        }
                    },
                    numberOfDays: {
                        langKey: 'header_number_of_days',
                        searchKey: function () {
                            return 'numberOfDays'
                        },
                        sortKey: function () {
                            if (gridService.isGridServerScope(self.grid.receivedMails.sortScope)) {
                                // number of days is difference between received date and now.
                                return '';
                            }
                            return 'numberOfDays';
                        },
                        hide: true
                    },
                    gridActions: {
                        langKey: 'header_actions',
                        hide: function () {
                            return !self.receivedMails.length;
                        }
                    }
                },
                columnsCount: function (includeHidden) {
                    return gridService.getColumnsCount(self.grid.receivedMails, includeHidden);
                },
                colSpan: function () {
                    return gridService.getColSpan(self.grid.receivedMails);
                },
                showColumn: function (column, isHeader) {
                    return gridService.isShowColumn(self.grid.receivedMails, column, isHeader);
                },
                sortScope: gridService.gridScope.server,
                sortCallback: function (sortKey) {
                    if (gridService.isGridServerScope(self.grid.receivedMails.sortScope)) {
                        // if grid is already filtered, call the _filterCallback function from service, search again in case user has searched before sort and resolve the progress
                        // otherwise, call the reload method of grid and search again in case user has searched before sort
                        if (self.grid.receivedMails.filterGridCriteria.criteria) {
                            var defer = $q.defer();
                            self.grid.receivedMails.progress = defer.promise;
                            outgoingMailService._filterCallback(self.grid.receivedMails, lookupService.statusTypesKeys.received)
                                .then(function (result) {
                                    self.grid.receivedMails.selectedRecords = [];
                                    // result will contain only records with this status but to assign to variable, call setMailsByStatusType method
                                    self.setMailsByStatusType(lookupService.statusTypesKeys.received, result);
                                    self.grid.receivedMails.searchCallback();
                                    defer.resolve(true);
                                });
                        } else {
                            self.grid.receivedMails.reload(self.grid.receivedMails.page)
                                .then(function () {
                                    self.grid.receivedMails.searchCallback();
                                });
                        }
                    } else {
                        self.receivedMails = gridService.sortGridData(self.grid.receivedMails, self.receivedMails);
                    }
                },
                searchText: '',
                searchCallback: function () {
                    if (!self.grid.receivedMails.searchText)
                        self.grid.receivedMails.reload();

                    var searchedRecords = mailService.searchMailGridData(self.grid.receivedMails, self.receivedMailsCopy, outgoingMailService.totalRecords);
                    self.setMailsByStatusType(lookupService.statusTypesKeys.received, searchedRecords, true);
                },
                filterGridCriteria: {reset: false, showReset: false, filterScope: gridService.gridScope.server},
                filterGridCallback: function ($event) {
                    var defer = $q.defer();
                    self.grid.receivedMails.page = 1;
                    outgoingMailService.controllerMethod.filterGridDialog(lookupService.statusTypesKeys.received, self.grid.receivedMails, $event)
                        .then(function (result) {
                            counterService.loadCounters();
                            self.grid.receivedMails.selectedRecords = [];
                            // result will contain only records with this status but to assign to variable, call setMailsByStatusType method
                            self.setMailsByStatusType(lookupService.statusTypesKeys.received, result);
                            gridService.resetSearchText(self.grid.receivedMails);
                            self.grid.receivedMails.progress = defer.promise;
                            defer.resolve(true);
                        }).catch(function (error) {
                        return [];
                    });
                },
                printFilterCallback: function ($event) {
                    printService.printSearchGrid(self.receivedMailsCopy, self.grid.receivedMails, $event);
                },
                pagingScope: gridService.gridScope.server,
                pagingCallback: function (pageNumber, limit) {
                    if (gridService.isGridServerScope(self.grid.receivedMails.pagingScope) && self.isTabSelected(self.tabsToShow.receivedMails)) {
                        // if grid is filtered, call the filterCallback function
                        // otherwise, call the reload method of grid
                        if (self.grid.receivedMails.filterGridCriteria.criteria) {
                            var defer = $q.defer();
                            self.grid.receivedMails.progress = defer.promise;
                            outgoingMailService._filterCallback(self.grid.receivedMails, lookupService.statusTypesKeys.received)
                                .then(function (result) {
                                    self.grid.receivedMails.selectedRecords = [];
                                    // result will contain only records with this status but to assign to variable, call setMailsByStatusType method
                                    self.setMailsByStatusType(lookupService.statusTypesKeys.received, result);
                                    defer.resolve(true);
                                });
                        } else if (!self.grid.receivedMails.searchText) {
                            self.grid.receivedMails.reload(pageNumber);
                        }
                    } else {
                        // do nothing
                    }
                },
                ScanCallback: function ($event) {
                    //open scan dialog
                    var statusTypesKey = lookupService.getLookupTypeId(lookupService.statusTypesKeys.received, lookupService.statusTypes);
                    mailService.openScanMailsDialog(self.grid.receivedMails, statusTypesKey, $event).then(function () {
                        self.reloadGrid($event);
                    });
                },
                reload: function (pageNumber, $event) {
                    var defer = $q.defer(), loadDefer = $q.defer();
                    self.grid.receivedMails.progress = defer.promise;
                    if (self.isHardReload) {
                        gridService.resetSorting(self.grid.receivedMails, '-registerDate');
                        gridService.resetSearchText(self.grid.receivedMails);
                    }
                    if (pageNumber)
                        self.grid.receivedMails.page = pageNumber;

                    if (self.grid.receivedMails.filterGridCriteria.criteria) {
                        outgoingMailService._filterCallback(self.grid.receivedMails, lookupService.statusTypesKeys.received, $event)
                            .then(function (result) {
                                loadDefer.resolve(result);
                            })
                            .catch(function (error) {
                                loadDefer.reject(error);
                            });
                    } else {
                        outgoingMailService.loadMails(lookupService.statusTypesKeys.received, self.grid.receivedMails, $event)
                            .then(function (result) {
                                loadDefer.resolve(result);
                            })
                            .catch(function (error) {
                                loadDefer.reject(error);
                            });
                    }
                    return loadDefer.promise.then(function (result) {
                        counterService.loadCounters();
                        self.grid.receivedMails.progress = defer.promise;
                        self.grid.receivedMails.selectedRecords = [];

                        // result will contain only records with this status but to assign to variable, call setMailsByStatusType method
                        self.setMailsByStatusType(lookupService.statusTypesKeys.received, result);
                        defer.resolve(true);
                        self.isHardReload = false;
                        return result;
                    }).catch(function (error) {
                        defer.resolve(true);
                        return [];
                    })

                },
                actions: [
                    // Mail Information Text
                    {
                        type: 'text',
                        icon: 'information-variant',
                        text: function (model) {
                            return {
                                shortcutText: model.getTranslatedName(),
                                contextText: model.getTranslatedName()
                            };
                        },
                        shortcut: true,
                        grid: function () {
                            return self.grid.receivedMails;
                        },
                        class: "action-green",
                        checkShow: gridService.checkToShowAction
                    },
                    // view document
                    {
                        type: 'action',
                        icon: 'book-open-page-variant',
                        text: 'grid_action_view',
                        callback: self.viewMail,
                        grid: function () {
                            return self.grid.receivedMails;
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
                    // Edit
                    {
                        type: 'action',
                        icon: 'pencil',
                        text: 'grid_action_edit',
                        shortcut: true,
                        callback: self.openEditMailDialog,
                        permissionKey: 'SYS_UPDATE_MAIL',
                        grid: function () {
                            return self.grid.receivedMails;
                        },
                        class: "action-green",
                        checkShow: function (action, model) {
                            // edit only if receiver entity is not using system
                            return gridService.checkToShowAction(action, model) && !model.getReceiverEntity().checkIsUseSystem();
                        }
                    },
                    // Return
                    {
                        type: 'action',
                        icon: 'reply',
                        text: 'grid_action_return',
                        shortcut: true,
                        class: "action-green",
                        /*checkShow: function (action, model) {
                            // return only if receiver entity is not using system
                            // if receiver entity is already using system, they can accept from expected and it will be automatically marked as received
                            return gridService.checkToShowAction(action, model) && !model.getReceiverEntity().checkIsUseSystem();
                        },*/
                        checkShow: gridService.checkToShowAction,
                        subMenu: [
                            // Return to New
                            {
                                type: 'action',
                                icon: 'reply',
                                text: 'grid_action_return_to_new',
                                shortcut: true,
                                callback: self.changeMailStatus,
                                grid: function () {
                                    return self.grid.receivedMails;
                                },
                                params: lookupService.statusTypesKeys.new,
                                class: "action-green",
                                checkShow: gridService.checkToShowAction
                            },
                            // Return to Sent
                            {
                                type: 'action',
                                icon: 'reply',
                                text: 'grid_action_return_to_sent',
                                shortcut: true,
                                callback: self.changeMailStatus,
                                grid: function () {
                                    return self.grid.receivedMails;
                                },
                                params: lookupService.statusTypesKeys.sent,
                                class: "action-green",
                                checkShow: gridService.checkToShowAction
                            }
                        ]
                    },
                    // Show Barcode
                    {
                        type: 'action',
                        icon: 'barcode',
                        text: 'grid_action_show_barcode',
                        shortcut: true,
                        callback: self.showBarcode,
                        grid: function () {
                            return self.grid.receivedMails;
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
                        grid: function () {
                            return self.grid.receivedMails;
                        },
                        class: "action-green",
                        checkShow: gridService.checkToShowAction
                    },
                    // Show Tracking History
                    {
                        type: 'action',
                        icon: 'history',
                        text: 'grid_action_tracking',
                        shortcut: true,
                        hide: true,
                        callback: self.showTrackingSheet,
                        grid: function () {
                            return self.grid.receivedMails;
                        },
                        class: "action-green",
                        checkShow: gridService.checkToShowAction
                    },
                    // Show Actions
                    {
                        type: 'action',
                        icon: 'history',
                        text: 'grid_action_action_logs',
                        shortcut: true,
                        callback: self.showActionLogs,
                        grid: function () {
                            return self.grid.receivedMails;
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
                            return self.grid.receivedMails;
                        },
                        class: "action-green",
                        checkShow: gridService.checkToShowAction
                    }
                ],
                bulkActions: [
                    // Return
                    {
                        type: 'action',
                        icon: 'reply',
                        text: 'grid_action_return',
                        shortcut: true,
                        class: "action-green",
                        grid: function () {
                            return self.grid.receivedMails;
                        },
                        /*checkShow: function () {
                            // return only if receiver entity of all selected mails is not using system
                            // if receiver entity is already using system, they can accept from expected and it will be automatically marked as received
                            if (this.grid().selectedRecords.length) {
                                return self.checkBulkEntitiesNotUseSystem(this.grid().selectedRecords)
                            }
                            return true;
                        },*/
                        checkShow: function () {
                            return this.grid().selectedRecords && this.grid().selectedRecords.length > 0;
                        },
                        subMenu: [
                            // Return to New
                            {
                                type: 'action',
                                icon: 'reply',
                                text: 'grid_action_return_to_new',
                                shortcut: true,
                                callback: self.changeMailStatusBulk,
                                grid: function () {
                                    return self.grid.receivedMails;
                                },
                                params: lookupService.statusTypesKeys.new,
                                class: "action-green",
                                checkShow: gridService.checkToShowAction
                            },
                            // Return to Sent
                            {
                                type: 'action',
                                icon: 'reply',
                                text: 'grid_action_return_to_sent',
                                shortcut: true,
                                callback: self.changeMailStatusBulk,
                                grid: function () {
                                    return self.grid.receivedMails;
                                },
                                params: lookupService.statusTypesKeys.sent,
                                class: "action-green",
                                checkShow: gridService.checkToShowAction
                            }
                        ]
                    }
                ]
            }
        };

        _updateGridByStatusMap();

        /**
         * @description Reloads the grid for current selected tab
         * @param $event
         */
        self.reloadGrid = function ($event) {
            self.isHardReload = true;
            if (self.isTabSelected(self.tabsToShow.newMails)) {
                self.grid.newMails.reload(self.grid.newMails.page, $event);
            } else if (self.isTabSelected(self.tabsToShow.receivedMails)) {
                self.grid.receivedMails.reload(self.grid.receivedMails.page, $event);
            } else if (self.isTabSelected(self.tabsToShow.sentMails)) {
                self.grid.sentMails.reload(self.grid.sentMails.page, $event);
            }
        };
    });
};
