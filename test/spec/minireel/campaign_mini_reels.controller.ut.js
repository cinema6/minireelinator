define(['app'], function(appModule) {
    'use strict';

    describe('CampaignMiniReelsController', function() {
        var $rootScope,
            $controller,
            cinema6,
            $scope,
            MiniReelService,
            CampaignCtrl,
            CampaignMiniReelsCtrl;

        var campaign;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');

                campaign = cinema6.db.create('campaign', {
                    id: 'cam-74070a860d121e',
                    links: {},
                    miniReels: [],
                    cards: []
                });

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    $scope.CampaignCtrl = CampaignCtrl = $controller('CampaignController', {
                        $scope: $scope
                    });
                    CampaignCtrl.initWithModel(campaign);

                    $scope.CampaignMiniReelsCtrl = CampaignMiniReelsCtrl = $controller('CampaignMiniReelsController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(CampaignMiniReelsCtrl).toEqual(jasmine.any(Object));
        });

        describe('remove(item)', function() {
            var minireel;

            beforeEach(function() {
                campaign.miniReels.push.apply(campaign.miniReels, ['e-f8f1341c77fb57', 'e-095e8df1cdd0c1', 'e-11e1cc3b9efa7f'].map(function(id) {
                    return {
                        id: id,
                        endDate: new Date(),
                        item: cinema6.db.create('experience', {
                            id: id,
                            data: {
                                deck: []
                            }
                        })
                    };
                }));

                minireel = campaign.miniReels[2];

                CampaignMiniReelsCtrl.remove(minireel.item);
            });

            it('should remove the minireel', function() {
                expect(campaign.miniReels.length).toBe(2);
                expect(campaign.miniReels).not.toContain(minireel);
            });
        });

        describe('add(item)', function() {
            var result;
            var minireel;
            var date;

            beforeEach(function() {
                campaign.miniReels.push.apply(campaign.miniReels, ['e-f8f1341c77fb57', 'e-095e8df1cdd0c1', 'e-11e1cc3b9efa7f'].map(function(id) {
                    return cinema6.db.create('experience', {
                        id: id,
                        data: {
                            deck: []
                        }
                    });
                }));

                minireel = cinema6.db.create('experience', {
                    id: 'e-5480ecc1063d7e',
                    data: {
                        deck: []
                    }
                });

                date = new Date();

                result = CampaignMiniReelsCtrl.add(minireel, {
                    endDate: date
                });
            });

            it('should add the minireel to the campaign', function() {
                expect(campaign.miniReels[3]).toEqual({
                    id: minireel.id,
                    endDate: date,
                    item: minireel
                });
            });

            it('should return the minireel', function() {
                expect(result).toBe(minireel);
            });

            describe('if called with a minireel that is already added', function() {
                beforeEach(function() {
                    result = CampaignMiniReelsCtrl.add(minireel);
                });

                it('should return the minireel', function() {
                    expect(result).toBe(minireel);
                });

                it('should not add the minireel again', function() {
                    expect(campaign.miniReels[4]).not.toBeDefined();
                });
            });
        });

        describe('previewUrlOf(minireel)', function() {
            var minireel;

            beforeEach(function() {
                minireel = cinema6.db.create('experience', {
                    id: 'e-5480ecc1063d7e',
                    data: {
                        deck: []
                    }
                });

                spyOn(MiniReelService, 'previewUrlOf').and.returnValue('http://cinema6.com?id=e-123');
            });

            it('should call the MiniReelService for the url', function() {
                CampaignMiniReelsCtrl.previewUrlOf(minireel);

                expect(MiniReelService.previewUrlOf).toHaveBeenCalledWith(minireel);
            });

            it('should append the campaign param to the url', function() {
                expect(CampaignMiniReelsCtrl.previewUrlOf(minireel)).toEqual('http://cinema6.com?id=e-123&campaign=cam-74070a860d121e')
            });
        });
    });
});
