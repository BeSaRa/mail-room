module.exports = function (app) {
    app.controller('entityCtrl', function (entityService,
                                           $q,
                                           _,
                                           langService,
                                           configurationService,
                                           lookupService,
                                           $filter,
                                           toast,
                                           generator,
                                           helpService,
                                           userInfoService,
                                           gridService) {
        'ngInject';
        var self = this;

        self.controllerName = 'entityCtrl';
        helpService.setHelpTo('entities');

        self.entities = []; //entityService.entities;
        self.entitiesCopy = generator.shallowCopyArray(entityService.entities);

        self.integratedSystemList = lookupService.returnLookups(lookupService.integratedSystems);
        self.integratedSystemId = configurationService.INTEGRATED_SYSTEM_MAILING_ROOM;

        /**
         * @description Contains options for grid configuration
         * @type {{limit: number, page: number, order: string, limitOptions: *[], columns: string[], showColumn: (function(*=): boolean), sortCallback: sortCallback}}
         */
        self.grid = {
            name: 'entities',
            progress: null,
            selectedRecords: [],
            limit: 5, // default limit
            page: 1, // first page
            order: '', // default sorting column with order(- for desc),
            limitOptions: gridService.getGridLimitOptions(self.entities),
            columns: {
                arabicName: {
                    langKey: 'header_arabic_name',
                    searchKey: function () {
                        return 'arName';
                    },
                    sortKey: function () {
                        return 'arName';
                    }
                },
                englishName: {
                    langKey: 'header_english_name',
                    searchKey: function () {
                        return 'enName';
                    },
                    sortKey: function () {
                        return 'enName';
                    }
                },
                responsibleName: {
                    langKey: 'header_responsible_name',
                    searchKey: function () {
                        return 'responsibleName';
                    },
                    sortKey: function () {
                        return 'responsibleName';
                    }
                },
                responsibleEmail: {
                    langKey: 'header_responsible_email',
                    searchKey: function () {
                        return 'responsibleEmail';
                    },
                    sortKey: function () {
                        return 'responsibleEmail';
                    }
                },
                entityCode: {
                    langKey: 'header_code',
                    searchKey: function () {
                        return 'code'
                    },
                    sortKey: function () {
                        return 'code';
                    }
                },
                useSystem: {
                    langKey: 'header_use_system'
                },
                status: {
                    langKey: 'header_status',
                },
                gridActions: {
                    langKey: 'header_actions',
                    hide: function () {
                        return !self.entities.length;
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
                self.entities = gridService.sortGridData(self.grid, self.entities);
            },
            searchText: '',
            searchCallback: function () {
                self.entities = gridService.searchGridData(self.grid, self.entitiesCopy);
                self.filterEntitiesByIntegratedSystem(self.entities);
                self.grid.sortCallback();
            },
            reload: function (pageNumber, $event) {
                var defer = $q.defer();
                self.grid.progress = defer.promise;

                return entityService.loadEntities($event)
                    .then(function (result) {
                        self.entities = result;
                        self.entitiesCopy = generator.shallowCopyArray(self.entities);
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
            activate: entityService.activateBulkEntities,
            deactivate: entityService.deactivateBulkEntities,
            single: entityService.changeEntityStatus
        };

        /**
         * @description Opens the dialog to add entity.
         * @param $event
         */
        self.openAddEntityDialog = function ($event) {
            return entityService.controllerMethod.addDialog(null, self.integratedSystemId, $event)
                .then(function (result) {
                    self.grid.reload(self.grid.page)
                        .then(function () {
                            toast.success(langService.get('msg_add_success').change({name: result.getNames()}));
                        })
                })
        };

        /**
         * @description Opens the dialog to edit entity.
         * @param entity
         * @param $event
         */
        self.openEditEntityDialog = function (entity, $event) {
            return entityService.controllerMethod.editDialog(entity, null, self.integratedSystemId, $event)
                .then(function (result) {
                    self.grid.reload(self.grid.page)
                        .then(function () {
                            toast.success(langService.get('msg_edit_specific_success').change({name: result.getNames()}));
                        })
                })
        };

        /**
         * @description Change the status of entity from grid
         * @param entity
         * @param $event
         */
        self.changeEntityStatus = function (entity, $event) {
            self.statusServices.single(entity, $event)
                .then(function (result) {
                    if (result)
                        toast.success(langService.get('msg_status_success'));
                    else {
                        entity.active = !entity.active;
                        dialog.errorMessage(langService.get('msg_something_happened_when_update_status'));
                    }
                })
                .catch(function () {
                    entity.active = !entity.active;
                    dialog.errorMessage(langService.get('msg_something_happened_when_update_status'));
                });
        };

        /**
         * @description Change the status of selected entities
         * @param status
         * @param $event
         */
        self.changeBulkEntitiesStatus = function (status, $event) {
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
         * @description Changes the is use system value for entity
         * @param entity
         * @param $event
         * @returns {boolean}
         */
        self.changeUseSystem = function (entity, $event) {
            entityService.changeIsUseSystem(entity, $event)
                .then(function (result) {
                    if (result)
                        toast.success(langService.get('msg_use_system_success'));
                    else {
                        entity.isUseSystem = !entity.isUseSystem;
                        dialog.errorMessage(langService.get('msg_something_wrong'));
                    }
                })
                .catch(function () {
                    entity.isUseSystem = !entity.isUseSystem;
                    dialog.errorMessage(langService.get('msg_something_wrong'));
                });
        };

        /**
         * @description Removes the given entity
         * @param entity
         * @param $event
         */
        self.removeEntity = function (entity, $event) {
            entityService.controllerMethod.delete(entity, $event)
                .then(function (result) {
                    if (result) {
                        self.grid.reload(self.grid.page).then(function () {
                            toast.success(langService.get("msg_delete_specific_success").change({name: entity.getNames()}));
                        });
                    }
                })
                .catch(function (error) {

                });
        };

        /**
         * @description Removes the selected entities
         * @param $event
         */
        self.removeBulkEntities = function ($event) {
            entityService.controllerMethod.deleteBulk(self.grid.selectedRecords, $event)
                .then(function (result) {
                    self.grid.reload(self.grid.page);
                })
                .catch(function (error) {

                });
        };

        self.isCurrentEntity = function (entity) {
            return userInfoService.isCurrentEntity(entity);
        };

        self.filterEntitiesByIntegratedSystem = function (entities) {
            self.entities = _.filter(entities ? entities : self.entitiesCopy, function (entity) {
                return entity.integratedSystemId === self.integratedSystemId;
            });
        };

        self.$onInit = function () {
            self.filterEntitiesByIntegratedSystem();
        };
    });
};
