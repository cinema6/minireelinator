define(['app'], function(appModule) {
    'use strict';

    var copy = angular.copy;

    describe('SelfiePreviewController', function() {
        var $rootScope,
            $controller,
            $scope,
            $q,
            MiniReelService,
            SelfiePreviewCtrl,
            c6BrowserInfo;

        var experience,
            card,
            miniReelDeferred,
            cardDeferred;

        function compileCtrl() {
            $scope.$apply(function() {
                SelfiePreviewCtrl = $controller('SelfiePreviewController', { $scope: $scope, c6BrowserInfo: c6BrowserInfo });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                MiniReelService = $injector.get('MiniReelService');

                card = {
                    data: {},
                    params: {}
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
                };

                $scope = $rootScope.$new();
                $scope.card = undefined;
                $scope.profile = undefined;
                $scope.active = undefined;
                $scope.standalone = undefined;
                $scope.device = undefined;
                $scope.experience = undefined;
            });

            miniReelDeferred = $q.defer();
            cardDeferred = $q.defer();
            spyOn(MiniReelService, 'create').and.returnValue(miniReelDeferred.promise);
            spyOn(MiniReelService, 'convertCardForPlayer').and.returnValue(cardDeferred.promise);

            compileCtrl();
        });

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            $scope = null;
            $q = null;
            MiniReelService = null;
            SelfiePreviewCtrl = null;
            c6BrowserInfo = null;
            experience = null;
            card = null;
            miniReelDeferred = null;
            cardDeferred = null;
        });

        it('should exist', function() {
            expect(SelfiePreviewCtrl).toEqual(jasmine.any(Object));
        });

        it('should create an experience for the preview', function() {
            expect(MiniReelService.create).toHaveBeenCalled();
        });

        describe('properties', function() {
            describe('profile', function() {
                it('should use what is on the $scope but default to a copy of the c6BrowserInfo.profile', function() {
                    expect(SelfiePreviewCtrl.profile).toEqual(c6BrowserInfo.profile);

                    $scope.profile = {
                        device: 'phone',
                        flash: false
                    };
                    $scope.device = 'phone';
                    compileCtrl();

                    expect(SelfiePreviewCtrl.profile).not.toEqual(c6BrowserInfo.profile);
                    expect(SelfiePreviewCtrl.profile).toEqual({
                        device: 'phone',
                        flash: false
                    });
                });
            });

            describe('active', function() {
                it('should use what is on the $scope but default to true', function() {
                    expect(SelfiePreviewCtrl.active).toBe(true);

                    $scope.active = false;
                    compileCtrl();

                    expect(SelfiePreviewCtrl.active).toBe(false);
                });
            });

            describe('standalone', function() {
                it('should use what is on the $scope but default to true', function() {
                    expect(SelfiePreviewCtrl.standalone).toBe(true);

                    $scope.standalone = false;
                    compileCtrl();

                    expect(SelfiePreviewCtrl.standalone).toBe(false);
                });
            });
        });

        describe('$scope', function() {
            describe('properties', function() {
                describe('device', function() {
                    it('should use the $scope value but default to desktop', function() {
                        expect($scope.device).toBe('desktop');

                        $scope.device = 'phone';
                        compileCtrl();

                        expect($scope.device).toBe('phone');
                    });

                    it('should use try to use the profile before defaulting to desktop', function() {
                        expect($scope.device).toBe('desktop');

                        $scope.device = null;
                        $scope.profile = { device: 'phone' };
                        compileCtrl();

                        expect($scope.device).toBe('phone');
                    });
                });
            });
        });

        describe('$watchers', function() {
            describe('card', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.card = card;
                    });
                });

                it('should convert the card for the player', function() {
                    expect(MiniReelService.convertCardForPlayer).toHaveBeenCalledWith(card);
                });

                describe('when card is converted for player', function() {
                    var convertedCard;

                    beforeEach(function() {
                        convertedCard = copy(card);

                        $scope.$apply(function() {
                            miniReelDeferred.resolve(experience);
                        });

                        $scope.$apply(function() {
                            cardDeferred.resolve(convertedCard);
                        });
                    });

                    it('should add certain properties to the data object and add the card to the controller', function() {
                        expect(convertedCard.data.autoplay).toBe(false);
                        expect(convertedCard.data.skip).toBe(true);
                        expect(convertedCard.data.controls).toBe(true);
                        expect(SelfiePreviewCtrl.card).toBe(convertedCard);
                    });

                    it('should add a copy of the experience to the controller with the converted card in the deck', function() {
                        expect(SelfiePreviewCtrl.experience).not.toBe(experience);
                        expect(SelfiePreviewCtrl.experience.data.deck).toEqual([convertedCard]);
                    });
                });

                describe('changing the device preview', function() {
                    var convertedCard;

                    function applyDeferreds() {
                        $scope.$apply(function() {
                            miniReelDeferred.resolve(experience);
                        });

                        $scope.$apply(function() {
                            cardDeferred.resolve(convertedCard);
                        });
                    }

                    beforeEach(function() {
                        convertedCard = copy(card);
                    });

                    it('should always be "phone" on mobile devices', function() {
                        convertedCard.params.action = { group: 'website' };
                        c6BrowserInfo.profile.device = 'phone';
                        applyDeferreds();
                        expect($scope.device).toBe('phone');
                        expect(SelfiePreviewCtrl.mobileOnly).toBe(false);
                    });

                    it('should be "phone" on desktop if the card is click-to-call', function() {
                        convertedCard.params.action = { group: 'phone' };
                        c6BrowserInfo.profile.device = 'desktop';
                        applyDeferreds();
                        expect($scope.device).toBe('phone');
                        expect(SelfiePreviewCtrl.mobileOnly).toBe(true);
                    });

                    it('should sometimes be "desktop"', function() {
                        convertedCard.params.action = { group: 'website' };
                        c6BrowserInfo.profile.device = 'desktop';
                        applyDeferreds();
                        expect($scope.device).toBe('desktop');
                        expect(SelfiePreviewCtrl.mobileOnly).toBe(false);
                    });
                });
            });

            describe('experience', function() {
                beforeEach(function() {
                    $scope.card = card;

                    $scope.$apply(function() {
                        experience.id = 'e-111';
                        experience.data.mode = 'full';
                        $scope.experience = experience;
                    });
                });

                it('should convert the card for the player', function() {
                    expect(MiniReelService.convertCardForPlayer).toHaveBeenCalledWith(card);
                });

                describe('when card is converted for player', function() {
                    it('should use the new experience for the preview', function() {
                        $scope.$apply(function() {
                            cardDeferred.resolve(copy(card));
                        });

                        expect(SelfiePreviewCtrl.experience.data.mode).toBe('full');
                        expect(SelfiePreviewCtrl.experience.id).toBe('e-111');
                    });
                });
            });

            describe('device', function() {
                it('should update the profile with the new device', function() {
                    expect(SelfiePreviewCtrl.profile.device).toBe('desktop');
                    expect(SelfiePreviewCtrl.profile.flash).toBe(true);

                    $scope.$apply(function() {
                        $scope.device = 'phone';
                    });

                    expect(SelfiePreviewCtrl.profile.device).toBe('phone');
                    expect(SelfiePreviewCtrl.profile.flash).toBe(false);

                    $scope.$apply(function() {
                        $scope.device = 'desktop';
                    });

                    expect(SelfiePreviewCtrl.profile.device).toBe('desktop');
                    expect(SelfiePreviewCtrl.profile.flash).toBe(true);
                });
            });
        });
    });
});
