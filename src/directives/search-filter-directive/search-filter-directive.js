module.exports = function (app) {
    require('./search-filter-directive-style.scss');
    app.directive('searchFilterDirective', function () {
        'ngInject';
        return {
            restrict: "E",
            template: require('./search-filter-template.html'),
            replace: true,
            scope: {
                model: '='
            },
            bindToController: true,
            controller: 'searchFilterDirectiveCtrl',
            controllerAs: 'searchFilter'
        }
    })
};