define(['minireel/campaign'], function(campaignModule) {
    'use strict';

    describe('CampaignController', function() {
        var $rootScope,
            $controller,
            $scope,
            CampaignCtrl;

        beforeEach(function() {
            module(campaignModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    CampaignCtrl = $controller('CampaignController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(CampaignCtrl).toEqual(jasmine.any(Object));
        });
    });
});
