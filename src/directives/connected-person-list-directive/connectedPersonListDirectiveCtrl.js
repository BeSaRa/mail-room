module.exports = function (app) {
    app.controller('connectedPersonListDirectiveCtrl', function ($scope,
                                                                 LangWatcher,
                                                                 gridService,
                                                                 generator,
                                                                 $q,
                                                                 mailRoomTemplate,
                                                                 ConnectedPerson,
                                                                 langService,
                                                                 _,
                                                                 dialog) {
        'ngInject';
        var self = this;
        self.controllerName = 'connectedPersonListDirectiveCtrl';
        LangWatcher($scope);

        function _init() {
            self.connectedPersonList = angular.copy(self.mail.connectedPersonList);
            self.connectedPersonListCopy = angular.copy(self.connectedPersonList);

            /**
             * @description
             * @type {{limit: number, page: number, order: string, limitOptions: *[], columns: string[], showColumn: (function(*=): boolean), sortCallback: sortCallback}}
             */
            self.grid = {
                name: 'connectedPersonList',
                progress: null,
                selectedRecords: [],
                limit: 5, // default limit
                page: 1, // first page
                order: '', // default sorting column with order(- for desc),
                limitOptions: gridService.getGridLimitOptions(self.connectedPersonList),
                columns: {
                    personalId: {
                        langKey: 'lbl_personal_id',
                        searchKey: function () {
                            return 'personalId';
                        },
                        sortKey: function () {
                            return 'personalId';
                        }
                    },
                    fullName: {
                        langKey: 'lbl_full_name',
                        searchKey: function () {
                            return 'fullName';
                        },
                        sortKey: function () {
                            return 'fullName';
                        }
                    },
                    address1: {
                        langKey: 'lbl_address_1',
                        searchKey: function () {
                            return 'address1';
                        },
                        sortKey: function () {
                            return 'address1';
                        }
                    },
                    mobile1: {
                        langKey: 'lbl_mobile_1',
                        searchKey: function () {
                            return 'mobile1';
                        },
                        sortKey: function () {
                            return 'mobile1';
                        }
                    },
                    gridActions: {
                        langKey: 'header_actions',
                        hide: function () {
                            return !self.connectedPersonList.length;
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
                    self.connectedPersonList = gridService.sortGridData(self.grid, self.connectedPersonList);
                },
                searchText: '',
                searchCallback: function () {
                    self.connectedPersonList = gridService.searchGridData(self.grid, self.connectedPersonListCopy);
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

        self.openAddConnectedPerson = function ($event) {
            return dialog
                .showDialog({
                    targetEvent: $event,
                    template: mailRoomTemplate.getPopup('connected-person'),
                    controller: 'connectedPersonPopCtrl',
                    controllerAs: 'ctrl',
                    locals: {
                        connectedPerson: new ConnectedPerson(),
                        connectedPersonList: angular.copy(self.connectedPersonList),
                        editMode: false,
                        disableAll: self.disableAll
                    }
                }).catch(function (connectedPersonList) {
                    self.connectedPersonList = connectedPersonList;
                    self.connectedPersonListCopy = angular.copy(self.connectedPersonList);
                    self.mail.connectedPersonList = connectedPersonList;
                })
        }

        self.openEditConnectedPerson = function (person, $event) {
            return dialog
                .showDialog({
                    targetEvent: $event,
                    template: mailRoomTemplate.getPopup('connected-person'),
                    controller: 'connectedPersonPopCtrl',
                    controllerAs: 'ctrl',
                    locals: {
                        connectedPerson: angular.copy(person),
                        connectedPersonList: self.connectedPersonList,
                        editMode: true,
                        disableAll: self.disableAll
                    }
                }).catch(function (connectedPersonList) {
                    self.connectedPersonList = connectedPersonList;
                    self.connectedPersonListCopy = angular.copy(self.connectedPersonList);
                    self.mail.connectedPersonList = connectedPersonList;
                })
        }

        self.removeConnectedPerson = function (person, $event) {
            return dialog.confirmMessage(langService.get('msg_confirm_delete').change({name: person.getFullName()}))
                .then(function () {
                    var index = _.findIndex(self.connectedPersonListCopy, person);
                    if (index > -1) {
                        self.connectedPersonListCopy.splice(index, 1);
                        self.connectedPersonList = self.connectedPersonListCopy;
                        self.mail.connectedPersonList = self.connectedPersonList;
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
                self.connectedPersonList = angular.copy(self.mail.connectedPersonList);
                self.connectedPersonListCopy = angular.copy(self.connectedPersonList);
            }
        });

        self.$onInit = function () {
            _init();
            _initResetWatch();
        }
    });
};
