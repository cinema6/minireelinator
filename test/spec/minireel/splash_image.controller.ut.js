(function() {
    'use strict';

    define(['minireel/editor', 'angular'], function(editorModule, angular) {
        describe('SplashImageController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                c6State,
                FileService,
                CollateralService,
                EditorService,
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

                module(editorModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    EditorService = $injector.get('EditorService');

                    FileService = $injector.get('FileService');
                    spyOn(FileService, 'open').and.returnValue({ url: 'temp.jpg' });

                    CollateralService = $injector.get('CollateralService');
                    spyOn(CollateralService, 'generateCollage')
                        .and.returnValue($q.defer().promise);

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
                            },
                            bustCache: jasmine.createSpy('EditorCtrl.bustCache()')
                        };
                        SplashImageCtrl = $controller('SplashImageController', { $scope: $scope });
                    });
                });

                spyOn(EditorService, 'beforeSync').and.callThrough();
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

                    describe('if there is no splashSrc', function() {
                        beforeEach(function() {
                            EditorSplashCtrl.splashSrc = null;

                            $scope.$apply(function() {
                                SplashImageCtrl = $controller('SplashImageController', { $scope: $scope });
                            });
                        });

                        it('should generate a splash image', function() {
                            expect(CollateralService.generateCollage).toHaveBeenCalledWith({
                                minireel: minireel,
                                name: 'splash',
                                allRatios: true,
                                cache: false
                            });
                        });

                        it('should set isGenerating to true', function() {
                            expect(SplashImageCtrl.isGenerating).toBe(true);
                        });

                        describe('after the image is generated', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    generateCollageDeferred.resolve({
                                        '1-1': '/collateral/blah/splash--1-1',
                                        '16-9': '/collateral/blah/splash--16-9'
                                    });
                                });
                            });

                            it('should set isGenerating to false', function() {
                                expect(SplashImageCtrl.isGenerating).toBe(false);
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
                    it('should be a boolean', function() {
                        expect(SplashImageCtrl.isGenerating).toEqual(jasmine.any(Boolean));
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

                describe('splashSrc', function() {
                    describe('if the splash is specified', function() {
                        beforeEach(function() {
                            minireel.data.splash.source = 'specified';
                        });

                        it('should return the splashSrc', function() {
                            expect(SplashImageCtrl.splashSrc).toBe(EditorSplashCtrl.splashSrc);
                        });
                    });

                    describe('if the splash src is generated', function() {
                        beforeEach(function() {
                            minireel.data.splash.source = 'generated';

                            SplashImageCtrl.generatedSrcs = {
                                '1-1': 'splash--1-1',
                                '6-5': 'splash--6-5',
                                '3-2': 'splash--3-2',
                                '16-9': 'splash--16-9'
                            };
                        });

                        it('should return the generated splash for that ratio', function() {
                            ['1-1', '6-5', '3-2', '16-9'].forEach(function(ratio) {
                                minireel.data.splash.ratio = ratio;

                                expect(SplashImageCtrl.splashSrc).toBe(SplashImageCtrl.generatedSrcs[ratio]);
                            });
                        });
                    });
                });

                describe('generatedSrcs', function() {
                    it('should be empty', function() {
                        expect(SplashImageCtrl.generatedSrcs).toEqual({
                            '1-1': null,
                            '6-5': null,
                            '3-2': null,
                            '16-9': null
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

                            it('should generate a collage with allRatios set to ' + !bool, function() {
                                expect(CollateralService.generateCollage).toHaveBeenCalledWith({
                                    minireel: minireel,
                                    name: 'splash',
                                    allRatios: !bool,
                                    cache: false
                                });
                            });

                            describe('with success', function() {
                                var result;

                                beforeEach(function() {
                                    result = {
                                        '1-1': '/collateral/foo--1-1',
                                        '6-5': '/collateral/foo--6-5',
                                        '3-2': '/collateral/foo--3-2',
                                        '16-9': '/collateral/foo--16-9'
                                    };

                                    $scope.$apply(function() {
                                        generateCollageDeferred.resolve(result);
                                    });
                                });

                                it('should copy the results data to the generatedSrcs', function() {
                                    expect(SplashImageCtrl.generatedSrcs).toEqual(result);
                                    expect(SplashImageCtrl.generatedSrcs).not.toBe(result);
                                });

                                it('should set isGenerating to false', function() {
                                    expect(SplashImageCtrl.isGenerating).toBe(false);
                                });

                                it('should resolve to the src', function() {
                                    expect(success).toHaveBeenCalledWith(result);
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
                });

                describe('uploadSplash(minireel)', function() {
                    var setDeferred,
                        success,
                        minireel;

                    beforeEach(function() {
                        minireel = {};

                        success = jasmine.createSpy('uploadSplash() success');
                        setDeferred = $q.defer();

                        spyOn(CollateralService, 'set')
                            .and.returnValue(setDeferred.promise);

                        SplashImageCtrl.splash = {};

                        $scope.$apply(function() {
                            SplashImageCtrl.uploadSplash(minireel).then(success);
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

                describe('save()', function() {
                    var originalData,
                        success;

                    beforeEach(function() {
                        success = jasmine.createSpy('save() success');

                        spyOn(c6State, 'goTo');

                        SplashImageCtrl.splash = {};

                        originalData = EditorCtrl.model.data;
                    });

                    describe('if the source is specified', function() {
                        var proxy, wrapper;

                        beforeEach(function() {
                            wrapper = {
                                close: jasmine.createSpy('wrapper.close()')
                            };

                            FileService.open.and.returnValue(wrapper);
                            spyOn(SplashImageCtrl, 'uploadSplash').and.returnValue($q.when(proxy));

                            $scope.$apply(function() {
                                minireel.data.splash.source = 'specified';
                            });

                            $scope.$apply(function() {
                                SplashImageCtrl.save().then(success);
                            });

                             proxy= {};
                        });

                        it('should set the MiniReel\'s splash to its splashSrc', function() {
                            expect(minireel.data.collateral.splash).toBe(SplashImageCtrl.splashSrc);
                        });

                        it('should register a beforeSync function that uploads the splash image', function() {
                            var fn = EditorService.beforeSync.calls.mostRecent().args[1];

                            expect(EditorService.beforeSync).toHaveBeenCalledWith('splash', jasmine.any(Function));

                            $scope.$apply(function() {
                                fn(proxy);
                            });

                            expect(SplashImageCtrl.uploadSplash).toHaveBeenCalledWith(proxy);
                            expect(FileService.open).toHaveBeenCalledWith(SplashImageCtrl.splash);
                            expect(wrapper.close).toHaveBeenCalled();
                        });

                        describe('if there is no splash', function() {
                            beforeEach(function() {
                                success.calls.reset();

                                minireel.data.collateral.splash = 'splash.jpg';
                                SplashImageCtrl.splash = null;

                                $scope.$apply(function() {
                                    SplashImageCtrl.save().then(success);
                                });
                            });

                            it('should not set the MiniReel\'s splash to its splashSrc', function() {
                                expect(minireel.data.collateral.splash).not.toBe(SplashImageCtrl.splashSrc);
                            });
                        });

                    });

                    describe('if the source is generated', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                minireel.data.splash.source = 'generated';
                                SplashImageCtrl.generatedSrcs[minireel.data.splash.ratio] = 'generated.jpg';
                            });

                            $scope.$apply(function() {
                                SplashImageCtrl.save().then(success);
                            });
                        });

                        it('should set the MiniReel\'s splash to its splashSrc', function() {
                            expect(minireel.data.collateral.splash).toBe(SplashImageCtrl.splashSrc);
                        });

                        it('should register a noop beforeSync function with the editor service', function() {
                            expect(EditorService.beforeSync).toHaveBeenCalledWith('splash', angular.noop);
                        });
                    });

                    ['specified', 'generated'].forEach(function(source) {
                        describe('if the source is ' + source, function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    minireel.data.splash.source = source;
                                });

                                $scope.$apply(function() {
                                    SplashImageCtrl.save().then(success);
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
                                expect(c6State.goTo).toHaveBeenCalledWith('MR:Editor');
                            });

                            it('should bust the caches', function() {
                                expect(EditorCtrl.bustCache).toHaveBeenCalled();
                            });

                            it('should resolve the promsise', function() {
                                expect(success).toHaveBeenCalledWith(EditorCtrl.model);
                            });
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
            });
        });
    });
}());
