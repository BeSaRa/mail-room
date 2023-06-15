module.exports = function (app) {
    app.config(function (resolverProvider, $stateProvider) {
        'ngInject';
        resolverProvider
            .setStateProvider($stateProvider)
           /* .resolveToState('loading', 'A_LANGUAGE', function (langService,
                                                               errorCode,
                                                               $q,
                                                               $stateParams,
                                                               lookupService,
                                                               generator,
                                                               dialog,
                                                               $http,
                                                               toast) {
                'ngInject';
                langService.getCurrentLang();
                lookupService.setHttpService($http);
                langService.setRequireServices(dialog, toast);
                generator.setDialog(dialog);
                generator.setLangService(langService);

                return true;
            })*/
           /* .bulkResolveToState('app', {
                loadMenus: function (sidebarService) {
                    'ngInject';
                    return sidebarService.loadMenuItems();
                },
                language: function (application, langService) {
                    'ngInject';
                    langService.loadLanguages().then(function () {
                        application.setReadyStatus(true);
                    });
                },
                lookups: function(lookupService){
                    'ngInject';
                    return lookupService.loadLookups();
                },
                initializeMailService: function (mailService) {
                    return true;
                }
            })*/
            .resolveToState('login', 'MUST_LOGGED_IN', function (tokenService, dialog, $timeout, $q, $state) {
                'ngInject';
                var defer = $q.defer();
                tokenService
                    .tokenRefresh()
                    .then(function () {
                        $state.go('app');
                    })
                    .catch(function () {
                        defer.resolve(true);
                        dialog.cancel();
                    });
                return defer.promise;
            })
            .registerResolver();
    });
};