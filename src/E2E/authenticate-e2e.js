module.exports = function (app) {
    app.run(function ($httpBackend,
                      urlService,
                      Response) {
        'ngInject';

        var response = new Response();


        // login
        $httpBackend
            .whenPOST(urlService.login)
            .respond(function (method, url, data) {
                var credentials = JSON.parse(data);
                if (credentials.username === 'test' && credentials.password === 'ebla')
                    return [200, response.setResponse(1)];
                return [401, response.setResponse(0)];
            });

        // logout
        $httpBackend
            .whenPOST(urlService.logout)
            .respond(function (method, url, data) {
                return [200, response.setResponse(1)];
            });
    })
};