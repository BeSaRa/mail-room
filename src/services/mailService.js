module.exports = function (app) {
    app.service('mailService', function (util,
                                         $http,
                                         $filter,
                                         MailInbox,
                                         OutgoingMail,
                                         IncomingMail,
                                         InternalMail,
                                         GeneralMail,
                                         OutgoingMailFilter,
                                         IncomingMailFilter,
                                         InternalMailFilter,
                                         SearchMail,
                                         urlService,
                                         generator,
                                         langService,
                                         toast,
                                         dialog,
                                         $q,
                                         Lookup,
                                         gridService,
                                         lookupService,
                                         employeeService,
                                         mailRoomTemplate,
                                         FilterMail,
                                         userInfoService,
                                         Entity,
                                         _) {
        'ngInject';
        var self = this;
        self.serviceName = 'mailService';
        util.inherits(OutgoingMail, MailInbox);
        util.inherits(IncomingMail, MailInbox);
        util.inherits(InternalMail, MailInbox);
        util.inherits(GeneralMail, MailInbox);
        util.inherits(FilterMail, MailInbox);
        util.inherits(OutgoingMailFilter, FilterMail);
        util.inherits(IncomingMailFilter, FilterMail);
        util.inherits(InternalMailFilter, FilterMail);

        self.models = {
            OutgoingMail: OutgoingMail,
            IncomingMail: IncomingMail,
            InternalMail: InternalMail,
            GeneralMail: GeneralMail
        };

        self.searchedMails = [];

        /**
         * @description Categorize the mails by status type
         * @param mails
         * @param statusType
         * @returns {*}
         */
        self.categorizeMailsByStatusType = function (mails, statusType) {
            if (typeof statusType !== 'undefined' && statusType !== null) {
                if (!angular.isNumber(statusType) && typeof statusType === 'string')
                    statusType = lookupService.getLookupByKeyName(lookupService.statusTypes, statusType).getTypeId();
                else if (typeof statusType === 'object' && statusType instanceof Lookup) {
                    statusType = statusType.getTypeId();
                }
                return _.filter(mails, {'statusType': statusType});
            } else {
                return mails;
            }
        };

        /**
         * @description Categorize the mails by mail type
         * @param mails
         * @param mailType
         * @returns {*}
         */
        self.categorizeMailsByMailType = function (mails, mailType) {
            if (typeof mailType !== 'undefined' && mailType !== null) {
                if (!angular.isNumber(mailType) && typeof mailType === 'string')
                    mailType = lookupService.getLookupByKeyName(lookupService.mailTypes, mailType).getTypeId();
                else if (typeof mailType === 'object' && mailType instanceof Lookup) {
                    mailType = mailType.getTypeId();
                }
                return _.filter(mails, {'mailType': mailType});
            } else {
                return mails;
            }
        };

        /**
         * @description Saves the mail into database
         * @param mail
         * @param $event
         * @returns {*}
         */
        self.saveMail = function (mail, $event) {
            if (mail.isNewRecord()) {
                return _addMail(mail, $event)
            } else {
                return _updateMail(mail, $event)
            }
        };

        var _addMail = function (mail, $event) {
            var urlAndModel = mail.getUrlAndModelNameByMailType();
            var defer = $q.defer();
            $http.post(urlAndModel.url, generator.interceptSendInstance(['MailInbox', urlAndModel.model], mail))
                .then(function (result) {
                    result = generator.generateInstance(result.data, self.models[urlAndModel.model]);
                    result = generator.interceptReceivedInstance(['MailInbox', urlAndModel.model], result);
                    defer.resolve(result);
                })
                .catch(function (error) {
                    defer.reject(error)
                });
            return defer.promise;
        };

        var _updateMail = function (mail, $event) {
            var urlAndModel = mail.getUrlAndModelNameByMailType();
            var defer = $q.defer();
            $http.put(urlAndModel.url + 'update', generator.interceptSendInstance(['MailInbox', urlAndModel.model], mail))
                .then(function (result) {
                    result = generator.generateInstance(result.data, self.models[urlAndModel.model]);
                    result = generator.interceptReceivedInstance(['MailInbox', urlAndModel.model], result);
                    defer.resolve(result);
                })
                .catch(function (error) {
                    defer.reject(error)
                });
            return defer.promise;
        };

        /**
         * @description Delete given mail.
         * @param mail
         * @param $event
         * @returns {HttpPromise}
         */
        self.deleteMail = function (mail, $event) {
            return dialog.confirmMessage(langService.get('msg_confirm_delete_simple'))
                .then(function () {
                    return _deleteMail(mail, $event);
                }).catch(function () {
                    return $q.reject('cancel');
                });
        };

        var _deleteMail = function (mail, $event) {
            var urlAndModel = mail.getUrlAndModelNameByMailType($event);
            //TODO: once the slash is removed from url in urls file, change the url to "urlAndModel.url + '/' +mail.getMailId()"
            return $http.delete(urlAndModel.url + mail.getMailId())
                .then(function (result) {
                    if (result.status === 200)
                        return true;
                    else {
                        toast.error(langService.get('msg_error_occurred_while_processing_request'));
                        return false;
                    }
                })
                .catch(function (error) {
                    toast.error(langService.get('msg_error_occurred_while_processing_request'));
                    return $q.reject(false);
                });
        };

        /**
         * @description Delete Bulk Mails
         * @param mails
         * @param $event
         * @returns {*}
         */
        self.deleteBulkMails = function (mails, $event) {
            return dialog.confirmMessage(langService.get('msg_confirm_delete_selected_multiple'))
                .then(function () {
                    return _deleteBulkMails(mails, $event);
                }).catch(function () {
                    return $q.reject('cancel');
                });
        };

        var _deleteBulkMails = function (mails, $event) {
            var urlAndModel = mails[0].getUrlAndModelNameByMailType($event);

            mails = _.map(mails, function (mail) {
                return generator.interceptSendInstance(['MailInbox', urlAndModel.model], mail);
            });

            return $http({
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                url: urlAndModel.url + 'delete-bulk',
                data: mails
            }).then(function (result) {
                return generator.getBulkActionResponse(result, mails, false, 'msg_failed_delete_selected', 'msg_delete_success', 'msg_delete_success_except_following');

            }).catch(function (error) {
                toast.error(langService.get('msg_error_occurred_while_processing_request'));
                return $q.reject(false);
            });
        };

        /**
         * @description Gets the barcode of mail and open popup to show barcode
         * @param mail
         * @param $event
         * @returns {*}
         */
        self.getAndOpenBarcode = function (mail, $event) {
            var mailCopy = angular.copy(mail);
            if (mailCopy.barcode) {
                mailCopy.openBarcode($event);
            } else {
                $http.get(urlService.barcode + '?reference-no=' + mailCopy.getMailReferenceNo(), {
                    transformResponse: function (data) {
                        return data;
                    }
                }).then(function (result) {
                    mailCopy.barcode = result.data;
                    mailCopy.openBarcode($event);
                }).catch(function (error) {
                    toast.error(langService.get('error_show_barcode'));
                })
            }
        };

        self.selectBarcodeOrSummaryReport = function (mail, $event) {
            if (mail.packageItemList.length) {
                return dialog
                    .showDialog({
                        targetEvent: $event,
                        template: mailRoomTemplate.getPopup('select-barcode-summary-report'),
                        controller: function (dialog, $timeout, $element, langService, reportService, mailService) {
                            'ngInject';
                            var self = this;
                            self.selectOption = 'barcode';

                            self.view = function ($event) {
                                if (self.selectOption === 'summary') {
                                    reportService.viewSummaryReport(mail, $event);
                                } else {
                                    mailService.getAndOpenBarcode(mail, $event);
                                }
                            }

                            self.close = function ($event) {
                                dialog.hide();
                            };
                        },
                        controllerAs: 'ctrl',
                        bindToController: true,
                        escapeToClose: false,
                        locals: {
                            mail: mail
                        }
                    });
            } else {
                self.getAndOpenBarcode(mail, $event);
            }
        }

        /**
         * @description Change status for given mail
         * @param mail
         * @param targetStatusKey
         * @param $event
         * @returns {promise}
         */
        self.changeStatus = function (mail, targetStatusKey, $event) {
            /**
             * make a copy to avoid changes in original mail.
             * original mail will be used to check current(original) status of mail. This will help in deciding whether to show popup or directly request service to change status
             */
            var mailCopy = angular.copy(mail);
            // clear the fields in mail according to current and target status of mail
            // after clearing the fields, update the new status in mail
            var targetStatusKeyCopy = targetStatusKey;
            var isMobileReceive = targetStatusKey === lookupService.statusTypesKeys.mobile_received;
            if (isMobileReceive) {
                targetStatusKeyCopy = lookupService.statusTypesKeys.received;
            }
            mailCopy.clearFields(targetStatusKey)
                .setMailStatusType(lookupService.getLookupByKeyName(lookupService.statusTypes, targetStatusKeyCopy).getTypeId());

            var defer = $q.defer(), successMsgKey, confirmMsg;

            if (targetStatusKey === lookupService.statusTypesKeys.new) {
                if (mail.isExpectedMailStatus()) {
                    successMsgKey = 'msg_add_mail_success';
                    confirmMsg = 'lbl_confirm_accept_mail';
                } else if (mail.isSentMailStatus() || mail.isReceivedMailStatus()) {
                    successMsgKey = 'msg_return_success';
                    confirmMsg = 'lbl_confirm_return_mail';
                }
                dialog.confirmMessage(langService.get(confirmMsg))
                    .then(function () {
                        _changeStatusCallback(mailCopy, $event)
                            .then(function (result) {
                                if (!result)
                                    defer.reject(langService.get('msg_error_occurred_while_processing_request'));

                                defer.resolve(result);
                            })
                            .catch(function (error) {
                                defer.reject(error);
                            });
                    });
            } else if (targetStatusKey === lookupService.statusTypesKeys.sent) {
                if (mail.isNewMailStatus()) {
                    successMsgKey = 'msg_sent_success';
                    mailCopy.sentDate = new Date();
                    mailCopy.registerDate = new Date(mailCopy.registerDate);
                    dialog
                        .showDialog({
                            targetEvent: $event,
                            template: mailRoomTemplate.getPopup('send-mail'),
                            controller: 'sendMailPopCtrl',
                            controllerAs: 'ctrl',
                            bindToController: true,
                            escapeToClose: false,
                            locals: {
                                mail: mailCopy,
                                senders: employeeService.employees,
                                callback: _changeStatusCallback
                            }
                        })
                        .then(function (result) {
                            defer.resolve(result);
                        })
                        .catch(function (error) {
                            defer.reject(error);
                        });
                } else if (mail.isReceivedMailStatus()) {
                    successMsgKey = 'msg_return_success';
                    confirmMsg = 'lbl_confirm_return_mail';

                    dialog.confirmMessage(langService.get(confirmMsg))
                        .then(function () {
                            _changeStatusCallback(mailCopy, $event)
                                .then(function (result) {
                                    defer.resolve(result);
                                })
                        });
                }
            } else if (targetStatusKey === lookupService.statusTypesKeys.received || isMobileReceive) {
                successMsgKey = 'msg_receive_success';
                mailCopy.receivedDate = new Date();
                mailCopy.sentDate = new Date(mailCopy.sentDate);
                if (isMobileReceive) {
                    mailCopy.receiverName = userInfoService.getCurrentUser().getTranslatedName();
                }
                dialog
                    .showDialog({
                        targetEvent: $event,
                        template: mailRoomTemplate.getPopup('receive-mail'),
                        controller: 'receiveMailPopCtrl',
                        controllerAs: 'ctrl',
                        bindToController: true,
                        escapeToClose: false,
                        locals: {
                            mail: mailCopy,
                            callback: isMobileReceive ? _mobileReceiveCallback : _changeStatusCallback,
                            isMobileReceive: isMobileReceive
                        }
                    })
                    .then(function (result) {
                        defer.resolve(result);
                    })
                    .catch(function (error) {
                        defer.reject(error);
                    });
            }

            return defer.promise.then(function (result) {
                toast.success(langService.get(successMsgKey));
                return result;
            }).catch(function (error) {
                if (error !== 'close') {
                    toast.error(langService.get('msg_error_occurred_while_processing_request'));
                }
                return false;
            });
        };

        /**
         * @description Change status callback.
         * It will be called from service or submitting form for change status.
         * @param mail
         * @param $event
         * @returns {*}
         * @private
         */
        var _changeStatusCallback = function (mail, $event) {
            var urlAndModel = mail.getUrlAndModelNameByMailType($event);
            return $http.put(urlAndModel.url + 'change-status/', generator.interceptSendInstance(['MailInbox', urlAndModel.model], mail))
                .then(function (result) {
                    /*result = generator.generateInstance(self.models[urlAndModel.model], result.data);
                    result = generator.interceptReceivedInstance(urlAndModel.model, result);*/
                    return result.status === 200;
                })
                .catch(function (error) {
                    return false;
                });
        };

        var _mobileReceiveCallback = function (mail, $event) {
            return $http.post(urlService.mobileRecieve, generator.interceptSendInstance(['MailInbox', 'IncomingMail', 'MobileReceive'], mail))
                .then(function (result) {
                    return result.status === 200;
                }).catch(function () {
                    return false
                })
        }

        /**
         * @description Change status bulk
         * @param mails
         * @param targetStatusKey
         * @param $event
         */
        self.changeStatusBulk = function (mails, targetStatusKey, $event) {
            /**
             * make a copy to avoid changes in original mails.
             * original mails will be used to check current(original) status of mails. This will help in deciding whether to show popup or directly request service to change status
             */
            var mailsCopy = angular.copy(mails);

            // clear the fields in mails according to current and target status of mail
            // after clearing the fields, update the new status in mails
            var targetStatusKeyCopy = targetStatusKey;
            var isMobileReceive = targetStatusKey === lookupService.statusTypesKeys.mobile_received;
            if (isMobileReceive) {
                targetStatusKeyCopy = lookupService.statusTypesKeys.received;
            }
            _.forEach(mailsCopy, function (mailCopy) {
                mailCopy.clearFields(targetStatusKey)
                    .setMailStatusType(lookupService.getLookupByKeyName(lookupService.statusTypes, targetStatusKeyCopy).getTypeId());
            });

            var defer = $q.defer(), successMsgKey, confirmMsg;
            var checkMail = mails[0];

            if (targetStatusKey === lookupService.statusTypesKeys.new) {
                if (checkMail.isExpectedMailStatus()) {
                    successMsgKey = 'msg_add_mail_success';
                    confirmMsg = 'lbl_confirm_accept_mail';
                } else if (checkMail.isSentMailStatus() || checkMail.isReceivedMailStatus()) {
                    successMsgKey = 'msg_return_success';
                    confirmMsg = 'lbl_confirm_return_mail';
                }
                dialog.confirmMessage(langService.get(confirmMsg))
                    .then(function () {
                        _changeStatusBulkCallback(mailsCopy, $event)
                            .then(function (result) {
                                defer.resolve(result);
                            })
                            .catch(function (error) {
                                defer.reject(error);
                            });
                    });
            } else if (targetStatusKey === lookupService.statusTypesKeys.sent) {
                if (checkMail.isNewMailStatus()) {
                    successMsgKey = 'msg_sent_success';
                    _.map(mailsCopy, function (mailCopy) {
                        mailCopy.sentDate = new Date();
                        mailCopy.registerDate = new Date(mailCopy.registerDate);
                    });

                    dialog
                        .showDialog({
                            targetEvent: $event,
                            template: mailRoomTemplate.getPopup('send-mails-bulk'),
                            controller: 'sendMailsBulkPopCtrl',
                            controllerAs: 'ctrl',
                            bindToController: true,
                            escapeToClose: false,
                            locals: {
                                mails: mailsCopy,
                                senders: employeeService.employees,
                                callback: _changeStatusBulkCallback
                            }
                        })
                        .then(function (result) {
                            defer.resolve(result);
                        })
                        .catch(function (error) {
                            defer.reject(error);
                        });
                } else if (checkMail.isReceivedMailStatus()) {
                    successMsgKey = 'msg_return_success';
                    confirmMsg = 'lbl_confirm_return_mail';

                    dialog.confirmMessage(langService.get(confirmMsg))
                        .then(function () {
                            _changeStatusBulkCallback(mailsCopy, $event)
                                .then(function (result) {
                                    defer.resolve(result);
                                })
                                .catch(function (error) {
                                    defer.reject(error);
                                });
                        });
                }
            } else if (targetStatusKey === lookupService.statusTypesKeys.received || isMobileReceive) {
                successMsgKey = 'msg_receive_success';
                _.map(mailsCopy, function (mailCopy) {
                    mailCopy.receivedDate = new Date();
                    mailCopy.sentDate = new Date(mailCopy.sentDate);
                    if (isMobileReceive) {
                        mailCopy.receiverName = userInfoService.getCurrentUser().getTranslatedName();
                    }
                });

                dialog
                    .showDialog({
                        targetEvent: $event,
                        template: mailRoomTemplate.getPopup('receive-mails-bulk'),
                        controller: 'receiveMailsBulkPopCtrl',
                        controllerAs: 'ctrl',
                        bindToController: true,
                        escapeToClose: false,
                        locals: {
                            mails: mailsCopy,
                            callback: isMobileReceive ? _mobileReceiveBulkCallback : _changeStatusBulkCallback,
                            isMobileReceive: isMobileReceive
                        }
                    })
                    .then(function (result) {
                        defer.resolve(result);
                    })
                    .catch(function (error) {
                        defer.reject(error);
                    });
            }

            return defer.promise.then(function (result) {
                return generator.getBulkActionResponse(result, mailsCopy, false, 'msg_error_occurred_while_processing_request', successMsgKey, 'msg_status_changed_success_except_following');
            }).catch(function (error) {
                if (error !== 'close') {
                    toast.error(langService.get('msg_error_occurred_while_processing_request'));
                }
                return false;
            });
        };


        /**
         * @description mobile receive bulk (BE suggest to do workaround here and loop request for bulk)
         * @param mails
         * @param $event
         * @returns {*}
         * @private
         */
        var _mobileReceiveBulkCallback = function (mails, $event) {
            if (!mails.length) {
                return true;
            }
            var mail = mails.shift();
            return _mobileReceiveCallback(mail, $event)
                .then(function (result) {
                    if (!mails.length) {
                        return result;
                    }
                    _mobileReceiveBulkCallback(mails, $event);
                    return result;
                }).catch(function () {
                    return false;
                });
        }

        var _changeStatusBulkCallback = function (mails, $event) {
            var urlAndModel = mails[0].getUrlAndModelNameByMailType($event);
            mails = _.map(mails, function (mail) {
                return generator.interceptSendInstance(['MailInbox', urlAndModel.model], mail);
            });

            return $http.put(urlAndModel.url + 'change-status-bulk/', mails)
                .then(function (result) {
                    return result;
                })
                .catch(function (error) {
                    return false;
                });
        };

        /***
         * @description Show Tracking History
         * @param mail
         * @param $event
         * @returns {promise}
         */
        self.openTrackingSheetDialog = function (mail, $event) {
            return dialog
                .showDialog({
                    targetEvent: $event,
                    template: mailRoomTemplate.getPopup('tracking-sheet'),
                    controller: 'trackingSheetPopCtrl',
                    controllerAs: 'ctrl',
                    bindToController: true,
                    locals: {
                        mail: mail
                    },
                    resolve: {
                        trackingSheets: function (trackingSheetService) {
                            'ngInject';
                            return trackingSheetService.loadTrackingSheets(mail, $event);
                        }
                    }
                })
        };

        /***
         *
         * @description Show Action logs
         * @param mail
         * @param $event
         * @returns {promise}
         */
        self.openActionLogsDialog = function (mail, $event) {
            return dialog
                .showDialog({
                    targetEvent: $event,
                    template: mailRoomTemplate.getPopup('action-logs'),
                    controller: 'actionLogPopCtrl',
                    controllerAs: 'ctrl',
                    bindToController: true,
                    locals: {
                        mail: mail
                    },
                    resolve: {
                        actionLogs: function (actionLogService) {
                            'ngInject';
                            return actionLogService.loadActionLogs(mail, $event);
                        }
                    }
                })
        };

        /***
         * @description Show Timeline
         * @param mail
         * @param $event
         * @returns {promise}
         */
        self.openTimelineDialog = function (mail, $event) {
            return dialog
                .showDialog({
                    targetEvent: $event,
                    template: mailRoomTemplate.getPopup('timeline'),
                    controller: function (dialog, $element, $timeout, printService) {
                        'ngInject';
                        var self = this;

                        self.print = function ($event) {
                            printService.printTimeline(self.mail, self.timelineRecords, $event)
                        };

                        self.closeDialog = function ($event) {
                            dialog.cancel();
                        };
                    },
                    controllerAs: 'ctrl',
                    bindToController: true,
                    locals: {
                        mail: mail
                    },
                    resolve: {
                        timelineRecords: function (actionLogService) {
                            'ngInject';
                            return actionLogService.loadTimeline(mail, $event);
                        }
                    }
                })
        };

        /**
         * @description Filters the mails depending upon criteria passed by user
         * @param criteria
         * @param grid
         * @param recordsCopy
         * @param $event
         */
        self.filterMails = function (criteria, grid, recordsCopy, $event) {
            if (gridService.isGridServerScope(grid.filterGridCriteria.filterScope)) {
                return _filterServerGridData(criteria, grid, $event);
            } else {
                return _filterClientGridData(criteria, recordsCopy, $event);
            }
        };

        /**
         * @description Filters the grids on server side
         * @param criteria
         * @param grid
         * @param $event
         * @returns {Promise}
         */
        var _filterServerGridData = function (criteria, grid, $event) {
            criteria = new SearchMail({
                mail: criteria,
                receivedDateFrom: criteria.receivedDateFrom,
                receivedDateTo: criteria.receivedDateTo,
                sentDateFrom: criteria.sentDateFrom,
                sentDateTo: criteria.sentDateTo,
                registerDateFrom: criteria.registerDateFrom,
                registerDateTo: criteria.registerDateTo
            });

            return self.searchMails(criteria, grid, $event)
                .then(function (result) {
                    return result;
                })
                .catch(function (error) {
                    return error;
                })
        };

        /**
         * @description Filters the grids on client side
         * @param criteria
         * @param recordsCopy
         * @param $event
         * @returns {Promise}
         */
        var _filterClientGridData = function (criteria, recordsCopy, $event) {
            try {
                var comparisonMap = criteria.getComparisonMapSimplified(),
                    record = null, recordCopy = null,
                    keysWithValue = criteria.getPropertiesWithValue(),
                    callback, property,
                    result = [],
                    criteriaCopy = generator.interceptSendInstance(['FilterMail'], criteria);

                for (var i = 0; i < recordsCopy.length; i++) {
                    record = recordsCopy[i];
                    recordCopy = generator.interceptSendInstance(['FilterMail'], angular.copy(record));

                    var isMatch = false;
                    for (var j = 0; j < keysWithValue.length; j++) {
                        property = keysWithValue[j];
                        callback = comparisonMap[property];
                        if (callback) {
                            if (callback === 'mailPropertyDatesBetween') {
                                var prop = (property.indexOf('From') > -1) ? property.substr(0, property.indexOf('From')) : property.substr(0, property.indexOf('To'));
                                isMatch = recordCopy[callback](prop, criteriaCopy[prop + 'From'], criteriaCopy[prop + 'To']);
                            } else {
                                isMatch = recordCopy[callback](property, criteriaCopy[property]);
                            }
                            // if all the properties filled by user matches, its okay
                            // otherwise, it means the record is not matching criteria. break it.
                            if (!isMatch) {
                                break;
                            }
                        }
                    }
                    if (isMatch) {
                        result.push(record);
                    }
                }
                return $q.resolve(result);
            } catch (error) {
                return $q.reject(error);
            }
        };

        /**
         * @description Search the text in the grid data
         * @param grid
         * @param recordsCopy
         * copy of original records which will be returned in case search is empty.
         * Used only in case of client side paging
         * @param totalRecords
         * total records number which will be returned.
         * Used only in case of server side paging
         * @returns {*}
         */
        self.searchMailGridData = function (grid, recordsCopy, totalRecords) {
            if (!grid.searchText)
                return {
                    mails: recordsCopy,
                    totalRecords: gridService.isGridServerScope(grid.pagingScope) ? totalRecords : recordsCopy.length
                };
            else {
                self.gridToSearch = grid;
                var searchedRecords = $filter('filter')(recordsCopy, _searchRecords);
                return {
                    mails: searchedRecords,
                    totalRecords: searchedRecords.length
                };
            }
        };

        var _searchRecords = function (item, index, records) {
            var searchTextCopy = angular.copy(self.gridToSearch.searchText.trim().toLowerCase());
            var column = null, propertyToSearch, propertyValue, result;
            for (var property in self.gridToSearch.columns) {
                column = self.gridToSearch.columns[property];
                /*Search only if column is visible and has searchKey property*/
                if (self.gridToSearch.showColumn(column) && column.hasOwnProperty('searchKey')) {
                    propertyToSearch = self.gridToSearch.columns[property].searchKey;
                    if (typeof propertyToSearch === 'function')
                        propertyToSearch = propertyToSearch();
                    // if property to search has value(property name defined), then search, otherwise, skip search
                    if (propertyToSearch) {
                        propertyValue = _.result(item, propertyToSearch);
                        if (propertyValue && propertyValue.toString().toLowerCase().indexOf(searchTextCopy) > -1) {
                            result = true;
                            break;
                        }
                        result = false;
                    }
                    result = false;
                }
                result = false;
            }
            return result;
        };

        /**
         * @description Search mails from server.
         * @param criteria
         * @param grid
         * @param $event
         * @returns {*}
         */
        self.searchMails = function (criteria, grid, $event) {
            var urlAndModel = criteria.hasOwnProperty('mail')
                ? criteria.mail.getUrlAndModelNameByMailType($event)
                : criteria.getUrlAndModelNameByMailType($event);

            var url = urlAndModel.searchUrl;
            if (grid.sortScope === 'server') {
                url += "?page=" + (grid.page - 1) + "&size=" + grid.limit;

                if (grid.order !== '') {
                    var orderCopy = angular.copy(grid.order);
                    url += "&sort=" + (grid.order.indexOf('-') === 0 ? orderCopy.substring(1) : grid.order) + "," + (grid.order.indexOf('-') === 0 ? "DESC" : "ASC");
                }
            }

            return $http.put(url, generator.interceptSendInstance('SearchMail', criteria))
                .then(function (result) {
                    var records = generator.generateCollection(result.data.content, self.models[urlAndModel.model], self._sharedMethods);
                    records = generator.interceptReceivedCollection(['MailInbox', urlAndModel.model], records);

                    return {
                        mails: records,
                        totalRecords: result.data.totalElements
                    };
                })
                .catch(function (error) {
                    return [];
                });
        };

        /**
         * @description Search general mails from server.
         * @param criteria
         * @param $event
         * @returns {*}
         */
        self.searchGeneralMails = function (criteria, $event) {
            return $http.put(urlService.generalSearch, generator.interceptSendInstance('SearchMail', criteria))
                .then(function (result) {
                    var records = generator.generateCollection(result.data.content, GeneralMail, self._sharedMethods);
                    records = generator.interceptReceivedCollection(['MailInbox', 'GeneralMail'], records);
                    return records;
                })
                .catch(function (error) {
                    return [];
                });
        };

        /**
         * @description Gets the barcode of mail and open popup to show barcode
         * @param referenceNo
         * @param $event
         * @returns {*}
         */
        self.getBarcodeMailByReferenceNumber = function (referenceNo, statusTypesKey, $event) {
            //ToDo pass statusTypeskey to url and change the right urlService
            return $http.get(urlService.outgoingMail + '?reference-no=' + referenceNo, {
                transformResponse: function (data) {
                    return data;
                }
            }).then(function (result) {
                if (result.data) {
                    result = generator.interceptReceivedInstance('MailInbox', result.data);
                    return result;
                }
                return false;
            }).catch(function (error) {
                toast.error(langService.get('can_not_find_mail'));
                return false;
            })
        };


        /**
         * @description get mail by reference No
         * @param referenceNo
         * @param isTracking
         * @param $event
         * @returns {*}
         */
        self.getMailByReferenceNumber = function (referenceNo, isTracking, $event) {
            referenceNo = referenceNo instanceof MailInbox ? referenceNo.getMailReferenceNo() : referenceNo;
            return $http.get(urlService.mail + 'find?reference-no=' + referenceNo)
                .then(function (result) {
                    if (result.data) {
                        result = generator.generateInstance(result.data, MailInbox, self._sharedMethods);
                        result = generator.interceptReceivedInstance(isTracking ? 'MailInboxTracking' : 'MailInbox', result);
                        return result;
                    }
                    return false;
                })
                .catch(function (error) {
                    return false;
                });
        };


        /**
         * open dialog to scan mails barcode
         * @param grid
         * @param statusTypesKey
         * @param $event
         */
        self.openScanMailsDialog = function (grid, statusTypesKey, $event) {
            return dialog
                .showDialog({
                    targetEvent: $event,
                    template: mailRoomTemplate.getPopup('barcode-scanner'),
                    controller: 'barcodeScannerPopCtrl',
                    controllerAs: 'ctrl',
                    bindToController: true,
                    escapeToClose: false,
                    locals: {
                        grid: grid,
                        statusTypesKey: statusTypesKey
                    }
                })
        }

        /**
         * @description Loads the mail from database by id.
         * @param mailId
         * Indicates if newly fetched mail will be updated in the existing mails list.
         * @returns {internal}
         */
        self.loadMailById = function (mailId) {
            mailId = mailId instanceof MailInbox ? mailId.getMailId() : mailId;

            return $http.get(urlService.mail + mailId)
                .then(function (result) {
                    if (result.data) {
                        result = generator.generateInstance(result.data, MailInbox, self._sharedMethods);
                        result = generator.interceptReceivedInstance('MailInbox', result);
                        return result;
                    }
                    return false;
                })
                .catch(function (error) {
                    return false;
                });
        };


        self.getMailTail = function (mail) {
            return $http.get(urlService.mailTail + mail.id)
                .then(function (result) {
                    if (result.data) {
                        mail.idCopy = result.data.idCopy;
                        mail.signature = result.data.signature;

                        result = generator.generateInstance(mail, MailInbox, self._sharedMethods);
                        result = generator.interceptReceivedInstance('MailInbox', result);

                        return result;
                    }
                    return false;
                })
                .catch(function (error) {
                    return false;
                });
        };

        /* /!**
          * @description Load the entities from server.
          * @returns {Promise|entities}
          *!/
         self.loadWorkItemByBarcode = function ($event, barcode, mail) {
             return $http.get(urlService.integration + '/find/barCode/' + barcode + "/" + mail.mailType)
                 .then(function (result) {
                     return result.data;
                 })
                 .catch(function (error) {
                     return $q.reject(error);
                 });
         };*/

        function _deleteItemId(item) {
            if (item.hasOwnProperty('id'))
                delete item.id;
            return item;
        }

        function _deleteMailIds(mail) {
            delete mail.id;
            mail.connectedPersonList.map(item => _deleteItemId(item));
            mail.packageItemList.map(item => _deleteItemId(item));
            mail.deliveryRequiredItemList.map(item => _deleteItemId(item));
            mail.registerDate = generator.setCurrentTimeOfDate(mail.registerDate);
        }

        /**
         * @description Load the entities from server.
         * @returns {Promise|entities}
         */
        self.loadItemByReferenceNumber = function ($event, refNum, mail) {
            var urlAndModel = mail.getUrlAndModelNameByMailType();
            return $http.post(urlService.integration + '/mail', {
                refrenceNumber: refNum,
                systemId: mail.integratedSystemId
            }).then(function (result) {
                var mail = generator.generateInstance(result.data, self.models[urlAndModel.model]);
                mail = generator.interceptReceivedInstance(['MailInbox', urlAndModel.model], mail);
                _deleteMailIds(mail);
                return mail;
            }).catch(function (error) {
                return $q.reject(error);
            });
        };

        /* /!**
          * @description open dialog to enter serial number and get entities and departments from CMS
          * @param $event
          * @param mail
          * @returns {promise}
          *!/
         self.openFilterByBarcodeDialog = function ($event, mail) {
             return dialog
                 .showDialog({
                     targetEvent: $event,
                     template: mailRoomTemplate.getPopup('workItem-barcode'),
                     controller: 'workItemBarcodePopCtrl',
                     controllerAs: 'ctrl',
                     bindToController: true,
                     escapeToClose: false,
                     locals: {
                         mail: mail
                     }
                 })

         };*/

        self.openIntegrationDialog = function ($event, mail) {
            return dialog
                .showDialog({
                    targetEvent: $event,
                    template: mailRoomTemplate.getPopup('integration-system'),
                    controller: 'integrationSystemPopCtrl',
                    controllerAs: 'ctrl',
                    bindToController: true,
                    escapeToClose: false,
                    locals: {
                        mail: mail
                    }
                })
        }
    });
};
