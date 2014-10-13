define(['app','minireel/sponsor','minireel/mixins/LinksController'], function(appModule, sponsorModule, LinksController) {
    'use strict';

    describe('SponsorMiniReelLinksController', function() {
        var $injector,
            $rootScope,
            $controller,
            c6State,
            sponsorMiniReel,
            $scope,
            SponsorMiniReelLinksCtrl;

        var links;

        beforeEach(function() {
            links = {
                'Action': 'buynow.html',
                'Facebook': 'fb.html'
            };

            module(appModule.name);
            module(sponsorModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;

                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');

                sponsorMiniReel = c6State.get('MR:SponsorMiniReel');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorMiniReelLinksCtrl = $controller('SponsorMiniReelLinksController', {
                        $scope: $scope
                    });
                    SponsorMiniReelLinksCtrl.initWithModel(links);
                });
            });
        });

        it('should exist', function() {
            expect(SponsorMiniReelLinksCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the LinksController', function() {
            expect(Object.keys(SponsorMiniReelLinksCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(LinksController, {
                $scope: $scope
            }))));
        });

        describe('$events', function() {
            describe('SponsorMiniReelCtrl:beforeSave', function() {
                beforeEach(function() {
                    spyOn(SponsorMiniReelLinksCtrl, 'save').and.callThrough();

                    $scope.$broadcast('SponsorMiniReelCtrl:beforeSave');
                });

                it('should save the links', function() {
                    expect(SponsorMiniReelLinksCtrl.save).toHaveBeenCalled();
                });
            });
        });
    });
});
