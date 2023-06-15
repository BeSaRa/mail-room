module.exports = function (app) {
    app.controller('gridBulkActionsDirectiveCtrl', function ($q,
                                                             $scope,
                                                             langService,
                                                             _,
                                                             Lookup,
                                                             $timeout,
                                                             userInfoService) {
        'ngInject';
        var self = this;
        self.controllerName = 'gridBulkActionsDirectiveCtrl';
        self.langService = langService;

        self.shortcutActions = [];

        self.actionTypes = {
            text: 'text',
            info: 'info',
            separator: 'separator',
            action: 'action'
        };
        self.isActionOfType = function (action, typeToCheck) {
            return action.type.toLowerCase() === typeToCheck;
        };

        /**
         * @description Get the text of action according to selected language
         * @param action
         */
        self.getActionText = function (action) {
            var langKey = "";
            if (action.hasOwnProperty('textCallback') && angular.isFunction(action.textCallback)) {
                return langService.get(action.textCallback(self.model));
            }

            if (angular.isFunction(action.text)) {
                langKey = action.text(self.model).contextText;
            } else {
                langKey = action.text;
            }
            if (action.type === 'text')
                return langKey;
            return langService.get(langKey);
        };

        /**
         * @description Process the callback for the action button
         * @param action
         * @param $event
         */
        self.processMenu = function (action, $event) {
            if (action.type.toLowerCase() === 'text')
                return false;

            if (action.hasOwnProperty('params') && action.params) {
                action.callback(action.grid(), action.params, $event);
            } else {
                action.callback(action.grid(), $event);
            }
        };

        /**
         * @description Checks if the action has sub menu
         * @returns {boolean}
         */
        self.hasSubMenu = function (action) {
            return (action.hasOwnProperty('subMenu') && angular.isArray(action.subMenu) && action.subMenu.length);
        };

        self.openBulkActionMenu = function ($mdMenu, $event) {
            $mdMenu.open($event);
        };

        self.isShowAction = function (action) {
            if (action.hide) {
                return false;
            }
            return action.checkShow() && (action.permissionKey ? userInfoService.getCurrentUser().hasPermissionTo(action.permissionKey) : true);
        }
    });
};	
