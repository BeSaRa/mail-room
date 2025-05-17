module.exports = function (app) {
    require('./application')(app);
    require('./authenticationService')(app);
    require('./helpService')(app);
    require('./customValidationService')(app);
    require('./generator')(app);
    require('./idleCounterService')(app);
    require('./listGeneratorService')(app);
    require('./loadingIndicatorService')(app);
    require('./loginDialogService')(app);
    require('./lookupService')(app);
    require('./officeWebAppService')(app);
    require('./sidebarService')(app);
    require('./stateHelperService')(app);
    require('./tableGeneratorService')(app);
    require('./titleService')(app);
    require('./toast')(app);
    require('./validationService')(app);
    require('./userInfoService')(app);

    require('./employeeService')(app);
    require('./entityService')(app);
    require('./permissionService')(app);
    require('./entityTypeService')(app);
    require('./mailService')(app);
    require('./outgoingMailService')(app);
    require('./incomingMailService')(app);
    require('./internalMailService')(app);
    require('./gridService')(app);
    require('./actionLogService')(app);
    require('./trackingSheetService')(app);
    require('./counterService')(app);
    require('./reportService')(app);
    require('./printService')(app);
    require('./attachmentService')(app);

};
