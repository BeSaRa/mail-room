module.exports = function (app) {
    app.controller('gridIndicatorDirectiveCtrl', function ($q,
                                                           $scope,
                                                           langService) {
        'ngInject';
        var self = this;
        self.controllerName = 'gridIndicatorDirectiveCtrl';
        self.langService = langService;

        /**
         * @description Checks if indicator will be displayed or not
         * @returns {boolean}
         */
        self.isShowIndicator = function () {
            return !self.showIndicator;
        };

        self.getIndicatorTooltip = function (indicator) {
            var tooltip = langService.get(indicator.tooltip) || '';
            return tooltip;
        };

        self.getIndicatorText = function (indicator) {
            var text = langService.get(indicator.text) || '';
            return text;
        };
    });
};