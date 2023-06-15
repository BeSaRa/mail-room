module.exports = function (app) {
    app.controller('sidebarMenuDirectiveCtrl', function ($state,
                                                         LangWatcher,
                                                         //permissionProvider,
                                                         counterService,
                                                         sidebarService,
                                                         $timeout,
                                                         $scope,
                                                         userInfoService) {
        'ngInject';
        var self = this;
        self.controllerName = 'sidebarMenuDirectiveCtrl';
        self.counterService = counterService;
        LangWatcher($scope);

        self.navigateToLink = function (item, $event) {
            $event.preventDefault();
            if (!item.children.length) {
                $state.go(item.state);
                return;
            }
            var menu = angular.element('#menu-id-' + item.ID).children('ul');
            sidebarService.toggleMenuItem(item);
        };

        self.isCurrentState = function (item) {
            /*if (item.isReport) {
                return $state.includes(item.state, {reportName: item.report.reportName});
            } else {*/
                return $state.includes(item.state);
            //}
        };

        self.showMenuItem = function (item) {
            // check if user has permission to open the page
            return userInfoService.employeeHasPermissionTo(item);
        }
    });
};
