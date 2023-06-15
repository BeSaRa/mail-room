module.exports = function (app) {
    app.controller('packageItemListDirectiveCtrl', function ($scope,
                                                             LangWatcher,
                                                             gridService,
                                                             generator,
                                                             dialog,
                                                             PackageItem,
                                                             mailRoomTemplate,
                                                             langService,
                                                             _,
                                                             entityService,
                                                             lookupService,
                                                             incomingMailService,
                                                             $timeout,
                                                             mailService,
                                                             employeeService,
                                                             $q) {
        'ngInject';
        var self = this;
        self.controllerName = 'packageItemListDirectiveCtrl';
        LangWatcher($scope);

        function _init() {
            self.packageItemList = angular.copy(self.mail.packageItemList);
            self.packageItemListClone = angular.copy(self.packageItemList);

            self.grid = {
                name: 'packageItemList',
                progress: null,
                selectedRecords: [],
                limit: 5, // default limit
                page: 1, // first page
                order: '', // default sorting column with order(- for desc),
                limitOptions: gridService.getGridLimitOptions(self.packageItemList),
                columns: {
                    category: {
                        langKey: 'lbl_category',
                        searchKey: function () {
                            return self.getSortingKey('categoryId', 'Lookup');
                        },
                        sortKey: function () {
                            return self.getSortingKey('categoryId', 'Lookup');
                        }
                    },
                    quantity: {
                        langKey: 'lbl_quantity',
                        searchKey: function () {
                            return 'quantity';
                        },
                        sortKey: function () {
                            return 'quantity';
                        }
                    },
                    weight: {
                        langKey: 'lbl_weight',
                        searchKey: function () {
                            return 'oneItemWeight';
                        },
                        sortKey: function () {
                            return 'oneItemWeight';
                        },
                        hide: true
                    },
                    height: {
                        langKey: 'lbl_height',
                        searchKey: function () {
                            return 'height';
                        },
                        sortKey: function () {
                            return 'height';
                        },
                        hide: true
                    },
                    width: {
                        langKey: 'lbl_width',
                        searchKey: function () {
                            return 'width';
                        },
                        sortKey: function () {
                            return 'width';
                        },
                        hide: true
                    },
                    length: {
                        langKey: 'lbl_length',
                        searchKey: function () {
                            return 'length';
                        },
                        sortKey: function () {
                            return 'length';
                        },
                        hide: true
                    },
                    description: {
                        langKey: 'lbl_description',
                        searchKey: function () {
                            return 'description';
                        },
                        sortKey: function () {
                            return 'description';
                        }
                    },
                    notes: {
                        langKey: 'lbl_notes',
                        searchKey: function () {
                            return 'notes';
                        },
                        sortKey: function () {
                            return 'notes';
                        }
                    },
                    gridActions: {
                        langKey: 'header_actions',
                        hide: function () {
                            return !self.packageItemList.length;
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
                    self.packageItemList = gridService.sortGridData(self.grid, self.packageItemList);
                },
                searchText: '',
                searchCallback: function () {
                    self.packageItemList = gridService.searchGridData(self.grid, self.packageItemListClone);
                    gridService.resetSorting(self.grid);
                    self.grid.sortCallback();
                },
                reload: function (pageNumber, $event) {
                    var defer = $q.defer();
                    self.grid.progress = defer.promise;
                }
            };
        }

        /**
         * @description Gets the sorting key for given column
         * @param property
         * @param modelType
         * @returns {*}
         */
        self.getSortingKey = function (property, modelType) {
            return generator.getColumnSortingKey(property, modelType);
        };

        self.getLookupValueText = function (typeId, lookupType) {
            return lookupService.getLookupByTypeId(lookupType, typeId);
        };

        /**
         * @description Checks if form is disabled(read-only)
         * @returns {boolean}
         */
        self.formDisabled = function () {
            return self.disableAll;
        };

        self.openAddPackageItem = function ($event) {
            return dialog
                .showDialog({
                    targetEvent: $event,
                    template: mailRoomTemplate.getPopup('package-item'),
                    controller: 'packageItemPopCtrl',
                    controllerAs: 'ctrl',
                    locals: {
                        packageItem: new PackageItem(),
                        packageItemList: self.packageItemList,
                        editMode: false,
                        disableAll: self.disableAll
                    }
                }).catch(function (result) {
                    self.packageItemList = result;
                    self.packageItemListClone = angular.copy(self.packageItemList);
                    self.mail.packageItemList = result;
                })
        };

        self.openEditPackageItem = function ($event, item) {
            return dialog
                .showDialog({
                    targetEvent: $event,
                    template: mailRoomTemplate.getPopup('package-item'),
                    controller: 'packageItemPopCtrl',
                    controllerAs: 'ctrl',
                    locals: {
                        packageItem: angular.copy(item),
                        packageItemList: self.packageItemList,
                        editMode: true,
                        disableAll: self.disableAll
                    }
                }).catch(function (result) {
                    self.packageItemList = result;
                    self.packageItemListClone = angular.copy(self.packageItemList);
                    self.mail.packageItemList = result;
                })
        };

        self.removePackageItem = function ($event, item) {
            return dialog.confirmMessage(langService.get('msg_confirm_delete_simple'))
                .then(function () {
                    var index = _.findIndex(self.packageItemListClone, item);
                    if (index > -1) {
                        self.packageItemListClone.splice(index, 1);
                        self.packageItemList = self.packageItemListClone;
                        self.mail.packageItemList = self.packageItemList;
                    }
                });
        };

        function _initResetWatch() {
            $scope.$watch(function () {
                return self.resetForm;
            }, function (newVal) {
                if (newVal)
                    _init();
            });
        }

        $scope.$watch(function () {
            return self.mailUpdated;
        }, function (newVal) {
            if (newVal) {
                self.packageItemList = angular.copy(self.mail.packageItemList);
                self.packageItemListClone = angular.copy(self.packageItemList);
            }
        });

        self.$onInit = function () {
            _init();
            _initResetWatch();
        }
    });
};
