module.exports = function (app) {
    app.controller('entityTypeCtrl', function (entityTypeService,
                                               $q,
                                               _,
                                               langService,
                                               $filter,
                                               toast,
                                               generator,
                                               helpService,
                                               gridService) {
        'ngInject';
        var self = this;

        self.controllerName = 'entityTypeCtrl';
        helpService.setHelpTo('entity-types');

        self.entityTypes = entityTypeService.entityTypes;
        self.entityTypesCopy = generator.shallowCopyArray(self.entityTypes);

        /**
         * @description Contains options for grid configuration
         * @type {{limit: number, page: number, order: string, limitOptions: *[], columns: string[], showColumn: (function(*=): boolean), sortCallback: sortCallback}}
         */
        self.grid = {
            name: 'entityTypes',
            progress: null,
            selectedRecords: [],
            limit: 5, // default limit
            page: 1, // first page
            order: '', // default sorting column with order(- for desc),
            limitOptions: gridService.getGridLimitOptions(self.entityTypes),
            columns: {
                arabicName: {
                    langKey: 'header_arabic_name',
                    searchKey: function(){
                        return 'arName';
                    },
                    sortKey: function(){
                        return 'arName';
                    }
                },
                englishName: {
                    langKey: 'header_english_name',
                    searchKey: function(){
                        return 'enName';
                    },
                    sortKey: function(){
                        return 'enName';
                    }
                },
                gridActions: {
                    langKey: 'header_actions',
                    hide: function () {
                        return !self.entityTypes.length;
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
                self.entityTypes = gridService.sortGridData(self.grid, self.entityTypes);
            },
            searchText: '',
            searchCallback: function () {
                self.entityTypes = gridService.searchGridData(self.grid, self.entityTypesCopy);
                gridService.resetSorting(self.grid);
                self.grid.sortCallback();
            },
            reload: function (pageNumber, $event) {
                var defer = $q.defer();
                self.grid.progress = defer.promise;

                return entityTypeService.loadEntityTypes($event)
                    .then(function (result) {
                        self.entityTypes = result;
                        self.entityTypesCopy = generator.shallowCopyArray(self.entityTypes);
                        self.grid.selectedRecords = [];
                        defer.resolve(true);
                        if (pageNumber)
                            self.grid.page = pageNumber;
                        gridService.resetSearchText(self.grid);
                        gridService.resetSorting(self.grid);
                        self.grid.sortCallback();
                        return result;
                    });
            }
        };

        /**
         *@description Contains methods for CRUD operations for job titles
         */
        self.statusServices = {
            activate: entityTypeService.activateBulkEntityTypes,
            deactivate: entityTypeService.deactivateBulkEntityTypes,
            single: entityTypeService.changeEntityStatus
        };

        /**
         * @description Opens the dialog to add entityType.
         * @param $event
         */
        self.openAddEntityTypeDialog = function ($event) {
            return entityTypeService.controllerMethod.addDialog($event)
                .then(function (result) {
                    self.grid.reload(self.grid.page)
                        .then(function () {
                            toast.success(langService.get('msg_add_success').change({name: result.getNames()}));
                        })
                })
        };

        /**
         * @description Opens the dialog to edit entityType.
         * @param entityType
         * @param $event
         */
        self.openEditEntityTypeDialog = function (entityType, $event) {
            return entityTypeService.controllerMethod.editDialog(entityType, $event)
                .then(function (result) {
                    self.grid.reload(self.grid.page)
                        .then(function () {
                            toast.success(langService.get('msg_edit_specific_success').change({name: result.getNames()}));
                        })
                })
        };

        /**
         * @description Change the status of entityType from grid
         * @param entityType
         * @param $event
         */
        self.changeEntityTypeStatus = function (entityType, $event) {
            self.statusServices.single(entityType, $event)
                .then(function (result) {
                    if (result)
                        toast.success(langService.get('msg_status_success'));
                    else {
                        entityType.active = !entityType.active;
                        dialog.errorMessage(langService.get('msg_something_happened_when_update_status'));
                    }
                })
                .catch(function () {
                    entityType.active = !entityType.active;
                    dialog.errorMessage(langService.get('msg_something_happened_when_update_status'));
                });
        };

        /**
         * @description Change the status of selected entityTypes
         * @param status
         * @param $event
         */
        self.changeBulkEntityTypesStatus = function (status, $event) {
            var updatedStatus = (status === 'activate');
            if (!generator.checkCollectionStatus(self.grid.selectedRecords, updatedStatus, 'active')) {
                toast.success(langService.get(updatedStatus ? 'msg_success_activate_selected' : 'msg_success_deactivate_selected'));
                return;
            }
            self.statusServices[status](self.grid.selectedRecords, $event).then(function () {
                self.grid.reload(self.grid.page);
            });
        };

        /**
         * @description Removes the given entityType
         * @param entityType
         * @param $event
         */
        self.removeEntityType = function (entityType, $event) {
            entityTypeService.controllerMethod.delete(entityType, $event)
                .then(function (result) {
                    if (result) {
                        self.grid.reload(self.grid.page).then(function () {
                            toast.success(langService.get("msg_delete_specific_success").change({name: entityType.getNames()}));
                        });
                    }
                })
                .catch(function (error) {

                });
        };

        /**
         * @description Removes the selected entityTypes
         * @param $event
         */
        self.removeBulkEntityTypes = function ($event) {
            entityTypeService.controllerMethod.deleteBulk(self.grid.selectedRecords, $event)
                .then(function (result) {
                    self.grid.reload(self.grid.page);
                })
                .catch(function (error) {

                });
        };
    });
};