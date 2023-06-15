module.exports = function (app) {
    app.config(function (loginPageProvider,
                         tokenServiceProvider,
                         urlServiceProvider,
                         IdleProvider,
                         localStorageServiceProvider,
                         $httpProvider) {
        'ngInject';

        var urlService = urlServiceProvider.$get();
        localStorageServiceProvider.setPrefix('MR_');
        // if you do not need to flip login background set it to false
        loginPageProvider.flipLoginBackground(true);
        // add default MailRoomInterceptor
        $httpProvider.interceptors.push('MailRoomInterceptor');

        IdleProvider.idle((1800)); // (30 minutes) in seconds
        IdleProvider.timeout(60); // (1 minute) in seconds

    });
};