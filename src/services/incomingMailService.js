module.exports = function (app) {
    app.service('incomingMailService', function ($http,
                                                 urlService,
                                                 generator,
                                                 langService,
                                                 mailRoomTemplate,
                                                 dialog,
                                                 toast,
                                                 $q,
                                                 $timeout,
                                                 _,
                                                 IncomingMail,
                                                 userInfoService,
                                                 lookupService,
                                                 employeeService,
                                                 mailService,
                                                 authenticationService,
                                                 entityService,
                                                 IncomingMailFilter,
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

                return $http.get(urlService.incomingMail + "statusType/" + statusType + params)
                    .then(function (result) {
                        self.mails = generator.generateCollection(result.data.content, IncomingMail, self._sharedMethods);
                        self.mails = generator.interceptReceivedCollection(['MailInbox', 'IncomingMail'], self.mails);
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
             * @description Get incoming mails from self.mails if found and if not load it from server again.
             * @param statusTypesKey
             * @param $event
             * @returns {Promise|employees}
             */
            self.getMails = function (statusTypesKey, $event) {
                return self.mails.length ? $q.when(self.mails) : self.loadMails(statusTypesKey, $event);
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
                                mail: new IncomingMail({
                                    statusType: lookupService.getLookupByKeyName(lookupService.statusTypes, lookupService.statusTypesKeys.received).getTypeId(),
                                    registerDate: new Date(),
                                    //receiverEntity: _.find(entityService.entities, {'id': Number(authenticationService.getLastLoginEntityId())})
                                }),
                                grid: grid,
                                entityDefaults: {
                                    senderEntity: null,
                                    senderDep: null,
                                    receiverEntity: _.find(entityService.entities, {'id': Number(authenticationService.getLastLoginEntityId())}),
                                    receiverDep: null
                                },
                                attachments: []
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
                                disableAll: viewMode,
                                attachments: []
                            }
                        })
                },
                /**
                 * @description Opens the dialog to find outgoing and link incoming mail to outgoing mail
                 * @param mail
                 * @param $event
                 * @returns {promise}
                 */
                linkToOutgoingDialog: function (mail, $event) {
                    return dialog
                        .showDialog({
                            targetEvent: $event,
                            template: mailRoomTemplate.getPopup('link-outgoing-to-incoming'),
                            controller: 'linkOutgoingToIncomingPopCtrl',
                            controllerAs: 'ctrl',
                            bindToController: true,
                            escapeToClose: false,
                            locals: {
                                mail: mail
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
                            grid.filterGridCriteria.criteria = new IncomingMailFilter({
                                statusType: lookupService.getLookupByKeyName(lookupService.statusTypes, mailStatusKey).getTypeId(),
                                receiverEntity: _.find(entityService.entities, {'id': Number(authenticationService.getLastLoginEntityId())})
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
                },
                /**
                 * @description Show linked outgoing mail
                 * @param mail
                 * @param $event
                 * @returns {promise}
                 */
                showLinkedMail: function (mail, $event) {
                    if (!mail.getRelatedMailId()) {
                        toast.info(langService.get('msg_no_linked_mail'));
                        return;
                    }
                    return dialog
                        .showDialog({
                            targetEvent: $event,
                            template: mailRoomTemplate.getPopup('mail-form-container'),
                            controller: 'mailFormContainerPopCtrl',
                            controllerAs: 'ctrl',
                            bindToController: true,
                            escapeToClose: false,
                            locals: {
                                disableAll: true
                            },
                            resolve: {
                                mail: function (outgoingMailService) {
                                    'ngInject';
                                    return outgoingMailService.loadMailById(mail.getRelatedMailId(), false)
                                        .then(function (result) {
                                            result.registerDate = result.registerDateFormatted;
                                            return result;
                                        });
                                }
                            }
                        })
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

        }
    );
};
