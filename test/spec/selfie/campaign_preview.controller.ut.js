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
            card,
            miniReelDeferred;

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

            miniReelDeferred = $q.defer();
            spyOn(MiniReelService, 'create').and.returnValue(miniReelDeferred.promise);

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieCampaignPreviewCtrl).toEqual(jasmine.any(Object));
        });

        it('should load the preview if there is a service and video id on instantiation', function() {
            card.data.service = 'youtube';
            card.data.videoid = '12345';

            compileCtrl();

            $timeout.flush(2000);

            expect(c6Debounce.debouncedFn).toHaveBeenCalled();
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
                            miniReelDeferred.resolve(experience);
                        });

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

        describe('$broadcast handler', function() {
            it('should load preview', function() {
                $rootScope.$broadcast('loadPreview');

                $timeout.flush(2000);

                expect(c6Debounce.debouncedFn).toHaveBeenCalled();
            });
        });
    });
});