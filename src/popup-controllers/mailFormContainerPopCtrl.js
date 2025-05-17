module.exports = function (app) {
    app.controller('mailFormContainerPopCtrl', function (dialog,
                                                         _,
                                                         validationService,
                                                         generator,
                                                         toast,
                                                         mailService,
                                                         langService,
                                                         gridService,
                                                         $timeout) {
        'ngInject';
        var self = this;
        self.controllerName = 'mailFormContainerPopCtrl';

        self.mailForm = null;

        //tabs
        self.tabsToShow = {
            mailInfo: {
                name: 'mailInfo',
                key: 'lbl_mail_info'
            },
            connectedPersonList: {
                name: 'connectedPersonList',
                key: 'lbl_connected_person_list'
            },
            packageItems: {
                name: 'packageItems',
                key: 'lbl_package_items'
            },
            deliveryRequiredItems: {
                name: 'deliveryRequiredItems',
                key: 'lbl_delivery_required_items'
            },
            attachments: {
                name: 'attachments',
                key: 'lbl_attachments',
                hide: true // hide by default and show after form load
            }
        };
        self.selectedTabName = self.tabsToShow.mailInfo.name;
        self.selectedTabIndex = 0;

        self.showTab = function (tab) {
            return !tab.hide;
        };
        self.setCurrentTab = function (tab, $event) {
            self.selectedTabName = tab.name;
        };
        self.isTabSelected = function (tab) {
            return self.selectedTabName.toLowerCase() === tab.name.toLowerCase()
        };
        self.changeTab = function (tab) {
            Object.keys(self.tabsToShow).forEach(function (key, index) {
                if (self.tabsToShow[key].name.toLowerCase() === tab.name.toLowerCase()) {
                    self.selectedTabIndex = index;
                }
            });
        };

        self.validateMailLabels = {
            priority: 'lbl_priority',
            postType: 'lbl_post_type',
            registerDate: 'lbl_register_date',
            attachmentNo: 'lbl_attachment_no',
            notes: 'lbl_notes',
            senderEntity: 'lbl_sender_entity',
            senderDep: 'lbl_sender_department',
            receiverEntity: 'lbl_receiver_entity',
            receiverDep: 'lbl_receiver_department'
        };

        /**
         * @description Adds new the mail
         * @param $event
         */
        self.addMail = function ($event) {
            validationService
                .createValidation('ADD_NEW_MAIL')
                .addStep('check_required_fields', true, generator.checkRequiredFields, self.mail, function (result) {
                    return !result.length;
                })
                .notifyFailure(function (step, result) {
                    var labels = _.map(result, function (label) {
                        return self.validateMailLabels[label];
                    });
                    generator.generateErrorFields('lbl_check_missing_fields', labels);
                })
                .validate()
                .then(function () {
                        self.mail.registerDate = generator.setCurrentTimeOfDate(self.mail.registerDate);
                        return mailService.saveMail(self.mail, $event)
                            .then(function (result) {
                                gridService.resetSearchText(self.grid);
                                gridService.resetSorting(self.grid, self.grid.order);
                                self.grid.reload(self.grid.page)
                                    .then(function () {
                                        self.resetForm();
                                        toast.success(langService.get('msg_add_mail_success'));
                                        result.openBarcode();
                                    });
                            })
                            .catch(function (error) {
                                toast.error(langService.get('msg_error_occurred_while_processing_request'));
                            })
                    }
                )
                .catch(function (error) {
                    toast.error(langService.get('msg_error_occurred_while_processing_request'));
                });
        };

        /**
         * @description Updates the existing mail
         * @param $event
         */
        self.updateMail = function ($event) {
            validationService
                .createValidation('UPDATE_MAIL')
                .addStep('check_required_fields', true, generator.checkRequiredFields, self.mail, function (result) {
                    return !result.length;
                })
                .notifyFailure(function (step, result) {
                    var labels = _.map(result, function (label) {
                        return self.validateMailLabels[label];
                    });
                    generator.generateErrorFields('lbl_check_missing_fields', labels);
                })
                .validate()
                .then(function () {
                        return mailService.saveMail(self.mail, $event)
                            .then(function (result) {
                                gridService.resetSearchText(self.grid);
                                gridService.resetSorting(self.grid, self.grid.order);
                                self.grid.reload(self.grid.page)
                                    .then(function () {
                                        //self.resetForm();
                                        dialog.hide();
                                        toast.success(langService.get('msg_edit_mail_success'));
                                    });
                            })
                            .catch(function (error) {
                                toast.error(langService.get('msg_error_occurred_while_processing_request'));
                            })
                    }
                )
                .catch(function (error) {
                    toast.error(langService.get('msg_error_occurred_while_processing_request'));
                });
        };

        /**
         * @description Resets the form
         */
        self.resetForm = function () {
            generator.resetFields(self.mail, angular.copy(self.model));
            // date is set again, in case the date changes between form opening and form reset time
            if (self.mail.isNewRecord())
                self.mail.registerDate = new Date();
            self.mailForm.$setUntouched();
            self.reset = true;
            $timeout(function () {
                self.reset = false;
            })
        };

        self.$onInit = function () {
            $timeout(function () {
                self.model = angular.copy(self.mail);
                self.tabsToShow.attachments.hide = !(self.model.isOutgoingMail() && self.model.isReceivedMailStatus());
            });
        };

        /**
         * @description Closes the dialog
         * @param $event
         */
        self.closePopup = function ($event) {
            dialog.cancel();
        };
    });
};
