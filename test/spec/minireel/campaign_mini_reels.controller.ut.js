define(['app'], function(appModule) {
    'use strict';

    describe('CampaignMiniReelsController', function() {
        var $rootScope,
            $controller,
            cinema6,
            $scope,
            $q,
            $window,
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
                $q = $injector.get('$q');
                $window = $injector.get('$window');
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
            it('should call the MiniReelService for the url', function() {
                var minireel = cinema6.db.create('experience', {
                    id: 'e-5480ecc1063d7e',
                    data: {
                        deck: []
                    }
                });

                spyOn(MiniReelService, 'previewUrlOf');

                CampaignMiniReelsCtrl.previewUrlOf(minireel);

                expect(MiniReelService.previewUrlOf).toHaveBeenCalledWith(minireel);
            });
        });

        describe('previewMiniReel(minireel)', function() {
            var minireel;

            beforeEach(function() {
                minireel = cinema6.db.create('experience', {
                    id: 'e-5480ecc1063d7e',
                    data: {
                        deck: []
                    }
                });

                spyOn(CampaignCtrl, 'save');
                CampaignCtrl.save.deferred = $q.defer();
                CampaignCtrl.save.and.returnValue(CampaignCtrl.save.deferred.promise);

                spyOn(MiniReelService, 'previewUrlOf').and.returnValue('http://cinema6.com?id=e-123');
                spyOn($window, 'open');

                CampaignMiniReelsCtrl.previewMiniReel(minireel);
            });

            it('should get the url form the MiniReelService', function() {
                expect(MiniReelService.previewUrlOf).toHaveBeenCalledWith(minireel);
            });

            it('should save the Campaign', function() {
                expect(CampaignCtrl.save).toHaveBeenCalled();
            });

            it('should open a new tab with the campaign id as a query parameter', function() {
                $scope.$apply(function() {
                    CampaignCtrl.save.deferred.resolve();
                });

                expect($window.open).toHaveBeenCalledWith('http://cinema6.com?id=e-123&campaign=cam-74070a860d121e');
            });
        });
    });
});
