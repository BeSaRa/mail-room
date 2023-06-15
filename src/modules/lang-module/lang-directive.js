module.exports = function (app) {
    app.directive('langDirective', function (langService,
                                             tokenService,
                                             authenticationService,
                                             $http,
                                             $rootScope) {
        'ngInject';
        return {
            restrict: 'A',
            link: function (scope, element) {
                $rootScope.languages = langService.languages;
                $rootScope.langService = langService;
                scope.tokenService = tokenService;
                tokenService.setRequireServices($http, authenticationService);

                function loadUpdateLang() {
                    langService.getLanguages().then(function (lang) {
                        $rootScope.lang = lang;
                    });
                }

                $rootScope.$watch(function () {
                    return langService.current;
                }, function (newValue, oldValue) {
                    if (!newValue)
                        return;

                    loadUpdateLang();

                    if (newValue !== oldValue && !!newValue) {
                        element.attr('lang', newValue);
                        if (newValue === 'ar') {
                            element.attr('dir', 'rtl').addClass('rtl');
                        } else {
                            element.removeAttr('dir').removeClass('rtl');
                        }
                    }
                });


            }
        }
    })
};