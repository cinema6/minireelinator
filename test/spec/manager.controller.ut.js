(function() {
    'use strict';

    define(['manager'], function() {
        describe('ManagerController', function() {
            var $rootScope,
                $scope,
                $controller,
                ManagerCtrl;

            var model,
                c6State;

            beforeEach(function() {
                model = [];

                module('c6.state', function($provide) {
                    $provide.provider('c6State', function() {
                        this.$get = function() {
                            return {
                                transitionTo: jasmine.createSpy('c6State.transitionTo()')
                            };
                        };

                        this.state = function() { return this; };
                        this.index = function() { return this; };
                    });
                });

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    c6State = $injector.get('c6State');

                    $scope = $rootScope.$new();
                    ManagerCtrl = $controller('ManagerController', { $scope: $scope, cModel: model });
                });
            });

            it('should exist', function() {
                expect(ManagerCtrl).toEqual(jasmine.any(Object));
            });

            describe('construction', function() {
                it('should put its model on itself', function() {
                    expect(ManagerCtrl.model).toBe(model);
                });
            });

            describe('methods', function() {
                describe('edit(minireel)', function() {
                    beforeEach(function() {
                        ManagerCtrl.edit({ id: 'e-59c8519cc4c54f' });
                    });

                    it('should transition to the "editor" state and provide the id of the minireel', function() {
                        expect(c6State.transitionTo).toHaveBeenCalledWith('editor', { id: 'e-59c8519cc4c54f' });
                    });
                });
            });
        });
    });
}());
