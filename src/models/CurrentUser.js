module.exports = function (app) {
    app.factory('CurrentUser', function (MailRoomModelInterceptor,
                                         langService,
                                         _,
                                         $q) {
        'ngInject';
        return function CurrentUser(model) {
            var self = this, $http, entityService;


            // every model has required fields
            // if you don't need to make any required fields leave it as an empty array
            var requiredFields = [];

            if (model)
                angular.extend(this, model);

            CurrentUser.prototype.setHttpService = function (service) {
                $http = service;
                return this;
            };
            /**
             * @description to set entity service when create the CurrentUser Model.
             * @param service
             * @return {CurrentUser}
             */
            CurrentUser.prototype.setEntityService = function (service) {
                entityService = service;
                return this;
            };

            /**
             * @description Get all required fields
             * @return {Array|requiredFields}
             */
            CurrentUser.prototype.getRequiredFields = function () {
                return requiredFields;
            };

            /**
             * @description Gets the concatenated current user name
             * @param separator
             * If passed, it will add separator between arabic and english names.
             * Otherwise it will add hyphen(-)
             * @returns {string}
             */
            CurrentUser.prototype.getNames = function (separator) {
                return this.arName + ' ' + (separator ? separator : '-') + ' ' + this.enName;
            };

            /**
             * @description Gets the current user name according to current language
             * @param reverse
             * If true, it will return name opposite to current language
             * @returns {string}
             */
            CurrentUser.prototype.getTranslatedName = function (reverse) {
                return langService.current === 'ar' ? (reverse ? this.enName : this.arName) : (reverse ? this.arName : this.enName);
            };


            CurrentUser.prototype._checkPermission = function (permissionKey) {
                var self = this;
                if (typeof permissionKey === 'function') {
                    return permissionKey(this);
                }

                var savedPermissions = self.getPermissions().sysPermissions;
                if (_.startsWith(permissionKey.toLowerCase(), 'ent')) {
                    savedPermissions = self.getPermissions().entityPermissions;
                }
                var result = _.find(savedPermissions, function (savedPermission) {
                    if (permissionKey === '') {
                        return true;
                    }

                    return savedPermission.permissionKey.toLowerCase().trim() === permissionKey.toLowerCase().trim();
                });

                return !!result;
            };

            /**
             * @description Set permission for current user
             * @param response
             * @return {Employee}
             */
            CurrentUser.prototype.setPermissions = function (response) {
                if (response.entityPermissions.length) {
                    if (response.entityPermissions[0].hasOwnProperty('permissions')) {
                        var currentEntityPermissions = _.find(response.entityPermissions, function (entityPermission) {
                            return entityPermission.id === self.currentEntity.id;
                        });

                        response.entityPermissions = currentEntityPermissions ? currentEntityPermissions.permissions : [];
                    }
                    else {
                        // we have current entity permissions only
                    }
                }

                this.entityPermissions = response.entityPermissions;
                this.sysPermissions = response.sysPermissions;
                this.employeeEntites = response.employeeEntites;
                return this;
            };

            /**
             * @description Get permissions for current user
             * @returns {{entityPermissions: *, sysPermissions: *}}
             */
            CurrentUser.prototype.getPermissions = function () {
                return {
                    entityPermissions: this.entityPermissions,
                    sysPermissions: this.sysPermissions
                };
            };

            /**
             * @description Set logged in entity for current user
             * @param currentEntity
             * @returns {CurrentUser}
             */
            CurrentUser.prototype.setCurrentEntity = function (currentEntity) {
                var self = this;
                if (typeof currentEntity === 'number') {
                    return entityService.loadEntityById(currentEntity, false)
                        .then(function (result) {
                            self.currentEntity = result;
                            return self;
                        });
                }
                else {
                    self.currentEntity = currentEntity;
                    return $q.resolve(self);
                }
            };

            /**
             * @description Get logged in entity for current user
             * @returns {{entityPermissions: *, sysPermissions: *}}
             */
            CurrentUser.prototype.getCurrentEntity = function () {
                return this.currentEntity;
            };

            /**
             * to check if the current user has permission
             * @param permissionKey
             * @param debug
             * @return {boolean}
             */
            CurrentUser.prototype.hasPermissionTo = function (permissionKey, debug) {
                if (debug)
                    debugger;
                    //console.log(permissionKey);
                return this._checkPermission(permissionKey);
            };

            /**
             * @description Check if the given permission collection found in current user or not.
             * @param permissions
             * @return {boolean}
             */
            CurrentUser.prototype.hasThesePermissions = function (permissions) {
                var self = this;
                permissions = angular.isArray(permissions) ? permissions : [permissions];
                return !_.some(_.map(permissions, function (permission) {
                    return self.hasPermissionTo(permission);
                }), function (item) {
                    return !item;
                });
            };

            /**
             * @description if the current user has at least one of these permissions.
             * @param permissions
             * @return {boolean}
             */
            CurrentUser.prototype.hasAnyPermissions = function (permissions) {
                var self = this;
                return _.some(_.map(permissions, function (permission) {
                    return self.hasPermissionTo(permission);
                }), function (item) {
                    return !!item;
                });
            };

            // don't remove MailRoomModelInterceptor from last line
            // should be always at last thing after all methods and properties.
            MailRoomModelInterceptor.runEvent('CurrentUser', 'init', this);
        }
    })
};