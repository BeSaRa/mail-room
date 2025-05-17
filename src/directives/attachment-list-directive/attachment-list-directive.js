module.exports = function (app) {
    //require('./attachment-list-style.scss');
    app.directive('attachmentListDirective', function () {
        'ngInject';
        return {
            restrict: 'E',
            template: require('./attachment-list-template.html'),
            controller: 'attachmentListDirectiveCtrl',
            controllerAs: 'ctrl',
            bindToController: true,
            scope: {
                mail: '=',
                resetForm: '=',
                disableAll: '=',
                editMode: '=',
                isMobileReceive: '=?',
                mailUpdated: '=?',
                attachmentList: '='
            }
        }
    })
};
