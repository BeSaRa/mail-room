module.exports = function (app) {
    app.controller('userMenuDirectiveCtrl', function ($timeout,
                                                      $state,
                                                      authenticationService,
                                                      toast,
                                                      langService,
                                                      userInfoService,
                                                      dialog,
                                                      errorCode) {
        'ngInject';
        var self = this;
        self.controllerName = 'userMenuDirectiveCtrl';
        self.currentUser = userInfoService.getCurrentUser();
        self.userInfoService = userInfoService;

        // selected status by default
        self.selectedStatus = {
            id: 1,
            title: 'Online',
            icon: 'check-circle',
            class: 'online-status'
        };

        self.statusList = [
            {
                id: 1,
                title: 'Online',
                icon: 'check-circle',
                class: 'online-status'
            },
            {
                id: 2,
                title: 'Away',
                icon: 'clock',
                class: 'away-status'
            },
            {
                id: 3,
                title: 'Do not Disturb',
                icon: 'minus-circle',
                class: 'disturb-status'
            },
            {
                id: 4,
                title: 'Invisible',
                icon: 'circle-outline',
                class: 'invisible-status'
            },
            {
                id: 5,
                title: 'Offline',
                icon: 'circle-outline',
                class: 'offline-status'
            }
        ];
        /**
         * select status from available status to set it selectedStatus variable .
         * @param status
         */
        self.selectStatus = function (status) {
            self.selectedStatus = status;
        };
        /**
         * to check if the given status selected
         * @param status
         * @return {boolean}
         */
        self.isStatusSelected = function (status) {
            return status.id === self.selectedStatus.id;
        };

        // deprecated method
        self.getOffset = function () {
            return '-15 0';
        };

        /**
         * @description switch organization
         * @param organization
         * @returns {boolean}
         */
        self.switchOrganization = function (organization) {
            /*if (self.isCurrentOrganization(organization))
                return true;

            authenticationService
                .selectEntityToLogin(organization)
                .then(function () {
                    $state.reload();
                })
                .catch(function (error) {
                    errorCode.checkIf(error, 'INACTIVE_USER_ENTITY', function () {
                        toast.error(langService.get('can_not_login_with_inactive_user_or_entity'));
                    });
                });*/
        };
        /**
         * @description if the current entity is selected.
         * @param entity
         * @returns {boolean}
         */
        /*self.isCurrentEntitySelected = function (entity) {
            if (!entity)
                return false;

            return entity.id === self.currentUser.currentEntity;
        };*/

        /**
         * logout employee
         */
        self.logout = function ($event) {
            authenticationService.logout(true, $event)
                .then(function () {
                    $state.go('login');
                });
        };

        /*
        @description change password
         */
        self.changePassword = function ($event) {
            authenticationService.openChangePasswordPopup(userInfoService.getCurrentUser(), false, false, $event)
                .then(function () {
                    dialog.successMessage(langService.get('msg_successfully_password_changed_with_logout')).then(function () {
                        authenticationService.logout(false, $event)
                            .then(function () {
                                $state.go('login');
                            });
                    });
                }).catch(function (error) {
                if (error === 'error_update_password')
                    toast.error(langService.get('error_update_password'))
            })
        };

        self.openUserMenu = function ($mdMenu) {
            $mdMenu.open();
        }
    });
};
