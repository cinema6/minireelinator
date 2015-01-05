define(['app'], function(appModule) {
    'use strict';

    describe('MR:Creatives.NewMiniReel state', function() {
        var $rootScope,
            $q,
            c6State,
            MiniReelService,
            campaign,
            creativesNewMiniReel;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                MiniReelService = $injector.get('MiniReelService');

                campaign = c6State.get('MR:Campaign');
                creativesNewMiniReel = c6State.get('MR:Creatives.NewMiniReel');
            });

            campaign.cModel = {
                id: 'cam-f67ec7c4ada34d',
                categories: ['food', 'vehicles', 'gaming']
            };
        });

        it('should exist', function() {
            expect(creativesNewMiniReel).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var minireel,
                success, failure;

            beforeEach(function() {
                minireel = {
                    data: {
                        deck: []
                    }
                };

                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                spyOn(MiniReelService, 'create').and.returnValue($q.when(minireel));

                $rootScope.$apply(function() {
                    creativesNewMiniReel.model().then(success, failure);
                });
            });

            it('should create a new minireel', function() {
                expect(MiniReelService.create).toHaveBeenCalledWith();
            });

            it('should resolve to the new minireel', function() {
                expect(success).toHaveBeenCalledWith(minireel);
            });

            it('should add campaign data to the MiniReel', function() {
                expect(minireel).toEqual(jasmine.objectContaining({
                    campaignId: campaign.cModel.id,
                    categoryList: campaign.cModel.categories
                }));
                expect(minireel.categoryList).not.toBe(campaign.cModel.categories);
            });
        });
    });
});
