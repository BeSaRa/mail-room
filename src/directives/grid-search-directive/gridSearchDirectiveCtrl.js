module.exports = function (app) {
    app.controller('gridSearchDirectiveCtrl', function (LangWatcher,
                                                        $scope) {
        'ngInject';
        var self = this;
        self.controllerName = 'gridSearchDirectiveCtrl';

        LangWatcher($scope);

        self.search = function () {
            self.grid.searchCallback();
        };

        self.filterRecords = function(reset, $event){
            self.grid.filterGridCriteria.reset = reset;
            self.grid.filterGridCallback($event);
        }

        self.printResultRecords = function ($event) {
           self.grid.printFilterCallback();
        }

    });
};