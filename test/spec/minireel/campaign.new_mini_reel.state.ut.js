define(['app'], function(appModule) {
    'use strict';

    describe('MR:Campaign.NewMiniReel state', function() {
        var $rootScope,
            $q,
            cinema6,
            c6State,
            MiniReelService,
            campaign,
            creativesNewMiniReel;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                c6State = $injector.get('c6State');
                MiniReelService = $injector.get('MiniReelService');

                campaign = c6State.get('MR:Campaign');
                creativesNewMiniReel = c6State.get('MR:Campaign.NewMiniReel');
            });

            campaign.cModel = cinema6.db.create('campaign', {
                id: 'cam-f67ec7c4ada34d',
                categories: ['food', 'vehicles', 'gaming'],
                logos: {
                    square: 'my-square-logo.png'
                },
                links: {
                    Facebook: 'fb.html',
                    Twitter: 'twit.com'
                },
                advertiser: {
                    id: 'a-b8ab2ceb807ca4',
                    name: 'Diageo'
                }
            });
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
                        links: {},
                        collateral: {
                            splash: null
                        },
                        params: {},
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
                    categories: campaign.cModel.categories,
                    data: jasmine.objectContaining({
                        collateral: jasmine.objectContaining({
                            logo: campaign.cModel.logos.square
                        }),
                        links: jasmine.objectContaining(campaign.cModel.links),
                        params: jasmine.objectContaining({
                            sponsor: campaign.cModel.advertiser.name
                        })
                    })
                }));
                expect(minireel.data.collateral).toEqual(jasmine.objectContaining({
                    splash: null
                }));
                expect(minireel.data).toEqual(jasmine.objectContaining({
                    deck: []
                }));
                expect(minireel.categories).not.toBe(campaign.cModel.categories);
            });
        });
    });
});
