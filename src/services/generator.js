module.exports = function (app) {
    app.service('generator', function (_,
                                       MailRoomModelInterceptor,
                                       $sce,
                                       tableGeneratorService,
                                       listGeneratorService,
                                       moment) {
            'ngInject';
            var self = this, dialog, langService, toast;
            self.defaultDateFormat = 'YYYY-MM-DD';
            self.defaultDateTimeFormat = 'YYYY-MM-DD hh:mm A';
            self.months = [
                {
                    text: 'lbl_month_january',
                    value: 1
                },
                {
                    text: 'lbl_month_february',
                    value: 2
                },
                {
                    text: 'lbl_month_march',
                    value: 3
                },
                {
                    text: 'lbl_month_april',
                    value: 4
                },
                {
                    text: 'lbl_month_may',
                    value: 5
                },
                {
                    text: 'lbl_month_june',
                    value: 6
                },
                {
                    text: 'lbl_month_july',
                    value: 7
                },
                {
                    text: 'lbl_month_august',
                    value: 8
                },
                {
                    text: 'lbl_month_september',
                    value: 9
                },
                {
                    text: 'lbl_month_october',
                    value: 10
                },
                {
                    text: 'lbl_month_november',
                    value: 11
                },
                {
                    text: 'lbl_month_december',
                    value: 12
                }
            ];

            self.setDialog = function (dialogPass) {
                dialog = dialogPass;
            };

            self.setLangService = function (langPass) {
                langService = langPass;
            };
            self.setToast = function (toastPass) {
                toast = toastPass;
            };

            /**
             * @description Makes a shallow copy of array
             * @param array
             * @returns {Array}
             */
            self.shallowCopyArray = function (array) {
                return _.map(array, function (item) {
                    return item;
                });
            };

            /**
             * @description intercept instance of model.
             * @param modelName
             * @param event
             * @param instance
             * @return {*}
             */
            var interceptInstance = function (modelName, event, instance) {
                return MailRoomModelInterceptor.runEvent(modelName, event, instance);
            };
            /**
             * @description intercept collection of models.
             * @param modelName
             * @param event
             * @param collection
             * @return {*}
             */
            var interceptCollection = function (modelName, event, collection) {
                for (var i = 0; i < collection.length; i++) {
                    collection[i] = interceptInstance(modelName, event, collection[i]);
                }
                return collection;
            };
            /**
             * @description intercept hashMap of models.
             * @param modelName
             * @param event
             * @param hashMap
             * @return {*}
             */
            var interceptHashMap = function (modelName, event, hashMap) {
                for (var i in hashMap) {
                    hashMap[i] = interceptCollection(modelName, event, hashMap[i]);
                }
                return hashMap;
            };

            /**
             *
             * @param modelName
             * @param collection
             * @return {*}
             */
            self.interceptSendCollection = function (modelName, collection) {
                return interceptCollection(modelName, 'send', _.cloneDeep(collection));
            };

            self.interceptSendInstance = function (modelName, model) {
                return interceptInstance(modelName, 'send', _.cloneDeep(model));
            };

            self.interceptReceivedCollection = function (modelName, collection) {
                return interceptCollection(modelName, 'received', collection);
            };

            self.interceptReceivedHashMap = function (modelName, hashMap) {
                return interceptHashMap(modelName, 'received', hashMap);
            };

            self.interceptReceivedInstance = function (modelName, model) {
                return interceptInstance(modelName, 'received', model);
            };
            /**
             * generate collection of given model
             * @param collection
             * @param model
             * @param sharedMethods
             * @returns {*}
             */
            self.generateCollection = function (collection, model, sharedMethods) {
                if (!angular.isArray(collection))
                    return [];

                for (var i = 0; i < collection.length; i++) {
                    collection[i] = self.generateInstance(collection[i], model, sharedMethods);
                }
                return collection;
            };

            self.generateHashMap = function (hashMap, model, sharedMethods) {
                for (var i in hashMap) {
                    hashMap[i] = self.generateCollection(hashMap[i], model, sharedMethods);
                }
                return hashMap;
            };
            /**
             * generate instance of given model
             * @param instance
             * @param model
             * @param sharedMethods
             * @returns {*}
             */
            self.generateInstance = function (instance, model, sharedMethods) {
                return sharedMethods ? angular.extend(new model(instance), sharedMethods) : new model(instance);
            };
            /**
             * generate the shared method from delete and update methods
             * @param deleteMethod
             * @param updateMethod
             * @returns {{delete: generator.delete, update: generator.update}}
             */
            self.generateSharedMethods = function (deleteMethod, updateMethod) {
                return {
                    delete: function () {
                        if (deleteMethod)
                            return deleteMethod(this);
                        else return null;
                    },
                    update: function () {
                        if (updateMethod)
                            return updateMethod(this);
                        else return null;
                    }
                }
            };
            /**
             * create a new id from any collection
             * @param collection
             * @param key
             * @returns {number}
             */
            self.createNewID = function (collection, key) {
                var id = 0;
                if (collection.length > 0)
                    id = _(collection).map(key).max() + 1;
                else
                    id += 1;

                return id;
            };
            /**
             * get some value from given collection and return object each key will have the selected value
             * @param collection
             * @param key
             * @param value
             * @returns {{key:value}}
             */
            self.getKeyValueFromCollection = function (collection, key, value) {
                var result = {};
                _.map(collection, function (item) {
                    if (item.hasOwnProperty(key)) {
                        result[item[key]] = typeof item[value] === 'function' ? item[value]() : item[value];
                    }
                });
                return result;
            };
            /**
             * get result of collection after sum given key
             * @param collection
             * @param key
             * @returns {*}
             */
            self.getResultFromSelectedCollection = function (collection, key) {
                return _.reduce(collection, function (prev, current, index) {
                    return prev + collection[index][key];
                }, 0);
            };
            /**
             * get selected collection from given result
             * @param collection
             * @param result
             * @param key
             * @returns {Array}
             */
            self.getSelectedCollectionFromResult = function (collection, result, key) {
                var selected = [];
                result = !result ? 0 : result;
                for (var i = 0; i < collection.length; i++) {
                    if (collection[i][key] <= result)
                        if ((collection[i][key] & result) === collection[i][key]) {
                            selected.push(collection[i]);
                        }
                }
                return selected;
            };
            /**
             * this method to check if the given args has value or not
             * note the 0 not defined as no value this means if value equal to 0 will pass and return true
             * @param value
             * @return {boolean}
             */
            self.validRequired = function (value) {
                return (
                    (typeof value === 'string') ? (value.trim() !== '') : (value !== null && typeof value !== 'undefined')
                );
            };
            /**
             * check validation of required fields
             * @param model
             * @return {Array}
             */
            self.checkRequiredFields = function (model) {
                var required = model.getRequiredFields(), result = [];
                _.map(required, function (property) {
                    if (!self.validRequired(model[property]))
                        result.push(property);
                });
                return result;
            };
            /**
             * to display  error messages for tabs
             * @param title
             * @param fields
             * @param fieldsPositions
             * @param defaultTab
             */
            self.generateTabsError = function (title, fields, fieldsPositions, defaultTab) {
                var translateFields = _.map(fields, function (field) {
                    return [
                        langService.get(fieldsPositions[field].lang),
                        (fieldsPositions[field].hasOwnProperty('tab') ? langService.get(fieldsPositions[field].tab) : defaultTab)
                    ];
                });
                var table = tableGeneratorService.createTable([langService.get('field'), langService.get('tab_location')], 'error-table');
                table.createTableRows(translateFields);
                dialog.validationErrorMessage(title, table.getTable(true));
            };
            /**
             * for display error messages that without tabs
             * @param title
             * @param fields
             * @param isLabelText
             */
            self.generateErrorFields = function (title, fields, isLabelText) {
                var list = listGeneratorService.createList('ul', 'error-list');
                _.map(fields, function (field) {
                    if (isLabelText)
                        list.addItemToList(field);
                    else
                        list.addItemToList(langService.get(field));
                });

                var titleTemplate = angular.element('<div><span class="validation-title">' + langService.get(title) + '</span></div>');
                titleTemplate.append(list.getList());
                dialog.errorMessage(titleTemplate.html());
            };

            /**
             * @description Displays error messages for failed bulk action
             * @param title
             * @param records
             */
            self.generateFailedBulkActionRecords = function (title, records) {
                var list = listGeneratorService.createList('ul', 'error-list');
                _.map(records, function (record) {
                    list.addItemToList(record);
                });


                var titleTemplate = angular.element('<div><span class="validation-title">' + langService.get(title) + '</span></div>');
                titleTemplate.append(list.getList());
                dialog.errorMessage(titleTemplate.html());
            };

            /**
             * @description Shows the response of bulk action.
             * @param  {Array.<*>} resultCollection
             * @param {Array.<*>} selectedItems
             * @param  {boolean} ignoreMessage
             * @param  {string} errorMessage
             * @param {string} successMessage
             * @param {string} failureSomeMessage
             * @returns {*}
             */
            self.getBulkActionResponse = function (resultCollection, selectedItems, ignoreMessage, errorMessage, successMessage, failureSomeMessage) {
                resultCollection = resultCollection.hasOwnProperty('data') ? resultCollection.data : resultCollection;

                var failureCollection = [];
                var currentIndex = 0;
                _.map(resultCollection, function (value) {
                    if (!value.status)
                        failureCollection.push(selectedItems[currentIndex]);
                    currentIndex++;
                });

                if (!ignoreMessage) {
                    if (failureCollection.length === selectedItems.length || !resultCollection) {
                        toast.error(langService.get(errorMessage));
                    } else if (failureCollection.length) {
                        self.generateFailedBulkActionRecords(failureSomeMessage, _.map(failureCollection, function (item) {
                            return item.getTranslatedName();
                        }));
                    } else {
                        toast.success(langService.get(successMessage));
                    }
                }
                return selectedItems;
            };

            /**
             * @description Replaces the values of disabled fields in case user changes value of disable field
             * @param record
             * @param originalRecord
             * @param fields
             * @param setNull
             * @returns {record}
             */

            self.replaceWithOriginalValues = function (record, originalRecord, fields, setNull) {
                if (typeof fields === "string") {
                    record[fields] = setNull ? null : originalRecord[fields];
                }
                else {
                    for (var i = 0; i < fields.length; i++) {
                        record[fields[i]] = setNull ? null : originalRecord[fields[i]];
                    }
                }
                return record;
            };

            self.preserveProperties = function (properties, current, override) {
                var attributes = {}, older = angular.copy(current), newer = angular.copy(override);
                var i = 0;
                // loop throw the current object and store the preserved properties to attributes.
                for (; i < properties.length; i++) {
                    if (current.hasOwnProperty(properties[i]))
                        attributes[properties[i]] = angular.copy(older[properties[i]]);
                }
                i = 0;
                for (; i < properties.length; i++) {
                    newer[properties[i]] = attributes[properties[i]];
                }
                return newer;
            };
            /**
             * @description Reset the model after making any changes
             * @param model
             * @param defaultModel
             */
            self.resetFields = function (model, defaultModel) {
                _.map(model, function (value, key) {
                    model[key] = defaultModel[key];
                });
            };
            /**
             * @description upper case first letter.
             * @param string
             * @returns {string}
             */
            self.ucFirst = function (string) {
                return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
            };
            /**
             * to check if the model has any changes or not
             * @param oldModel
             * @param newModel
             * @returns {boolean}
             */
            self.modelHasChanges = function (oldModel, newModel) {
                return !angular.equals(angular.toJson(oldModel), angular.toJson(newModel));
            };

            /**
             * @description Compares the collections status(active/inactive) against the passed status value.
             * @param collection
             * Collection of records to check the status
             * @param status
             * Active/Inactive
             * @param statusField
             * The name of the field to check the status from record of collection. By default, it checks 'status' field
             * @returns {boolean}
             * Returns false, if the collection contains all records with same status.
             * Returns true, if the collection contains any record with different status
             */
            self.checkCollectionStatus = function (collection, status, statusField) {
                return _.some(_.map(collection, function (model) {
                    return model[!statusField ? 'status' : statusField];
                }), function (item) {
                    return item !== status;
                });
            };

            /**
             * @description Get the sorting key for information or lookup model
             * @param property
             * @param modelType
             * @returns {*}
             */
            self.getColumnSortingKey = function (property, modelType) {
                modelType = modelType.toLowerCase();
                if (modelType === 'lookup' || modelType === 'entity' || modelType === 'employee')
                    return property + '.' + (langService.current === 'ar' ? 'arName' : 'enName');
                else if (modelType === 'employeepermission')
                    return property + '.employee.' + (langService.current === 'ar' ? 'arName' : 'enName');
                return property;
            };

            /**
             * @description Gets the date in default format
             * @param timeStamp
             * @param dateAndTime
             * @returns {string | null}
             */
            self.getDateStringFromTimeStamp = function (timeStamp, dateAndTime) {
                if (timeStamp) {
                    if (!isNaN(timeStamp)) {
                        // in case of long numbers, they will be having L at last. so remove L and change timeStamp to moment date.
                        timeStamp = Number(timeStamp.toString().split('L')[0]);
                        return moment(timeStamp).format(dateAndTime ? self.defaultDateTimeFormat : self.defaultDateFormat);
                    }
                    return timeStamp;
                }
                return null;
            };

            /**
             * @description Gets the date in default format
             * @param timeStamp
             * @param skipTime
             * @returns {Date | null}
             */
            self.getDateFromTimeStamp = function (timeStamp, skipTime) {
                if (timeStamp) {
                    if (!isNaN(timeStamp)) {
                        // in case of long numbers, they will be having L at last. so remove L and change timeStamp to moment date.
                        timeStamp = Number(timeStamp.toString().split('L')[0]);
                        if (skipTime) {
                            return moment(timeStamp).startOf('day').toDate();
                        }
                        return moment(timeStamp).toDate();
                    }
                    return timeStamp;
                }
                return null;
            };

            /**
             * @description Gets the time from timeStamp
             * @param timeStamp
             * @param isTwentyFourHour
             * @returns {string | null}
             */
            self.getTimeFromTimeStamp = function (timeStamp, isTwentyFourHour) {
                if (timeStamp) {
                    // in case of long numbers, they will be having L at last. so remove L and change timeStamp to moment time.
                    timeStamp = Number(timeStamp.toString().split('L')[0]);
                    return moment(timeStamp).format(isTwentyFourHour ? 'HH:mm' : 'hh:mm A');
                }
                return null;
            };

            /**
             * @description Gets timeStamp from the provided date
             * @param date
             * @param addL
             * @returns {string | null}
             */
            self.getTimeStampFromDate = function (date, addL) {
                if (date) {
                    if ((date instanceof Date) || typeof date === 'string') {
                        date = moment(date, self.defaultDateFormat).valueOf();
                        return addL ? date + 'L' : date;
                    }
                    return date;
                }
                return null;
            };

            /**
             * @description Returns the end time of the given date
             * @param date
             * @returns {*}
             */
            self.setEndTimeOfDate = function (date) {
                if (date) {
                    // if date is not instance of date and is timestamp, get the date from timestamp
                    if (!(date instanceof Date) && !isNaN(date)) {
                        date = self.getDateFromTimeStamp(date);
                    }
                    var dateWithEndTime = angular.copy(date);
                    return new Date(dateWithEndTime.getFullYear(), dateWithEndTime.getMonth(), dateWithEndTime.getDate(), 23, 59, 59, 999);
                }
                return null;
            };

            /**
             * @description Sets the current time and returns the given date with current time
             * @param date
             * @returns {*}
             */
            self.setCurrentTimeOfDate = function (date) {
                if (date) {
                    // if date is not instance of date and is timestamp, get the date from timestamp
                    if (!(date instanceof Date) && !isNaN(date)) {
                        date = self.getDateFromTimeStamp(date);
                    }
                    var datePassed = angular.copy(date);
                    var currentDate = new Date();
                    return new Date(datePassed.getFullYear(), datePassed.getMonth(), datePassed.getDate(), currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds(), currentDate.getMilliseconds());
                }
                return null;
            };

            /**
             * @description Gets the difference in days between given date and now
             * @returns {*}
             * @param dateTimeStamp
             */
            self.getNumberOfDays = function (dateTimeStamp) {
                if (!dateTimeStamp)
                    return '';
                if (typeof dateTimeStamp !== 'number')
                    dateTimeStamp = self.getTimeStampFromDate(date);
                return -(moment(dateTimeStamp).diff(moment(), 'days'));
            };

            /**
             * @description Converts the date to string using provided string format or default date format
             * @param date
             * @param format
             * @returns {string}
             */
            self.convertDateToString = function (date, format) {
                if (date) {
                    date = typeof date === 'string' ? new Date(date) : date;
                    format = format || self.defaultDateFormat;
                    return moment(date).format(format);
                }
                return "";
            };

            /**
             * @description Deletes property/properties from the model
             * @param record
             * @param propertyToDelete
             */
            var deleteNestedProperties = function (record, propertyToDelete) {
                if (propertyToDelete.indexOf('.') > -1) {
                    var arr = propertyToDelete.split('.');
                    for (var i = 0; i < arr.length; i++) {
                        var prop = arr.shift();
                        deleteNestedProperties(record[prop], arr.join('.'))
                    }
                }
                else {
                    delete record[propertyToDelete];
                }
                return record;
            };

            /**
             * @description Deletes the given properties from record
             * @param record
             * @param propertyToDelete
             * @returns {*}
             */
            self.deleteProperties = function (record, propertyToDelete) {
                if (typeof propertyToDelete === 'string') {
                    delete record[propertyToDelete];
                }
                else {
                    if (propertyToDelete && angular.isArray(propertyToDelete)) {
                        for (var i = 0; i < propertyToDelete.length; i++) {
                            if (propertyToDelete[i]) {
                                if (propertyToDelete[i].indexOf('.') > -1)
                                    record = deleteNestedProperties(record, propertyToDelete[i]);
                                else if (propertyToDelete[i])
                                    delete record[propertyToDelete[i]];
                            }
                        }
                    }
                }
                return record;
            };

            /**
             * @description Deletes all the properties from the model that ends with given string
             * @param record
             * @param endString
             * @returns {*}
             */
            self.deletePropertiesEndsWith = function (record, endString) {
                // If endString is string, make it array
                if (typeof endString === 'string') {
                    endString = [endString];
                }
                var propertiesToDelete = [],
                    recordProperties = Object.keys(record);
                for (var i = 0; i < endString.length; i++) {
                    for (var j = 0; j < recordProperties.length; j++) {
                        if (_.endsWith(recordProperties[j], endString[i]))
                            propertiesToDelete.push(recordProperties[j]);
                    }
                }
                return self.deleteProperties(record, propertiesToDelete);
            };

            /**
             * @description Checks if the string is a valid json
             * @param str
             * @returns {boolean}
             */
            self.isJsonString = function (str) {
                try {
                    JSON.parse(str);
                } catch (e) {
                    return false;
                }
                return true;
            }


            self.convertBinaryDataToURL = function (arrayOfData) {
                return $sce.trustAsResourceUrl('data:image/png;base64,' + arrayOfData);
            }
        }
    )
};