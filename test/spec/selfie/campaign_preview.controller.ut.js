define(['app','c6uilib'], function(appModule, c6uilib) {
    'use strict';

    var copy = angular.copy;

    describe('SelfieCampaignPreviewControler', function() {
        var $rootScope,
            $scope,
            $controller,
            $timeout,
            $q,
            cinema6,
            MiniReelService,
            c6BrowserInfo,
            c6Debounce,
            SelfieCampaignCtrl,
            SelfieCampaignPreviewCtrl;

        var experience,
            card;

        function compileCtrl() {
            $scope.$apply(function() {
                SelfieCampaignPreviewCtrl = $controller('SelfieCampaignPreviewController', { $scope: $scope, c6BrowserInfo: c6BrowserInfo });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            module(c6uilib.name, function($provide) {
                $provide.decorator('c6Debounce', function($delegate) {
                    return jasmine.createSpy('c6Debounce()').and.callFake(function(fn, time) {
                        c6Debounce.debouncedFn = fn;
                        spyOn(c6Debounce, 'debouncedFn').and.callThrough();

                        return $delegate.call(null, c6Debounce.debouncedFn, time);
                    });
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $timeout = $injector.get('$timeout');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');
                c6Debounce = $injector.get('c6Debounce');

                card = {
                    data: {}
                };

                experience = {
                    type: 'minireel',
                    appUri: 'mini-reel-player',
                    data: {
                        mode: 'light',
                        deck: []
                    }
                };

                c6BrowserInfo = {
                    profile: {
                        device: 'desktop',
                        flash: true
                    }
                }

                $scope = $rootScope.$new();
                $scope.SelfieCampaignCtrl = {
                    card: card
                };
            });

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieCampaignPreviewCtrl).toEqual(jasmine.any(Object));
        });

        it('should create an experience for the preview', function() {
            spyOn(cinema6.db, 'create').and.returnValue(experience);

            compileCtrl();

            expect(cinema6.db.create).toHaveBeenCalledWith('experience', jasmine.any(Object));
        });

        it('should load the preview if there is a service and video id on instantiation', function() {
            spyOn(MiniReelService, 'convertCardForPlayer').and.returnValue($q.defer().promise);

            card.data.service = 'youtube';
            card.data.videoid = '12345';

            compileCtrl();

            $timeout.flush(2000);

            expect(c6Debounce.debouncedFn).toHaveBeenCalled();
        });

        describe('properties', function() {
            describe('device', function() {
                it('should default to desktop', function() {
                    expect(SelfieCampaignPreviewCtrl.device).toBe('desktop');
                });
            });

            describe('card', function() {
                it('should default to null', function() {
                    expect(SelfieCampaignPreviewCtrl.card).toBe(null);
                });
            });

            describe('profile', function() {
                it('should be a copy of the c6BrowserInfo.profile', function() {
                    expect(SelfieCampaignPreviewCtrl.profile).toEqual(c6BrowserInfo.profile);
                });
            });

            describe('active', function() {
                it('should default to true', function() {
                    expect(SelfieCampaignPreviewCtrl.active).toBe(true);
                });
            });
        });

        describe('methods', function() {
            describe('loadPreview()', function() {
                var deferred;

                beforeEach(function() {
                    deferred = $q.defer();

                    spyOn(MiniReelService, 'convertCardForPlayer').and.returnValue(deferred.promise);
                });

                it('should debounce for 2 seconds', function() {
                    expect(c6Debounce.debouncedFn).not.toHaveBeenCalled();

                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();

                    $timeout.flush(2000);

                    expect(c6Debounce.debouncedFn).toHaveBeenCalled();
                    expect(c6Debounce.debouncedFn.calls.count()).toBe(1);
                });

                it('should convert the card for the player', function() {
                    SelfieCampaignPreviewCtrl.loadPreview();

                    $timeout.flush(2000);

                    expect(MiniReelService.convertCardForPlayer).toHaveBeenCalledWith(card);
                });

                describe('when card is converted for player', function() {
                    var convertedCard;

                    beforeEach(function() {
                        convertedCard = copy(card);

                        SelfieCampaignPreviewCtrl.loadPreview();

                        $timeout.flush(2000);

                        $scope.$apply(function() {
                            deferred.resolve(convertedCard);
                        });
                    });

                    it('should add certain properties to the data object and add the card to the controller', function() {
                        expect(convertedCard.data.autoplay).toBe(false);
                        expect(convertedCard.data.skip).toBe(true);
                        expect(convertedCard.data.controls).toBe(true);
                        expect(SelfieCampaignPreviewCtrl.card).toBe(convertedCard);
                    });

                    it('should add a copy of the experience to the controller with the converted card in the deck', function() {
                        expect(SelfieCampaignPreviewCtrl.experience).not.toBe(experience);
                        expect(SelfieCampaignPreviewCtrl.experience.data.deck).toEqual([convertedCard]);
                    });
                });
            });
        });

        describe('$watchers', function() {
            describe('device', function() {
                it('should update the profile with the new device', function() {
                    expect(SelfieCampaignPreviewCtrl.profile.device).toBe('desktop');
                    expect(SelfieCampaignPreviewCtrl.profile.flash).toBe(true);

                    $scope.$apply(function() {
                        SelfieCampaignPreviewCtrl.device = 'phone';
                    });

                    expect(SelfieCampaignPreviewCtrl.profile.device).toBe('phone');
                    expect(SelfieCampaignPreviewCtrl.profile.flash).toBe(false);

                    $scope.$apply(function() {
                        SelfieCampaignPreviewCtrl.device = 'desktop';
                    });

                    expect(SelfieCampaignPreviewCtrl.profile.device).toBe('desktop');
                    expect(SelfieCampaignPreviewCtrl.profile.flash).toBe(true);
                });
            });
        });

        describe('$broadcast handler', function() {
            it('should load preview', function() {
                spyOn(MiniReelService, 'convertCardForPlayer').and.returnValue($q.defer().promise);

                $rootScope.$broadcast('loadPreview');

                $timeout.flush(2000);

                expect(c6Debounce.debouncedFn).toHaveBeenCalled();
            });
        });
    });
});