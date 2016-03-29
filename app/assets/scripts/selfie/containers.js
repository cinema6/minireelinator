define(['angular','c6_state'], function(angular, c6State) {
    'use strict';

    var extend = angular.extend,
        copy = angular.copy;

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
                    prompt: 'There was a problem processing your request: ' + error.data,
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

        .controller('SelfieContainerController', ['c6State','cinema6','c6AsyncQueue',
                                                  'ConfirmDialogService','PlacementService',
        function                                 ( c6State , cinema6 , c6AsyncQueue ,
                                                   ConfirmDialogService , PlacementService ) {
            var queue = c6AsyncQueue();

            function showErrorModal(error) {
                ConfirmDialogService.display({
                    prompt: 'There was a problem processing your request: ' + error.data,
                    affirm: 'OK',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: function() {
                        return ConfirmDialogService.close();
                    }
                });
            }

            function generateModel(params, model, ui) {
                return {
                    ui: ui,
                    params: params,
                    defaults: params.reduce(function(result, param) {
                            if (ui.indexOf(param.name) > -1) {
                                result[param.name] = param;

                                if (param.type === 'Array' && !param.value.length) {
                                    param.value.push({
                                        label: param.label,
                                        value: ''
                                    });
                                }
                            }
                            return result;
                        }, {}),
                    addedParams: params.filter(function(param) {
                        return (param.type === 'Array' ? !!param.value.length : !!param.value) &&
                            param.editable && ui.indexOf(param.name) < 0;
                    }),
                    availableParams: params.filter(function(param) {
                        return (ui.indexOf(param.name) < 0 || param.type === 'Array') &&
                            param.editable;
                    }),
                    show: !!Object.keys(model).length
                };
            }

            this.initWithModel = function(model) {
                this._container = model;

                this.hasName = !!model.name;
                this.validName = true;

                this.mraid = generateModel(
                    PlacementService.convertForUI(model.defaultTagParams.mraid || {}),
                    model.defaultTagParams.mraid || {},
                    ['network','uuid','hostApp','prebuffer','clickUrls']
                );

                this.vpaid = generateModel(
                    PlacementService.convertForUI(model.defaultTagParams.vpaid || {}),
                    model.defaultTagParams.vpaid || {},
                    ['network','uuid']
                );
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
                    dbModel = this._container;

                ['mraid', 'vpaid'].forEach(function(key) {
                    if (self[key].show) {
                        dbModel.defaultTagParams[key] = PlacementService.convertForSave(
                            self[key].params
                        );
                    } else {
                        dbModel.defaultTagParams[key] = undefined;
                    }
                });

                this.pending = true;

                dbModel.save().then(function() {
                    c6State.goTo('Selfie:Containers', null, null);
                }).catch(showErrorModal)
                .finally(function() { self.pending = false; });
            }, this);
        }])

        .service('PlacementService', ['c6State',
        function                     ( c6State ) {
            this.convertForUI = function(model) {
                var App = c6State.get('Selfie:App'),
                    schema = App.cModel.data.placement.params;

                return schema.reduce(function(result, param) {
                    var value = model[param.name],
                        _value;

                    if (param.type === 'Array') {
                        _value = (value || param.default || [])
                            .map(function(val) {
                                return {
                                    label: param.label,
                                    value: val
                                };
                            });
                    } else if (param.type === 'Boolean') {
                        _value = value === undefined ?
                            param.default :
                            (!!value ? 'Yes' : 'No');
                    } else {
                        _value = value || param.default;
                    }

                    result.push(extend(copy(param), {value: _value}));

                    return result;
                }, []);
            };

            this.convertForSave = function(params) {
                return params.reduce(function(result, param) {
                    if (param.type === 'Array') {
                        result[param.name] = param.value.reduce(function(result, item) {
                            if (item.value) {
                                result.push(item.value);
                            }
                            return result;
                        }, []);

                        result[param.name] = !!result[param.name].length ?
                            result[param.name] : undefined;
                    } else if (param.type === 'Boolean') {
                        result[param.name] = typeof param.value === 'string' ?
                            param.value === 'Yes' : undefined;
                    } else {
                        result[param.name] = (param.value || undefined);
                    }

                    return result;
                }, {});
            };
        }]);
});