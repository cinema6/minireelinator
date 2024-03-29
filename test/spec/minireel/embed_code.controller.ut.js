(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('EmbedCodeController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                SettingsService,
                c6State,
                MiniReelState,
                EmbedCodeCtrl;

            var ensureFulfillmentDeferred,
                $attrs,
                orgSettings;

            beforeEach(function() {
                $attrs = {};

                orgSettings = {
                    embedTypes: ['shortcode', 'script', 'iframe'],
                    embedDefaults: {
                        size: null
                    }
                };

                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    SettingsService = $injector.get('SettingsService');

                    MiniReelState = c6State.get('MiniReel');
                    MiniReelState.cModel = {
                        data: {
                            apiRoot: '//staging.cinema6.com/',
                            c6EmbedSrc: '//lib.cinema6.com/c6embed/v0.7.0-0-g495dfa0/c6embed.min.js',
                            soloPlayerUrl: '//portal.cinema6.com/api/public/players/',
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

                    SettingsService.register('MR::org', orgSettings, {
                        localSync: false
                    });
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

            afterAll(function() {
                $rootScope = null;
                $scope = null;
                $controller = null;
                $q = null;
                SettingsService = null;
                c6State = null;
                MiniReelState = null;
                EmbedCodeCtrl = null;
                ensureFulfillmentDeferred = null;
                $attrs = null;
                orgSettings = null;
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

                describe('formats', function() {
                    it('should be an array of the org\'s embedTypes', function() {
                        expect(EmbedCodeCtrl.formats).toEqual([
                            {
                                name: 'Wordpress Shortcode',
                                value: 'shortcode'
                            },
                            {
                                name: 'Script Tag',
                                value: 'script'
                            },
                            {
                                name: 'IFrame',
                                value: 'iframe'
                            }
                        ]);
                    });
                });

                describe('format', function() {
                    it('should be initialized as the first format in the list', function() {
                        expect(EmbedCodeCtrl.format).toBe(EmbedCodeCtrl.formats[0].value);
                    });
                });

                describe('mode', function() {
                    it('should be initialized as responsive', function() {
                        expect(EmbedCodeCtrl.mode).toBe('responsive');
                    });

                    describe('if the org has a default embed size', function() {
                        beforeEach(function() {
                            orgSettings.embedDefaults.size = {
                                width: '400px',
                                height: '522px'
                            };

                            $scope.$apply(function() {
                                EmbedCodeCtrl = $controller('EmbedCodeController', { $scope: $scope, $attrs: $attrs });
                            });
                        });

                        it('should be "custom"', function() {
                            expect(EmbedCodeCtrl.mode).toBe('custom');
                        });
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

                    describe('if the org has a default embed size', function() {
                        beforeEach(function() {
                            orgSettings.embedDefaults.size = {
                                width: '400px',
                                height: '522px'
                            };

                            $scope.$apply(function() {
                                EmbedCodeCtrl = $controller('EmbedCodeController', { $scope: $scope, $attrs: $attrs });
                            });
                        });

                        it('should be a copy of the org\'s size', function() {
                            expect(EmbedCodeCtrl.size).toEqual(orgSettings.embedDefaults.size);
                            expect(EmbedCodeCtrl.size).not.toBe(orgSettings.embedDefaults.size);
                        });
                    });
                });

                describe('code', function() {
                    describe('if the format is "iframe"', function() {
                        beforeEach(function() {
                            EmbedCodeCtrl.format = 'iframe';
                        });

                        it('should be an iframe', function() {
                            expect(EmbedCodeCtrl.code).toMatch(/<iframe .+?><\/iframe>/);
                        });

                        it('should have a frameborder of 0', function() {
                            expect(EmbedCodeCtrl.code).toMatch(/frameborder="0"/);
                        });

                        it('should have a src that points to the player service', function() {
                            expect(EmbedCodeCtrl.code).toMatch(/\/\/portal.cinema6.com\/api\/public\/players\/lightbox\?experience=e-0277a8c7564f87/);
                        });

                        describe('if the size is responsive', function() {
                            beforeEach(function() {
                                EmbedCodeCtrl.mode = 'responsive';
                            });

                            it('should have a width and height of 100%', function() {
                                expect(EmbedCodeCtrl.code).toMatch(/width="100%"/);
                                expect(EmbedCodeCtrl.code).toMatch(/height="100%"/);
                            });
                        });

                        describe('if the size is not responsive', function() {
                            beforeEach(function() {
                                EmbedCodeCtrl.mode = 'custom';
                                EmbedCodeCtrl.size = {
                                    height: '200px',
                                    width: '300px'
                                };
                            });

                            it('should have width and height set', function() {
                                expect(EmbedCodeCtrl.code).toMatch(/width="300px"/);
                                expect(EmbedCodeCtrl.code).toMatch(/height="200px"/);
                            });
                        });

                        describe('if there is a campaign', function() {
                            it('should add it as a query param', function() {
                                $scope.campaign = {
                                    id: 'c-123'
                                };

                                expect(EmbedCodeCtrl.code).toMatch(/&campaign=c-123/);
                            });
                        });

                        describe('if embed is for preview purposes only', function() {
                            it('should add preview=true param', function() {
                                EmbedCodeCtrl.preview = true;

                                expect(EmbedCodeCtrl.code).toMatch(/&preview=true/);
                            });
                        });
                    });

                    describe('if the format is "shortcode"', function() {
                        beforeEach(function() {
                            EmbedCodeCtrl.format = 'shortcode';
                        });

                        it('should be a wordpress shortcode', function() {
                            expect(EmbedCodeCtrl.code).toMatch(/\[minireel .+?\]/);
                        });

                        it('should include the experience id', function() {
                            expect(EmbedCodeCtrl.code).toContain(' exp="' + $scope.minireel.id + '"');
                        });

                        it('should include the splash settings', function() {
                            expect(EmbedCodeCtrl.code).toContain(' splash="img-text-overlay:6/4"');
                        });

                        ['lightbox', 'lightbox-ads'].forEach(function(mode) {
                            describe('if the minireel mode is ' + mode, function() {
                                beforeEach(function() {
                                    $scope.minireel.data.mode = mode;
                                });

                                it('should not preload', function() {
                                    expect(EmbedCodeCtrl.code).not.toContain(' preload="preload"');
                                });
                            });
                        });

                        ['full', 'light'].forEach(function(mode) {
                            describe('if the minireel mode is ' + mode, function() {
                                beforeEach(function() {
                                    $scope.minireel.data.mode = mode;
                                });

                                it('should preload', function() {
                                    expect(EmbedCodeCtrl.code).toContain(' preload="preload"');
                                });
                            });
                        });

                        describe('if the size is responsive', function() {
                            beforeEach(function() {
                                EmbedCodeCtrl.mode = 'responsive';
                            });

                            it('should not include an explicit width and height', function() {
                                expect(EmbedCodeCtrl.code).not.toMatch(/ width=".+?" height=".+?"/);
                            });
                        });

                        describe('if the size is explicit', function() {
                            beforeEach(function() {
                                EmbedCodeCtrl.mode = 'custom';
                            });

                            it('should include a width and height', function() {
                                expect(EmbedCodeCtrl.code).toMatch(/ width=".+?" height=".+?"/);
                            });

                            it('should update if the dimensions are updated', function() {
                                EmbedCodeCtrl.size.height = '300px';
                                EmbedCodeCtrl.size.width = '100%';

                                expect(EmbedCodeCtrl.code).toMatch(/ width="100%" height="300px"/);
                            });
                        });

                        describe('if there is a campaign', function() {
                            it('should include a campaign parameter', function() {
                                $scope.campaign = {
                                    id: 'c-123'
                                };

                                expect(EmbedCodeCtrl.code).toMatch(/ campaign="c-123"/);
                            });
                        });

                        describe('if embed is for preview purposes only', function() {
                            it('should include a preview="true" param', function() {
                                EmbedCodeCtrl.preview = true;

                                expect(EmbedCodeCtrl.code).toMatch(/ preview="true"/);
                            });
                        });
                    });

                    describe('if the format is "script"', function() {
                        beforeEach(function() {
                            EmbedCodeCtrl.format = 'script';
                        });

                        it('should be a script tag', function() {
                            expect(EmbedCodeCtrl.code).toMatch(/<script .+?><\/script>/);
                        });

                        it('should include the experience id', function() {
                            expect(EmbedCodeCtrl.code).toContain(' data-experience="' + $scope.minireel.id + '"');
                        });

                        it('should include the splash settings', function() {
                            expect(EmbedCodeCtrl.code).toContain(' data-splash="img-text-overlay/6:4"');
                        });

                        it('should include the player type', function() {
                            expect(EmbedCodeCtrl.code).toContain(' data-type="' + $scope.minireel.data.mode + '"');
                        });

                        it('should include the apiRoot', function() {
                            expect(EmbedCodeCtrl.code).toContain(' data-api-root="' + MiniReelState.cModel.data.apiRoot + '"');
                        });

                        it('should include the title', function() {
                            expect(EmbedCodeCtrl.code).toContain(' data-title="' + $scope.minireel.data.title + '"');
                        });

                        it('should include the splash image', function() {
                            expect(EmbedCodeCtrl.code).toContain(' data-image="' + $scope.minireel.data.collateral.splash + '"');
                        });

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
                            beforeEach(function() {
                                EmbedCodeCtrl.mode = 'responsive';
                            });

                            it('should not include an explicit width and height', function() {
                                expect(EmbedCodeCtrl.code).not.toMatch(/ data-width=".+?" data-height=".+?"/);
                            });
                        });

                        describe('if the size is explicit', function() {
                            beforeEach(function() {
                                EmbedCodeCtrl.mode = 'custom';
                            });

                            it('should include a width and height', function() {
                                expect(EmbedCodeCtrl.code).toMatch(/ data-width=".+?" data-height=".+?"/);
                            });

                            it('should update if the dimensions are updated', function() {
                                EmbedCodeCtrl.size.height = '300px';
                                EmbedCodeCtrl.size.width = '100%';

                                expect(EmbedCodeCtrl.code).toMatch(/ data-width="100%" data-height="300px"/);
                            });
                        });

                        describe('if there is a campaign', function() {
                            it('should include a campaign parameter', function() {
                                $scope.campaign = {
                                    id: 'c-123'
                                };

                                expect(EmbedCodeCtrl.code).toMatch(/ data-campaign="c-123"/);
                            });
                        });

                        describe('if embed is for preview purposes only', function() {
                            it('should include a preview=true param', function() {
                                EmbedCodeCtrl.preview = true;

                                expect(EmbedCodeCtrl.code).toMatch(/ data-preview/);
                            });
                        });
                    });
                });
            });
        });
    });
}());
