module.exports = function (app) {
    app.directive('formDirective', function () {
        'ngInject';
        return {
            require: 'form',
            scope: {
                formDirective: '='
            },
            link: function (scope, element, attrs, ctrl) {
                if (attrs.formDirective == null || attrs.formDirective === '')
                    return;

                scope.formDirective = ctrl;
            }
        }
    })
};