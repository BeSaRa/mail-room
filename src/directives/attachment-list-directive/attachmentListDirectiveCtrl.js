module.exports = function (app) {
    app.controller('attachmentListDirectiveCtrl', function ($scope,
                                                            LangWatcher,
                                                            gridService,
                                                            generator,
                                                            $q,
                                                            mailRoomTemplate,
                                                            ConnectedPerson,
                                                            langService,
                                                            _,
                                                            attachmentService,
                                                            dialog) {
        'ngInject';
        var self = this;
        self.controllerName = 'attachmentListDirectiveCtrl';

        LangWatcher($scope);

        function _init() {
            self.attachmentListCopy = angular.copy(self.attachmentList);

            /**
             * @description
             * @type {{limit: number, page: number, order: string, limitOptions: *[], columns: string[], showColumn: (function(*=): boolean), sortCallback: sortCallback}}
             */
            self.grid = {
                name: 'attachmentList',
                progress: null,
                selectedRecords: [],
                limit: 5, // default limit
                page: 1, // first page
                order: '', // default sorting column with order(- for desc),
                limitOptions: gridService.getGridLimitOptions(self.attachmentList),
                columns: {
                    nameAr: {
                        langKey: 'lbl_arabic_name',
                        searchKey: function () {
                            return 'nameAr';
                        },
                        sortKey: function () {
                            return 'nameAr';
                        }
                    },
                    nameEn: {
                        langKey: 'lbl_english_name',
                        searchKey: function () {
                            return 'nameEn';
                        },
                        sortKey: function () {
                            return 'nameEn';
                        }
                    },
                    gridActions: {
                        langKey: 'header_actions',
                        hide: function () {
                            return !self.attachmentList.length;
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
                    self.attachmentList = gridService.sortGridData(self.grid, self.attachmentList);
                },
                searchText: '',
                searchCallback: function () {
                    self.attachmentList = gridService.searchGridData(self.grid, self.attachmentListCopy);
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
                self.attachmentList = angular.copy(self.attachmentList);
                self.attachmentListCopy = angular.copy(self.attachmentList);
            }
        });

        self.$onInit = function () {
            _init();
            _initResetWatch();
        };

        self.openAttachment = function (record, $event) {
            attachmentService.viewAttachment(record, $event);
        };

    });
};
