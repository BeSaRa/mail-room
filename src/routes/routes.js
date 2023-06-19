module.exports = function (app) {
    app.config(function ($stateProvider,
                         mailRoomTemplateProvider,
                         $urlRouterProvider,
                         $locationProvider,
                         $mdDateLocaleProvider,
                         versionServiceProvider,
                         momentProvider) {
        'ngInject';
        $locationProvider.hashPrefix('');

        var templateProvider = mailRoomTemplateProvider;

        var moment = momentProvider.$get();

        versionServiceProvider
            .setVersionNumber('1.4.3')
            .setBuildNumber('')
            .setPrivateBuildNumber('');


        $urlRouterProvider.otherwise('/404');
        /**
         * md-datepicker settings for default date format
         * @param date
         * @returns {string}
         */
        $mdDateLocaleProvider.formatDate = function (date) {
            var m = moment(date);
            return m.isValid() ? m.format('YYYY-MM-DD') : '';
        };

        $stateProvider
            // 404
            .state('error', {
                url: '/404',
                template: templateProvider.getView('404')
            })
            // login page
            .state('login', {
                url: '/login',
                template: templateProvider.getView('login'),
                controller: 'loginCtrl',
                controllerAs: 'login'
            })
            // loading page
            .state('loading', {
                url: '/loading/',
                template: templateProvider.getView('loading'),
                resolve: {
                    languages: function (application, $http, langService) {
                        'ngInject';
                        langService.setHttpService($http);
                        langService.loadLanguages().then(function () {
                            application.setReadyStatus(true);
                        });
                    },
                    loadGenerator: function (generator, dialog, langService, toast) {
                        'ngInject';
                        generator.setDialog(dialog);
                        generator.setLangService(langService);
                        generator.setToast(toast);
                    }
                }
            })
            .state('app', {
                abstract: true,
                url: '',
                template: templateProvider.getView('home'),
                resolve: {
                    // Just to initialize mailService
                    initializeMailService: function (mailService, lookupService, $http) {
                        'ngInject';
                        lookupService.setHttpService($http);
                        return true;
                    },
                    lookups: function (lookupService) {
                        'ngInject';
                        return lookupService.loadLookups();
                    },
                    menus: function (sidebarService) {
                        'ngInject';
                        return sidebarService.loadMenuItems();
                    },
                    counters: function (counterService) {
                        'ngInject';
                        return counterService.loadCounters();
                    }
                }
            })
            // access denied
            .state('app.access-denied', {
                url: '/access-denied',
                template: templateProvider.getView('access-denied')
            })
            // landing page
            .state('app.landing-page', {
                url: '/landing-page',
                template: templateProvider.getView('landing-page'),
                controller: 'landingPageCtrl',
                controllerAs: 'ctrl'
            })
            // /*.state('password', {
            //     url: '/password-encrypt/entity/:identifier?',
            //     template: templateProvider.getView('password-encrypt'),
            //     controller: 'passwordEncryptCtrl',
            //     controllerAs: 'ctrl'
            // })*/

            // outgoing
            .state('app.outgoing', {
                abstract: true,
                url: '/outgoing',
                template: '<div id="sub-view-wrapper"><ui-view flex layout="column" class="sub-view" /></div>'
            })
            // outgoing mails
            .state('app.outgoing.mails', {
                url: '/mails',
                template: templateProvider.getView('outgoing-mails'),
                controller: 'outgoingMailCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    entities: function (entityService) {
                        'ngInject';
                        return entityService.getEntities();
                    },
                    allEntities: function (entityService) {
                        'ngInject';
                        return entityService.getAllEntities();
                    },
                    employees: function (employeeService) {
                        'ngInject';
                        return employeeService.loadEmployees();
                    }
                }
            })
            // incoming
            .state('app.incoming', {
                abstract: true,
                url: '/incoming',
                template: '<div id="sub-view-wrapper"><ui-view flex layout="column" class="sub-view" /></div>'
            })
            // incoming mails
            .state('app.incoming.mails', {
                url: '/mails',
                template: templateProvider.getView('incoming-mails'),
                controller: 'incomingMailCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    entities: function (entityService) {
                        'ngInject';
                        return entityService.getEntities();
                    },
                    allEntities: function (entityService) {
                        'ngInject';
                        return entityService.getAllEntities();
                    },
                    employees: function (employeeService) {
                        'ngInject';
                        return employeeService.loadEmployees();
                    }
                }
            })
            // internal
            .state('app.internal', {
                abstract: true,
                url: '/internal',
                template: '<div id="sub-view-wrapper"><ui-view flex layout="column" class="sub-view" /></div>'
            })
            // internal mails
            .state('app.internal.mails', {
                url: '/mails',
                template: templateProvider.getView('internal-mails'),
                controller: 'internalMailCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    entities: function (entityService) {
                        'ngInject';
                        return entityService.getEntities();
                    },
                    allEntities: function (entityService) {
                        'ngInject';
                        return entityService.getAllEntities();
                    },
                    employees: function (employeeService) {
                        'ngInject';
                        return employeeService.loadEmployees();
                    }
                }
            })
            // administration
            .state('app.administration', {
                abstract: true,
                url: '/administration',
                template: '<div id="sub-view-wrapper"><ui-view flex layout="column" class="sub-view" /></div>'
            })
            // employees
            .state('app.administration.employees', {
                url: '/employees',
                template: templateProvider.getView('employees'),
                controller: 'employeeCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    employees: function (employeeService) {
                        'ngInject';
                        return employeeService.loadEmployees();
                    },
                    permissions: function (permissionService) {
                        'ngInject';
                        return permissionService.loadPermissions();
                    }
                },
                permission: 'menu_item_admin_employees'
            })
            // entities
            .state('app.administration.entities', {
                url: '/entities',
                template: templateProvider.getView('entities'),
                controller: 'entityCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    entities: function (entityService) {
                        'ngInject';
                        return entityService.loadEntities();
                    },
                    entityTypes: function (entityTypeService) {
                        'ngInject';
                        return entityTypeService.loadEntityTypes();
                    },
                    employees: function (employeeService) {
                        'ngInject';
                        return employeeService.loadEmployees();
                    },
                    permissions: function (permissionService) {
                        'ngInject';
                        return permissionService.loadPermissions();
                    }
                },
                permission: 'menu_item_admin_entities'
            })
            // entity types
            .state('app.administration.entity-types', {
                url: '/entity-types',
                template: templateProvider.getView('entity-types'),
                controller: 'entityTypeCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    entityTypes: function (entityTypeService) {
                        'ngInject';
                        return entityTypeService.loadEntityTypes();
                    }
                }
            })
            // permissions
            .state('app.administration.permissions', {
                url: '/permissions',
                template: templateProvider.getView('permissions'),
                controller: 'permissionCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    permissions: function (permissionService) {
                        'ngInject';
                        return [];
                    }
                }
            })
            // search
            .state('app.search', {
                abstract: true,
                url: '/search',
                template: '<div id="sub-view-wrapper"><ui-view flex layout="column" class="sub-view" /></div>'
            })
            // general search
            .state('app.search.general', {
                url: '/general',
                template: templateProvider.getView('general-search'),
                controller: 'generalSearchCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    entities: function (entityService) {
                        'ngInject';
                        return entityService.loadEntities();
                    },
                    allEntities: function (entityService) {
                        'ngInject';
                        return entityService.loadAllEntities();
                    },
                    employees: function (employeeService) {
                        'ngInject';
                        return employeeService.loadEmployees();
                    }
                },
                permission: 'menu_item_search'
            })
            .state('app.reports', {
                abstract: true,
                url: '/reports',
                template: '<div id="sub-view-wrapper"><ui-view flex layout="column" class="sub-view" /></div>'
            })
            // mail details report
            .state('app.reports.mail-details', {
                url: '/reports/mail-details',
                template: templateProvider.getView('mail-details-report'),
                controller: 'mailDetailsReportCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    entities: function (entityService) {
                        'ngInject';
                        return entityService.loadEntities();
                    },
                    employees: function (employeeService) {
                        'ngInject';
                        return employeeService.loadEmployees();
                    }
                },
                permission: 'menu_item_report_mail_details'
            })
            // mail action details report
            .state('app.reports.mail-action-details', {
                url: '/reports/mail-action-details',
                template: templateProvider.getView('mail-action-details-report'),
                controller: 'mailActionDetailsReportCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    entities: function (entityService) {
                        'ngInject';
                        return entityService.loadEntities();
                    },
                    employees: function (employeeService) {
                        'ngInject';
                        return employeeService.loadEmployees();
                    }
                },
                permission: 'menu_item_report_mail_action_details'
            })
            // user details operation report
            .state('app.reports.employee-details', {
                url: '/reports/employee-details',
                template: templateProvider.getView('employee-details-report'),
                controller: 'employeeDetailsReportCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    entities: function (entityService) {
                        'ngInject';
                        return entityService.loadEntities();
                    },
                    employees: function (employeeService) {
                        'ngInject';
                        return employeeService.loadEmployees();
                    }
                },
                permission: 'menu_item_report_employee_details'
            })
            // user statical operation report
            .state('app.reports.employee-statical', {
                url: '/reports/employee-statical',
                template: templateProvider.getView('employee-statical-report'),
                controller: 'employeeStaticalReportCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    entities: function (entityService) {
                        'ngInject';
                        return entityService.loadEntities();
                    },
                    employees: function (employeeService) {
                        'ngInject';
                        return employeeService.loadEmployees();
                    }
                },
                permission: 'menu_item_report_employee_statical'
            })
            // department statical operation report
            .state('app.reports.department-statical', {
                url: '/reports/department-statical',
                template: templateProvider.getView('department-statical-report'),
                controller: 'departmentStaticalReportCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    entities: function (entityService) {
                        'ngInject';
                        return entityService.loadEntities();
                    },
                    employees: function (employeeService) {
                        'ngInject';
                        return employeeService.loadEmployees();
                    }
                },
                permission: 'menu_item_report_department_statical'
            })
            // tracking mail
            .state('tracking', {
                url: '/tracking',
                template: templateProvider.getView('tracking-mail'),
                controller: 'trackingMailCtrl',
                controllerAs: 'ctrl'
            })
    });
};
