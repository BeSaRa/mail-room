module.exports = function (app) {
    app.directive('catchUploadFileDirective', function ($parse, $timeout) {
        'ngInject';
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var callback = $parse(attrs.catchUploadFileDirective)(scope);
                var reset = attrs.resetAfterChange === 'true';

                element.on('change', function () {
                    var self = this;
                    if (this.files.length && typeof callback === 'function') {
                        $timeout(function () {
                            callback(self.files, element);
                            if (reset) {
                                this.value = '';
                            }
                        });
                    } else if (!this.files.length && typeof callback === 'function') {
                        $timeout(function () {
                            callback([], element);

                        });
                    }
                });
            }
        }
    })
};