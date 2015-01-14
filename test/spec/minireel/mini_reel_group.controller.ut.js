define(['minireel/campaign', 'minireel/mixins/WizardController'], function(campaignModule, WizardController) {
    'use strict';

    describe('MiniReelGroupController', function() {
        var $rootScope,
            $controller,
            $scope,
            MiniReelGroupCtrl;

        beforeEach(function() {
            module(campaignModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    MiniReelGroupCtrl = $scope.MiniReelGroupCtrl = $controller('MiniReelGroupController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(MiniReelGroupCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the WizardController', inject(function($injector) {
            expect(Object.keys(MiniReelGroupCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(WizardController))));
        }));

        describe('properties', function() {
            describe('tabs', function() {
                it('should be an array of tabs', function() {
                    expect(MiniReelGroupCtrl.tabs).toEqual([
                        {
                            name: 'General',
                            sref: 'MR:MiniReelGroup.General'
                        },
                        {
                            name: 'Cards',
                            sref: 'MR:MiniReelGroup.Cards'
                        },
                        {
                            name: 'MiniReels',
                            sref: 'MR:MiniReelGroup.MiniReels'
                        }
                    ]);
                });
            });
        });
    });
});
