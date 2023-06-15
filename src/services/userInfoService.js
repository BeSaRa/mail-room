module.exports = function (app) {
    app.service('userInfoService', function ($cookies,
                                             generator,
                                             MailRoomModelInterceptor,
                                             CurrentUser,
                                             permission,
                                             LoginResponse,
                                             EmployeePermission,
                                             Entity,
                                             EntityPermission) {
        'ngInject';
        var self = this, currentUser = null,
            userCookieKey = 'MRUser';
        self.serviceName = 'userInfoService';

        /**
         * @description Get the current user from cookies
         * @return {CurrentUser}
         * @private
         */
        function _getCurrentUserFromCookie() {
            var currentUserCookie = $cookies.get(userCookieKey);
            return currentUserCookie ? new CurrentUser(currentUserCookie) : currentUserCookie;
        }

        /**
         *@description Destroy current user data with cookies and cached
         * @private
         */
        function _destroyCurrentUserCookie() {
            currentUser = null;
            $cookies.remove(userCookieKey);
        }

        /**
         * @description Create current user cookie and cached data
         * @param result
         * @return {*}
         * @private
         */
        function _createCurrentUserCookie(result) {
            currentUser = generator.interceptReceivedInstance('CurrentUser', new CurrentUser(result.employee));
            // set current entity for logged in employee.
            currentUser.setCurrentEntity(result.currentEntity)
                .then(function (currentUser) {
                    currentUser.setPermissions(result); // set permissions
                });

            return self;
        }

        /**
         * @description Set current user to cookie and save it as private variable inside the service
         * @return CurrentUser
         * @param result
         */
        self.setCurrentUser = function (result) {
            var response = angular.copy(result);
            if (response instanceof EmployeePermission) {
                response = new LoginResponse({
                    employee: response.employee,
                    sysPermissions: response.permissions,
                    entityPermissions: currentUser.getPermissions().entityPermissions,
                    currentEntity: currentUser.getCurrentEntity(),
                    employeeEntites: response.entityPermissions
                })
            }

            else if (response instanceof Entity) {
                response = new LoginResponse({
                    employee: self.getCurrentUser(),
                    sysPermissions: currentUser.getPermissions().sysPermissions,
                    entityPermissions: currentUser.getPermissions().entityPermissions,
                    currentEntity: response,
                    employeeEntites: response.entityPermissions
                })
            }

            else if (response instanceof EntityPermission) {
                response = new LoginResponse({
                    employee: self.getCurrentUser(),
                    sysPermissions: currentUser.getPermissions().sysPermissions,
                    entityPermissions: response.permissions,
                    currentEntity: currentUser.getCurrentEntity(),
                    employeeEntites: response.permissions
                })
            }
            // create instance from CurrentUser Model.
            return _createCurrentUserCookie(response);
        };

        /**
         * @description Get current user from service or get it from cookie if found
         * @return {CurrentUser | null }
         */
        self.getCurrentUser = function () {
            return currentUser ? currentUser : _getCurrentUserFromCookie();
        };

        self.getTranslatedName = function () {
            return currentUser ? currentUser.getTranslatedName() : null;
        };
        /**
         * @description Destroy current user data
         */
        self.destroyCurrentUser = function () {
            _destroyCurrentUserCookie();
        };

        /**
         * @description Checks if the given employee or id is the current user.
         * @param employee
         */
        self.isCurrentEmployee = function (employee) {
            var id = employee.hasOwnProperty('id') ? employee.getEmployeeId() : employee;
            return currentUser.id === id;
        };

        /**
         * @description Checks if the given entity or id is the current user entity.
         * @param entity
         */
        self.isCurrentEntity = function (entity) {
            var id = entity.hasOwnProperty('id') ? entity.getEntityId() : entity;
            return currentUser.currentEntity.id === id;
        };

        /**
         * @description Check if current user has permission to this menu item
         * @param menuItem
         * @return {boolean}
         */
        self.employeeHasPermissionTo = function (menuItem) {
            var item = permission.getMenuPermissions(menuItem);
            var method = item.type === 'item' ? 'hasThesePermissions' : 'hasAnyPermissions';
            if (!currentUser)
                return false;
            return currentUser[method](item.permissions);
        };

        /**
         * @description expose has permission to from CurrentUser Model
         * @param permission
         * @returns {*}
         */
        self.hasPermissionTo = function (permission) {
            return currentUser ? currentUser.hasPermissionTo.apply(currentUser, arguments) : false;
        };

        self.getCurrentUserEntities = function () {
          return currentUser.employeeEntites;
        };
    })
};