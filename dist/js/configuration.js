(function () {
    angular
        .module('app')
        .config(function (urlServiceProvider) {
            'ngInject';
            urlServiceProvider
                .setEnvironment('newStage')
                .setBaseUrl('dev', 'http://100.100.3.176:9082/mailRoom/api')
                .setBaseUrl('stage', 'http://100.100.3.176:9081/mailRoom/api')
                .setBaseUrl('newStage', 'http://100.100.3.176:9081/main-web-start/api')
                .setBaseUrl('azure','http://100.100.3.176:8072/mailRoomV2/api');

            urlServiceProvider
                .addSegment('ismailStage', 'http://100.100.3.176:8080');

        });

})();
