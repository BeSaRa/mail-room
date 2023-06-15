module.exports = function (app) {
    require('./grid-search-directive-style.scss');
    app.directive('gridSearchDirective', function () {
        'ngInject';
        return {
            restrict: "E",
            template: require('./grid-search-template.html'),
            replace: true,
            scope: {
                grid: '=',
                filter: '=?'
            },
            bindToController: true,
            controller: 'gridSearchDirectiveCtrl',
            controllerAs: 'ctrl',
            link:  function(scope, element, attrs){
                element = angular.element(element[0].querySelector('#btn_searchGrid'));
                element.bind('click',function(){
                    document.querySelector('#search_header_query').focus();
                })
            }
        }
    })
};