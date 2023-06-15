module.exports = function (app) {
    app.run(function ($httpBackend, urlService, generator, Response) {
        'ngInject';

        var self = this;
        // constants for all lookup
        self.PRIORITY_LEVEL = "priorityLevel";

        var globalLookup = [{
            "priorityLevel": [
                {
                    "id": 29,
                    "category": 1,
                    "lookupKey": 0,
                    "lookupStrKey": "NORMAL",
                    "defaultArName": "عادي",
                    "defaultEnName": "Normal",
                    "status": true,
                    "itemOrder": 1,
                    "parent": null
                }, {
                    "id": 30,
                    "category": 1,
                    "lookupKey": 1,
                    "lookupStrKey": "URGENT",
                    "defaultArName": "عاجل",
                    "defaultEnName": "Urgent",
                    "status": true,
                    "itemOrder": 2,
                    "parent": null
                }, {
                    "id": 31,
                    "category": 1,
                    "lookupKey": 2,
                    "lookupStrKey": "TOP_URGENT",
                    "defaultArName": "عاجل جدا",
                    "defaultEnName": "Top Urgent",
                    "status": true,
                    "itemOrder": 3,
                    "parent": null
                }]
        }];

        var response = new Response();

        $httpBackend
            .whenGET(urlService.lookups.replace('{{lookupName}}', self.PRIORITY_LEVEL))
            .respond(function () {
                return [200, response.setResponse(globalLookup[self.PRIORITY_LEVEL])];
            });

    });
};