module.exports = function (app) {
    app.controller('toolbarDirectiveCtrl', function ($mdSidenav,
                                                     loadingIndicatorService,
                                                     sidebarService,
                                                     langService,
                                                     $mdMedia,
                                                     authenticationService,
                                                     $state,
                                                     helpService,
                                                     employeeService,
                                                     errorCode,
                                                     toast,
                                                     Entity,
                                                     userInfoService,
                                                     $window,
                                                     $location) {
        'ngInject';
        var self = this;
        self.controllerName = 'toolbarDirectiveCtrl';
        self.currentUser = userInfoService.getCurrentUser();
        self.employeeEntities = userInfoService.getCurrentUserEntities();

        self.loadingService = loadingIndicatorService;

        self.toggleSidebar = function (sidebarId) {
            $mdSidenav(sidebarId).toggle();
            /*if (sidebarId === 'right-sidebar' && !self.themeService.themes.length) {
                self.themeService.getThemes();
            }*/
        };

        self.toggleSidebarLocked = function (sidebarCode) {
            return sidebarService.getSidebar(sidebarCode).toggleLocked();
        };

        self.sizeXS = function () {
            return $mdMedia('xs');
        };

        /**
         * @description open help popup
         */
        self.openHelp = function () {
            helpService.openContextHelp();
        };

        /**
         * @description switch Entity
         * @returns {boolean}
         * @param entity
         */
        self.switchEntity = function (entity) {
            if (self.isCurrentEntity(entity))
                return true;

            authenticationService
                .selectEntityToLogin(entity)
                .then(function (result) {
                    self.employeeEntities = result.employeeEntites;
                    $state.reload();
                })
                .catch(function (error) {
                    toast.error(langService.get('error_change_entity'));
                });
        };


        /**
         * set direction for menu content
         * @param $event
         * @returns {string}
         */
        self.getPositionMode = function ($event) {
            var dir = langService.current === 'ar' ? 'left' : 'right';

            return dir + " bottom";
        };

        self.openUserEntityMenu = function ($mdMenu) {
            if (self.employeeEntities && self.employeeEntities.length > 1)
                $mdMenu.open();
        };

        /**
         * @description if the current entity is selected.
         * @returns {boolean}
         * @param entity
         */
        self.isCurrentEntity = function (entity) {
            if (!entity)
                return false;

            return entity.id === self.currentUser.currentEntity.id;
        };

        /**
         * @description logout current user
         */
        self.logout = function ($event) {
            authenticationService.logout(true, $event)
                .then(function () {
                    $state.go('login');
                });
        };

        /**
         * @description Opens the mail tracking in new tab
         * @param $event
         */
        self.openMailTracking = function ($event) {
            //var trackingUrl = $location.protocol() + "://" + $location.host() + ":" + $location.port() + "/#/tracking";
            var trackingUrl = location.origin + location.pathname + "#/tracking";
            $window.open(trackingUrl, '_blank');
        };

    });
};
