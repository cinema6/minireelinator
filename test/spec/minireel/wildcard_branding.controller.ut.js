define(['app'], function(appModule) {
    'use strict';

    describe('WildcardBrandingController', function() {
        var $rootScope,
            $controller,
            c6State,
            MiniReelService,
            $scope,
            WildcardCtrl,
            WildcardBrandingCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');
                MiniReelService = $injector.get('MiniReelService');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    WildcardCtrl = $scope.WildcardCtrl = $controller('WildcardController', {
                        $scope: $scope,
                        cState: c6State.get('MR:New:Wildcard')
                    });
                    WildcardCtrl.model = MiniReelService.createCard('video');

                    WildcardBrandingCtrl = $controller('WildcardBrandingController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(WildcardBrandingCtrl).toEqual(jasmine.any(Object));
        });

        describe('if the card params has an action object', function() {
            var action;

            beforeEach(function() {
                action = {};

                WildcardCtrl.model.params.action = action;

                $scope.$apply(function() {
                    WildcardBrandingCtrl = $controller('WildcardBrandingController', {
                        $scope: $scope
                    });
                });
            });

            it('should not replace the action', function() {
                expect(WildcardCtrl.model.params.action).toBe(action);
            });
        });

        describe('if the card params has no action', function() {
            beforeEach(function() {
                delete WildcardCtrl.model.params.action;

                $scope.$apply(function() {
                    WildcardBrandingCtrl = $controller('WildcardBrandingController', {
                        $scope: $scope
                    });
                });
            });

            it('should create one', function() {
                expect(WildcardCtrl.model.params.action).toEqual({
                    type: 'button',
                    label: ''
                });
            });
        });

        describe('properties', function() {
            describe('actionTypeOptions', function() {
                it('should be an object of options', function() {
                    expect(WildcardBrandingCtrl.actionTypeOptions).toEqual({
                        'Button': 'button',
                        'Text': 'text'
                    });
                });
            });
        });

        describe('$events', function() {
            describe('$destroy', function() {
                describe('if the action has a label', function() {
                    beforeEach(function() {
                        WildcardCtrl.model.params.action.label = 'HELLO!';

                        $scope.$apply(function() {
                            $scope.$emit('$destroy');
                        });
                    });

                    it('should not null-out the action object', function() {
                        expect(WildcardCtrl.model.params.action).toEqual(jasmine.objectContaining({
                            label: 'HELLO!'
                        }));
                    });
                });

                describe('if the action has no label', function() {
                    beforeEach(function() {
                        WildcardCtrl.model.params.action.label = '';

                        $scope.$apply(function() {
                            $scope.$emit('$destroy');
                        });
                    });

                    it('should null-out the action object', function() {
                        expect(WildcardCtrl.model.params.action).toBeNull();
                    });
                });
            });
        });
    });
});
