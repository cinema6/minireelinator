(function() {
    'use strict';

    define(['editor'], function() {
        describe('SplashImageController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                CollateralService,
                SplashImageCtrl;

            var EditorSplashCtrl;

            var minireel;

            beforeEach(function() {
                minireel = {
                    data: {
                        splash: {
                            source: 'generated',
                            ratio: '1-1'
                        }
                    }
                };

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $q = $injector.get('$q');

                    CollateralService = $injector.get('CollateralService');
                    spyOn(CollateralService, 'generateCollage')
                        .and.returnValue($q.when(null));

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        EditorSplashCtrl = $scope.EditorSplashCtrl = {
                            model: minireel,
                            splashSrc: 'foo.jpg'
                        };
                        SplashImageCtrl = $controller('SplashImageController', { $scope: $scope });
                    });
                });
            });

            it('should exist', function() {
                expect(SplashImageCtrl).toEqual(jasmine.any(Object));
            });

            describe('initialization', function() {
                var generateCollageDeferred;

                beforeEach(function() {
                    generateCollageDeferred = $q.defer();

                    CollateralService.generateCollage.calls.reset();
                    CollateralService.generateCollage.and.returnValue(generateCollageDeferred.promise);
                });

                describe('if the source is specified', function() {
                    beforeEach(function() {
                        minireel.data.splash.source = 'specified';
                    });

                    ['bar.jpg', null].forEach(function(splashSrc) {
                        describe('if the splashSrc is ' + splashSrc, function() {
                            beforeEach(function() {
                                EditorSplashCtrl.splashSrc = splashSrc;

                                $scope.$apply(function() {
                                    SplashImageCtrl = $controller('SplashImageController', { $scope: $scope });
                                });
                            });

                            it('should not generate a splash image', function() {
                                expect(CollateralService.generateCollage).not.toHaveBeenCalled();
                            });
                        });
                    });
                });

                describe('if the source is generated', function() {
                    beforeEach(function() {
                        minireel.data.splash.source = 'generated';
                    });

                    describe('if there is a splashSrc', function() {
                        beforeEach(function() {
                            EditorSplashCtrl.splashSrc = 'barry.jpg';

                            $scope.$apply(function() {
                                SplashImageCtrl = $controller('SplashImageController', { $scope: $scope });
                            });
                        });

                        it('should not generate a splash image', function() {
                            expect(CollateralService.generateCollage).not.toHaveBeenCalled();
                        });
                    });

                    describe('if there is no splashSrc', function() {
                        beforeEach(function() {
                            EditorSplashCtrl.splashSrc = null;

                            $scope.$apply(function() {
                                SplashImageCtrl = $controller('SplashImageController', { $scope: $scope });
                            });
                        });

                        it('should generate a splash image', function() {
                            expect(CollateralService.generateCollage).toHaveBeenCalledWith(minireel, 'splash--1-1', 600);
                        });

                        it('should set isGenerating to true', function() {
                            expect(SplashImageCtrl.isGenerating).toBe(true);
                        });

                        describe('after the image is generated', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    generateCollageDeferred.resolve('/collateral/blah/splash--1-1');
                                });
                            });

                            it('should set isGenerating to false', function() {
                                expect(SplashImageCtrl.isGenerating).toBe(false);
                            });

                            it('should set the splashSrc to the result', function() {
                                expect(EditorSplashCtrl.splashSrc).toBe('/collateral/blah/splash--1-1');
                            });
                        });

                        describe('if the generation fails', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    generateCollageDeferred.reject('FAIL');
                                });
                            });

                            it('should set isGenerating to false', function() {
                                expect(SplashImageCtrl.isGenerating).toBe(false);
                            });
                        });
                    });
                });
            });

            describe('properties', function() {
                describe('isGenerating', function() {
                    it('should be false', function() {
                        expect(SplashImageCtrl.isGenerating).toBe(false);
                    });
                });
            });

            describe('methods', function() {
                describe('generateSplash(permanent)', function() {
                    var generateCollageDeferred,
                        success;

                    beforeEach(function() {
                        generateCollageDeferred = $q.defer();
                        success = jasmine.createSpy('success');

                        CollateralService.generateCollage.and.returnValue(generateCollageDeferred.promise);
                    });

                    [true, false].forEach(function(bool) {
                        describe('if permanent is ' + bool, function() {
                            beforeEach(function() {
                                SplashImageCtrl.generateSplash(bool).then(success);
                            });

                            it('should set isGenerating to true', function() {
                                expect(SplashImageCtrl.isGenerating).toBe(true);
                            });

                            describe('with success', function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        generateCollageDeferred.resolve('/collateral/foo.jpg');
                                    });
                                });

                                it('should set the splashSrc to the result', function() {
                                    expect(EditorSplashCtrl.splashSrc).toBe('/collateral/foo.jpg');
                                });

                                it('should set isGenerating to false', function() {
                                    expect(SplashImageCtrl.isGenerating).toBe(false);
                                });

                                it('should resolve to the src', function() {
                                    expect(success).toHaveBeenCalledWith('/collateral/foo.jpg');
                                });
                            });

                            describe('with failure', function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        generateCollageDeferred.reject('ERROR');
                                    });
                                });

                                it('should set isGenerating to false', function() {
                                    expect(SplashImageCtrl.isGenerating).toBe(false);
                                });
                            });
                        });
                    });

                    describe('if permanent is true', function() {
                        beforeEach(function() {
                            SplashImageCtrl.generateSplash(true);
                        });

                        it('should generate a collage with the name "splash"', function() {
                            expect(CollateralService.generateCollage).toHaveBeenCalledWith(minireel, 'splash', 600);
                        });
                    });

                    describe('if permanent is false', function() {
                        beforeEach(function() {
                            SplashImageCtrl.generateSplash(false);
                        });

                        it('should generate a collage with the name "splash--ratio"', function() {
                            expect(CollateralService.generateCollage).toHaveBeenCalledWith(minireel, 'splash--1-1', 600);
                        });
                    });
                });
            });

            describe('$watchers', function() {
                describe('minireel.data.splash.ratio', function() {
                    ['6-5', '6-4', '16-9'].forEach(function(ratio) {
                        describe('with ratio: ' + ratio, function() {
                            describe('if the source is specififed', function() {
                                beforeEach(function() {
                                    minireel.data.splash.source = 'specified';

                                    $scope.$apply(function() {
                                        minireel.data.splash.ratio = ratio;
                                    });
                                });

                                it('should not generate a splash image', function() {
                                    
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}());
