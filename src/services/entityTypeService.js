module.exports = function (app) {
    app.service('entityTypeService', function ($http,
                                               urlService,
                                               generator,
                                               $q,
                                               _,
                                               dialog,
                                               EntityType,
                                               mailRoomTemplate,
                                               langService,
                                               toast) {
        'ngInject';
        var self = this;

        self.entityTypes = [];

        /**
         * @description Load the entity types from server.
         * @returns {Promise|entityTypes}
         */
        self.loadEntityTypes = function ($event) {
            return $http.get(urlService.entityTypes)
                .then(function (result) {
                    self.entityTypes = generator.generateCollection(result.data, EntityType, self._sharedMethods);
                    self.entityTypes = generator.interceptReceivedCollection('EntityType', self.entityTypes);
                    return self.entityTypes;
                })
                .catch(function (error) {
                    return [];
                });
        };

        /**
         * @description Get entity types from self.entityTypes if found and if not load it from server again.
         * @returns {Promise|entityTypes}
         */
        self.getEntityTypes = function ($event) {
            return self.entityTypes.length ? $q.when(self.entityTypes) : self.loadEntityTypes($event);
        };

        /**
         * @description Loads the entity type from database by id.
         * @param {EntityType | number} entityTypeId
         * @param {boolean} updateEntityTypes
         * Indicates if newly fetched entity will be updated in the existing entity types list.
         * @returns {EntityType}
         */
        self.loadEntityTypeById = function (entityTypeId, updateEntityTypes) {
            entityTypeId = entityTypeId instanceof EntityType ? entityTypeId.id : entityTypeId;
            return $http.get(urlService.entityTypes + '/' + entityTypeId)
                .then(function (result) {
                    result = generator.generateInstance(result.data, EntityType, self._sharedMethods);
                    result = generator.interceptReceivedInstance('EntityType', result);
                    if (updateEntityTypes) {
                        if (self.entityTypes.length) {
                            self.entityTypes = _.map(self.entityTypes, function (entityType) {
                                if (entityType.id === result.id) {
                                    entityType = result;
                                }
                                return entityType;
                            });
                        }
                        else {
                            self.entityTypes.push(result);
                        }
                    }
                    return result;
                })
                .catch(function (error) {

                });
        };

        /**
         * @description Gets the entity type from existing entity types by id.
         * If entity types list is empty, it will fetch from server and find entity type by id.
         * @param {EntityType | number} entityTypeId
         * @param {boolean} fetchNew
         * Indicates if entity type will be fetched from server.
         * @param {boolean} updateEntityTypesIfFetchNew
         * Indicates if newly fetched entity types will be updated in the existing entity types list.
         * It is used if fetchNew = true
         * @returns {EntityType}
         */
        self.getEntityById = function (entityTypeId, fetchNew, updateEntityTypesIfFetchNew) {
            entityTypeId = entityTypeId instanceof EntityType ? entityTypeId.id : entityTypeId;
            if (fetchNew) {
                return self.loadEntityTypeById(entityTypeId, updateEntityTypesIfFetchNew)
                    .then(function (result) {
                        return result;
                    })
                    .catch(function (error) {

                    });
            }
            else {
                return _.find(self.entityTypes, function (entityType) {
                    return Number(entityType.id) === Number(entityTypeId);
                });
            }
        };

        /**
         * @description Contains methods for CRUD operations for entity types
         */
        self.controllerMethod = {
            addDialog: function ($event) {
                return dialog
                    .showDialog({
                        targetEvent: $event,
                        template: mailRoomTemplate.getPopup('entity-type'),
                        controller: 'entityTypePopCtrl',
                        controllerAs: 'ctrl',
                        locals: {
                            editMode: false,
                            entityType: new EntityType()
                        }
                    })
            },
            editDialog: function (entityType, $event) {
                return dialog
                    .showDialog({
                        targetEvent: $event,
                        template: mailRoomTemplate.getPopup('entity-type'),
                        controller: 'entityTypePopCtrl',
                        controllerAs: 'ctrl',
                        locals: {
                            editMode: true,
                            entityType: angular.copy(entityType)
                        }
                    })
            },
            delete: function (entityType, $event) {
                return dialog.confirmMessage(langService.get('msg_confirm_delete').change({name: entityType.getNames()}))
                    .then(function () {
                        return self.deleteEntityType(entityType);
                    });
            },
            deleteBulk: function (entityTypes, $event) {
                return dialog.confirmMessage(langService.get('msg_confirm_delete_selected_multiple'))
                    .then(function (result) {
                        return self.deleteBulkEntityTypes(entityTypes);
                    });
            }
        };

        /**
         * @description Add new entityType
         * @param entityType
         * @returns {*}
         */
        self.addEntityType =  function (entityType) {
            return $http.post(urlService.entityTypes, generator.interceptSendInstance('EntityType', entityType))
                .then(function (result) {
                    result = generator.generateInstance(result.data, EntityType, self._sharedMethods);
                    return generator.interceptReceivedInstance('EntityType', result);
                })
                .catch(function (error) {

                });
        };

        /**
         * @description Update the given entityType.
         * @param entityType
         * @returns {*}
         */
        self.updateEntityType = function (entityType) {
            var id = entityType.getEntityTypeId();
            return $http.put(urlService.entityTypes + '/' + id, generator.interceptSendInstance('EntityType', entityType))
                .then(function (result) {
                    result = generator.generateInstance(result.data, EntityType, self._sharedMethods);
                    return generator.interceptReceivedInstance('EntityType', result);
                })
                .catch(function (error) {

                });
        };

        /**
         * @description Delete given entityType.
         * @param entityType
         * @returns {HttpPromise}
         */
        self.deleteEntityType = function (entityType) {
            entityType = entityType.getEntityTypeId();
            return $http.delete(urlService.entityTypes + '/' + entityType)
                .then(function (result) {
                    if (result.status === 200)
                        return true;
                    else {
                        toast.error(langService.get('msg_error_occurred_while_processing_request'));
                        return false;
                    }
                })
                .catch(function (error) {
                    toast.error(langService.get('msg_error_occurred_while_processing_request'));
                    return false;
                });
        };

        /**
         * @description delete bulk entity types.
         * @param entityTypes
         * @return {Promise|null}
         */
        self.deleteBulkEntityTypes = function (entityTypes) {
            var bulkIds = entityTypes[0].hasOwnProperty('id') ? _.map(entityTypes, 'id') : entityTypes;
            return $http({
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                url: urlService.entityTypes + '/bulk',
                data: bulkIds
            }).then(function (result) {
                return generator.getBulkActionResponse(result, entityTypes, false, 'msg_failed_delete_selected', 'msg_delete_success', 'msg_delete_success_except_following');
            });
        };

        /**
         * @description activate/deactivate entity type
         * @param entityType
         * @param $event
         */
        self.changeEntityTypeStatus = function (entityType, $event) {
            entityType = entityType.getEntityTypeId();
            return $http
                .put(urlService.entityTypes + '/change-status/' + entityType)
                .then(function (result) {
                    if (result.status === 200)
                        return true;
                    else
                        return false;
                })
                .catch(function (error) {
                    return false;
                });
        };

       /* /!**
         * @description Activate bulk of entityTypes
         * @param entityTypes
         * @param $event
         *!/
        self.activateBulkEntityTypes = function (entityTypes, $event) {
            var bulkIds = entityTypes[0].hasOwnProperty('id') ? _.map(entityTypes, id) : entityTypes;
            return $http
                .put(urlService.entityTypes + '/activate/bulk', bulkIds)
                .then(function (result) {
                    return generator.getBulkActionResponse(result, entityTypes, false, 'msg_failed_activate_selected', 'msg_success_activate_selected', 'msg_success_activate_selected_except_following');
                });
        };

        /!**
         * @description Deactivate bulk of entityTypes
         * @param entityTypes
         * @param $event
         *!/
        self.deactivateBulkEntityTypes = function (entityTypes, $event) {
            var bulkIds = entityTypes[0].hasOwnProperty('id') ? _.map(entityTypes, id) : entityTypes;
            return $http
                .put(urlService.entityTypes + '/deactivate/bulk', bulkIds)
                .then(function (result) {
                    return generator.getBulkActionResponse(result, entityTypes, false, 'msg_failed_deactivate_selected', 'msg_success_deactivate_selected', 'msg_success_deactivate_selected_except_following');
                });
        };*/

        /**
         * @description Checks if record with same name exists. Returns true if exists
         * @param entityType
         * @param editMode
         * @returns {boolean}
         */
        self.checkDuplicate = function (entityType, editMode) {
            var entityTypesToFilter = self.entityTypes;
            if (editMode) {
                entityTypesToFilter = _.filter(entityTypesToFilter, function (entityTypeToFilter) {
                    return entityTypeToFilter.id !== entityType.id;
                });
            }
            return _.some(_.map(entityTypesToFilter, function (existingEntity) {
                return existingEntity.arName === entityType.arName
                    || existingEntity.enName.toLowerCase() === entityType.enName.toLowerCase();
            }), function (matchingResult) {
                return matchingResult === true;
            });
        };

        /**
         * @description create the shared method to the model.
         * @type {{delete: generator.delete, update: generator.update}}
         * @private
         */
        self._sharedMethods = generator.generateSharedMethods(self.deleteEntityType, self.updateEntityType);

    })
};