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

            this.mraid = {
                alreadyInUI: ['network','uuid','hostApp','prebuffer'],
                addedParams: [],
                show: false
            };

            this.vpaid = {
                alreadyInUI: ['network','uuid'],
                addedParams: [],
                show: false
            };

            this.initWithModel = function(model) {
                this.container = model.pojoify();

                this.hasName = !!this.container.name;
                this.mraid.show = Object.keys(this.container.defaultTagParams.mraid).length > 1;
                this.vpaid.show = Object.keys(this.container.defaultTagParams.vpaid).length > 1;

                this.mraid.availableParams = placementSchema.params
                    .reduce(function(result, param, key) {
                        if (param.editable && Ctrl.mraid.alreadyInUI.indexOf(param.name) < 0) {
                            result.push(param);
                        }
                        return result;
                    }, []);

                this.mraid.defaults = this.container.defaultTagParams.mraid;
                this.vpaid.defaults = this.container.defaultTagParams.vpaid;

                this.mraid.defaults.clickUrls = (this.mraid.defaults.clickUrls || ['']).map(function(url) {
                    return {
                        value: url
                    };
                });

                this.heading = cState.heading;
            };

            this.addParam = function(type, param) {
                if (param.type === 'Array') {
                    this[type].defaults[param.name] = this[type].defaults[param.name] || [];
                    this[type].defaults[param.name].push({label: param.label, value: null});
                }

                if (this[type].addedParams.indexOf(param) < 0 && param.name !== 'clickUrls') {
                    this[type].addedParams.push(param);
                }

                console.log(param);
            };

            this.save = function() {
                cState.saveContainer(this.container);
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