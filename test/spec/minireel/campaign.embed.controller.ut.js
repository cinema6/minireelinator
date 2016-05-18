(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('CampaignEmbedController', function() {
            var $rootScope,
                $controller,
                CampaignEmbedCtrl,
                cState;

            ['MR:Campaign.MiniReels.Embed', 'MR:Campaign.Placements.Embed'].forEach(function(instance) {
                describe(instance, function() {
                    beforeEach(function() {
                        module(appModule.name);

                        cState = {
                            cParent: {
                                cName: instance
                            }
                        };

                        inject(function($injector) {
                            $rootScope = $injector.get('$rootScope');
                            $controller = $injector.get('$controller');

                            CampaignEmbedCtrl = $controller('CampaignEmbedController', {
                                cState: cState
                            });
                        });
                    });

                    afterAll(function() {
                        $rootScope = null;
                        $controller = null;
                        CampaignEmbedCtrl = null;
                        cState = null;
                    });

                    it('should exist', function() {
                        expect(CampaignEmbedCtrl).toEqual(jasmine.any(Object));
                    });

                    it('should have the instance state name on the controller', function() {
                        expect(CampaignEmbedCtrl.parentState).toBe(instance);
                    });
                });
            });
        })
    });
}());
