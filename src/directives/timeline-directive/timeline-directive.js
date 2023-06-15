module.exports = function (app) {
    require('./timeline-style.scss');
    app.directive('timelineDirective', function () {
        'ngInject';
        return {
            restrict: 'E',
            template: require('./timeline-template.html'),
            controller: function ($scope,LangWatcher) {
                'ngInject';
                var self = this;

                LangWatcher($scope);
            },
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                mail: '=',
                timelineRecords: '='
            }
        }
    });
};