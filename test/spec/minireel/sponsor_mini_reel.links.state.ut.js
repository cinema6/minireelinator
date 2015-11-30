define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorMiniReel.Links state', function() {
        var $rootScope,
            c6State,
            SettingsService,
            EditorService,
            sponsorMiniReel,
            sponsorMiniReelLinks;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                SettingsService = $injector.get('SettingsService');
                EditorService = $injector.get('EditorService');
            });

            sponsorMiniReel = c6State.get('MR:SponsorMiniReel');
            sponsorMiniReelLinks = c6State.get('MR:SponsorMiniReel.Links');
        });

        it('should exist', function() {
            expect(sponsorMiniReelLinks).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var model;

            beforeEach(function() {
                sponsorMiniReel.cModel = {
                    data: {
                        deck: [],
                        splash: {
                            ratio: '1-1',
                            theme: 'img-only',
                            source: 'specified'
                        }
                    }
                };

                SettingsService.register('MR::user', {
                    minireelDefaults: {
                        splash: {
                            ratio: '1-1',
                            theme: 'img-only',
                            source: 'specified'
                        }
                    }
                }, {
                    localSync: false
                });
                SettingsService.register('MR::org', {
                    minireelDefaults: {
                        mode: 'lightbox-ads',
                        autoplay: true
                    }
                }, {
                    localSync: false
                });

                $rootScope.$apply(function() {
                    EditorService.open(sponsorMiniReel.cModel);
                });
                EditorService.state.minireel.data.links = {
                    'Action': 'action.html',
                    'Website': 'website.html',
                    'My Custom Thang': 'blegh.html',
                    'Instagram': 'intergrem.html',
                    'Facebook': 'fb.html',
                    'Pinterest': '/share/pinterest.htm'
                };

                model = sponsorMiniReelLinks.model();
            });

            it('should be the minireel\'s links', function() {
                expect(model).toBe(EditorService.state.minireel.data.links);
            });

            describe('if there are no links', function() {
                beforeEach(function() {
                    delete EditorService.state.minireel.data.links;

                    model = sponsorMiniReelLinks.model();
                });

                it('should be a created links object', function() {
                    expect(model).toEqual({});
                    expect(model).toBe(EditorService.state.minireel.data.links);
                });
            });
        });
    });
});
