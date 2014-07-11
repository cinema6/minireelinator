(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('EmbedCodeController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                c6State,
                MiniReelState,
                EmbedCodeCtrl;

            var ensureFulfillmentDeferred,
                $attrs;

            beforeEach(function() {
                $attrs = {};

                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');

                    MiniReelState = c6State.get('MiniReel');
                    MiniReelState.cModel = {
                        data: {
                            c6EmbedSrc: '//lib.cinema6.com/c6embed/v0.7.0-0-g495dfa0/c6embed.min.js',
                            modes: [
                                {
                                    value: 'lightbox',
                                    modes: [
                                        {
                                            value: 'lightbox'
                                        },
                                        {
                                            value: 'lightbox-ads'
                                        }
                                    ]
                                },
                                {
                                    value: 'inline',
                                    modes: [
                                        {
                                            value: 'full'
                                        },
                                        {
                                            value: 'light'
                                        }
                                    ]
                                }
                            ]
                        }
                    };

                    ensureFulfillmentDeferred = $q.defer();

                    $scope = $rootScope.$new();
                    $scope.minireel = {
                        id: 'e-0277a8c7564f87',
                        data: {
                            branding: 'elitedaily',
                            mode: 'lightbox',
                            splash: {
                                theme: 'img-text-overlay',
                                ratio: '6-4'
                            },
                            collateral: {
                                splash: '/collateral/foo.jpg'
                            },
                            title: 'This is the Title!'
                        }
                    };
                    $scope.splashSrc = '/collateral/foo.jpg?cb=0';
                    EmbedCodeCtrl = $controller('EmbedCodeController', { $scope: $scope, $attrs: $attrs });
                });
            });

            it('should exist', function() {
                expect(EmbedCodeCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('readOnly', function() {
                    describe('if the readonly attr is undefined', function() {
                        beforeEach(function() {
                            delete $attrs.readonly;

                            EmbedCodeCtrl = $controller('EmbedCodeController', { $scope: $scope, $attrs: $attrs });
                        });

                        it('should be false', function() {
                            expect(EmbedCodeCtrl.readOnly).toBe(false);
                        });
                    });

                    describe('if the readonly attr is defined', function() {
                        beforeEach(function() {
                            $attrs.readonly = '';

                            EmbedCodeCtrl = $controller('EmbedCodeController', { $scope: $scope, $attrs: $attrs });
                        });

                        it('should be true', function() {
                            expect(EmbedCodeCtrl.readOnly).toBe(true);
                        });
                    });
                });

                describe('mode', function() {
                    it('should be initialized as responsive', function() {
                        expect(EmbedCodeCtrl.mode).toBe('responsive');
                    });
                });

                describe('modes', function() {
                    it('should be the options for embedding', function() {
                        expect(EmbedCodeCtrl.modes).toEqual([
                            {
                                name: 'Responsive Auto-fit *',
                                value: 'responsive'
                            },
                            {
                                name: 'Custom Size',
                                value: 'custom'
                            }
                        ]);
                    });
                });

                describe('size', function() {
                    it('should be initialized to a custom size', function() {
                        expect(EmbedCodeCtrl.size).toEqual({
                            width: '650px',
                            height: '522px'
                        });
                    });
                });

                describe('code', function() {
                    ['lightbox', 'lightbox-ads'].forEach(function(mode) {
                        describe('if the minireel mode is ' + mode, function() {
                            beforeEach(function() {
                                $scope.minireel.data.mode = mode;
                            });

                            it('should not preload', function() {
                                expect(EmbedCodeCtrl.code).not.toContain(' data-preload');
                            });
                        });
                    });

                    ['full', 'light'].forEach(function(mode) {
                        describe('if the minireel mode is ' + mode, function() {
                            beforeEach(function() {
                                $scope.minireel.data.mode = mode;
                            });

                            it('should preload', function() {
                                expect(EmbedCodeCtrl.code).toContain(' data-preload');
                            });
                        });
                    });

                    describe('if the size is responsive', function() {
                        it('should be a responsive embed code', function() {
                            expect(EmbedCodeCtrl.code).toBe(
                                '<script src="' + MiniReelState.cModel.data.c6EmbedSrc + '" data-exp="e-0277a8c7564f87" data-:title="' + btoa('This is the Title!') + '" data-splash="img-text-overlay:6/4" data-:branding="' + btoa('elitedaily') + '"></script>'
                            );
                        });
                    });

                    describe('if there is no branding', function() {
                        beforeEach(function() {
                            delete $scope.minireel.data.branding;
                        });

                        it('should not include the branding', function() {
                            expect(EmbedCodeCtrl.code).not.toContain('data-:branding="' + btoa('undefined') + '"');
                        });
                    });

                    describe('if the size is explicit', function() {
                        beforeEach(function() {
                            EmbedCodeCtrl.mode = 'custom';
                        });

                        it('should be an explicit embed code', function() {
                            expect(EmbedCodeCtrl.code).toBe(
                                '<script src="' + MiniReelState.cModel.data.c6EmbedSrc + '" data-exp="e-0277a8c7564f87" data-:title="' + btoa('This is the Title!') + '" data-splash="img-text-overlay:6/4" data-width="650px" data-height="522px" data-:branding="' + btoa('elitedaily') + '"></script>'
                            );
                        });

                        it('should update if the dimensions are updated', function() {
                            EmbedCodeCtrl.size.height = '300px';
                            EmbedCodeCtrl.size.width = '100%';

                            expect(EmbedCodeCtrl.code).toBe(
                                '<script src="' + MiniReelState.cModel.data.c6EmbedSrc + '" data-exp="e-0277a8c7564f87" data-:title="' + btoa('This is the Title!') + '" data-splash="img-text-overlay:6/4" data-width="100%" data-height="300px" data-:branding="' + btoa('elitedaily') + '"></script>'
                            );
                        });
                    });
                });
            });
        });
    });
}());
