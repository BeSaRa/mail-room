module.exports = function (app) {
    app.service('permissionService', function ($http,
                                               urlService,
                                               generator,
                                               $q,
                                               _,
                                               Permission) {
        'ngInject';
        var self = this;

        self.permissions = [];

        var _categorizePermissions = function () {
            var permissionsCategorized = {
                system: [],
                entity: [],
            };
            _.map(self.permissions, function (permission) {
                if (_.startsWith(permission.permissionKey.toLowerCase(), 'sys')) {
                    permissionsCategorized.system.push(permission);
                }
                else {
                    permissionsCategorized.entity.push(permission);
                }
                return permission;
            });
            return permissionsCategorized;
        };

        /**
         * @description Load the system permissions from server.
         * @returns {Promise|permissions}
         */
        self.loadPermissions = function () {
            return $http.get(urlService.permissions)
                .then(function (result) {
                    self.permissions = generator.generateCollection(result.data, Permission, self._sharedMethods);
                    self.permissions = generator.interceptReceivedCollection('Permission', self.permissions);
                    self.permissions = _categorizePermissions();
                    return self.permissions;
                })
                .catch(function (error) {
                    return [];
                });
        };

        /**
         * @description Get permissions from self.permissions if found and if not load it from server again.
         * @returns {Promise|permissions}
         */
        self.getPermissions = function () {
            return self.permissions.length ? $q.when(self.permissions) : self.loadPermissions();
        };

        /**
         * @description Checks if record with same name exists. Returns true if exists
         * @param permission
         * @param editMode
         * @returns {boolean}
         */
        self.checkDuplicate = function (permission, editMode) {
            var permissionsToFilter = self.employees;
            if (editMode) {
                permissionsToFilter = _.filter(permissionsToFilter, function (permissionToFilter) {
                    return permissionToFilter.id !== permission.id;
                });
            }
            return _.some(_.map(permissionsToFilter, function (existingPermission) {
                return existingPermission.arName === permission.arName
                    || existingPermission.enName.toLowerCase() === permission.enName.toLowerCase();
            }), function (matchingResult) {
                return matchingResult === true;
            });
        };

        /**
         * @description create the shared method to the model.
         * @type {{delete: generator.delete, update: generator.update}}
         * @private
         */
        self._sharedMethods = generator.generateSharedMethods(self.deletePermission, self.updatePermission);

    })
};