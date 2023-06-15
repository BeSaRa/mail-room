module.exports = function (app) {
    require('./default')(app);
    require('./permissions')(app);
    require('./resolver')(app);
};