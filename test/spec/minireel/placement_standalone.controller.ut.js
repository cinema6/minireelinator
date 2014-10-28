define(['app', 'minireel/services'], function(appModule, servicesModule) {
    'use strict';

    describe('PlacementStandaloneController', function() {
        var $rootScope,
            $controller,
            c6State,
            SettingsService,
            MiniReelService,
            portal,
            $scope,
            SponsorCardCtrl,
            PlacementStandaloneCtrl;

        var card,
            minireel;

        beforeEach(function() {
            module(servicesModule.name, function($provide) {
                $provide.decorator('MiniReelService', function($delegate) {
                    var create = $delegate.create;

                    spyOn($delegate, 'create').and.callFake(function() {
                        return create.apply($delegate, arguments)
                            .then(function(result) {
                                return (minireel = result);
                            });
                    });

                    return $delegate;
                });
            });

            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');

                portal = c6State.get('Portal');
                portal.cModel = {
                    org: {
                        id: 'o-2dacba90c5ddc8'
                    }
                };

                SettingsService = $injector.get('SettingsService');
                MiniReelService = $injector.get('MiniReelService');

                card = MiniReelService.createCard('video');
                card.title = 'My Awesome Video';

                SettingsService
                    .register('MR::org', {
                        minireelDefaults: {
                            autoplay: true,
                            mode: 'light'
                        }
                    }, {
                        localSync: false
                    })
                    .register('MR::user', {
                        minireelDefaults: {
                            splash: {
                                ratio: '3-2',
                                theme: 'img-only'
                            }
                        }
                    }, {
                        localSync: false
                    });

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorCardCtrl = $scope.SponsorCardCtrl = $controller('SponsorCardController', {
                        $scope: $scope,
                        cState: c6State.get('MR:SponsorCard')
                    });
                    SponsorCardCtrl.initWithModel(card);

                    PlacementStandaloneCtrl = $controller('PlacementStandaloneController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(PlacementStandaloneCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('data', function() {
                it('should be some incomplete minireel data based on the card', function() {
                    expect(PlacementStandaloneCtrl.data).toEqual({
                        title: card.title,
                        mode: 'lightbox'
                    });
                });
            });

            describe('enableCompanionAd', function() {
                describe('getting', function() {
                    describe('if the mode is "lightbox"', function() {
                        beforeEach(function() {
                            PlacementStandaloneCtrl.data.mode = 'lightbox';
                        });

                        it('should be false', function() {
                            expect(PlacementStandaloneCtrl.enableCompanionAd).toBe(false);
                        });
                    });

                    describe('if the mode is "lightbox-ads"', function() {
                        beforeEach(function() {
                            PlacementStandaloneCtrl.data.mode = 'lightbox-ads';
                        });

                        it('should be true', function() {
                            expect(PlacementStandaloneCtrl.enableCompanionAd).toBe(true);
                        });
                    });
                });

                describe('setting', function() {
                    describe('to false', function() {
                        beforeEach(function() {
                            PlacementStandaloneCtrl.data.mode = 'lightbox-ads';

                            PlacementStandaloneCtrl.enableCompanionAd = false;
                        });

                        it('should set the mode to lightbox', function() {
                            expect(PlacementStandaloneCtrl.data.mode).toBe('lightbox');
                        });
                    });

                    describe(' to true', function() {
                        beforeEach(function() {
                            PlacementStandaloneCtrl.data.mode = 'lightbox';

                            PlacementStandaloneCtrl.enableCompanionAd = true;
                        });

                        it('should set the mode to lightbox-ads', function() {
                            expect(PlacementStandaloneCtrl.data.mode).toBe('lightbox-ads');
                        });
                    });
                });
            });
        });

        describe('methods', function() {
            describe('place()', function() {
                beforeEach(function() {
                    spyOn(SponsorCardCtrl, 'place').and.callThrough();
                    spyOn(c6State, 'goTo');

                    $scope.$apply(function() {
                        PlacementStandaloneCtrl.place();
                    });
                });

                it('should create a MiniReel', function() {
                    expect(MiniReelService.create).toHaveBeenCalledWith();
                });

                it('should copy the data property to the minireel\'s data', function() {
                    expect(minireel.data).toEqual(jasmine.objectContaining(PlacementStandaloneCtrl.data));
                });

                it('should make the deck of the minireel empty', function() {
                    expect(minireel.data.deck).toEqual([]);
                });

                it('should place the card in the minireel', function() {
                    expect(SponsorCardCtrl.place).toHaveBeenCalledWith(minireel, 0);
                });

                it('should go to the MR:Placement.Placements state', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('MR:Placement.Placements');
                });
            });
        });
    });
});
