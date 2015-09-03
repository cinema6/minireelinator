define(['app'], function(appModule) {
    'use strict';

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

        it('should exist', function() {
            expect(SelfiePreviewCtrl).toEqual(jasmine.any(Object));
        });

        it('should create an experience for the preview', function() {
            expect(MiniReelService.create).toHaveBeenCalled();
        });

        describe('properties', function() {
            describe('card', function() {
                it('should use what is on the $scope', function() {
                    expect(SelfiePreviewCtrl.card).toBe(undefined);

                    $scope.card = card;
                    compileCtrl();

                    expect(SelfiePreviewCtrl.card).toBe(card);
                });
            });

            describe('profile', function() {
                it('should use what is on the $scope but default to a copy of the c6BrowserInfo.profile', function() {
                    expect(SelfiePreviewCtrl.profile).toEqual(c6BrowserInfo.profile);

                    $scope.profile = {
                        device: 'phone',
                        flash: false
                    };
                    compileCtrl();

                    expect(SelfiePreviewCtrl.profile).not.toEqual(c6BrowserInfo.profile);
                    expect(SelfiePreviewCtrl.profile).toEqual({
                        profile: {
                            device: 'phone',
                            flash: false
                        }
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
                });
            });
        });

        describe('$watchers', function() {
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