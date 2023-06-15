module.exports = function (app) {
    app.run(function ($httpBackend,
                      urlService,
                      Entity,
                      generator,
                      _) {
        'ngInject';

        var urlWithId = new RegExp(urlService.entities + '\/(\\d+)$');
        var urlChangeStatus = new RegExp(urlService.entities + '/change-status' + '\/(\\d+)');
        var urlGetDepartments = new RegExp(urlService.entities + '?parentId=' + '\/(\\d+)$');

        /**
         * List of fake entities
         * @type {*[]}
         */
        var entities = [
            {
                "entityLevel": 1,
                "responsibleEmail": "res22pff@res.com",
                "responsibleName": "res",
                "active": true,
                "deleted": null,
                "entityType": {
                    "id": 1,
                    "arName": "ministry",
                    "enName": "وزارة"
                },
                "id": 19,
                "arName": "ةهى1",
                "enName": "min1",
                "entityTypeId": 1,
                "parentId": null,
                "rootId": 19
            },
            {
                "entityLevel": 1,
                "responsibleEmail": "ssres22pff@res.com",
                "responsibleName": "responsible name",
                "active": true,
                "deleted": null,
                "entityType": {
                    "id": 2,
                    "arName": "bank",
                    "enName": "بنك"
                },
                "id": 22,
                "arName": "شق2",
                "enName": "en2",
                "entityTypeId": 2,
                "parentId": null,
                "rootId": 22
            },
            {
                "entityLevel": 1,
                "responsibleEmail": "ssres22pff@res.com",
                "responsibleName": "resddp22ffffff name ",
                "active": true,
                "deleted": null,
                "entityType": {
                    "id": 1,
                    "arName": "ministry",
                    "enName": "وزارة"
                },
                "id": 24,
                "arName": "ministrye 45050",
                "enName": "ministry english namedsdsds4040",
                "entityTypeId": 1,
                "parentId": null,
                "rootId": 24
            },
            {
                "entityLevel": 1,
                "responsibleEmail": "ssres22pff@res.com",
                "responsibleName": "resddp22ffffff name ",
                "active": true,
                "deleted": null,
                "entityType": {
                    "id": 1,
                    "arName": "ministry",
                    "enName": "وزارة"
                },
                "id": 25,
                "arName": "ministrye 45050",
                "enName": "ministry english namedsdsds4040",
                "entityTypeId": 1,
                "parentId": null,
                "rootId": 25
            },
            {
                "entityLevel": 0,
                "responsibleEmail": "sdfasd2@email.com",
                "responsibleName": "asdfa",
                "active": true,
                "deleted": null,
                "entityType": {
                    "id": 1,
                    "arName": "ministry",
                    "enName": "وزارة"
                },
                "id": 32,
                "arName": "ةهى3",
                "enName": "min3",
                "entityTypeId": 1,
                "parentId": null,
                "rootId": 32
            },
            {
                "entityLevel": 0,
                "responsibleEmail": "asdf@email.com",
                "responsibleName": "dfasdg",
                "active": true,
                "deleted": null,
                "entityType": {
                    "id": 1,
                    "arName": "ministry",
                    "enName": "وزارة"
                },
                "id": 34,
                "arName": "سعلا2",
                "enName": "sub2",
                "entityTypeId": 1,
                "parentId": null,
                "rootId": 34
            },
            {
                "entityLevel": 0,
                "responsibleEmail": "adsfgaw@email.com",
                "responsibleName": "sdafsdg",
                "active": true,
                "deleted": null,
                "entityType": {
                    "id": 1,
                    "arName": "ministry",
                    "enName": "وزارة"
                },
                "id": 35,
                "arName": "سعلا3",
                "enName": "sub3",
                "entityTypeId": 1,
                "parentId": null,
                "rootId": 35
            },
            {
                "entityLevel": 0,
                "responsibleEmail": "fasdfg@email.com",
                "responsibleName": "asdfasd",
                "active": true,
                "deleted": null,
                "entityType": {
                    "id": 1,
                    "arName": "ministry",
                    "enName": "وزارة"
                },
                "id": 38,
                "arName": "ىثص ثىفهفغ",
                "enName": "new entity",
                "entityTypeId": 1,
                "parentId": null,
                "rootId": 38
            },
            {
                "entityLevel": 0,
                "responsibleEmail": "responsibleemail@email.com",
                "responsibleName": "responsible name",
                "active": true,
                "deleted": null,
                "entityType": {
                    "id": 2,
                    "arName": "bank",
                    "enName": "بنك"
                },
                "id": 40,
                "arName": "ثىفهفغ1",
                "enName": "entity1",
                "entityTypeId": 2,
                "parentId": null,
                "rootId": 40
            }
        ];

        /**
         * Interceptor to fake get request and respond with the list of fake entities
         */
        $httpBackend.whenGET(urlService.entities).respond(function () {
            return [200, _.filter(entities, function(entity){
                return !entity.parentId;
            })];
        });

        // add new entity
        $httpBackend
            .whenPOST(urlService.entities)
            .respond(function (method, url, data) {
                var entity = JSON.parse(data);
                // create new id for model
                entity.id = generator.createNewID(entities, 'id');
                // push model to collections
                entities.push(entity);
                return [200, entity];
            });

        // edit entity
        $httpBackend.whenPUT(function (url) {
            return urlWithId.test(url);
        }).respond(function (method, url, data) {
            var entity = new Entity(JSON.parse(data));
            var id = url.split('/').pop();
            for (var i = 0; i < entities.length; i++) {
                if (entities[i].id === parseInt(id)) {
                    entities[i] = entity;
                    break;
                }
            }
            return [200, entity];
        });

        // delete entity single
        $httpBackend.whenDELETE(function (url) {
            return urlWithId.test(url);
        }).respond(function (method, url, data) {
            var id = url.split('/').pop();
            for (var i = 0; i < entities.length; i++) {
                if (entities[i].id === parseInt(id)) {
                    entities.splice(i, 1);
                }
            }
            return [200];
        });

        /*  // delete entities bulk
          $httpBackend.whenDELETE(urlService.entities + '/bulk').respond(function (method, url, data) {
              var entitiesToDelete = JSON.parse(data);

              for (var i = 0; i < entitiesToDelete.length; i++) {
                  for (var j = 0; j < entities.length; j++) {
                      if (entities[j].id === entities[i]) {
                          entities.splice(j, 1);
                          break;
                      }
                  }
              }
              return [200, true];
          });
  */

        // change status for single entity
        $httpBackend.whenPUT(function (url) {
            return urlChangeStatus.test(url);
        }).respond(function (method, url, data) {
            var id = url.split('/').pop();

            var entity = _.find(entities, function (ent) {
                return ent.id === parseInt(id);
            });

            entity.active = !entity.active;

            return [200];
        });

        /* // activate entities status bulk
         $httpBackend.whenPUT((urlService.entities + '/activate/bulk')).respond(function (method, url, data) {
             var entitiesToActivate = JSON.parse(data);
             for (var i = 0; i < entitiesToActivate.length; i++) {
                 for (var j = 0; j < entities.length; j++) {
                     if (entities[j].id === entitiesToActivate[i]) {
                         entities[j].active = true;
                         break;
                     }
                 }
             }
             return [200, true];
         });

         // Deactivate entities status bulk
         $httpBackend.whenPUT((urlService.entities + '/deactivate/bulk')).respond(function (method, url, data) {
             var entitiesToDeactivate = JSON.parse(data);
             for (var i = 0; i < entitiesToDeactivate.length; i++) {
                 for (var j = 0; j < entitiesToDeactivate.length; j++) {
                     if (entities[j].id === entitiesToDeactivate[i]) {
                         entities[j].status = false;
                         break;
                     }
                 }
             }
             return [200, true];
         });*/

        /**
         * Interceptor to fake get request and respond with the list of fake departments by parent entityId
         */
        $httpBackend.whenGET(function (url) {
            return urlGetDepartments.test(url);
        }).respond(function () {
            var parentId = url.split('=').pop();
            return [200, _.filter(entities, function(entity){
              return entity.parentId === parentId;
            })];
        });
    })
};