(function() {
    'use strict';

    define(['editor'], function() {
        describe('SplashImageController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                c6State,
                FileService,
                CollateralService,
                SplashImageCtrl;

            var EditorSplashCtrl,
                EditorCtrl;

            var minireel;

            beforeEach(function() {
                minireel = {
                    data: {
                        splash: {
                            source: 'generated',
                            ratio: '1-1'
                        },
                        collateral: {
                            splash: 'splash.jpg'
                        }
                    }
                };

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');

                    FileService = $injector.get('FileService');
                    spyOn(FileService, 'open').and.returnValue({ url: '' });

                    CollateralService = $injector.get('CollateralService');
                    spyOn(CollateralService, 'generateCollage')
                        .and.returnValue($q.when(null));

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        $scope.EditorSplashCtrl = EditorSplashCtrl = {
                            model: minireel,
                            splashSrc: 'foo.jpg'
                        };
                        $scope.EditorCtrl = EditorCtrl = {
                            model: {
                                data: {
                                    collateral: {
                                        splash: null
                                    },
                                    splash: {
                                        source: 'generated',
                                        ratio: '16-9'
                                    }
                                }
                            }
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

                describe('maxFileSize', function() {
                    it('should be 307200', function() {
                        expect(SplashImageCtrl.maxFileSize).toBe(307200);
                    });
                });

                describe('splash', function() {
                    it('should be null', function() {
                        expect(SplashImageCtrl.splash).toBeNull();
                    });
                });

                describe('currentUpload', function() {
                    it('should be null', function() {
                        expect(SplashImageCtrl.currentUpload).toBeNull();
                    });
                });

                describe('fileTooBig', function() {
                    beforeEach(function() {
                        SplashImageCtrl.maxFileSize = 204800;
                    });

                    it('should not throw any errors if there is no file', function() {
                        expect(function() {
                            return SplashImageCtrl.fileTooBig;
                        }).not.toThrow();
                    });

                    describe('if there is a file', function() {
                        beforeEach(function() {
                            SplashImageCtrl.splash = {
                                size: 102400
                            };
                        });

                        it('should be true if the file\'s size is greater than the max size', function() {
                            function tooBig() {
                                return SplashImageCtrl.fileTooBig;
                            }

                            expect(tooBig()).toBe(false);

                            SplashImageCtrl.splash.size = 204800;
                            expect(tooBig()).toBe(false);

                            SplashImageCtrl.splash.size = 204801;
                            expect(tooBig()).toBe(true);
                        });
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

                describe('uploadSplash()', function() {
                    var setDeferred,
                        success;

                    beforeEach(function() {
                        success = jasmine.createSpy('uploadSplash() success');
                        setDeferred = $q.defer();

                        spyOn(CollateralService, 'set')
                            .and.returnValue(setDeferred.promise);

                        SplashImageCtrl.splash = {};

                        $scope.$apply(function() {
                            SplashImageCtrl.uploadSplash().then(success);
                        });
                    });

                    it('should set the user-selected file as the minireel\'s splash image', function() {
                        expect(CollateralService.set).toHaveBeenCalledWith('splash', SplashImageCtrl.splash, minireel);
                    });

                    it('should put the result of the set method on iteself', function() {
                        expect(SplashImageCtrl.currentUpload).toBe(setDeferred.promise);
                    });

                    describe('after the upload completes', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                setDeferred.resolve(minireel);
                            });
                        });

                        it('should null-out the currentUpload property', function() {
                            expect(SplashImageCtrl.currentUpload).toBeNull();
                        });

                        it('should resolve to the minireel', function() {
                            expect(success).toHaveBeenCalledWith(minireel);
                        });
                    });

                    describe('if the upload fails', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                setDeferred.reject({});
                            });
                        });

                        it('should null-out the currentUpload property', function() {
                            expect(SplashImageCtrl.currentUpload).toBeNull();
                        });
                    });
                });

                describe('save', function() {
                    var originalData,
                        uploadDeferred, generateDeferred,
                        success;

                    beforeEach(function() {
                        success = jasmine.createSpy('save() success');
                        uploadDeferred = $q.defer();
                        generateDeferred = $q.defer();

                        spyOn(c6State, 'goTo');
                        spyOn(SplashImageCtrl, 'uploadSplash').and.returnValue(uploadDeferred.promise);
                        spyOn(SplashImageCtrl, 'generateSplash').and.returnValue(generateDeferred.promise);

                        SplashImageCtrl.splash = {};

                        originalData = EditorCtrl.model.data;
                    });

                    describe('if the source is specified', function() {
                        beforeEach(function() {
                            minireel.data.splash.source = 'specified';

                            $scope.$apply(function() {
                                SplashImageCtrl.save().then(success);
                            });
                        });

                        describe('if there is no splash', function() {
                            beforeEach(function() {
                                SplashImageCtrl.uploadSplash.calls.reset();
                                success.calls.reset();

                                SplashImageCtrl.splash = null;

                                $scope.$apply(function() {
                                    SplashImageCtrl.save().then(success);
                                });
                            });

                            it('should not upload anything', function() {
                                expect(SplashImageCtrl.uploadSplash).not.toHaveBeenCalled();
                                expect(success).toHaveBeenCalled();
                            });
                        });

                        it('should upload the splash image', function() {
                            expect(SplashImageCtrl.uploadSplash).toHaveBeenCalled();
                        });
                    });

                    describe('if the source is generated', function() {
                        beforeEach(function() {
                            minireel.data.splash = 'generated';

                            $scope.$apply(function() {
                                SplashImageCtrl.save().then(success);
                            });
                        });

                        it('should generate a splash image', function() {
                            expect(SplashImageCtrl.generateSplash).toHaveBeenCalledWith(true);
                        });

                        describe('if the upload fails', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    generateDeferred.reject('EROOR');
                                });
                            });

                            it('should still reach the end of the chain', function() {
                                expect(c6State.goTo).toHaveBeenCalledWith('editor');
                            });
                        });

                        describe('if the upload succeeds', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    generateDeferred.resolve('/collateral/test/splash.jpg');
                                });
                            });

                            it('should set the "splash" key on the collateral object of the minireel', function() {
                                expect(minireel.data.collateral.splash).toBe('/collateral/test/splash.jpg');
                            });
                        });
                    });

                    describe('after the upload completes', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                SplashImageCtrl.save().then(success);
                            });

                            expect(EditorCtrl.model.data.collateral).not.toEqual(minireel.data.collateral);
                            expect(EditorCtrl.model.data.splash).not.toEqual(minireel.data.splash);
                            expect(c6State.goTo).not.toHaveBeenCalled();

                            $scope.$apply(function() {
                                uploadDeferred.resolve(minireel);
                            });
                        });

                        it('should copy the collateral hash of its model to the EditorCtrl\'s model', function() {
                            expect(EditorCtrl.model.data.collateral).toEqual(minireel.data.collateral);
                            expect(EditorCtrl.model.data).toBe(originalData);
                        });

                        it('should copy the splash object', function() {
                            expect(EditorCtrl.model.data.splash).toEqual(minireel.data.splash);
                            expect(EditorCtrl.model.data).toBe(originalData);
                        });

                        it('should transition back to the editor', function() {
                            expect(c6State.goTo).toHaveBeenCalledWith('editor');
                        });

                        it('should resolve the promsise', function() {
                            expect(success).toHaveBeenCalledWith(EditorCtrl.model);
                        });
                    });
                });
            });

            describe('events', function() {
                describe('$destroy', function() {
                    function trigger() {
                        $scope.$emit('$destroy');
                    }

                    describe('if the user did not select an image', function() {
                        beforeEach(trigger);

                        it('should do nothing', function() {
                            expect(FileService.open).not.toHaveBeenCalled();
                        });
                    });

                    describe('if the user did select an image', function() {
                        var wrapper;

                        beforeEach(function() {
                            wrapper = {
                                close: jasmine.createSpy('wrapper.close()')
                            };

                            SplashImageCtrl.splash = {};
                            FileService.open.and.returnValue(wrapper);

                            trigger();
                        });

                        it('should close the file', function() {
                            expect(FileService.open).toHaveBeenCalledWith(SplashImageCtrl.splash);
                            expect(wrapper.close).toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('$watchers', function() {
                describe('this.splash', function() {
                    it('should set the splashSrc to the url of the opened file', function() {
                        var file,
                            wrapper = {
                                url: 'blah.jpg'
                            };

                        FileService.open.and.returnValue(wrapper);

                        $scope.$apply(function() {
                            SplashImageCtrl.splash = file = {};
                        });
                        expect(EditorSplashCtrl.splashSrc).toBe(wrapper.url);
                    });

                    it('should close a file if it is no longer the user-selected file', function() {
                        var file,
                            wrapper = {
                                close: jasmine.createSpy('wrapper.close()')
                            };

                        expect(FileService.open).not.toHaveBeenCalled();

                        FileService.open.and.returnValue(wrapper);
                        $scope.$apply(function() {
                            SplashImageCtrl.splash = file = {};
                        });

                        expect(wrapper.close).not.toHaveBeenCalled();

                        $scope.$apply(function() {
                            SplashImageCtrl.splash = file = {};
                        });
                        expect(FileService.open).toHaveBeenCalledWith(file);
                        expect(wrapper.close).toHaveBeenCalled();
                    });
                });

                describe('minireel.data.splash.ratio', function() {
                    beforeEach(function() {
                        spyOn(SplashImageCtrl, 'generateSplash');
                    });

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
                                    expect(SplashImageCtrl.generateSplash).not.toHaveBeenCalled();
                                });
                            });

                            describe('if the source is generated', function() {
                                beforeEach(function() {
                                    minireel.data.splash.source = 'generated';

                                    $scope.$apply(function() {
                                        minireel.data.splash.ratio = ratio;
                                    });
                                });

                                it('should generate a preview', function() {
                                    expect(SplashImageCtrl.generateSplash).toHaveBeenCalledWith(false);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}());
