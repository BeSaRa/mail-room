module.exports = function (app) {
    require('./landingPageCtrl')(app);
    require('./loginCtrl')(app);
    // require('./passwordEncryptCtrl')(app);

    //outgoing
    require('./outgoingMailCtrl')(app);
    // incoming
    require('./incomingMailCtrl')(app);
    // internal
    require('./internalMailCtrl')(app);

    // administration
    require('./employeeCtrl')(app);
    require('./permissionCtrl')(app);
    require('./entityCtrl')(app);
    require('./entityTypeCtrl')(app);

    // search
    require('./generalSearchCtrl')(app);

    //reports
    require('./mailDetailsReportCtrl')(app);
    require('./mailActionDetailsReportCtrl')(app);
    require('./employeeStaticalReportCtrl')(app);
    require('./employeeDetailsReportCtrl')(app);
    require('./departmentStaticalReportCtrl')(app);
    require('./trackingMailCtrl')(app);
};