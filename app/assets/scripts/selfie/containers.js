define(['angular','c6_state'], function(angular, c6State) {
    'use strict';

    var forEach = angular.forEach,
        isArray = angular.isArray,
        isObject = angular.isObject;

    return angular.module('c6.app.selfie.containers', [c6State.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Containers', ['c6State',
            function                                   ( c6State ) {
                this.templateUrl = 'views/selfie/containers.html';

                this.enter = function() {
                    return c6State.goTo('Selfie:Containers:List');
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Containers:List', ['cinema6','SpinnerService',
            function                                        ( cinema6 , SpinnerService ) {
                this.templateUrl = 'views/selfie/containers/list.html';
                this.controller = 'SelfieContainersController';
                this.controllerAs = 'SelfieContainersCtrl';

                this.model = function() {
                    SpinnerService.display();

                    return cinema6.db.findAll('container')
                        .finally(function() {
                            SpinnerService.close();
                        });
                };
            }]);
        }])

        .controller('SelfieContainersController', ['c6State','c6AsyncQueue',
                                                   'ConfirmDialogService',
        function                                  ( c6State , c6AsyncQueue ,
                                                    ConfirmDialogService ) {
            var queue = c6AsyncQueue();

            function showErrorModal(error) {
                ConfirmDialogService.display({
                    prompt: 'There was an a problem processing your request: ' + error.data,
                    affirm: 'OK',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: function() {
                        return ConfirmDialogService.close();
                    }
                });
            }

            this.delete = function(container) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this DSP?',
                    affirm: 'Yes',
                    cancel: 'Cancel',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: queue.debounce(function() {
                        ConfirmDialogService.close();

                        return container.erase().then(function() {
                            c6State.goTo('Selfie:Containers');
                        }).catch(showErrorModal);
                    })
                });
            };

            this.edit = function(container) {
                c6State.goTo('Selfie:Edit:Container', [container], null);
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:New:Container', ['cinema6',
            function                                      ( cinema6 ) {
                this.templateUrl = 'views/selfie/containers/container.html';
                this.controller = 'SelfieContainerController';
                this.controllerAs = 'SelfieContainerCtrl';

                this.model = function() {
                    return cinema6.db.create('container', {
                        name: null,
                        label: null,
                        defaultTagParams: {}
                    });
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Edit:Container', ['cinema6',
            function                                       ( cinema6 ) {
                this.templateUrl = 'views/selfie/containers/container.html';
                this.controller = 'SelfieContainerController';
                this.controllerAs = 'SelfieContainerCtrl';

                this.model = function(params) {
                    return cinema6.db.find('container', params.id);
                };
            }]);
        }])

        .controller('SelfieContainerController', ['cState','c6State','cinema6','c6AsyncQueue',
                                                  'ConfirmDialogService',
        function                                 ( cState , c6State , cinema6 , c6AsyncQueue ,
                                                   ConfirmDialogService ) {
            var App = c6State.get('Selfie:App'),
                placementSchema = App.cModel.data.placement,
                queue = c6AsyncQueue();

            function showErrorModal(error) {
                ConfirmDialogService.display({
                    prompt: 'There was an a problem processing your request: ' + error.data,
                    affirm: 'OK',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: function() {
                        return ConfirmDialogService.close();
                    }
                });
            }

            function convertParamValueForUI(param, value) {
                // We need to convert the raw values into UI-friendly
                // objects for binding. Arrays end up in ng-repeats,
                // Booleans end up as <select> dropdowns, Strings
                // and Numbers end up as simple <inputs>
                var _val;

                if (param.type === 'Array') {
                    _val = (value || param.default || [''])
                        .map(function(val) {
                            return {
                                label: param.label,
                                value: val
                            };
                        });
                } else if (param.type === 'Boolean') {
                    _val = value === undefined ?
                        param.default :
                        (!!value ? 'Yes' : 'No');
                } else {
                    _val = value || param.default;
                }

                return {
                    name: param.name,
                    label: param.label,
                    type: param.type,
                    options: param.options,
                    value: _val,
                };
            }

            function extendParams(target, params, override) {
                // We could be extending the target with data from an object
                // or an array. Regardless, we want to process the params
                // the same way, so set(param) is used for both
                function set(param) {
                    if (param.type === 'Array') {
                        target[param.name] = param.value.reduce(function(result, item) {
                            if (item.value) {
                                result.push(item.value);
                            }
                            return result;
                        }, override ? [] : (target[param.name] || []));
                    } else if (param.type === 'Boolean') {
                        target[param.name] = param.value !== undefined ?
                            param.value === 'Yes' : param.value;
                    } else {
                        target[param.name] = param.value;
                    }
                }

                if (isArray(params)) {
                    params.forEach(set);
                } else if (isObject(params)) {
                    forEach(params, set);
                }

                return target;
            }

            function generateParamModel(schema, existingParams, alreadyInUI) {
                // This function takes a schema (an array of supported params with config)
                // and loops through it. If the param is not editable we don't include it
                // in the UI and we won't overwrite it when saving. However, if that param
                // has a default value we do want it to get set and copied over when saving.
                // If it is editable we want it to be included in the dropdown of available
                // params (unless it should be shown in the UI by default).

                return schema.reduce(function(result, param) {
                    var inUI = alreadyInUI.indexOf(param.name) > -1;

                    if (param.editable && (!inUI || param.type === 'Array')) {
                        // if param is editable and is either not in the UI already
                        // or is an Array (accepts multiple values), make it available
                        // in the dropdown as an additional option
                        result.availableParams.push({
                            name: param.name,
                            label: param.label,
                            type: param.type,
                            options: param.options,
                            value: param.type !== 'Array' ? param.default : []
                        });
                    }

                    if (existingParams[param.name] || param.default || inUI) {
                        // if the param is already defined or has a default or should
                        // be in the UI, then set it up as a default param in the UI
                        result.defaults[param.name] = convertParamValueForUI(
                            param,
                            existingParams[param.name]
                        );

                        if (param.editable && !inUI) {
                            // if the param is already defined or has a default value
                            // but is not already in the UI, then display it as an
                            // added param under the default params
                            result.addedParams.push(
                                convertParamValueForUI(
                                    param,
                                    existingParams[param.name]
                                )
                            );
                        }
                    }

                    return result;
                }, {
                    availableParams: [],
                    addedParams: [],
                    defaults: {},
                    show: Object.keys(existingParams).length > 0
                });
            }

            function extendContainer(target, obj) {
                // when we're ready to save a container we want
                // to copy over every param that was edited in
                // the UI. If the property is not set or it's
                // and array with nothing in it we remove it
                // from the DB model, if it's an object we recurse
                forEach(obj, function(prop, key) {
                    if (isObject(prop) && !isArray(prop)) {
                        target[key] = target[key] || {};
                        return extendContainer(target[key], prop);
                    }

                    if (prop === undefined || (isArray(prop) && !prop.length)) {
                        delete target[key];
                    } else {
                        target[key] = prop;
                    }
                });

                return target;
            }

            this.initWithModel = function(model) {
                this._container = model;
                this.container = model.pojoify();
                this.container.defaultTagParams.mraid = this.container.defaultTagParams.mraid || {};
                this.container.defaultTagParams.vpaid = this.container.defaultTagParams.vpaid || {};

                this.hasName = !!model.name;
                this.validName = true;

                // generate an 'mraid' and 'vpaid' object for
                // binding in the UI, this will contain a
                // 'defaults' object with params that are
                // always shown in the UI, an array of
                // 'availableParams' that can be added via
                // a dropdown, and an array of 'addedParams'
                // that contains all non-default params that
                // have been added to the container
                this.mraid = generateParamModel(
                    placementSchema.params,
                    this.container.defaultTagParams.mraid,
                    ['network','uuid','hostApp','prebuffer','clickUrls']
                );
                this.vpaid = generateParamModel(
                    placementSchema.params,
                    this.container.defaultTagParams.vpaid,
                    ['network','uuid']
                );
            };

            this.addParam = function(type, param) {
                if (!param) { return; }

                if (param.type === 'Array') {
                    param.value.push({
                        label: param.label,
                        value: undefined
                    });
                }

                if (this[type].addedParams.indexOf(param) < 0) {
                    this[type].addedParams.push(param);
                }
            };

            this.removeParam = function(type, param, subParam) {
                if (!param) { return; }

                var index = this[type].addedParams.indexOf(param);

                if (subParam) {
                    param.value.splice(param.value.indexOf(subParam), 1);
                }

                if (param.type !== 'Array' || !param.value.length) {
                    this[type].addedParams.splice(index, 1);

                    param.value = param.type !== 'Array' ? param.default : [];
                }
            };

            this.validateName = function(name) {
                if (!name) { return; }

                var self = this;

                if (!(/^[\w-]+$/).test(name)) {
                    self.validName = false;
                    return;
                }

                cinema6.db.findAll('container', {name: name})
                    .then(function(containers) {
                        self.validName = !containers.length;
                    });
            };

            this.delete = function(container) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete this DSP?',
                    affirm: 'Yes',
                    cancel: 'Cancel',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: queue.debounce(function() {
                        ConfirmDialogService.close();

                        return container.erase().then(function() {
                            c6State.goTo('Selfie:Containers');
                        }).catch(showErrorModal);
                    })
                });
            };

            this.save = queue.debounce(function() {
                var self = this,
                    dbModel = this._container,
                    container = this.container,
                    defaultTagParams = this.container.defaultTagParams;

                // loop through each param object (ie. 'mraid' and 'vpaid')
                // and overwrite existing values with current defaults
                // and then add the other chosen params
                forEach(defaultTagParams, function(params, key) {
                    if (self[key].show) {
                        extendParams(params, self[key].defaults, true);
                        extendParams(params, self[key].addedParams);
                    } else {
                        defaultTagParams[key] = undefined;
                    }
                });

                // update dbModel with current container data
                extendContainer(dbModel, container);

                this.pending = true;

                // save the container and go to dashboard
                dbModel.save().then(function() {
                    c6State.goTo('Selfie:Containers', null, null);
                }).catch(showErrorModal)
                .finally(function() { self.pending = false; });
            }, this);
        }]);
});