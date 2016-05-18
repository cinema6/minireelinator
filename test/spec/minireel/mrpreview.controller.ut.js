define(['app','angular'], function(appModule, angular) {
    'use strict';

    var copy = angular.copy;
    var extend = angular.extend;

    describe('PreviewController', function() {
        var $rootScope,
            $q,
            $scope,
            $controller,
            c6UrlMaker,
            PreviewCtrl,
            MiniReelService,
            c6EventEmitter,
            c6BrowserInfo,
            c6State, portal,
            postMessage;

        var responseCallback,
            editorExperience,
            playerExperience,
            session,
            playerMeta;

        beforeEach(function() {
            c6BrowserInfo = {
                profile: {
                    flash: true,
                    autoplay: true,
                    device: 'desktop'
                }
            };

            module('c6.ui', function($provide) {
                $provide.value('c6BrowserInfo',c6BrowserInfo);

                $provide.decorator('c6UrlMaker', function($delegate) {
                    return jasmine.createSpy('c6UrlMaker()')
                        .and.callFake($delegate);
                });
            });

            module(appModule.name, function($provide) {
                $provide.value('playerMeta', {});
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                $controller = $injector.get('$controller');
                MiniReelService = $injector.get('MiniReelService');
                postMessage = $injector.get('postMessage');
                c6EventEmitter = $injector.get('c6EventEmitter');
                c6UrlMaker = $injector.get('c6UrlMaker');
                playerMeta = $injector.get('playerMeta');
                c6State = $injector.get('c6State');
                portal = c6State.get('Portal');
                portal.cModel = {};

                $scope = $rootScope.$new();

                PreviewCtrl = $controller('PreviewController', { $scope: $scope });
            });

            editorExperience = {
                id: 'foo--editor',
                data: {
                    mode: 'light',
                    autoplay: false,
                    deck: [
                        {
                            id: '1',
                            type: 'video',
                            data: {}
                        },
                        {
                            id: '2',
                            type: 'ad',
                            data: {}
                        },
                        {
                            id: '3',
                            type: 'video',
                            data: {}
                        }
                    ]
                }
            };
            playerExperience = extend(copy(editorExperience), {
                id: 'foo--player'
            });

            session = {
                ping: jasmine.createSpy('session.ping()')
            };

            c6EventEmitter(session);

            spyOn(session, 'on').and.callThrough();

            responseCallback = jasmine.createSpy('responseCallback()');
        });

        afterAll(function() {
            $rootScope = null;
            $q = null;
            $scope = null;
            $controller = null;
            c6UrlMaker = null;
            PreviewCtrl = null;
            MiniReelService = null;
            c6EventEmitter = null;
            c6BrowserInfo = null;
            c6State = null;
            portal = null;
            postMessage = null;
            responseCallback = null;
            editorExperience = null;
            playerExperience = null;
            session = null;
            playerMeta = null;
        });

        describe('initialization', function() {
            it('should exist', function() {
                expect(PreviewCtrl).toEqual(jasmine.any(Object));
            });

            it('should set the default mode to desktop', function() {
                expect(PreviewCtrl.device).toBe('desktop');
            });
        });

        describe('properties', function() {
            describe('active', function() {
                it('should be false', function() {
                    expect(PreviewCtrl.active).toBe(false);
                });
            });

            describe('experience', function() {
                it('should be null', function() {
                    expect(PreviewCtrl.experience).toBeNull();
                });
            });

            describe('card', function() {
                it('should be null', function() {
                    expect(PreviewCtrl.card).toBeNull();
                });
            });

            describe('profile', function() {
                it('should be a copy of the c6BrowserInfo.profile', function() {
                    expect(PreviewCtrl.profile).toEqual(c6BrowserInfo.profile);
                    expect(PreviewCtrl.profile).not.toBe(c6BrowserInfo.profile);
                });
            });

            describe('device', function() {
                it('should be "desktop"', function() {
                    expect(PreviewCtrl.device).toBe('desktop');
                });
            });
        });

        describe('$scope listeners', function() {
            describe('mrPreview:splashClick', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.$emit('mrPreview:splashClick');
                    });
                });

                it('should set "active" to true', function() {
                    expect(PreviewCtrl.active).toBe(true);
                });
            });

            describe('mrPreview:updateExperience', function() {
                beforeEach(function() {
                    spyOn(MiniReelService, 'convertForPlayer').and.callFake(function() {
                        return $q.when(copy(playerExperience));
                    });

                    $scope.$apply(function() {
                        $scope.$emit('mrPreview:updateExperience', editorExperience);
                    });
                });

                it('should convert the experience for the player', function() {
                    expect(MiniReelService.convertForPlayer).toHaveBeenCalledWith(editorExperience);
                });

                it('should make a copy of the experience, disable its ads and make it it\'s experience property', function() {
                    expect(PreviewCtrl.experience).toEqual(extend(copy(playerExperience), {
                        data: extend(copy(playerExperience.data), {
                            adConfig: {
                                video: {
                                    firstPlacement: -1,
                                    frequency: 0
                                },
                                display: {}
                            }
                        })
                    }));
                });

                describe('if the experience changes', function() {
                    beforeEach(function() {
                        playerExperience = copy(playerExperience);
                        playerExperience.data.deck[0].type = 'video';

                        $scope.$apply(function() {
                            $scope.$emit('mrPreview:updateExperience', editorExperience);
                        });
                    });

                    it('should copy the new experience to its experience property', function() {
                        expect(PreviewCtrl.experience).toEqual(extend(copy(playerExperience), {
                            data: extend(copy(playerExperience.data), {
                                adConfig: jasmine.any(Object)
                            })
                        }));
                    });
                });

                describe('if the experience doesn\'t change', function() {
                    var previousExperience;

                    beforeEach(function() {
                        previousExperience = PreviewCtrl.experience;
                        playerExperience = copy(playerExperience);

                        $scope.$apply(function() {
                            $scope.$emit('mrPreview:updateExperience', editorExperience);
                        });
                    });

                    it('should do nothing', function() {
                        expect(PreviewCtrl.experience).toBe(previousExperience);
                    });
                });

                describe('if a card is also provided', function() {
                    var card;

                    beforeEach(function() {
                        card = playerExperience.data.deck[1];
                        PreviewCtrl.active = false;

                        $scope.$apply(function() {
                            $scope.$emit('mrPreview:updateExperience', editorExperience, card);
                        });
                    });

                    it('should set the card property to the provided card', function() {
                        expect(PreviewCtrl.card).toBe(card);
                    });

                    it('should set active to true', function() {
                        expect(PreviewCtrl.active).toBe(true);
                    });
                });

                describe('if a card is not provided', function() {
                    beforeEach(function() {
                        PreviewCtrl.card = playerExperience.data.deck[1];
                        PreviewCtrl.active = false;

                        $scope.$apply(function() {
                            $scope.$emit('mrPreview:updateExperience', editorExperience);
                        });
                    });

                    it('should set the card property to null', function() {
                        expect(PreviewCtrl.card).toBeNull();
                    });

                    it('should not set active to true', function() {
                        expect(PreviewCtrl.active).not.toBe(true);
                    });
                });
            });

            describe('mrPreview:reset', function() {
                beforeEach(function() {
                    PreviewCtrl.active = true;
                    PreviewCtrl.card = {};
                    PreviewCtrl.experience = {};
                    spyOn(MiniReelService, 'convertForPlayer').and.returnValue($q.when(playerExperience));

                    $scope.$apply(function() {
                        $scope.$emit('mrPreview:reset');
                    });
                });

                it('should set active to false', function() {
                    expect(PreviewCtrl.active).toBe(false);
                });

                it('should set the card property back to null', function() {
                    expect(PreviewCtrl.card).toBeNull();
                });

                it('should set the experience property back to null', function() {
                    expect(PreviewCtrl.experience).toBeNull();
                });
            });

            describe('mrPreview:updateMode', function() {
                beforeEach(function() {
                    spyOn(MiniReelService, 'convertForPlayer').and.returnValue($q.when(playerExperience));

                    $scope.$apply(function() {
                        $scope.$emit('mrPreview:updateMode', editorExperience);
                    });
                });

                it('should convert the experience for the player', function() {
                    expect(MiniReelService.convertForPlayer).toHaveBeenCalledWith(editorExperience);
                });

                it('should make a copy of the experience and make it it\'s experience property', function() {
                    expect(PreviewCtrl.experience).toEqual(extend(copy(playerExperience), {
                        data: extend(copy(playerExperience.data), {
                            adConfig: jasmine.any(Object)
                        })
                    }));
                });

                describe('if the experience changes', function() {
                    beforeEach(function() {
                        playerExperience = copy(playerExperience);
                        playerExperience.data.deck[0].type = 'video';

                        $scope.$apply(function() {
                            $scope.$emit('mrPreview:updateMode', editorExperience);
                        });
                    });

                    it('should copy the new experience to its experience property', function() {
                        expect(PreviewCtrl.experience).toEqual(extend(copy(playerExperience), {
                            data: extend(copy(playerExperience.data), {
                                adConfig: jasmine.any(Object)
                            })
                        }));
                    });
                });

                describe('if the experience doesn\'t change', function() {
                    var previousExperience;

                    beforeEach(function() {
                        previousExperience = PreviewCtrl.experience;
                        playerExperience = copy(playerExperience);

                        $scope.$apply(function() {
                            $scope.$emit('mrPreview:updateMode', editorExperience);
                        });
                    });

                    it('should do nothing', function() {
                        expect(PreviewCtrl.experience).toBe(previousExperience);
                    });
                });
            });
        });

        describe('$watcher', function() {
            describe('active', function() {
                function set(bool) {
                    $scope.$apply(function() {
                        PreviewCtrl.active = bool;
                    });
                }

                beforeEach(function() {
                    set(undefined);

                    spyOn($scope, '$emit').and.callThrough();
                    spyOn($scope, '$broadcast').and.callThrough();
                });

                describe('if true', function() {
                    beforeEach(function() {
                        set(true);
                    });

                    it('should tell the splash page it is being hidden', function() {
                        expect($scope.$broadcast).toHaveBeenCalledWith('mrPreview:splashHide');
                    });
                });

                describe('if false', function() {
                    beforeEach(function() {
                        set(false);
                    });

                    it('should tell the splash page it is being shown', function() {
                        expect($scope.$broadcast).toHaveBeenCalledWith('mrPreview:splashShow');
                    });
                });

                describe('if there is a card', function() {
                    beforeEach(function() {
                        PreviewCtrl.card = {};
                    });

                    describe('if true', function() {
                        beforeEach(function() {
                            set(true);
                        });

                        it('should not $emit anything', function() {
                            expect($scope.$emit).not.toHaveBeenCalled();
                        });
                    });

                    describe('if false', function() {
                        beforeEach(function() {
                            set(false);
                        });

                        it('should $emit "mrPreview:closePreview"', function() {
                            expect($scope.$emit).toHaveBeenCalledWith('mrPreview:closePreview');
                        });
                    });
                });

                describe('if there is no card', function() {
                    beforeEach(function() {
                        PreviewCtrl.card = null;
                    });

                    describe('if true', function() {
                        beforeEach(function() {
                            set(true);
                        });

                        it('should not $emit anything', function() {
                            expect($scope.$emit).not.toHaveBeenCalled();
                        });
                    });

                    describe('if false', function() {
                        beforeEach(function() {
                            set(false);
                        });

                        it('should not $emit anything', function() {
                            expect($scope.$emit).not.toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('device', function() {
                var currentProfile;

                beforeEach(function() {
                    $scope.$apply(function() {
                        currentProfile = PreviewCtrl.profile;
                    });
                });

                describe('if set to something the same as the current device', function() {
                    beforeEach(function() {
                        currentProfile.device = 'tablet';

                        $scope.$apply(function() {
                            PreviewCtrl.device = currentProfile.device;
                        });
                    });

                    it('should do nothing', function() {
                        expect(PreviewCtrl.profile).toBe(currentProfile);
                    });
                });

                describe('if set to something that is not the current device', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            PreviewCtrl.device = 'netbook';
                        });
                    });

                    it('should update the profile', function() {
                        expect(PreviewCtrl.profile).not.toBe(currentProfile);
                        expect(PreviewCtrl.profile).toEqual(extend(copy(currentProfile), {
                            device: PreviewCtrl.device
                        }));
                    });
                });

                describe('if set to desktop', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            PreviewCtrl.device = 'desktop';
                        });
                    });

                    it('should make the profile\'s flash setting its true value', function() {
                        expect(PreviewCtrl.profile.flash).toBe(c6BrowserInfo.profile.flash);
                    });
                });

                describe('if set to "phone"', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            PreviewCtrl.device = 'phone';
                        });
                    });

                    it('should set flash to false', function() {
                        expect(PreviewCtrl.profile.flash).toBe(false);
                    });
                });
            });
        });
    });
});
