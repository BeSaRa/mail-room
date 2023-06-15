module.exports = function (app) {
    require('./LookupIntercepetor')(app);
    require('./MenuItemInterceptor')(app);
    require('./CurrentUserInterceptor')(app);

    require('./EmployeeInterceptor')(app);
    require('./PermissionInterceptor')(app);
    require('./EmployeePermissionInterceptor')(app);
    require('./EntityInterceptor')(app);
    require('./EntityTypeInterceptor')(app);
    require('./LoginResponseInterceptor')(app);

    require('./MailInboxInterceptor')(app);
    require('./OutgoingMailInterceptor')(app);
    require('./IncomingMailInterceptor')(app);
    require('./InternalMailInterceptor')(app);

    require('./FilterMailInterceptor')(app);
    require('./OutgoingMailFilterInterceptor')(app);
    require('./IncomingMailFilterInterceptor')(app);
    require('./InternalMailFilterInterceptor')(app);

    require('./ActionLogInterceptor')(app);
    require('./TrackingSheetInterceptor')(app);

    require('./SearchMailInterceptor')(app);
    require('./ReportingInterceptor')(app);

    require('./CounterInterceptor')(app);
    require('./PackageItemInterceptor')(app);
    require('./ConnectedPersonInterceptor')(app);
    require('./DeliveryRequiredItemInterceptor')(app);
    require('./MobileReceiveInterceptor')(app);
};
