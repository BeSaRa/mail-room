module.exports = function (app) {
    app.service('lookupService', function (urlService, $q, generator, Lookup, _) {
        'ngInject';
        var self = this, $http;
        self.serviceName = 'lookupService';

        self.lookups = {};
        self.lookupKeyMaps = {};

        self.lookupTypesMap = {
            1: 'packageItemCategory',
            2: 'lengthUnits',
            3: 'weightUnits',
            4: 'otherMeasurementUnits',
            'packageItemCategory': 1,
            'lengthUnits': 2,
            'weightUnits': 3,
            'otherMeasurementUnits': 4,
        };

        // available lookup
        self.mailTypes = 'mailTypes';
        self.mailTypesKeys = {
            outgoing: 'outgoing',
            incoming: 'incoming',
            internal: 'internal'
        };
        self.entryTypes = 'entryTypes';
        self.entryTypesKeys = {
            general: 'general',
            correspondence: 'correspondence'
        };
        self.statusTypes = 'statusTypes';
        self.statusTypesKeys = {
            new: 'new',
            sent: 'sent',
            received: 'received',
            mobile_received: 'mobileReceived',
            expected: 'expected',
            notDelivered: 'not_received'
        };
        self.priorityTypes = 'priorityTypes';
        self.priorityTypesKeys = {
            normal: 'normal',
            fast: 'fast '
        };
        self.serialBasedTypes = 'serialBasedTypes';
        self.serialBasedTypesKeys = {};
        self.integratedSystems = 'integratedSystems';

        self.actionLogTypes = 'actionLogTypes';
        self.actionLogTypesKeys = {
            add: 'add',
            send: 'send',
            received: 'received',
            exported: 'exported',
            modify: 'modify',
            delete: 'delete'
        };
        self.postTypes = 'postTypes';
        self.postTypesKeys = {
            package: 'package',
            email: 'email'
        };

        self.setHttpService = function (http) {
            $http = http;
        };

        var _setLookupKeyMapInArray = function (lookupType) {
            var lookups = self.lookups[lookupType], lookup, lookupKeyName;
            lookups.keyMaps = {};
            for (var i = 0; i < lookups.length; i++) {
                lookup = lookups[i];
                lookupKeyName = lookup.keyName;
                if (!lookups.keyMaps.hasOwnProperty(lookupKeyName))
                    lookups.keyMaps[lookupKeyName] = {};
                lookups.keyMaps[lookupKeyName] = lookup.keyName;
            }
        };

        var _setLookupKeyMapInService = function (lookupType) {
            var lookups = self.lookups[lookupType];
            for (var i = 0; i < lookups.length; i++) {
                if (!self.lookupKeyMaps.hasOwnProperty(lookupType))
                    self.lookupKeyMaps[lookupType] = {};
                self.lookupKeyMaps[lookupType][lookups[i].keyName] = lookups[i].keyName;
            }
        };

        /**
         * @description Load lookups from server.
         * @param lookupName
         * Checks if all lookups or particular lookup needs to be updated after load.
         * @returns {Promise|lookups}
         */
        self.loadLookups = function (lookupName) {
            return $http.get(urlService.lookups)
                .then(function (result) {
                    // set the lookupType in from lookUpTypes to self.lookups and delete it
                    if (result.data.hasOwnProperty('lookUpTypes')) {
                        _.map(result.data.lookUpTypes, function (item) {
                            self.lookups[self.lookupTypesMap[item.id]] = [];
                            return item;
                        });
                    }
                    delete result.data.lookUpTypes;

                    // set the values to lookup types from lookUps property to self.lookups and delete it
                    // use id instead of typeId when these lookups will be used
                    if (result.data.hasOwnProperty('lookUps') && result.data.lookUps.length > 0) {
                        _.map(result.data.lookUps, function (item) {
                            item.typeId = item.typeId.hasOwnProperty('id') ? item.typeId.id : item.typeId;
                            item.keyName = item.keyStr;
                            self.lookups[self.lookupTypesMap[item.typeId]].push(generator.interceptReceivedInstance('Lookup', generator.generateInstance(item, Lookup, self._sharedMethods)));
                            return item;
                        });
                    }
                    delete result.data.lookUps;

                    if (lookupName) {
                        self.lookups[lookupName] = generator.generateCollection(result.data[lookupName], Lookup, self._sharedMethods);
                        self.lookups[lookupName] = generator.interceptReceivedCollection('Lookup', self.lookups[lookupName]);
                    } else {
                        for (var record in result.data) {
                            lookupName = record;
                            self.lookups[lookupName] = generator.generateCollection(result.data[lookupName], Lookup, self._sharedMethods);
                            self.lookups[lookupName] = generator.interceptReceivedCollection('Lookup', self.lookups[lookupName]);
                        }
                    }
                    return self.lookups;
                })
                .catch(function (error) {
                    //console.log(error);
                });
        };

        /**
         * @description Get lookups from self.lookups if found and if not load it from server again.
         * @returns {Promise|lookups}
         */
        self.getLookups = function (lookupName) {
            return (
                self.lookups.hasOwnProperty(lookupName) && self.lookups[lookupName].length ?
                    $q.when(self.lookups[lookupName]) : self.loadLookups(lookupName)
            );
        };

        /**
         * @description get lookup by lookupName and typeId
         * @param lookupName
         * @param lookupTypeId
         * @returns {Lookup|undefined} return Lookup Model or undefined if not found.
         */
        self.getLookupByTypeId = function (lookupName, lookupTypeId) {
            lookupTypeId = lookupTypeId instanceof Lookup ? lookupTypeId.typeId : lookupTypeId;
            return _.find(self.lookups[lookupName], function (lookup) {
                return Number(lookup.typeId) === Number(lookupTypeId);
            });
        };

        /**
         * @description get lookup by lookupName and keyName
         * @param lookupName
         * @param keyName
         * @returns {Lookup|undefined} return Lookup Model or undefined if not found.
         */
        self.getLookupByKeyName = function (lookupName, keyName) {
            keyName = keyName instanceof Lookup ? keyName.keyName : keyName;
            return _.find(self.lookups[lookupName], function (lookup) {
                return lookup.keyName === keyName;
            });
        };

        /**
         * @description Filter the lookup from the given list of lookups by keyName
         * @param lookups
         * @param keyName
         * @returns {Lookup|undefined} return Lookup Model or undefined if not found.
         */
        self.filterLookupByKeyName = function (lookups, keyName) {
            keyName = keyName instanceof Lookup ? keyName.keyName : keyName;
            return _.find(lookups, function (lookup) {
                return lookup.keyName === keyName;
            });
        };

        /**
         * @description This method sets the lookup from the when validate token or login
         * @param lookups
         */
        self.setLookups = function (lookups) {
            _.map(lookups, function (lookupType, key) {
                self.lookups[key] = generator.generateCollection(lookupType, Lookup, self._sharedMethods);
                self.lookups[key] = generator.interceptReceivedCollection('Lookup', self.lookups[key]);
                return self.lookups[key];
            });
        };

        self.returnLookups = function (lookupName) {
            return self.lookups.hasOwnProperty(lookupName) ? self.lookups[lookupName] : [];
        };


        self.getLookupTypeId = function (lookupKeyOrTypeId, lookupType) {
            if (!angular.isNumber(lookupKeyOrTypeId) && typeof lookupKeyOrTypeId === 'string')
                return self.getLookupByKeyName(self[lookupType], lookupKeyOrTypeId).getTypeId();
            else if (typeof lookupKeyOrTypeId === 'object' && lookupKeyOrTypeId instanceof Lookup) {
                return lookupKeyOrTypeId.getTypeId();
            }
            return lookupKeyOrTypeId;
        };

        /**
         * @description create the shred method to the model.
         * @type {{delete: generator.delete, update: generator.update}}
         * @private
         */
        self._sharedMethods = generator.generateSharedMethods(self.deleteLookup, self.updateLookup);


    });
};
