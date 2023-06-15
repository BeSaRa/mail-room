module.exports = function (app) {
    app.service('outgoingMailService', function ($http,
                                                 urlService,
                                                 generator,
                                                 langService,
                                                 mailRoomTemplate,
                                                 dialog,
                                                 toast,
                                                 $q,
                                                 _,
                                                 $timeout,
                                                 OutgoingMail,
                                                 userInfoService,
                                                 lookupService,
                                                 employeeService,
                                                 mailService,
                                                 authenticationService,
                                                 entityService,
                                                 OutgoingMailFilter,
                                                 gridService) {
        'ngInject';
        var self = this;

        self.mails = [];
        self.searchMailCriteria = {};
        self.totalRecords = 0;

        /**
         * @description Load the mails from server.
         * @param statusType
         * @param grid
         * @param $event
         * @returns {Promise|mails}
         */
        self.loadMails = function (statusType, grid, $event) {
            var paramsArray = [];
            statusType = lookupService.getLookupTypeId(statusType, lookupService.statusTypes);
            if (grid.hasOwnProperty('pagingScope') && gridService.isGridServerScope(grid.pagingScope)) {
                paramsArray.push("page", '=', (grid.page - 1), "&", "size", "=", grid.limit);
            }
            if (grid.hasOwnProperty('sortScope') && gridService.isGridServerScope(grid.sortScope)) {
                if (grid.order !== '') {
                    var sort = angular.copy(grid.order), sortDirection = "ASC";
                    if (sort.indexOf('-') === 0) {
                        sort = sort.substring(1);
                        sortDirection = "DESC";
                    }
                    // if already paging params are added, push "&"
                    if (paramsArray.length) {
                        paramsArray.push("&");
                    }
                    paramsArray.push("sort", '=', sort, ",", sortDirection);
                }
            }

            // if there is parameters, push "?" to 0 index to make query string
            if (paramsArray.length) {
                paramsArray.splice(0, 0, '?');
            }
            var params = paramsArray.join('');

            return $http.get(urlService.outgoingMail + "statusType/" + statusType + params)
                .then(function (result) {
                    self.mails = generator.generateCollection(result.data.content, OutgoingMail, self._sharedMethods);
                    self.mails = generator.interceptReceivedCollection(['MailInbox', 'OutgoingMail'], self.mails);
                    self.totalRecords = result.data.totalElements;
                    return {
                        mails: self.mails,
                        totalRecords: result.data.totalElements
                    };

                })
                .catch(function (error) {
                    return [];
                });
        };

        /**
         * @description Get outgoing mails from self.mails if found and if not load it from server again.
         * @param statusTypesKey
         * @param $event
         * @returns {Promise|employees}
         */
        self.getMails = function (statusTypesKey, $event) {
            return self.mails.length ? $q.when(self.mails) : self.loadMails(statusTypesKey, $event);
        };

        /**
         * @description Loads the mail from database by id.
         * @param mailId
         * @param {boolean} updateMails
         * Indicates if newly fetched mail will be updated in the existing mails list.
         * @returns {OutgoingMail}
         */
        self.loadMailById = function (mailId, updateMails) {
            mailId = mailId instanceof OutgoingMail ? mailId.getMailId() : mailId;
            return $http.get(urlService.outgoingMail + mailId)
                .then(function (result) {
                    if (result.data) {
                        result = generator.generateInstance(result.data, OutgoingMail, self._sharedMethods);
                        result = generator.interceptReceivedInstance(['MailInbox', 'OutgoingMail'], result);
                        if (updateMails) {
                            if (self.mails.length) {
                                self.mails = _.map(self.mails, function (mail) {
                                    if (mail.id === result.id) {
                                        mail = result;
                                    }
                                    return mail;
                                });
                            } else {
                                self.mails.push(result);
                            }
                        }
                        return result;
                    }
                    return false;
                })
                .catch(function (error) {
                    return false;
                });
        };

        /**
         * @description Gets the mail from existing mails by id.
         * If mails list is empty, it will fetch from server and find mail by id.
         * @param {OutgoingMail | number} mailId
         * @param {boolean} fetchNew
         * Indicates if mail will be fetched from server instead of finding from existing list of mails.
         * @param {boolean} updateMailsIfFetchNew
         * Indicates if newly fetched mail will be updated in the existing mails list.
         * It is used if fetchNew = true
         * @returns {OutgoingMail}
         */
        self.getMailById = function (mailId, fetchNew, updateMailsIfFetchNew) {
            mailId = mailId instanceof OutgoingMail ? mailId.getMailId() : mailId;
            if (fetchNew) {
                return self.loadMailById(mailId, updateMailsIfFetchNew)
                    .then(function (result) {
                        return result;
                    })
                    .catch(function (error) {

                    });
            } else {
                return _.find(self.mails, function (mail) {
                    return Number(mail.id) === Number(mailId);
                });
            }
        };

        /**
         * @description Get outgoing mail by reference number
         * @param referenceNo
         * @param $event
         * @returns {*}
         */
        self.loadMailByReferenceNo = function (referenceNo, $event) {
            referenceNo = referenceNo instanceof OutgoingMail ? referenceNo.getMailReferenceNo() : referenceNo;
            return $http.get(urlService.outgoingMail + 'find?reference-no=' + referenceNo)
                .then(function (result) {
                    if (result.data) {
                        result = generator.generateInstance(result.data, OutgoingMail, self._sharedMethods);
                        result = generator.interceptReceivedInstance(['MailInbox', 'OutgoingMail'], result);
                        return result;
                    }
                    return false;
                })
                .catch(function (error) {
                    return false;
                });
        };

        self.controllerMethod = {
            /**
             * @description Opens the dialog to add new mail
             * @param grid
             * @param $event
             * @returns {promise}
             */
            addDialog: function (grid, $event) {
                return dialog
                    .showDialog({
                        targetEvent: $event,
                        template: mailRoomTemplate.getPopup('mail-form-container'),
                        controller: 'mailFormContainerPopCtrl',
                        controllerAs: 'ctrl',
                        bindToController: true,
                        escapeToClose: false,
                        locals: {
                            mail: new OutgoingMail({
                                statusType: lookupService.getLookupByKeyName(lookupService.statusTypes, lookupService.statusTypesKeys.new).getTypeId(),
                                registerDate: new Date(),
                                //senderEntity: _.find(entityService.entities, {'id': Number(authenticationService.getLastLoginEntityId())})
                            }),
                            grid: grid,
                            entityDefaults: {
                                senderEntity: _.find(entityService.entities, {'id': Number(authenticationService.getLastLoginEntityId())}),
                                senderDep: null,
                                receiverEntity: null,
                                receiverDep: null
                            }
                        }
                    })
            },
            /**
             * @description Opens the dialog to edit new mail
             * @param mail
             * @param grid
             * @param viewMode
             * @param $event
             * @returns {promise}
             */
            editDialog: function (mail, grid, viewMode, $event) {
                var mailToUpdate = angular.copy(mail);

                // get mail  idCopy and signature from server
                mailService.getMailTail(mail).then(function (mailTail) {
                    mailToUpdate.idCopy = mailTail.idCopy;
                    mailToUpdate.signature = mailTail.signature;
                });

                mailToUpdate.registerDate = generator.getDateFromTimeStamp(mailToUpdate.registerDate, false);
                mailToUpdate.sentDate = generator.getDateFromTimeStamp(mailToUpdate.sentDate, false);
                mailToUpdate.receivedDate = generator.getDateFromTimeStamp(mailToUpdate.receivedDate, false);
                return dialog
                    .showDialog({
                        targetEvent: $event,
                        template: mailRoomTemplate.getPopup('mail-form-container'),
                        controller: 'mailFormContainerPopCtrl',
                        controllerAs: 'ctrl',
                        bindToController: true,
                        escapeToClose: false,
                        locals: {
                            mail: mailToUpdate,
                            grid: grid,
                            editMode: true,
                            disableAll: viewMode
                        }
                    })
            },
            /**
             * @description Opens the dialog for filter
             * @param mailStatusKey
             * @param grid
             * @param $event
             * @returns {promise}
             */
            filterGridDialog: function (mailStatusKey, grid, $event) {
                // if clear filter clicked, reset will be true, set showReset = false so it will not show reset filter button above the grid
                // otherwise, open popup to fill filter data
                if (grid.filterGridCriteria.reset) {
                    delete grid.filterGridCriteria.criteria;
                    grid.filterGridCriteria.showReset = false;
                    grid.page = 1;
                    gridService.resetSorting(grid, grid.order);
                    return self._filterCallback(grid, mailStatusKey, $event);
                } else {
                    if (!grid.filterGridCriteria.hasOwnProperty('criteria')) {
                        grid.filterGridCriteria.criteria = new OutgoingMailFilter({
                            statusType: lookupService.getLookupByKeyName(lookupService.statusTypes, mailStatusKey).getTypeId(),
                            senderEntity: _.find(entityService.entities, {'id': Number(authenticationService.getLastLoginEntityId())})
                        });
                    }
                    return dialog
                        .showDialog({
                            targetEvent: $event,
                            template: mailRoomTemplate.getPopup('filter-grid-container'),
                            controller: 'filterGridContainerPopCtrl',
                            controllerAs: 'ctrl',
                            bindToController: true,
                            locals: {
                                grid: grid,
                                callback: self._filterCallback,
                                mailStatusKey: mailStatusKey
                            }
                        }).then(function (result) {
                            // on closing popup, if reset is clicked, set showReset = false so it will not show reset filter button above the grid
                            // otherwise, set showReset = true. it will show reset filter button
                            $timeout(function () {
                                if (grid.filterGridCriteria.reset) {
                                    delete grid.filterGridCriteria.criteria;
                                    grid.filterGridCriteria.showReset = false;
                                } else {
                                    grid.filterGridCriteria.showReset = true;
                                }
                            });
                            return result;
                        });
                }
            }
        };

        /**
         * @description Returns the mails matching the search fields
         * @param grid
         * @param mailStatusKey
         * @param $event
         * @returns {Array|*}
         * @private
         */
        self._filterCallback = function (grid, mailStatusKey, $event) {
            var defer = $q.defer(),
                criteria = grid.filterGridCriteria.criteria;

            if (grid.filterGridCriteria.reset || !criteria || criteria.isFilterEmpty()) {
                self.loadMails(mailStatusKey, grid, $event)
                    .then(function (result) {
                        defer.resolve(result);
                    })
                    .catch(function (error) {
                        defer.reject(error);
                    });
            } else {
                mailService.filterMails(criteria, grid, self.mails, $event)
                    .then(function (result) {
                        defer.resolve(result);
                    })
                    .catch(function (error) {
                        defer.reject(error);
                    })
            }

            return defer.promise.then(function (result) {
                return result;
            }).catch(function (error) {
                return [];
            })
        };
    });
};
