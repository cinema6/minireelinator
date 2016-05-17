define(['app'], function(appModule) {
    'use strict';

    describe('SponsorCardBrandingController', function() {
        var $rootScope,
            $controller,
            c6State,
            MiniReelService,
            $scope,
            SponsorCardCtrl,
            SponsorCardBrandingCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');
                MiniReelService = $injector.get('MiniReelService');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorCardCtrl = $scope.SponsorCardCtrl = $controller('SponsorCardController', {
                        $scope: $scope,
                        cState: c6State.get('MR:SponsorCard')
                    });
                    SponsorCardCtrl.initWithModel(MiniReelService.createCard('video'));

                    SponsorCardBrandingCtrl = $controller('SponsorCardBrandingController', {
                        $scope: $scope
                    });
                });
            });
        });

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            c6State = null;
            MiniReelService = null;
            $scope = null;
            SponsorCardCtrl = null;
            SponsorCardBrandingCtrl = null;
        });

        it('should exist', function() {
            expect(SponsorCardBrandingCtrl).toEqual(jasmine.any(Object));
        });

        describe('if the card params has an action object', function() {
            var action;

            beforeEach(function() {
                action = {};

                SponsorCardCtrl.model.params.action = action;

                $scope.$apply(function() {
                    SponsorCardBrandingCtrl = $controller('SponsorCardBrandingController', {
                        $scope: $scope
                    });
                });
            });

            it('should not replace the action', function() {
                expect(SponsorCardCtrl.model.params.action).toBe(action);
            });
        });

        describe('if the card params has no action', function() {
            beforeEach(function() {
                delete SponsorCardCtrl.model.params.action;

                $scope.$apply(function() {
                    SponsorCardBrandingCtrl = $controller('SponsorCardBrandingController', {
                        $scope: $scope
                    });
                });
            });

            it('should create one', function() {
                expect(SponsorCardCtrl.model.params.action).toEqual({
                    type: 'button',
                    label: ''
                });
            });
        });

        describe('properties', function() {
            describe('actionTypeOptions', function() {
                it('should be an object of options', function() {
                    expect(SponsorCardBrandingCtrl.actionTypeOptions).toEqual({
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
                        SponsorCardCtrl.model.params.action.label = 'HELLO!';

                        $scope.$apply(function() {
                            $scope.$emit('$destroy');
                        });
                    });

                    it('should not null-out the action object', function() {
                        expect(SponsorCardCtrl.model.params.action).toEqual(jasmine.objectContaining({
                            label: 'HELLO!'
                        }));
                    });
                });

                describe('if the action has no label', function() {
                    beforeEach(function() {
                        SponsorCardCtrl.model.params.action.label = '';

                        $scope.$apply(function() {
                            $scope.$emit('$destroy');
                        });
                    });

                    it('should null-out the action object', function() {
                        expect(SponsorCardCtrl.model.params.action).toBeNull();
                    });
                });
            });
        });
    });
});
