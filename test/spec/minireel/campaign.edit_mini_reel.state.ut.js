define(['app'], function(appModule) {
    'use strict';

    describe('MR:Campaign.EditMiniReel state', function() {
        var $rootScope,
            c6State,
            cinema6,
            CampaignState,
            MiniReelService,
            editMinireel;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');

                CampaignState = c6State.get('MR:Campaign');
                editMinireel = c6State.get('MR:Campaign.EditMiniReel');
            });
        });

        it('should exist', function() {
            expect(editMinireel).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var minireel, id,
                success, failure;

            beforeEach(function() {
                id = 'e-74246042cd7b59';

                success = jasmine.createSpy('success');
                failure = jasmine.createSpy('failure');

                cinema6.db.push('experience', id, {
                    data: {
                        links: {},
                        collateral: {
                            splash: null
                        },
                        params: {},
                        deck: []
                    }
                });

                $rootScope.$apply(function() {
                    cinema6.db.find('experience', id).then(function(_minireel) {
                        minireel = _minireel;
                    });
                });

                $rootScope.$apply(function() {
                    editMinireel.model({
                        minireelId: id
                    }).then(success, failure);
                });
            });

            it('should return the minireel based on the id', function() {
                expect(success).toHaveBeenCalledWith(minireel);
            });
        });

        describe('afterModel()', function() {
            var minireel;

            beforeEach(function() {
                minireel = cinema6.db.create('minireel', {
                    id: '12345',
                    data: {
                        links: {},
                        collateral: {
                            splash: null
                        },
                        params: {},
                        deck: []
                    }
                });

                CampaignState.cModel = cinema6.db.create('campaign', {
                    miniReels: [
                        {
                            id: 'e-f4970a95123ea9',
                            endDate: new Date()
                        },
                        {
                            id: minireel.id,
                            endDate: new Date(),
                            name: 'wazzup'
                        },
                        {
                            id: 'e-7ff198e3585ea4',
                            endDate: new Date()
                        }
                    ]
                });

                editMinireel.afterModel(minireel);
            });

            it('should set the metaData property based on the campaign', function() {
                expect(editMinireel.metaData).toEqual({
                    endDate: CampaignState.cModel.miniReels[1].endDate,
                    name: CampaignState.cModel.miniReels[1].name
                });
            });
        });

        describe('enter()', function() {
            it('should go to the "MR:Edit:Campaign.MiniReel" state', function() {
                spyOn(c6State, 'goTo');
                editMinireel.enter();

                expect(c6State.goTo).toHaveBeenCalledWith('MR:Edit:Campaign.MiniReel', null, null, true);
            });
        });
    });
});