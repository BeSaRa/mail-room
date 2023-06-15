module.exports = function (app) {
    app.controller('gridActionsDirectiveCtrl', function ($q,
                                                         $scope,
                                                         langService,
                                                         _,
                                                         Lookup,
                                                         $timeout) {
        'ngInject';
        var self = this;
        self.controllerName = 'gridActionsDirectiveCtrl';
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
         * @description Checks if actions will be shown or not
         * @param action
         * @returns {*}
         */
        self.isShowAction = function (action) {
            return action.checkShow(action, self.model);
        };

        /**
         * @description Get the text of action according to selected language
         * @param action
         * @param isShortcutRequest
         */
        self.getActionText = function (action, isShortcutRequest) {
            var langKey = "";
            if (action.hasOwnProperty('textCallback') && angular.isFunction(action.textCallback)) {
                return langService.get(action.textCallback(self.model));
            }

            if (angular.isFunction(action.text)) {
                if (isShortcutRequest)
                    langKey = action.text(self.model).shortcutText;
                else
                    langKey = action.text(self.model).contextText;
            }
            else {
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
                action.callback(self.model, action.grid(), action.params, $event);
            }
            else {
                action.callback(self.model, action.grid(), $event);
            }
        };

        /**
         * @description Filters the action buttons for showing/hiding shortcut actions
         * It will skip the separators
         * @returns {Array}
         */
        self.filterShortcuts = function (direction) {
            self.shortcutActions = [];
            var mainAction, action;
            direction = direction || self.menuDirection;
            for (var i = 0; i < self.gridActions.length; i++) {
                mainAction = self.gridActions[i];
                if (direction === 'vertical') {
                    action = _filterVerticalShortcuts(mainAction);
                }
                else {
                    action = _filterHorizontalShortcuts(mainAction);
                }
                if (action) {
                    angular.isArray(action) ? self.shortcutActions = self.shortcutActions.concat(action) : self.shortcutActions.push(action);
                }
            }
        };

        /**
         * @description Filter the actions to be shown in horizontal direction depending on permissions and values.
         * It will skip the separators
         * @param mainAction
         * @returns {*}
         * Returns the array of actions(main or sub menu action) or false.
         * @private
         */
        function _filterHorizontalShortcuts(mainAction) {
            if (mainAction.hasOwnProperty('subMenu') && angular.isArray(mainAction.subMenu) && mainAction.subMenu.length) {
                if (self.isShowAction(mainAction)) {
                    var shortcutActions = [], subAction;
                    for (var k = 0; k < mainAction.subMenu.length; k++) {
                        subAction = mainAction.subMenu[k];
                        if (subAction.type.toLowerCase() === "action" && self.isShowAction(subAction)) {
                            if (!!self.shortcut) {
                                if (subAction.hasOwnProperty('shortcut') && subAction.shortcut) {
                                    shortcutActions.push(subAction);
                                }
                            }
                            else {
                                shortcutActions.push(subAction);
                            }
                        }
                    }
                    return shortcutActions;
                }
                return false;
            }
            else {
                if (mainAction.type.toLowerCase() === "action" && self.isShowAction(mainAction)) {
                    if (!!self.shortcut) {
                        if (mainAction.hasOwnProperty('shortcut') && mainAction.shortcut) {
                            return mainAction;
                        }
                        return false;
                    }
                    else {
                        return mainAction;
                    }
                }
                else {
                    return false;
                }
            }
        }

        /**
         * @description Filter the actions to be shown in vertical direction depending on permissions and values.
         * It will include the separators
         * @param mainAction
         * @returns {*}
         * Returns the main action.
         * If there is no sub menu, main action will be returned.
         * If there is sub menu, sub menu array will be replaced with available sub menus according to permissions and values and main action will be returned;
         * If no condition matches, return false;
         * @private
         */
        function _filterVerticalShortcuts(mainAction) {
            /*
            * if main action has subMenu and subMenu has length
            * else main action doesn't have subMenu
            * */
            if (mainAction.hasOwnProperty('subMenu') && angular.isArray(mainAction.subMenu) && mainAction.subMenu.length) {
                if (self.isShowAction(mainAction)) {
                    var subActionsToShow = [];
                    for (var j = 0; j < mainAction.subMenu.length; j++) {
                        var subAction = mainAction.subMenu[j];
                        /*If sub menu has separator, show it in vertical only. not in horizontal*/
                        if (subAction.type.toLowerCase() === "action" && self.isShowAction(subAction)) {
                            if (!!self.shortcut) {
                                if (subAction.hasOwnProperty('shortcut') && subAction.shortcut) {
                                    subActionsToShow.push(subAction);
                                }
                            }
                            else {
                                subActionsToShow.push(subAction);
                            }
                        }
                        else if (subAction.type.toLowerCase() === "separator" && !subAction.hide) {
                            subActionsToShow.push(subAction);
                        }
                    }
                    if (subActionsToShow.length) {
                        mainAction.subMenu = subActionsToShow;
                        return mainAction;
                    }
                    else {
                        return false;
                    }
                }
                return false;
            }
            else {
                /*
                * If main menu is of type "action", check if its allowed to show
                * else if main menu is of type "separator", and separator is allowed to show(not hidden)
                * else nothing(return false)
                * */
                if (mainAction.type.toLowerCase() === "action" && self.isShowAction(mainAction)) {
                    /*
                    * If shortcut is passed true in directive, this means, we need to show only shortcut actions
                    * else show all actions
                    * */
                    if (!!self.shortcut) {
                        if (mainAction.hasOwnProperty('shortcut') && mainAction.shortcut) {
                            return mainAction;
                        }
                        return false;
                    }
                    else {
                        return mainAction;
                    }
                }
                else if (mainAction.type.toLowerCase() === 'separator' && !mainAction.hide) {
                    return mainAction;
                }
                else {
                    return false;
                }
            }
        }

        /**
         * @description Filters the action buttons for showing/hiding context menu actions
         * @returns {Array}
         */
        self.filterContextMenuItems = function () {
            var contextMenu, contextMenuActions = [];
            for (var i = 0; i < self.gridActions.length; i++) {
                contextMenu = _filterContextMenuActions(self.gridActions[i]);
                if (contextMenu) {
                    angular.isArray(contextMenu) ? contextMenuActions = contextMenuActions.concat(contextMenu) : contextMenuActions.push(contextMenu);
                }
                //return !gridAction.hide && !(gridAction.hasOwnProperty('onlyShortcut') && gridAction.onlyShortcut);
            }
            return contextMenuActions;
        };

        function _filterContextMenuActions(mainAction) {
            /*
            * if main action has subMenu and subMenu has length
            * else main action doesn't have subMenu
            * */
            if (mainAction.hasOwnProperty('subMenu') && angular.isArray(mainAction.subMenu) && mainAction.subMenu.length) {
                if (self.isShowAction(mainAction)) {
                    var subActionsToShow = [];
                    for (var j = 0; j < mainAction.subMenu.length; j++) {
                        var subAction = mainAction.subMenu[j];
                        /*If sub menu is action, and action is allowed to show, show it
                        * If sub menu is separator and not hidden, show it
                        * If sub menu is document info, and info is allowed to show, show it
                        * */
                        if (subAction.type.toLowerCase() === "action" && self.isShowAction(subAction)) {
                            if (!(mainAction.hasOwnProperty('onlyShortcut') && mainAction.onlyShortcut)) {
                                subActionsToShow.push(subAction);
                            }
                        }
                        else if (subAction.type.toLowerCase() === "separator" && !subAction.hide) {
                            subActionsToShow.push(subAction);
                        }
                        else if (subAction.type.toLowerCase() === 'info' && self.isShowAction(subAction)) {
                            subActionsToShow.push(subAction);
                        }
                    }
                    if (subActionsToShow.length) {
                        mainAction.subMenu = subActionsToShow;
                        return mainAction;
                    }
                    else {
                        return false;
                    }
                }
                return false;
            }
            else {
                /*
                * If main menu is of type "action", check if its allowed to show
                * else if main menu is of type "separator", and separator is allowed to show(not hidden)
                * else nothing(return false)
                * */
                if (mainAction.type.toLowerCase() === "action" && self.isShowAction(mainAction)) {
                    /*
                    * If onlyShortcut is true in action, this means, we need not to show action
                    * else show action
                    * */
                    if (mainAction.hasOwnProperty('onlyShortcut') && mainAction.onlyShortcut) {
                        return false;
                    }
                    return mainAction;
                }
                else if (mainAction.type.toLowerCase() === 'separator' && !mainAction.hide) {
                    return mainAction;
                }
                else if (mainAction.type.toLowerCase() === 'text' && self.isShowAction(mainAction)) {
                    return mainAction;
                }
                else {
                    return false;
                }
            }
        }

        /**
         * @description Initialize and filter the shortcut actions.
         */
        $timeout(function () {
            self.filterShortcuts();
        });

        /**
         * @description Opens the grid shortcut menu
         * @param $mdMenu
         */
        self.openShortcutMenu = function ($mdMenu) {
            $mdMenu.open();
        };

        /**
         * @description Gets the information about the record
         */
        self.getRecordInfo = function (action, keyToFind) {
            return action[keyToFind];
        };

        /**
         * @description Filter the shortcut actions for each model change/digest.
         */
        $scope.$watch(function () {
            return self.model;
        }, function () {
            self.filterShortcuts();
        });
    });
};	