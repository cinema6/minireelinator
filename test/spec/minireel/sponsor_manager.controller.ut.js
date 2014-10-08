define(['minireel/sponsor','app','minireel/mixins/MiniReelListController'], function(sponsorModule, appModule, MiniReelListController) {
    'use strict';

    describe('SponsorManagerController', function() {
        var $injector,
            $rootScope,
            $controller,
            c6State,
            sponsorManager,
            $scope,
            SponsorManagerCtrl;

        beforeEach(function() {
            module(appModule.name);
            module(sponsorModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;

                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');

                sponsorManager = c6State.get('MR:Sponsor.Manager');
                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorManagerCtrl = $controller('SponsorManagerController', {
                        $scope: $scope,
                        cState: sponsorManager
                    });
                });
            });
        });

        it('should exist', function() {
            expect(SponsorManagerCtrl).toEqual(jasmine.any(Object));
        });

        it('should inhert from the MiniReelListController', function() {
            var MiniReelListCtrl = $injector.instantiate(MiniReelListController, {
                $scope: $scope,
                cState: sponsorManager
            });

            expect(Object.keys(SponsorManagerCtrl)).toEqual(Object.keys(MiniReelListCtrl));
        });
    });
});
