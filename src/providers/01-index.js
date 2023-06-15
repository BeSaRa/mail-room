module.exports = function (app) {
    require('./MailRoomModelInterceptorProvider')(app);
    require('./templateProvider')(app);
    require('./urlServiceProvider')(app);
    require('./loginPageProvider')(app);
    require('./resolverProvider')(app);
    require('./exceptionProvider')(app);
    require('./momentProvider')(app);
    require('./permissionProvider')(app);
    require('./headerProvider')(app);
    require('./tokenService')(app);
    require('./versionServiceProvider')(app);
    require('./configurationServiceProvider')(app);
};
