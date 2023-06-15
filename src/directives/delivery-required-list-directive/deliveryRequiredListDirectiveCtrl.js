module.exports = function (app) {
    app.controller('deliveryRequiredListDirectiveCtrl', function ($scope,
                                                                  LangWatcher,
                                                                  gridService,
                                                                  generator,
                                                                  $q,
                                                                  mailRoomTemplate,
                                                                  DeliveryRequiredItem,
                                                                  langService,
                                                                  _,
                                                                  dialog) {
        'ngInject';
        var self = this;
        self.controllerName = 'deliveryRequiredListDirectiveCtrl';
        LangWatcher($scope);

        function _init() {
            self.deliveryRequiredItemList = self.mail.deliveryRequiredItemList;
            self.deliveryRequiredItemListCopy = angular.copy(self.deliveryRequiredItemList);

            /**
             * @description
             * @type {{limit: number, page: number, order: string, limitOptions: *[], columns: string[], showColumn: (function(*=): boolean), sortCallback: sortCallback}}
             */
            self.grid = {
                name: 'deliveryRequiredItemList',
                progress: null,
                selectedRecords: [],
                limit: 5, // default limit
                page: 1, // first page
                order: '', // default sorting column with order(- for desc),
                limitOptions: gridService.getGridLimitOptions(self.deliveryRequiredItemList),
                columns: {
                    labelAr: {
                        langKey: 'lbl_arabic_name',
                        searchKey: function () {
                            return 'labelAr';
                        },
                        sortKey: function () {
                            return 'labelAr';
                        }
                    },
                    labelEn: {
                        langKey: 'lbl_english_name',
                        searchKey: function () {
                            return 'labelEn';
                        },
                        sortKey: function () {
                            return 'labelEn';
                        }
                    },
                    keyStr: {
                        langKey: 'lbl_code',
                        searchKey: function () {
                            return 'keyStr';
                        },
                        sortKey: function () {
                            return 'keyStr';
                        }
                    },
                    collected: {
                        langKey: 'lbl_collected',
                        searchKey: function () {
                            return 'collected';
                        },
                        sortKey: function () {
                            return 'collected';
                        }
                    },
                    gridActions: {
                        langKey: 'header_actions',
                        hide: function () {
                            return !self.deliveryRequiredItemList.length || !!self.isMobileReceive;
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
                    self.deliveryRequiredItemList = gridService.sortGridData(self.grid, self.deliveryRequiredItemList);
                },
                searchText: '',
                searchCallback: function () {
                    self.deliveryRequiredItemList = gridService.searchGridData(self.grid, self.deliveryRequiredItemListCopy);
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
         * @description Checks if form is disabled(read-only)
         * @returns {boolean}
         */
        self.formDisabled = function () {
            return self.disableAll;
        };

        self.openAddDeliveryRequiredItem = function ($event) {
            return dialog
                .showDialog({
                    targetEvent: $event,
                    template: mailRoomTemplate.getPopup('delivery-required-item'),
                    controller: 'deliveryRequiredItemPopCtrl',
                    controllerAs: 'ctrl',
                    locals: {
                        deliveryRequiredItem: new DeliveryRequiredItem(),
                        deliveryRequiredItemList: angular.copy(self.deliveryRequiredItemList),
                        editMode: false,
                        disableAll: self.disableAll,
                        isMobileReceive: self.isMobileReceive || false
                    }
                }).catch(function (deliveryRequiredItemList) {
                    self.deliveryRequiredItemList = deliveryRequiredItemList;
                    self.deliveryRequiredItemListCopy = angular.copy(self.deliveryRequiredItemList);
                    self.mail.deliveryRequiredItemList = deliveryRequiredItemList;
                })
        }

        self.openEditDeliveryRequiredItem = function (item, $event) {
            return dialog
                .showDialog({
                    targetEvent: $event,
                    template: mailRoomTemplate.getPopup('delivery-required-item'),
                    controller: 'deliveryRequiredItemPopCtrl',
                    controllerAs: 'ctrl',
                    locals: {
                        deliveryRequiredItem: angular.copy(item),
                        deliveryRequiredItemList: self.deliveryRequiredItemList,
                        editMode: true,
                        disableAll: self.disableAll,
                        isMobileReceive: self.isMobileReceive || false
                    }
                }).catch(function (deliveryRequiredItemList) {
                    self.deliveryRequiredItemList = deliveryRequiredItemList;
                    self.deliveryRequiredItemListCopy = angular.copy(self.deliveryRequiredItemList);
                    self.mail.deliveryRequiredItemList = deliveryRequiredItemList;
                })
        }

        self.removeDeliveryRequiredItem = function (item, $event) {
            return dialog.confirmMessage(langService.get('msg_confirm_delete').change({name: item.getTranslatedName()}))
                .then(function () {
                    var index = _.findIndex(self.deliveryRequiredItemListCopy, item);
                    if (index > -1) {
                        self.deliveryRequiredItemListCopy.splice(index, 1);
                        self.deliveryRequiredItemList = self.deliveryRequiredItemListCopy;
                        self.mail.deliveryRequiredItemList = self.deliveryRequiredItemList;
                    }
                });
        };

        self.changeCollected = function (item, $event) {
            if (!self.isMobileReceive) {
                item.collected = !item.collected;
            }
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
                self.deliveryRequiredItemList = self.mail.deliveryRequiredItemList;
                self.deliveryRequiredItemListCopy = angular.copy(self.deliveryRequiredItemList);
            }
        });

        self.$onInit = function () {
            _init();
            _initResetWatch();
        }
    });
};
