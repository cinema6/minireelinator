define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorMiniReel.Links state', function() {
        var c6State,
            SettingsService,
            EditorService,
            sponsorMiniReel,
            sponsorMiniReelLinks;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
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
                EditorService.open(sponsorMiniReel.cModel).data.links = {
                    'Action': 'action.html',
                    'Website': 'website.html',
                    'My Custom Thang': 'blegh.html',
                    'Instagram': 'intergrem.html',
                    'Facebook': 'fb.html',
                    'Pinterest': '/share/pinterest.htm'
                };

                model = sponsorMiniReelLinks.model();
            });

            it('should be an array of links', function() {
                expect(model).toEqual([
                    {
                        name: 'Action',
                        href: 'action.html'
                    },
                    {
                        name: 'Website',
                        href: 'website.html'
                    },
                    {
                        name: 'Facebook',
                        href: 'fb.html'
                    },
                    {
                        name: 'Twitter',
                        href: null
                    },
                    {
                        name: 'Pinterest',
                        href: '/share/pinterest.htm'
                    },
                    {
                        name: 'My Custom Thang',
                        href: 'blegh.html'
                    },
                    {
                        name: 'Instagram',
                        href: 'intergrem.html'
                    }
                ]);
            });

            describe('if there are no links', function() {
                beforeEach(function() {
                    delete EditorService.state.minireel.data.links;

                    model = sponsorMiniReelLinks.model();
                });

                it('should be the defaults', function() {
                    expect(model).toEqual(['Action', 'Website', 'Facebook', 'Twitter', 'Pinterest'].map(function(name) {
                        return {
                            name: name,
                            href: null
                        };
                    }));
                });
            });
        });
    });
});
