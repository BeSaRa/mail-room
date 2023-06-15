module.exports = function (app) {
    app.service('gridService', function (_,
                                         $filter,
                                         langService,
                                         userInfoService) {
        'ngInject';
        var self = this;
        self.serviceName = 'gridService';

        /**
         * @description Determines the scope of the grid to be server side or client side
         * @type {{client: string, server: string}}
         */
        self.gridScope = {
            client: 'client',
            server: 'server'
        };

        /**
         * @description Checks if the grid scope is server side
         * @param scope
         * @returns {boolean}
         */
        self.isGridServerScope = function (scope) {
            return scope === self.gridScope.server;
        };

        /**
         * @description Resets grid sorting
         * @param grid
         * @param overrideSortKey
         * @param clearSort
         * @returns {*}
         */
        self.resetSorting = function (grid, overrideSortKey, clearSort) {
            grid.order = clearSort ? '' : (overrideSortKey ? overrideSortKey : grid.order);
            return grid;
        };

        /**
         * @description Resets grid search text
         * @param grid
         * @returns {*}
         */
        self.resetSearchText = function (grid) {
            grid.searchText = '';
            return grid;
        };

        /**
         * @description reset filter
         * @param grid
         */
        self.resetFilter = function (grid) {
            if (grid.filterGridCriteria.hasOwnProperty('criteria')) {
                delete grid.filterGridCriteria.criteria;
                grid.filterGridCriteria.reset = true;
                grid.filterGridCriteria.showReset = false;
            }
        };

        /**
         * @description Gets the grid limit options(records per page options)
         * @param records
         * @returns {*[]}
         */
        self.getGridLimitOptions = function (records) {
            return (
                [
                    5,
                    10,
                    20,
                    50
                    /* {
                         label: langService.get('lbl_page_all'),
                         value: function () {
                             return (records.length + 21);
                         }
                     }*/
                ]
            );
        };

        /**
         * @description Gets the number of columns in the grid
         * @param grid
         * @param includeHidden
         * If passed, hidden columns will be also counted
         * Otherwise, hidden columns will not be counted
         * @returns {number}
         */
        self.getColumnsCount = function (grid, includeHidden) {
            if (!grid.columns)
                return 0;
            if (includeHidden) {
                return grid.columns.length;
            }
            return Object.keys(_.filter(grid.columns, function (col) {
                return !col.hide
            })).length;
        };

        /**
         * @description Check if the column can be shown or not
         * @param grid
         * @param column
         * @param isHeader
         * If passed, it will check if column header is to be shown.
         * Otherwise, check if column cell is to be shown
         * @returns {boolean}
         */
        self.isShowColumn = function (grid, column, isHeader) {
            /*If column is undefined, it is given in html but not available in the grid columns. Hide it*/
            if (!column)
                return false;

            var showColumn = true;
            if (column.hasOwnProperty('hide')) {
                if (typeof column.hide === 'function') {
                    showColumn = !(column.hide());
                } else
                    showColumn = !(column.hide);
            }

            return isHeader ? (showColumn && !grid.selectedRecords.length) : showColumn;
        };

        /**
         * @description Gets the colspan for grid header
         * @param grid
         * @returns {number}
         */
        self.getColSpan = function (grid) {
            if (!grid.columns)
                return 0;
            return Object.keys(_.filter(grid.columns, function (col) {
                if (typeof col.hide === 'function')
                    return !col.hide();
                return !col.hide
            })).length;
        };

        /**
         * @description Check if action will be shown on grid or not
         * @param action
         * @param model
         * @returns {boolean}
         */
        /*self.checkToShowAction = function (action, model) {
            return (!action.hide) && (action.permissionKey ? userInfoService.getCurrentUser().hasPermissionTo(action.permissionKey) : true);
        };*/
        self.checkToShowAction = function (action) {
            if (action.hide)
                return false;
            else {
                var hasPermission = true;
                // check if permission key(s) property available and user has permissions regarding the permission key(s)
                if (action.hasOwnProperty('permissionKey')) {
                    if (typeof action.permissionKey === 'string') {
                        hasPermission = userInfoService.getCurrentUser().hasPermissionTo(action.permissionKey);
                    } else if (angular.isArray(action.permissionKey) && action.permissionKey.length) {
                        if (action.hasOwnProperty('checkAnyPermission')) {
                            hasPermission = userInfoService.getCurrentUser() && userInfoService.getCurrentUser().hasAnyPermissions(action.permissionKey);
                        } else {
                            hasPermission = userInfoService.getCurrentUser() && userInfoService.getCurrentUser().hasThesePermissions(action.permissionKey);
                        }
                    }
                }

                /*var showInViewOnly = action.hasOwnProperty('showInViewOnly') && action.showInViewOnly,
                    showInView = action.hasOwnProperty('showInView') && action.showInView;
                if (action.actionFromPopup) {
                    if (!showInView)
                        hasPermission = false;
                }
                else {
                    if (showInViewOnly)
                        hasPermission = false;
                }*/
                return hasPermission;
            }
        };

        /**
         * @description Sorts the grid data on client side in ascending or descending order depending on column header clicked.
         * @param grid
         * @param records
         * @returns {*}
         */
        self.sortGridData = function (grid, records) {
            return $filter('orderBy')(records, grid.order)
        };

        /**
         * @description Search the text in the grid data
         * @param grid
         * @param recordsCopy
         * copy of original records which will be returned in case search is empty.
         * @returns {*}
         */
        self.searchGridData = function (grid, recordsCopy) {
            if (!grid.searchText)
                return recordsCopy;
            else {
                self.gridToSearch = grid;
                return $filter('filter')(recordsCopy, _searchRecords);
            }
        };

        var _searchRecords = function (item, index, records) {
            var searchTextCopy = angular.copy(self.gridToSearch.searchText.trim().toLowerCase());
            var column = null, propertyToSearch, propertyValue, result;
            for (var property in self.gridToSearch.columns) {
                column = self.gridToSearch.columns[property];
                /*Search only if column is visible and has searchKey property*/
                if (self.gridToSearch.showColumn(column) && column.hasOwnProperty('searchKey')) {
                    propertyToSearch = self.gridToSearch.columns[property].searchKey;
                    if (typeof propertyToSearch === 'function')
                        propertyToSearch = propertyToSearch();
                    // if property to search has value(property name defined), then search, otherwise, skip search
                    if (propertyToSearch) {
                        propertyValue = _.result(item, propertyToSearch);
                        if (propertyValue && propertyValue.toString().toLowerCase().indexOf(searchTextCopy) > -1) {
                            result = true;
                            break;
                        }
                        result = false;
                    }
                    result = false;
                }
                result = false;
            }
            return result;
        };

    });
};
