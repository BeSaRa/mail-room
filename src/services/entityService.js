module.exports = function (app) {
    app.service('entityService', function (urlService, generator, $q, _, $http, dialog, Entity, mailRoomTemplate, langService, EmployeePermission, toast, userInfoService) {
        'ngInject';
        var self = this;

        self.entities = [];
        self.allEntities = [];
        self.categorizedEntities = {};

        /**
         * @description Load the entities from server.
         * @returns {Promise|entities}
         */
        self.loadEntities = function ($event) {
            return $http.get(urlService.entities)
                .then(function (result) {
                    self.entities = generator.generateCollection(result.data, Entity, self._sharedMethods);
                    self.entities = generator.interceptReceivedCollection('Entity', self.entities);
                    _categorizeEntitiesByIntegratedSystem(self.entities);
                    return self.entities;
                })
                .catch(function (error) {
                    return [];
                });
        };

        function _categorizeEntitiesByIntegratedSystem(entities) {
            entities.map((entity) => {
                if (!self.categorizedEntities.hasOwnProperty(entity.integratedSystemId)) {
                    self.categorizedEntities[entity.integratedSystemId] = [];
                }
                self.categorizedEntities[entity.integratedSystemId].push(entity);
            })
        }

        /**
         * @description Get entities from self.entities if found and if not load it from server again.
         * @returns {Promise|entities}
         */
        self.getEntities = function ($event) {
            return self.entities.length ? $q.when(self.entities) : self.loadEntities($event);
        };

        /**
         * @description Load the all entities and departments from server.
         * @returns {Promise|entities}
         */
        self.loadAllEntities = function ($event) {
            return $http.get(urlService.entities + '?all=true')
                .then(function (result) {
                    self.allEntities = generator.generateCollection(result.data, Entity, self._sharedMethods);
                    self.allEntities = generator.interceptReceivedCollection('Entity', self.allEntities);
                    return self.allEntities;
                })
                .catch(function (error) {
                    return [];
                });
        };

        /**
         * @description get all entities
         * @param $event
         * @returns {*|Promise|entities}
         */
        self.getAllEntities = function ($event) {
            return self.allEntities.length ? $q.when(self.allEntities) : self.loadAllEntities($event);
        }

        /**
         * @description Loads the entity from database by id.
         * @param {Entity | number} entityId
         * @param {boolean} updateEntities
         * Indicates if newly fetched entity will be updated in the existing entities list.
         * @returns {Entity}
         */
        self.loadEntityById = function (entityId, updateEntities) {
            entityId = entityId instanceof Entity ? entityId.id : entityId;
            return $http.get(urlService.entities + '/' + entityId)
                .then(function (result) {
                    result = generator.generateInstance(result.data, Entity, self._sharedMethods);
                    result = generator.interceptReceivedInstance('Entity', result);
                    if (updateEntities) {
                        if (self.entities.length) {
                            self.entities = _.map(self.entities, function (entity) {
                                if (entity.id === result.id) {
                                    entity = result;
                                }
                                return entity;
                            });
                        } else {
                            self.entities.push(result);
                        }
                    }
                    return result;
                })
                .catch(function (error) {

                });
        };

        /**
         * @description Gets the entity from existing entities by id.
         * If entities list is empty, it will fetch from server and find entity by id.
         * @param {Entity | number} entityId
         * @param {boolean} fetchNew
         * Indicates if entity will be fetched from server instead of finding from existing list of entities.
         * @param {boolean} updateEntitiesIfFetchNew
         * Indicates if newly fetched entity will be updated in the existing entities list.
         * It is used if fetchNew = true
         * @returns {Entity}
         */
        self.getEntityById = function (entityId, fetchNew, updateEntitiesIfFetchNew) {
            entityId = entityId instanceof Entity ? entityId.id : entityId;
            if (!entityId) {
                return null;
            }
            if (fetchNew) {
                return self.loadEntityById(entityId, updateEntitiesIfFetchNew)
                    .then(function (result) {
                        return result;
                    })
                    .catch(function (error) {

                    });
            } else {
                return _.find(self.entities, function (entity) {
                    return Number(entity.id) === Number(entityId);
                });
            }
        };

        /**
         * @description get entity by Ref Id
         * @param refId
         * @returns {*}
         */
        self.getEntityByReferenceId = function (refId) {
            refId = refId instanceof Entity ? refId.refId : refId;
            return _.find(self.entities, function (entity) {
                if (!entity.refId || !refId) {
                    return false;
                }
                return ('' + entity.refId).trim().toLowerCase() === ('' + refId).trim().toLowerCase();
            });

        };

        /**
         * @description get department by id
         * @param departmentId
         */
        self.getDepartmentById = function (departmentId) {
            departmentId = (departmentId.hasOwnProperty("id")) ? Number(departmentId.id) : Number(departmentId);
            if (!departmentId) {
                return null;
            }
            return _.find(self.departments, function (departmentId) {
                return departmentId === Number(departmentId.id)
            });
        }

        /**
         * @description get department by Ref Id
         * @param refId
         */
        self.getDepartmentByReferenceId = function (refId) {
            refId = refId instanceof Entity ? refId.refId : refId;
            refId = (refId.hasOwnProperty("refId")) ? Number(refId.refId) : refId;

            return _.find(self.departments, function (department) {
                if (!department.refId || !refId) {
                    return false;
                }
                return ('' + department.refId).trim().toLowerCase() === ('' + refId).trim().toLowerCase();
            });
        }

        /**
         * @description Contains methods for CRUD operations for entities
         */
        self.controllerMethod = {
            addDialog: function (parentEntity, integratedSystemId, $event) {
                var entity = new Entity();
                if (parentEntity) {
                    entity.parentId = parentEntity.getEntityId();
                    entity.entityTypeId = parentEntity.getEntityTypeId();
                    entity.rootId = parentEntity.getEntityId();
                    entity.isUseSystem = parentEntity.checkIsUseSystem();
                }
                entity.integratedSystemId = integratedSystemId;
                return dialog
                    .showDialog({
                        targetEvent: $event,
                        template: mailRoomTemplate.getPopup('entity'),
                        controller: 'entityPopCtrl',
                        controllerAs: 'ctrl',
                        locals: {
                            editMode: false,
                            entity: entity,
                            entityEmployees: [],
                            departments: [],
                            parentEntity: parentEntity
                        }
                    })
            }, editDialog: function (entity, parentEntity, $event) {
                return dialog
                    .showDialog({
                        targetEvent: $event,
                        template: mailRoomTemplate.getPopup('entity'),
                        controller: 'entityPopCtrl',
                        controllerAs: 'ctrl',
                        locals: {
                            editMode: true, entity: angular.copy(entity), parentEntity: parentEntity
                        }/*,
                        resolve: {
                            entityEmployees: function () {
                                'ngInject';
                                return self.employeeMethods.loadEmployeesByEntityId(entity.getEntityId())
                            },
                            departments: function () {
                                'ngInject';
                                return self.loadDepartmentsByParentId(entity.getEntityId());
                            }
                        }*/
                    })
            }, delete: function (entity, $event) {
                return dialog.confirmMessage(langService.get('msg_confirm_delete').change({name: entity.getNames()}))
                    .then(function () {
                        return self.deleteEntity(entity);
                    });
            }, deleteBulk: function (entities, $event) {
                return dialog.confirmMessage(langService.get('msg_confirm_delete_selected_multiple'))
                    .then(function () {
                        return self.deleteBulkEntities(entities);
                    });
            }
        };

        /**
         * @description Adds new entity
         * @param entity
         * @returns {*}
         */
        self.addEntity = function (entity) {
            return $http.post(urlService.entities, generator.interceptSendInstance('Entity', entity))
                .then(function (result) {
                    result = generator.generateInstance(result.data, Entity, self._sharedMethods);
                    return generator.interceptReceivedInstance('Entity', result);
                })
                .catch(function (error) {
                    if (error && error.data.message === 'ENTITY_CODE_EXIST') {
                        toast.error(langService.get('error_name_code_duplicate'))
                    }
                    return $q.reject();
                });
        };

        /**
         * @description Update the given entity.
         * @param entity
         * @returns {*}
         */
        self.updateEntity = function (entity) {
            var id = entity.getEntityId();
            return $http.put(urlService.entities + '/' + id, generator.interceptSendInstance('Entity', entity))
                .then(function (result) {
                    result = generator.generateInstance(result.data, Entity, self._sharedMethods);
                    result = generator.interceptReceivedInstance('Entity', result);

                    if (userInfoService.isCurrentEntity(result)) userInfoService.setCurrentUser(result);
                    return result;
                })
                .catch(function (error) {
                    if (error && error.data.message === 'ENTITY_CODE_EXIST') {
                        toast.error(langService.get('error_name_code_duplicate'))
                    }
                    return $q.reject();
                });
        };

        /**
         * @description Delete given entity.
         * @param entity
         * @returns {HttpPromise}
         */
        self.deleteEntity = function (entity) {
            entity = entity.getEntityId();
            return $http.delete(urlService.entities + '/' + entity)
                .then(function (result) {
                    if (result.status === 200) return true; else {
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
         * @description delete bulk entities.
         * @param entities
         * @return {Promise|null}
         */
        self.deleteBulkEntities = function (entities) {
            var bulkIds = entities[0].hasOwnProperty('id') ? _.map(entities, 'id') : entities;
            return $http({
                method: 'DELETE', headers: {
                    'Content-Type': 'application/json'
                }, url: urlService.entities + '/bulk', data: bulkIds
            }).then(function (result) {
                return generator.getBulkActionResponse(result, entities, false, 'msg_failed_delete_selected', 'msg_delete_success', 'msg_delete_success_except_following');
            });
        };

        /**
         * @description activate/deactivate entity
         * @param entity
         * @param $event
         */
        self.changeEntityStatus = function (entity, $event) {
            entity = entity.getEntityId();
            return $http
                .put(urlService.entities + '/change-status/' + entity)
                .then(function (result) {
                    if (result.status === 200) return true; else return false;
                })
                .catch(function (error) {
                    return false;
                });
        };

        /**
         * @description activate/deactivate isUserSystem
         * @param entity
         * @param $event
         */
        self.changeIsUseSystem = function (entity, $event) {
            entity = entity.getEntityId();
            return $http
                .put(urlService.entities + '/change-use-system/' + entity)
                .then(function (result) {
                    return result.status === 200;
                })
                .catch(function (error) {
                    return false;
                });
        };

        /**
         * @description Activate bulk of entities
         * @param entities
         * @param $event
         */
        self.activateBulkEntities = function (entities, $event) {
            var bulkIds = entities[0].hasOwnProperty('id') ? _.map(entities, id) : entities;
            return $http
                .put(urlService.entities + '/activate/bulk', bulkIds)
                .then(function (result) {
                    return generator.getBulkActionResponse(result, entities, false, 'msg_failed_activate_selected', 'msg_success_activate_selected', 'msg_success_activate_selected_except_following');
                });
        };

        /**
         * @description Deactivate bulk of entities
         * @param entities
         * @param $event
         */
        self.deactivateBulkEntities = function (entities, $event) {
            var bulkIds = entities[0].hasOwnProperty('id') ? _.map(entities, id) : entities;
            return $http
                .put(urlService.entities + '/deactivate/bulk', bulkIds)
                .then(function (result) {
                    return generator.getBulkActionResponse(result, entities, false, 'msg_failed_deactivate_selected', 'msg_success_deactivate_selected', 'msg_success_deactivate_selected_except_following');
                });
        };

        /**
         * @description Checks if record with same name exists. Returns true if exists
         * @param entity
         * @param editMode
         * @returns {boolean}
         */
        self.checkDuplicate = function (entity, editMode) {
            var entitiesToFilter = entity.hasParentEntity() ? self.departments : self.entities;
            if (editMode) {
                entitiesToFilter = _.filter(entitiesToFilter, function (entityToFilter) {
                    return entityToFilter.id !== entity.id;
                });
            }
            return _.some(_.map(entitiesToFilter, function (existingEntity) {
                return existingEntity.arName === entity.arName || existingEntity.enName.toLowerCase() === entity.enName.toLowerCase() || (existingEntity.entityCode && existingEntity.entityCode.toLowerCase() === entity.entityCode.toLowerCase());
            }), function (matchingResult) {
                return matchingResult === true;
            });
        };

        /**
         * @description Contains the methods available for employee operations on entity
         */
        self.employeeMethods = {
            /**
             * @description Get the employees for the given entity
             * @param entityId
             * @returns {*}
             */
            loadEmployeesByEntityId: function (entityId, $event) {
                entityId = entityId.hasOwnProperty('id') ? entityId.id : entityId;
                return $http.get(urlService.entities + '/' + entityId + '/employees')
                    .then(function (result) {
                        result = generator.generateCollection(result.data, EmployeePermission);
                        result = generator.interceptReceivedCollection('EmployeePermission', result);
                        return result;
                    });
            }, /**
             * @description Adds new entityEmployee
             * @param entityEmployee
             * @param model
             * @param $event
             * @returns {*}
             */
            addEmployeeToEntity: function (entityEmployee, model, $event) {
                var employeeId = entityEmployee.getEmployeeId();
                return $http.post(urlService.employees + '/' + employeeId + '/entities', model)
                    .then(function (result) {
                        return result.status === 200;
                    });
            }, /**
             * @description Updates existing entityEmployee
             * @param entityEmployee
             * @param model
             * @param $event
             * @returns {*}
             */
            updateEntityEmployee: function (entityEmployee, model, $event) {
                var employeeId = entityEmployee.getEmployeeId();
                return $http.put(urlService.employees + '/' + employeeId + '/entities', model)
                    .then(function (result) {

                        if (userInfoService.isCurrentEntity(model.id) && userInfoService.isCurrentEmployee(employeeId)) userInfoService.setCurrentUser(model);

                        return result.status === 200;
                    });
            }, /**
             * @description Removes the existing entityEmployee
             * @param entityEmployee
             * @param entityId
             * @returns {*}
             */
            removeEntityEmployee: function (entityEmployee, entityId) {
                return dialog.confirmMessage(langService.get('msg_confirm_delete').change({name: entityEmployee.getNames()}))
                    .then(function () {
                        var entityEmployeeId = entityEmployee.getEmployeeId();
                        return self.employeeMethods.removeEmployeeCallback(entityEmployeeId, entityId)
                            .then(function (result) {
                                if (result) {
                                    toast.success(langService.get("msg_delete_specific_success").change({name: entityEmployee.getNames()}));
                                }
                                return result;
                            })
                    });
            }, /**
             * @description Remove existing entityEmployee callback
             * @param entityEmployeeId
             * @param entityId
             * @returns {*}
             */
            removeEmployeeCallback: function (entityEmployeeId, entityId) {
                return $http.delete(urlService.employees + '/' + entityEmployeeId + '/entities/' + entityId)
                    .then(function (result) {
                        if (result.status === 200) return true;
                        return false;
                    })
                    .catch(function (error) {
                        return false;
                    });
            }
        };

        /**
         * @description Loads the departments by parent entity Id
         * @param parentId
         * @param $event
         * @returns {*}
         */
        self.departments = [];
        self.loadDepartmentsByParentId = function (parentId, $event) {
            if (!parentId) {
                return $q.resolve([]);
            }
            parentId = parentId.hasOwnProperty('id') ? parentId.getEntityId() : parentId;
            return $http.get(urlService.entities + '?parentId=' + parentId)
                .then(function (result) {
                    result = generator.generateCollection(result.data, Entity, self._sharedMethods);
                    result = generator.interceptReceivedCollection('Entity', result);
                    self.departments = result;
                    return result;
                })
                .catch(function (error) {
                    return [];
                });
        };

        self.clearDepartments = function () {
            self.departments = [];
            return self.departments;
        };

        /**
         * @description create the shared method to the model.
         * @type {{delete: generator.delete, update: generator.update}}
         * @private
         */
        self._sharedMethods = generator.generateSharedMethods(self.deleteEntity, self.updateEntity);

    })
};
