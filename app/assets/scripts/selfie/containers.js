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

            this.initWithModel = function(model) {
                this._container = model;

                this.hasName = !!model.name;
                this.validName = true;

                this.mraid = PlacementService.generateParamsModel(
                    model.defaultTagParams.mraid,
                    ['network','uuid','hostApp','prebuffer','clickUrls']
                );

                this.vpaid = PlacementService.generateParamsModel(
                    model.defaultTagParams.vpaid,
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
        }]);
});