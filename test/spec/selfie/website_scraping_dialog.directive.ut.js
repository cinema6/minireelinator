(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('<selfie-website-scraping-dialog>', function() {
            var $rootScope,
                $scope,
                $compile,
                SelfieWebsiteScrapingDialogService,
                $scraper;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    SelfieWebsiteScrapingDialogService = $injector.get('SelfieWebsiteScrapingDialogService');

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        $scraper = $compile('<selfie-website-scraping-dialog></selfie-website-scraping-dialog>')($scope);
                    });
                });
            });

            it('should set its scope.model propertry to be the SelfieWebsiteScrapingDialogService\'s model', function() {
                expect($scraper.isolateScope().model).toBe(SelfieWebsiteScrapingDialogService.model);
            });
        });
    });
}());
