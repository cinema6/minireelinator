define(['minireel/campaign', 'minireel/mixins/WizardController'], function(campaignModule, WizardController) {
    'use strict';

    describe('CreativesNewMiniReelController', function() {
        var $rootScope,
            $controller,
            $scope,
            CreativesNewMiniReelCtrl;

        beforeEach(function() {
            module(campaignModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    CreativesNewMiniReelCtrl = $scope.CreativesNewMiniReelCtrl = $controller('CreativesNewMiniReelController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(CreativesNewMiniReelCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the WizardController', inject(function($injector) {
            expect(Object.keys(CreativesNewMiniReelCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(WizardController))));
        }));

        describe('properties', function() {
            describe('tabs', function() {
                it('should be an array of tabs to display in the sidebar', function() {
                    expect(CreativesNewMiniReelCtrl.tabs).toEqual([
                        {
                            name: 'General',
                            sref: 'MR:Creatives.NewMiniReel.General'
                        },
                        {
                            name: 'MiniReel Type',
                            sref: 'MR:Creatives.NewMiniReel.Type'
                        },
                        {
                            name: 'Playback Settings',
                            sref: 'MR:Creatives.NewMiniReel.Playback'
                        }
                    ]);
                });
            });
        });
    });
});
