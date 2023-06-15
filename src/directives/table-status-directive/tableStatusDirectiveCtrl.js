module.exports = function (app) {
    app.controller('tableStatusDirectiveCtrl', function ($q, $scope, langService) {
        'ngInject';
        var self = this;
        self.controllerName = 'tableStatusDirectiveCtrl';
        $scope.lang = langService.getCurrentTranslate();
        // all available status
        self.status = [
            {id: 0, lang: 'lbl_select_status', value: null},
            {id: 1, lang: 'lbl_active', value: 'activate'},
            {id: 2, lang: 'lbl_inactive', value: 'deactivate'}
        ];
        // default status
        self.selectedStatus = self.status[0];
        // event

        self.statusChanged = function () {
            var defer = $q.defer();
            if (self.selectedStatus.id === 0)
                return;
            // this callback came from the scope of directive
            self.whenClose(self.selectedStatus.value, defer);
            // to return to the default value again
            defer.promise.then(function () {
                self.selectedStatus = self.status[0];
            })
        }

    });
};