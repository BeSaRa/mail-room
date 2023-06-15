module.exports = function (app) {
    app.run(function ($httpBackend,
                      urlService,
                      EntityType,
                      generator,
                      _) {
        'ngInject';

        var urlWithId = new RegExp(urlService.entityTypes + '\/(\\d+)$');
        var urlChangeStatus = new RegExp(urlService.entityTypes + '/change-status' + '\/(\\d+)');

        /**
         * List of fake entity types
         * @type {*[]}
         */
        var entityTypes = [
            {
                id: 1,
                arName: 'وزارة',
                enName: 'Ministry'
            },
            {
                id: 2,
                arName: 'بنك',
                enName: 'Bank'
            },
            {
                id: 3,
                arName: 'شركات',
                enName: 'Company'
            },
            {
                id: 4,
                arName: 'أخرى',
                enName: 'Other'
            }
        ];

        /**
         * Interceptor to fake get request and respond with the list of fake entityTypes
         */
        $httpBackend.whenGET(urlService.entityTypes).respond(function () {
            return [200, entityTypes];
        });

        // add new entity type
        $httpBackend
            .whenPOST(urlService.entityTypes)
            .respond(function (method, url, data) {
                var entityType = JSON.parse(data);
                // create new id for model
                entityType.id = generator.createNewID(entityTypes, 'id');
                // push model to collections
                entityTypes.push(entityType);
                return [200, entityType];
            });

        // edit entity type
        $httpBackend.whenPUT(function (url) {
            return urlWithId.test(url);
        }).respond(function (method, url, data) {
            var entityType = new EntityType(JSON.parse(data));
            var id = url.split('/').pop();
            for (var i = 0; i < entityTypes.length; i++) {
                if (entityTypes[i].id === parseInt(id)) {
                    entityTypes[i] = entityType;
                    break;
                }
            }
            return [200, entityType];
        });

        // delete entityType single
        $httpBackend.whenDELETE(function (url) {
            return urlWithId.test(url);
        }).respond(function (method, url, data) {
            var id = url.split('/').pop();
            for (var i = 0; i < entityTypes.length; i++) {
                if (entityTypes[i].id === parseInt(id)) {
                    entityTypes.splice(i, 1);
                }
            }
            return [200];
        });

        /*  // delete entityTypes bulk
          $httpBackend.whenDELETE(urlService.entityTypes + '/bulk').respond(function (method, url, data) {
              var entityTypesToDelete = JSON.parse(data);

              for (var i = 0; i < entityTypesToDelete.length; i++) {
                  for (var j = 0; j < entityTypes.length; j++) {
                      if (entityTypes[j].id === entityTypes[i]) {
                          entityTypes.splice(j, 1);
                          break;
                      }
                  }
              }
              return [200, true];
          });*/


        // change status for single entity type
        $httpBackend.whenPUT(function (url) {
            return urlChangeStatus.test(url);
        }).respond(function (method, url, data) {
            var id = url.split('/').pop();

            var entityType = _.find(entityTypes, function (ent) {
                return ent.id === parseInt(id);
            });

            entityType.active = !entityType.active;

            return [200];
        });

        /* // activate entityTypes status bulk
         $httpBackend.whenPUT((urlService.entityTypes + '/activate/bulk')).respond(function (method, url, data) {
             var entityTypesToActivate = JSON.parse(data);
             for (var i = 0; i < entityTypesToActivate.length; i++) {
                 for (var j = 0; j < entityTypes.length; j++) {
                     if (entityTypes[j].id === entityTypesToActivate[i]) {
                         entityTypes[j].active = true;
                         break;
                     }
                 }
             }
             return [200, true];
         });

         // Deactivate entityTypes status bulk
         $httpBackend.whenPUT((urlService.entityTypes + '/deactivate/bulk')).respond(function (method, url, data) {
             var entityTypesToDeactivate = JSON.parse(data);
             for (var i = 0; i < entityTypesToDeactivate.length; i++) {
                 for (var j = 0; j < entityTypesToDeactivate.length; j++) {
                     if (entityTypes[j].id === entityTypesToDeactivate[i]) {
                         entityTypes[j].status = false;
                         break;
                     }
                 }
             }
             return [200, true];
         });
 */

    })
};