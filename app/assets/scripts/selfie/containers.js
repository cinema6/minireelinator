define(['angular','c6_state'], function(angular, c6State) {
    'use strict';

    var forEach = angular.forEach,
        isArray = angular.isArray,
        isObject = angular.isObject;

    return angular.module('c6.app.selfie.containers', [c6State.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Containers', ['cinema6','c6State',
            function                                   ( cinema6 , c6State ) {
                this.templateUrl = 'views/selfie/containers.html';
                this.controller = 'SelfieContainersController';
                this.controllerAs = 'SelfieContainersCtrl';

                this.model = function() {
                    return cinema6.db.findAll('container');
                };

                this.enter = function() {
                    return c6State.goTo('Selfie:Containers:List');
                };
            }]);
        }])

        .controller('SelfieContainersController', ['cState',
        function                                  ( cState ) {
            console.log(cState);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Containers:List', [function() {
                this.templateUrl = 'views/selfie/containers/list.html';
            }]);
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
                        defaultTagParams: {
                            mraid: {},
                            vpaid: {}
                        }
                    });
                };

                this.afterModel = function() {
                    this.heading = 'Add New DSP';
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

                this.afterModel = function(model) {
                    this.heading = model.label;
                };
            }]);
        }])

        .controller('SelfieContainerController', ['cState','c6State',
        function                                 ( cState , c6State ) {
            var App = c6State.get('Selfie:App'),
                placementSchema = App.cModel.data.placement;

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
                    value: _val
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
                        target[param.name] = param.value === 'Yes';
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
                            value: param.default || param.type !== 'Array' ? null : []
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
                    show: Object.keys(existingParams).length > 1
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
                this.hasName = !!model.name;
                this.heading = cState.heading;

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
                        value: null
                    });
                }

                if (this[type].addedParams.indexOf(param) < 0) {
                    this[type].addedParams.push(param);
                }
            };

            this.save = function() {
                var self = this,
                    dbModel = this._container,
                    container = this.container,
                    defaultTagParams = this.container.defaultTagParams;

                // loop through each param object (ie. 'mraid' and 'vpaid')
                // and overwrite existing values with current defaults
                // and then add the other chosen params
                forEach(defaultTagParams, function(params, key) {
                    extendParams(params, self[key].defaults, true);
                    extendParams(params, self[key].addedParams);
                });

                // update dbModel with current container data
                extendContainer(dbModel, container);

                // svae the container and go to dashboard
                dbModel.save().then(function() {
                    c6State.goTo('Selfie:Containers');
                });
            };
        }]);
});