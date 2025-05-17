(function () {
    angular
        .module('app')
        .config(function (urlServiceProvider) {
            'ngInject';
            urlServiceProvider
                .setEnvironment('dev')
                .setBaseUrl('dev', 'http://192.168.56.4:5003/mailingRoomUI/api');

        });

})();
