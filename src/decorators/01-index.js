module.exports = function (app) {
    require('./$pagination')(app);
    require('./mdTable')(app);
};