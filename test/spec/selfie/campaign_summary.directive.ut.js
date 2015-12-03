(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('<selfie-campaign-summary>', function() {
            var $rootScope,
                $scope,
                $compile,
                SelfieCampaignSummaryService,
                $login;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    SelfieCampaignSummaryService = $injector.get('SelfieCampaignSummaryService');

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        $login = $compile('<selfie-campaign-summary></selfie-campaign-summary>')($scope);
                    });
                });
            });

            it('should set its scope.model propertry to be the SelfieCampaignSummaryService\'s model', function() {
                expect($login.isolateScope().model).toBe(SelfieCampaignSummaryService.model);
            });
        });
    });
}());
