module.exports = function (app) {
    app.service('langService', function (Language,
                                         mailRoomTemplate,
                                         $window,
                                         $rootScope,
                                         Localization,
                                         generator,
                                         urlService,
                                         $q,
                                         $cookies,
                                         _) {
        'ngInject';
        var self = this, toast, dialog, addKeyOpened = false, $http;
        self.cookiesKey = 'lang';
        self.current = null;
        self.defaultLanguages = {};
        self.selectedLanguage = null;
        self.currentSelectedLanguage = null;

        self.languages = [
            new Language({
                id: 1,
                title: 'Arabic',
                code: 'ar',
                image: 'qa',
                lookupKey: 1
            }),
            new Language({
                id: 2,
                title: 'English',
                code: 'en',
                image: 'uk',
                lookupKey: 2
            })
        ];
        // this is default languages keys
        self.langKeys = {
            ar: {},
            en: {}
        };


        self.setSelectedLanguageById = function (langId) {
            self.setSelectedLanguage(_.find(self.languages, function (lang) {
                return lang.id === langId;
            }));
        };

        self.setHttpService = function (http) {
            $http = http;
            return self;
        };
        /**
         * @description set require service for the langService
         * @param dialogService
         * @param toastService
         */
        self.setRequireServices = function (dialogService, toastService) {
            dialog = dialogService;
            toast = toastService;
        };

        self.get = function (langKey, ignoreError) {
            return self.langKeys.hasOwnProperty(self.current) ?
                self.langKeys[self.current][langKey] :
                (ignoreError) ? false : 'LANG: ' + langKey;
        };

        self.getKey = function (langKey, lang, ignoreError) {
            return self.langKeys.hasOwnProperty(lang) ?
                self.langKeys[lang][langKey] :
                (ignoreError) ? false : 'LANG: ' + langKey;
        };

        self.getCurrentLang = function () {
            return $cookies.get(self.cookiesKey) ? $cookies.get(self.cookiesKey) : self.setCurrentLang('ar');
        };

        self.is = function (lang) {
            var key = lang.hasOwnProperty('code') ? lang.code : lang;
            return self.current === key;
        };

        self.setCurrentLang = function (langKey) {
            var expiry = new Date();
            expiry.setDate(expiry.getDate() + 365);
            $cookies.put(self.cookiesKey, langKey, {
                expires: expiry
            });
            self.current = langKey;
            self.currentLangTitleCase = _.startCase(_.toLower(langKey));
            return self.current;
        };

        self.getSelectedLanguage = function () {
            return _.find(self.languages, function (lang) {
                return lang.code === self.current;
            });
        };

        self.prepareLanguages = function () {
            var languages = self.defaultLanguages;
            for (var key in languages) {
                if (languages.hasOwnProperty(key)) {
                    for (var langKey in languages[key]) {
                        if (languages[key].hasOwnProperty(langKey)) {
                            if (!self.langKeys.hasOwnProperty(langKey)) {
                                self.langKeys[langKey] = {};
                            }
                            self.langKeys[langKey][key] = languages[key][langKey];
                        }
                    }
                }

            }
            self.current = self.getCurrentLang();
            self.selectedLanguage = self.getSelectedLanguage();
            $rootScope.$broadcast('$languagePrepared');
            return self.currentSelectedLanguage = angular.extend({}, self.langKeys[self.current], {
                get: self.get,
                getKey: self.getKey,
                is: self.is
            });
        };

        self.loadLanguages = function () {
            return $http.get(urlService.language).then(function (result) {
                self.defaultLanguages = result.data;
                return self.prepareLanguages();
            }).catch(function () {
                alert('language Error');
            });
        };

        self.getLanguages = function () {
            var keys = Object.keys(self.langKeys);
            return keys && Object.keys(self.langKeys[keys[0]]).length > 46 ? $q.when(self.getCurrentTranslate()) : self.loadLanguages();
        };


        self.setSelectedLanguage = function (language) {
            var result = -1;
            _.filter(self.languages, function (lang, index) {
                if (lang.code === language.code)
                    result = index;
                return lang;
            });

            self.selectedLanguage = self.languages[result];
            self.current = self.selectedLanguage.code;
            self.setCurrentLang(self.current);
        };
        self.getCurrentTranslate = function () {
            if (!self.current)
                self.current = 'ar';

            return angular.extend({}, self.langKeys[self.current], {
                get: self.get,
                current: self.current,
                getKey: self.getKey,
                is: self.is
            });
        };
        /**
         * @description prepare localization
         * @param localization
         * @param prepare
         */
        self.prepareLocalization = function (localization, prepare) {

            if (angular.isArray(localization) && localization.length && typeof localization[0].setLangService === 'undefined')
                localization = generator.interceptReceivedCollection('Localization', localization);


            _.map(localization, function (local) {
                if (!self.defaultLanguages.hasOwnProperty(local.localizationKey)) {
                    self.defaultLanguages[local.localizationKey] = {};
                }
                self.defaultLanguages[local.localizationKey]['ar'] = local.arName;
                self.defaultLanguages[local.localizationKey]['en'] = local.enName;
                self.defaultLanguages[local.localizationKey]['module'] = local.module;
            });
            if (prepare)
                self.prepareLanguages();
            return self;
        };
        /**
         * @description get localization  by module.
         * load localization by module
         */
        self.loadLocalizationByModule = function (module) {
            var moduleKey = module.hasOwnProperty('id') ? module.lookupKey : module;
            return $http
                .get(urlService.localizations + '/module/' + moduleKey)
                .then(function (result) {
                    var localizations = generator.interceptReceivedCollection('Localization', generator.generateCollection(result.data.rs, Localization));
                    self.prepareLocalization(localizations, true);
                    return localizations;
                });
        };

        self.replaceLanKeyValue = function (local) {
            var keys = Object.keys(self.langKeys);
            for (var i = 0; i < keys.length; i++) {
                self.langKeys[keys[i]][local.localizationKey] = local[keys[i] + 'Name'];
            }
        };
        /**
         * @description delete local from localization table.
         * @param local
         * @return {Promise}
         */
        self.deleteLocalizationKey = function (local) {
            var id = local.hasOwnProperty('id') ? local.id : local;
            return $http
                .delete(urlService.localizations + '/' + id);
        };
        /**
         * @description add localization Key
         * @param local
         */
        self.addLocalizationKey = function (local) {
            return $http
                .post(urlService.localizations, generator.interceptSendInstance('Localization', local))
                .then(function (result) {
                    local.id = result.data.rs;
                    local.isOverrided = true;
                    return generator.interceptReceivedInstance('Localization', generator.generateInstance(local, Localization));
                });
        };
        /**
         * @description to check if the localization key exists or not before add
         * @param key
         * @returns {Promise}
         */
        self.checkLangKeyIfExists = function (key) {
            return $http
                .get(urlService.globalLocalizationLookups + '/localizationkey/' + key)
                .then(function (result) {
                    return result.data.rs;
                })
        };
        /**
         * @description change localization module number.
         * @param module
         * @param localizations
         */
        self.changeLocalizationModule = function (module, localizations) {
            return $http
                .put(urlService.globalLocalizationLookups + '/change-module-bulk', {
                    first: module.lookupKey,
                    second: _.map(localizations, 'localizationKey')
                })
                .then(function (result) {
                    return result.data.rs;
                })
        };
        /**
         * @description load all localization from service.
         */
        self.loadLocalizationKeys = function () {
            return $http
                .get(urlService.localizations)
                .then(function (result) {
                    var localizations = generator.interceptReceivedCollection('Localization', generator.generateCollection(result.data.rs, Localization));
                    self.prepareLocalization(localizations, true);
                    return localizations;
                })
        };
        /**
         * @update localization Key
         * @param local
         */
        self.updateLocalizationKey = function (local) {
            return $http
                .put(urlService.localizations, generator.interceptSendInstance('Localization', local))
                .then(function () {
                    return generator.interceptReceivedInstance('Localization', generator.generateInstance(local, Localization));
                });
        };
        /**
         * @description update global localization key
         * @param local
         * @return {Promise}
         */
        self.updateGlobalLocalizationKey = function (local) {
            return $http
                .put(urlService.globalLocalizationLookups, generator.interceptSendInstance('Localization', local))
                .then(function () {
                    return generator.interceptReceivedInstance('Localization', generator.generateInstance(local, Localization));
                });
        };
        /**
         * @description this just for development area.
         * @param local
         * @return {Promise}
         */
        self.addGlobalLocalizationKey = function (local) {
            return $http
                .post(urlService.globalLocalizationLookups, generator.interceptSendInstance('Localization', local))
                .then(function (result) {
                    local.id = result.data.rs;
                    return generator.interceptReceivedInstance('Localization', generator.generateInstance(local, Localization));
                });
        };

        self.controllerMethod = {
            deleteLocalization: function (local, $event, mute) {
                return dialog
                    .confirmMessage(self.get('confirm_delete').change({name: local.getLocalizationKey()}), null, null, $event)
                    .then(function () {
                        return self.deleteLocalizationKey(local)
                            .then(function () {
                                if (!mute)
                                    toast.success(self.get('delete_specific_success').change({name: local.getLocalizationKey()}));
                                return local;
                            });
                    })
            },
            editLocalization: function (local, $event) {
                return dialog
                    .showDialog({
                        template: mailRoomTemplate.getPopup('localization'),
                        controller: 'localizationPopCtrl',
                        controllerAs: 'ctrl',
                        targetEvent: $event,
                        locals: {
                            localization: local,
                            newLocalizationKey: false
                        }
                    });
            },
            addNewLocalizationKey: function ($event) {
                addKeyOpened = true;
                return dialog
                    .showDialog({
                        template: mailRoomTemplate.getPopup('localization'),
                        controller: 'localizationPopCtrl',
                        controllerAs: 'ctrl',
                        targetEvent: $event,
                        locals: {
                            localization: new Localization(),
                            newLocalizationKey: true
                        }
                    })
                    .then(function (local) {
                        addKeyOpened = false;
                        self.loadLocalizationKeys();
                    })
                    .catch(function () {
                        addKeyOpened = false;
                    });
            }
        };

        angular
            .element($window)
            .on('keypress keydown', function (e) {
                var code = e.which || e.keyCode;
                if (e.ctrlKey && e.altKey && code === 76) {
                    if (!addKeyOpened)
                        self.controllerMethod.addNewLocalizationKey();
                }
            })


    });
};