define(['angular','c6_state'], function(angular, c6State) {
    'use strict';

    var extend = angular.extend,
        forEach = angular.forEach,
        isArray = angular.isArray;

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
                    this.container = model;
                    this.heading = model.label;
                };

                this.saveContainer = function(container) {
                    extend(this.container, container).save();
                };
            }]);
        }])

        .controller('SelfieContainerController', ['cState','c6State',
        function                                 ( cState , c6State ) {
            var Ctrl = this,
                App = c6State.get('Selfie:App'),
                placementSchema = App.cModel.data.placement;

            this.initWithModel = function(model) {
                var container = model.pojoify(),
                    params = container.defaultTagParams,
                    mraidUI = ['network','uuid','hostApp','prebuffer','clickUrls'],
                    vpaidUI = ['network','uuid'];

                this.mraid = placementSchema.params
                    .reduce(function(result, param, key) {
                        if (param.editable && (mraidUI.indexOf(param.name) < 0 || param.type === 'Array')) {
                            result.availableParams.push({
                                name: param.name,
                                label: param.label,
                                type: param.type,
                                value: param.default || param.type !== 'Array' ? null : []
                            });
                        }

                        if (params.mraid[param.name] || param.default || mraidUI.indexOf(param.name) > -1) {
                            result.defaults[param.name] = param.type !== 'Array' ?
                                (params.mraid[param.name] || param.default) :
                                (params.mraid[param.name] || param.default || ['']).map(function(value) {
                                    return {
                                        label: param.label,
                                        value: value
                                    };
                                });

                            if (param.editable && mraidUI.indexOf(param.name) < 0) {
                                result.addedParams.push({
                                    name: param.name,
                                    label: param.label,
                                    type: param.type,
                                    value: param.type !== 'Array' ?
                                        (params.mraid[param.name] || param.default) :
                                        (params.mraid[param.name] || param.default).map(function(value) {
                                            return {
                                                label: param.label,
                                                value: value
                                            };
                                        })
                                });
                            }
                        }

                        return result;
                    }, {
                        availableParams: [],
                        addedParams: [],
                        defaults: {},
                        show: Object.keys(params.mraid).length > 1
                    });

                this.vpaid = placementSchema.params
                    .reduce(function(result, param, key) {
                        if (param.editable && (vpaidUI.indexOf(param.name) < 0 || param.type === 'Array')) {
                            result.availableParams.push({
                                name: param.name,
                                label: param.label,
                                type: param.type,
                                value: param.default || param.type !== 'Array' ? null : []
                            });
                        }

                        if (params.vpaid[param.name] || param.default || vpaidUI.indexOf(param.name) > -1) {
                            result.defaults[param.name] = param.type !== 'Array' ?
                                (params.vpaid[param.name] || param.default) :
                                (params.vpaid[param.name] || param.default || ['']).map(function(value) {
                                    return {
                                        label: param.label,
                                        value: value
                                    };
                                });

                            if (param.editable && vpaidUI.indexOf(param.name) < 0) {
                                result.addedParams.push({
                                    name: param.name,
                                    label: param.label,
                                    type: param.type,
                                    value: param.type !== 'Array' ?
                                        (params.vpaid[param.name] || param.default) :
                                        (params.vpaid[param.name] || param.default).map(function(value) {
                                            return {
                                                label: param.label,
                                                value: value
                                            };
                                        })
                                });
                            }
                        }

                        return result;
                    }, {
                        availableParams: [],
                        addedParams: [],
                        defaults: {},
                        show: Object.keys(params.vpaid).length > 1
                    });

                console.log(this.mraid);
                console.log(this.vpaid);

                this.container = model.pojoify();
                this.hasName = !!this.container.name;
                this.heading = cState.heading;
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
                var defaultTagParams = this.container.defaultTagParams;

                console.log(this.container);

                forEach(this.mraid.defaults, function(param, key) {
                    defaultTagParams.mraid[key] = param;
                });

                this.mraid.addedParams.forEach(function(param) {
                    if (param.type === 'Array') {
                        defaultTagParams.mraid[param.name] = param.value.reduce(function(result, par) {
                            if (par.value) {
                                result.push(par.value);
                            }
                            return result;
                        }, []);
                    } if (param.type === 'Boolean') {
                        defaultTagParams.mraid[param.name] = param.value === 'Yes';
                    } else {
                        defaultTagParams.mraid[param.name] = param.value;
                    }
                });

                forEach(this.vpaid.defaults, function(param, key) {
                    defaultTagParams.vpaid[key] = param;
                });

                this.vpaid.addedParams.forEach(function(param) {
                    if (param.type === 'Array') {
                        defaultTagParams.vpaid[param.name] = param.value.reduce(function(result, par) {
                            if (par.value) {
                                result.push(par.value);
                            }
                            return result;
                        }, []);
                    } else if (param.type === 'Boolean') {
                        defaultTagParams.vpaid[param.name] = param.value === 'Yes';
                    } else {
                        defaultTagParams.vpaid[param.name] = param.value;
                    }
                });

                console.log(this.container);

                console.log(this.mraid);
                console.log(this.vpaid);
                // cState.saveContainer(this.container);
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Container', [function() {
                this.templateUrl = 'views/selfie/containers/container.html';

                this.afterModel = function() {
                    console.log('CONTAINER', this);
                };
            }]);
        }]);
});