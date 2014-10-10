define(['minireel/sponsor','minireel/mixins/WizardController'], function(sponsorModule, WizardController) {
    'use strict';

    describe('SponsorCardController', function() {
        var $injector,
            $rootScope,
            $controller,
            $scope,
            SponsorCardCtrl;

        beforeEach(function() {
            module(sponsorModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;

                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorCardCtrl = $controller('SponsorCardController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(SponsorCardCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the WizardController', function() {
            expect(Object.keys(SponsorCardCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(WizardController))));
        });

        describe('properties', function() {
            describe('tabs', function() {
                it('should be an array of tabs', function() {
                    expect(SponsorCardCtrl.tabs).toEqual([
                        {
                            name: 'Editorial Content',
                            sref: 'MR:SponsorCard.Copy',
                            required: true
                        },
                        {
                            name: 'Video Content',
                            sref: 'MR:SponsorCard.Video',
                            required: true
                        },
                        {
                            name: 'Branding',
                            sref: 'MR:SponsorCard.Branding',
                            required: true
                        },
                        {
                            name: 'Links',
                            sref: 'MR:SponsorCard.Links',
                            required: false
                        },
                        {
                            name: 'Advertising',
                            sref: 'MR:SponsorCard.Ads',
                            required: true
                        },
                        {
                            name: 'Tracking',
                            sref: 'MR:SponsorCard.Tracking',
                            required: true
                        },
                        {
                            name: 'Placement',
                            sref: 'MR:SponsorCard.Placement',
                            required: true
                        }
                    ]);
                });
            });
        });
    });
});
