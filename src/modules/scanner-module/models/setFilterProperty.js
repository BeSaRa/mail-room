module.exports = function (app) {
    app.factory('setFilterProperty', function () {
        'ngInject';
        return function setFilterProperty(filters, filterName, propName) {
            for (var i in filters) {
                if (filters[i].Name == filterName) {
                    for (var y in filters[i].Properties) {
                        if (filters[i].Properties[y].Name == propName) {
                            filters[i].Properties[y].Value = propValue;
                        }
                    }
                }
            }
        }
    })
};