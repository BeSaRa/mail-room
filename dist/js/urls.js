(function () {
    angular
        .module('app')
        .config(function (urlServiceProvider) {
            'ngInject';

            urlServiceProvider
            // to load languages
                .addToAll('language', 'dist/resources/lang.json')
                // to load sidebar menus
                .addToAll('menus', 'dist/resources/menu.json')
                // to make authenticate
                .addToAllWithBase('login', '/auth/login')
                // to logout
                .addToAllWithBase('logout', '/auth/logout')
                // validate token
                .addToAllWithBase('validateToken', '/auth/validate-token')
                // admin change password
                .addToAllWithBase('adminchangePass', '/auth/adminchangePass')
                // user change password
                .addToAllWithBase('changePass', '/auth/changePass')
                // employees
                .addToAllWithBase('employees', '/employees')
                // entities
                .addToAllWithBase('entities', '/entities')
                // permissions
                .addToAllWithBase('permissions', 'employees/permissions')
                // entity types
                .addToAllWithBase('entityTypes', '/entity-types')
                // lookups
                .addToAllWithBase('lookups', '/look-ups/reload')
                // generic mail
                .addToAllWithBase('mail', '/inbox/')
                // generic id copy and signature
                .addToAllWithBase('mailTail', '/inbox/tail/')
                // outgoing mails
                .addToAllWithBase('outgoingMail', '/outgoing/')
                // incoming mails
                .addToAllWithBase('incomingMail', '/incoming/')
                // internal mails
                .addToAllWithBase('internalMail', '/internal/')
                // action log
                .addToAllWithBase('actionLog', '/log/actions/:id')
                // timeline log
                .addToAllWithBase('timeline', '/log/actions/time-line/:id')
                // tracking sheet
                .addToAllWithBase('trackingSheet', '/log/history/:id')
                // outgoing search
                .addToAllWithBase('outgoingSearch', '/search/outgoing')
                // incoming search
                .addToAllWithBase('incomingSearch', '/search/incoming')
                // internal search
                .addToAllWithBase('internalSearch', '/search/internal')
                // general search
                .addToAllWithBase('generalSearch', '/search/mailinbox')
                // tracking mail
                .addToAllWithBase('trackingMail', '/tracking')
                // mail counters
                .addToAllWithBase('mailCounter', '/tool/total-counts')
                // barcode
                .addToAllWithBase('barcode', '/tool/barcode-string')
                // reportings
                .addToAllWithBase('report', '/report')
                // mail details report
                .addToAllWithBase('mailDetailsReport', '/reports/mail-details')
                //mail actions details report
                .addToAllWithBase('mailActionsDetailsReport', '/reports/mail-actions-details')
                //user details operation report
                .addToAllWithBase('userDetailsOperationReport', '/reports/user-details-operation')
                //user statical operation report
                .addToAllWithBase('userStaticalOperationReport', '/reports/user-statical-operation')
                // switch entity
                .addToAllWithBase("selectEntityLogin", "/auth/changeEntity")
                // switch entity
                .addToAllWithBase("integration", "/integration")
                .addToAllWithBase('summaryReport',"/report/summeryReport/")
                .addToAllWithBase('deliveryReport',"/report/deliveryReport/")
                .addToAllWithBase('mobileRecieve','/inbox/mobileReceive')
                .addToAllWithBase('attachment','/inbox/attachment')
            //department statical operation report
            //    .addToAllWithBase('departmentStaticalOperationReport', '/reports/department-statical-operation')
            ;
        })
        .config(function (tokenServiceProvider, urlServiceProvider) {
            var urlService = urlServiceProvider.$get();
            tokenServiceProvider.setLastLoginEntityIdKey('entityLogin');
            // exclude urls form token provider
            tokenServiceProvider
                .excludeTokenFromUrl(urlService.login)
                .excludeTokenFromUrl(urlService.information);
        });

})();
