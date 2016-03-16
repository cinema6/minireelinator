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

        .controller('SelfieContainerController', ['cState',
        function                                 ( cState ) {
            function removeSpaces(str) {
                if (!str) { return str; }
                return str.replace(/^\s*/, '');
            }

            function addQuotes(str) {
                return '"' + str + '"';
            }

            function convertToText(data, joiner) {
                var result = '';

                forEach(data, function(value, prop) {
                    if (prop === 'container') { return; }

                    var val = !isArray(value) ?
                        addQuotes(value) :
                        '[' + value.map(function(item) {
                            return addQuotes(item);
                        }).join(',') + ']';

                    result += prop + joiner + val + '\n';
                });

                return result;
            }

            function convertToModel(text) {
                if (!text) { return; }

                var lines = text.split('\n');

                return lines.reduce(function(result, line) {
                    if (!line) { return result; }

                    var hasEqualSign = (/=/).test(line),
                        splitLine = line.split(hasEqualSign ? '=' : ':'),
                        prop = splitLine[0],
                        value = removeSpaces(splitLine[1]);

                    if (prop === 'container') { return result; }

                    try {
                        result[prop] = JSON.parse(value);
                    }
                    catch(e) {
                        if (value.charAt(0) === '[' && value.charAt(value.length-1) === ']') {
                            value = value.replace(/[\[\]]/g, '').split(',').map(removeSpaces);
                        }
                        result[prop] = value;
                    }

                    return result;
                }, {});
            }

            this.initWithModel = function(model) {
                this.container = model.pojoify();

                this.hasName = !!this.container.name;
                this.mraid = convertToText(this.container.defaultTagParams.mraid, ': ');
                this.vpaid = convertToText(this.container.defaultTagParams.vpaid, '=');

                this.heading = cState.heading;
            };

            this.save = function() {
                // convertToModel(this.mraid);
                console.log(convertToModel(this.mraid));
                console.log(convertToModel(this.vpaid));

                extend(this.container.defaultTagParams.mraid, convertToModel(this.mraid));
                extend(this.container.defaultTagParams.vpaid, convertToModel(this.vpaid));

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