module.exports = function (app) {
    app.service('attachmentService', function ($http,
                                               urlService,
                                               generator,
                                               dialog,
                                               $sce,
                                               $q,
                                               toast,
                                               langService,
                                               mailRoomTemplate) {
        'ngInject';
        var self = this;

        /**
         * @description Load the Attachments By Mail Id from server.
         * @param mailId
         * @param $event
         * @returns {*}
         */
        self.loadAttachmentsByMailId = function (mailId, $event) {
            mailId = mailId.hasOwnProperty('id') ? mailId.getMailId() : mailId;

            return $http.get(urlService.attachment + '/' + mailId)
                .then(function (result) {
                    if (result.data) {
                        return result.data;
                    }
                    return [];
                })
                .catch(function (error) {
                    return [];
                })
        };
        self.viewAttachment = function (attachment, $event) {
            _getAttachmentContentUrl(attachment)
                .then(function (contentUrl) {
                    if (!contentUrl) {
                        toast.error(langService.get('msg_content_not_found'));
                        return null;
                    }

                    var heading = langService.get('lbl_attachment');
                    var attachmentName = (langService.current === 'ar' ? attachment.nameAr : attachment.nameEn);
                    heading += (attachmentName ? ' - ' + attachmentName : '');

                    dialog.showDialog({
                        template: mailRoomTemplate.getPopup('content-viewer'),
                        controller: 'contentViewerPopCtrl',
                        controllerAs: 'ctrl',
                        bindToController: true,
                        locals: {
                            heading: heading,
                            contentUrl: contentUrl
                        }
                    });
                })
        };

        function _getAttachmentContentUrl(attachment) {
            if (!attachment.content) {
                return $q.resolve(null);
            }
            var base64 = generator.convertBinaryDataToURL(attachment.content);
            return self.convertBase64ToBlob(base64)
                .then(function (blob) {
                    if (!blob || blob.size === 0) {
                        return null;
                    }
                    return $sce.trustAsResourceUrl(URL.createObjectURL(blob));
                });
        }

        self.convertBase64ToBlob = function (base64Content) {
            return $http.get(base64Content, {responseType: 'blob'})
                .then(function (result) {
                    return result.data;
                });
        };

    })
};
