define(['minireel/sponsor','minireel/mixins/LinksController'], function(sponsorModule, LinksController) {
    'use strict';

    describe('SponsorCardLinksController', function() {
        var $injector,
            $rootScope,
            $controller,
            $scope,
            SponsorCardLinksCtrl;

        beforeEach(function() {
            module(sponsorModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;

                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorCardLinksCtrl = $controller('SponsorCardLinksController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(SponsorCardLinksCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the LinksController', function() {
            expect(Object.keys(SponsorCardLinksCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(LinksController, {
                $scope: $scope
            }))));
        });
    });
});
