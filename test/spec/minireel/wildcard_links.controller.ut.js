define(['minireel/campaign','minireel/mixins/LinksController'], function(campaignModule, LinksController) {
    'use strict';

    describe('WildcardLinksController', function() {
        var $injector,
            $rootScope,
            $controller,
            $scope,
            WildcardLinksCtrl;

        beforeEach(function() {
            module(campaignModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;

                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    WildcardLinksCtrl = $controller('WildcardLinksController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(WildcardLinksCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the LinksController', function() {
            expect(Object.keys(WildcardLinksCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(LinksController, {
                $scope: $scope
            }))));
        });
    });
});
