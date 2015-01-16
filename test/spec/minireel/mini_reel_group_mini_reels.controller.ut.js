define(['minireel/app', 'minireel/mixins/MiniReelSearchController'], function(appModule, MiniReelSearchController) {
    'use strict';

    describe('MiniReelGroupMiniReelsController', function() {
        var $rootScope,
            $controller,
            cinema6,
            $scope,
            CampaignCtrl,
            MiniReelGroupMiniReelsCtrl;

        var campaign, miniReels;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                cinema6 = $injector.get('cinema6');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    CampaignCtrl = $scope.CampaignCtrl = $controller('CampaignController', {
                        $scope: $scope
                    });
                    CampaignCtrl.initWithModel(campaign = cinema6.db.create('campaign', {
                        links: {},
                        miniReels: []
                    }));

                    MiniReelGroupMiniReelsCtrl = $scope.MiniReelGroupMiniReelsCtrl = $controller('MiniReelGroupMiniReelsController', {
                        $scope: $scope
                    });
                    miniReels = MiniReelGroupMiniReelsCtrl.model = [];
                });
            });
        });

        it('should exist', function() {
            expect(MiniReelGroupMiniReelsCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the MiniReelSearchController', inject(function($injector) {
            expect(Object.keys(MiniReelGroupMiniReelsCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(MiniReelSearchController, {
                $scope: $scope
            }))));
        }));

        describe('methods', function() {
            describe('add(minireel)', function() {
                var minireel;

                beforeEach(function() {
                    miniReels.push.apply(miniReels,
                        ['e-2e3c0f39ef5805', 'e-0007bc5bac6734'].map(function(id) {
                            return cinema6.db.create('experience', {
                                id: id,
                                data: {
                                    deck: []
                                }
                            });
                        })
                    );

                    minireel = cinema6.db.create('experience', {
                        id: 'e-7fd84132c0c7af',
                        data: {
                            deck: []
                        }
                    });

                    MiniReelGroupMiniReelsCtrl.add(minireel);
                });

                it('should add the minireel to the model', function() {
                    expect(miniReels.length).toBe(3);
                    expect(miniReels[2]).toBe(minireel);
                });
            });

            describe('remove(minireel)', function() {
                var removed;

                beforeEach(function() {
                    miniReels.push.apply(miniReels,
                        ['e-2e3c0f39ef5805', 'e-0007bc5bac6734', 'e-f5131e4b35a58f', 'e-9e1d2c9c60841a', 'e-a53ed0e7bb4d28'].map(function(id) {
                            return cinema6.db.create('experience', {
                                id: id,
                                data: {
                                    deck: []
                                }
                            });
                        })
                    );

                    removed = miniReels[3];

                    MiniReelGroupMiniReelsCtrl.remove(removed);
                });

                it('should remove the minireel from the model', function() {
                    expect(miniReels.length).toBe(4);
                    expect(miniReels).not.toContain(removed);
                });
            });

            describe('isNotBeingTargeted', function() {
                var isNotBeingTargeted;
                var notTargeted;

                beforeEach(function() {
                    isNotBeingTargeted = MiniReelGroupMiniReelsCtrl.isNotBeingTargeted;

                    notTargeted = ['e-2e3c0f39ef5805', 'e-0007bc5bac6734', 'e-f5131e4b35a58f'].map(function(id) {
                        return cinema6.db.create('experience', {
                            id: id,
                            data: {
                                deck: []
                            }
                        });
                    });

                    miniReels.push.apply(miniReels,
                        ['e-9e1d2c9c60841a', 'e-a53ed0e7bb4d28'].map(function(id) {
                            return cinema6.db.create('experience', {
                                id: id,
                                data: {
                                    deck: []
                                }
                            });
                        })
                    );
                });

                describe('if the minireel is not in the model', function() {
                    it('should return true', function() {
                        notTargeted.forEach(function(minireel) {
                            expect(isNotBeingTargeted(minireel)).toBe(true);
                        });
                    });
                });

                describe('if the minireel is in the model', function() {
                    it('should return false', function() {
                        miniReels.forEach(function(minireel) {
                            expect(isNotBeingTargeted(minireel)).toBe(false);
                        });
                    });
                });
            });
        });
    });
});
