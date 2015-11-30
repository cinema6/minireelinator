(function() {
    'use strict';

    define(['minireel/services'], function(servicesModule) {
        describe('VideoService', function() {
            var VideoService;

            beforeEach(function() {
                module(servicesModule.name);

                inject(function($injector) {
                    VideoService = $injector.get('VideoService');
                });
            });

            it('should exist', function() {
                expect(VideoService).toEqual(jasmine.any(Object));
            });

            describe('@public', function() {
                describe('methods', function() {
                    describe('urlFromData(service, id)', function() {
                        function fromData() {
                            return VideoService.urlFromData.apply(VideoService, arguments);
                        }

                        it('should create a youtube url', function() {
                            expect(fromData('youtube', 'xKLRGJYna-8')).toBe('https://www.youtube.com/watch?v=xKLRGJYna-8');
                            expect(fromData('youtube', 'QhMufR7MiqA')).toBe('https://www.youtube.com/watch?v=QhMufR7MiqA');
                            expect(fromData('youtube', '0M1L15hpphQ')).toBe('https://www.youtube.com/watch?v=0M1L15hpphQ');
                        });

                        it('should create a vimeo url', function() {
                            expect(fromData('vimeo', '83486021')).toBe('http://vimeo.com/83486021');
                            expect(fromData('vimeo', '89501438')).toBe('http://vimeo.com/89501438');
                            expect(fromData('vimeo', '26404699')).toBe('http://vimeo.com/26404699');
                        });

                        it('should create a dailymotion url', function() {
                            expect(fromData('dailymotion', 'x17nw7w')).toBe('http://www.dailymotion.com/video/x17nw7w');
                            expect(fromData('dailymotion', 'x1d5q7o')).toBe('http://www.dailymotion.com/video/x1d5q7o');
                            expect(fromData('dailymotion', 'x3pih4')).toBe('http://www.dailymotion.com/video/x3pih4');
                        });

                        it('should create a vine url', function() {
                            expect(fromData('vine', '12345')).toBe('https://vine.co/v/12345');
                        });

                        it('should create a vine url', function() {
                            expect(fromData('vzaar', '12345')).toBe('http://vzaar.tv/12345');
                            expect(fromData('vzaar', '54321')).toBe('http://vzaar.tv/54321');
                            expect(fromData('vzaar', '1380051')).toBe('http://vzaar.tv/1380051');
                        });

                        it('should create a wistia url', function() {
                            expect(fromData('wistia', '12345', 'cinema6.wistia.com')).toBe('https://cinema6.wistia.com/medias/12345?preview=true');
                            expect(fromData('wistia', '12345', 'home.wistia.com')).toBe('https://home.wistia.com/medias/12345?preview=true');
                        });

                        it('should create a jwplayer url', function() {
                            expect(fromData('jwplayer', '12345')).toBe('https://content.jwplatform.com/previews/12345');
                            expect(fromData('jwplayer', 'iGznZrKK-n5DiyUyn')).toBe('https://content.jwplatform.com/previews/iGznZrKK-n5DiyUyn');
                        });

                        it('should create a vidyard url', function() {
                            expect(fromData('vidyard', 'GFOy4oZge52L_NOwT2mwkw')).toBe('http://embed.vidyard.com/share/GFOy4oZge52L_NOwT2mwkw');
                            expect(fromData('vidyard', 'abc-123')).toBe('http://embed.vidyard.com/share/abc-123');
                            expect(fromData('vidyard', 'abc_123')).toBe('http://embed.vidyard.com/share/abc_123');
                        });
                    });

                    describe('dataFromText(url)', function() {
                        function fromUrl() {
                            return VideoService.dataFromText.apply(VideoService, arguments);
                        }

                        it('should parse a youtube url', function() {
                            expect(fromUrl('https://www.youtube.com/watch?v=jFJUz1DO20Q&list=PLFD1E8B0910A73A12&index=11')).toEqual({
                                service: 'youtube',
                                id: 'jFJUz1DO20Q',
                                hostname: 'www.youtube.com'
                            });
                        });

                        it('should parse a youtu.be url', function() {
                            expect(fromUrl('https://www.youtube.com/watch?v=jFJUz1DO20Q&list=PLFD1E8B0910A73A12&index=11')).toEqual({
                                service: 'youtube',
                                id: 'jFJUz1DO20Q',
                                hostname: 'www.youtube.com'
                            });
                        });

                        it('should parse a youtube embed code', function() {
                            expect(fromUrl('<iframe width="560" height="315" src="https://www.youtube.com/embed/jFJUz1DO20Q?list=PLFD1E8B0910A73A12" frameborder="0" allowfullscreen></iframe>')).toEqual({
                                service: 'youtube',
                                id: 'jFJUz1DO20Q',
                                hostname: null
                            });
                        });

                        it('should parse a vimeo url', function() {
                            expect(fromUrl('http://vimeo.com/89495751')).toEqual({
                                service: 'vimeo',
                                id: '89495751',
                                hostname: 'vimeo.com'
                            });
                        });

                        it('should parse a vimeo embed code', function() {
                            expect(fromUrl('<iframe src="https://player.vimeo.com/video/89495751?color=ffffff" width="500" height="192" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe> <p><a href="https://vimeo.com/89495751">molt.</a> from <a href="https://vimeo.com/user13462546">▲Bipolar Spider▲</a> on <a href="https://vimeo.com">Vimeo</a>.</p>')).toEqual({
                                service: 'vimeo',
                                id: '89495751',
                                hostname: null
                            });
                        });

                        it('should parse a dailymotion url', function() {
                            expect(fromUrl('http://www.dailymotion.com/video/x120oui_vincent-and-the-doctor-vincent-van-gogh-visits-the-museum-doctor-who-museum-scene_shortfilms?search_algo=2')).toEqual({
                                service: 'dailymotion',
                                id: 'x120oui',
                                hostname: 'www.dailymotion.com'
                            });
                        });

                        it('should parse a dai.ly url', function() {
                            expect(fromUrl('http://dai.ly/x120oui')).toEqual({
                                service: 'dailymotion',
                                id: 'x120oui',
                                hostname: 'dai.ly'
                            });
                        });

                        it('should parse a dailymotion embed code', function() {
                            expect(fromUrl('<iframe frameborder="0" width="480" height="270" src="//www.dailymotion.com/embed/video/x120oui" allowfullscreen></iframe><br /><a href="http://www.dailymotion.com/video/x120oui_vincent-van-gogh-visits-the-museum-doctor-who-museum-scene-vincent-and-the-doctor_shortfilms" target="_blank">Vincent van Gogh visits the Museum (Doctor Who...</a> <i>by <a href="http://www.dailymotion.com/PuertoLibre" target="_blank">PuertoLibre</a></i>')).toEqual({
                                service: 'dailymotion',
                                id: 'x120oui',
                                hostname: null
                            });
                        });

                        it('should parse a vine url', function() {
                            expect(fromUrl('https://vine.co/v/12345')).toEqual({
                                service: 'vine',
                                id: '12345',
                                hostname: 'vine.co'
                            });
                        });

                        it('should parse a vzaar url', function() {
                            expect(fromUrl('http://vzaar.tv/1380051')).toEqual({
                                service: 'vzaar',
                                id: '1380051',
                                hostname: 'vzaar.tv'
                            });
                        });

                        it('should parse a wistia url', function() {
                            expect(fromUrl('https://cinema6.wistia.com/medias/12345')).toEqual({
                                service: 'wistia',
                                id: '12345',
                                hostname: 'cinema6.wistia.com'
                            });
                        });

                        it('should parse a jwplayer url', function() {
                            expect(fromUrl('https://content.jwplatform.com/previews/iGznZrKK-n5DiyUyn')).toEqual({
                                service: 'jwplayer',
                                id: 'iGznZrKK-n5DiyUyn',
                                hostname: 'content.jwplatform.com'
                            });
                        });

                        it('should parse jwplayer embed codes', function() {
                            var scriptEmbed = '<script type="application/javascript" src="//content.jwplatform.com/players/iGznZrKK-n5DiyUyn.js"></script>';
                            var iframeEmbed = '<iframe src="//content.jwplatform.com/players/iGznZrKK-n5DiyUyn.html" width="480" height="270" frameborder="0" scrolling="auto" allowfullscreen></iframe>';
                            var expected = {
                                service: 'jwplayer',
                                id: 'iGznZrKK-n5DiyUyn',
                                hostname: null
                            };
                            expect(fromUrl(scriptEmbed)).toEqual(expected);
                            expect(fromUrl(iframeEmbed)).toEqual(expected);
                        });

                        it('should parse wistia embed codes', function() {
                            var inlineEmbed = '<div class="wistia_responsive_padding" style="padding:56.25% 0 0 0;position:relative;"><div class="wistia_responsive_wrapper" style="height:100%;left:0;position:absolute;top:0;width:100%;"><iframe src="//fast.wistia.net/embed/iframe/9iqvphjp4u?videoFoam=true" allowtransparency="true" frameborder="0" scrolling="no" class="wistia_embed" name="wistia_embed" allowfullscreen mozallowfullscreen webkitallowfullscreen oallowfullscreen msallowfullscreen width="100%" height="100%"></iframe></div></div><script src="//fast.wistia.net/assets/external/E-v1.js" async></script>';
                            var expected = {
                                service: 'wistia',
                                id: '9iqvphjp4u',
                                hostname: null
                            };
                            expect(fromUrl(inlineEmbed)).toEqual(expected);
                        });

                        it('should parse vzaar embed codes', function() {
                            var embedCode = '<iframe allowFullScreen allowTransparency="true" class="vzaar-video-player" frameborder="0" height="252" id="vzvd-5700429" mozallowfullscreen name="vzvd-5700429" src="//view.vzaar.com/5700429/player" title="vzaar video player" type="text/html" webkitAllowFullScreen width="448"></iframe>';
                            var expected = {
                                service: 'vzaar',
                                id: '5700429',
                                hostname: null
                            };
                            expect(fromUrl(embedCode)).toEqual(expected);
                        });

                        it('should parse a vidyard url', function() {
                            expect(fromUrl('http://embed.vidyard.com/share/Eu6TAcwwJZaHDlfiJTsW-A')).toEqual({
                                service: 'vidyard',
                                id: 'Eu6TAcwwJZaHDlfiJTsW-A',
                                hostname: 'embed.vidyard.com'
                            });
                        });

                        it('should parse vidyard embed codes', function() {
                            var scriptEmbed = '<script type=\'text/javascript\' id=\'vidyard_embed_code_Eu6TAcwwJZaHDlfiJTs_W-A\' src=\'//play.vidyard.com/Eu6TAcwwJZaHDlfiJTs_W-A.js?v=3.1.1&type=inline\'></script>';
                            var iframeEmbed = '<iframe class=\'vidyard_iframe\' src=\'//play.vidyard.com/Eu6TAcwwJZaHDlfiJTs_W-A.html?v=3.1.1\' width=\'640\' height=\'360\' scrolling=\'no\' frameborder=\'0\' allowtransparency=\'true\' allowfullscreen></iframe>';
                            var expected = {
                                service: 'vidyard',
                                id: 'Eu6TAcwwJZaHDlfiJTs_W-A',
                                hostname: null
                            };
                            expect(fromUrl(scriptEmbed)).toEqual(expected);
                            expect(fromUrl(iframeEmbed)).toEqual(expected);
                        });

                        it('should return null if the url is not valid', function() {
                            expect(fromUrl('apple.com')).toBeNull();
                            expect(fromUrl('84fh439#')).toBeNull();
                            expect(fromUrl('http://www.youtube.com/')).toBeNull();
                            expect(fromUrl('http://www.vimeo.com/')).toBeNull();
                            expect(fromUrl('http://www.dailymotion.com/')).toBeNull();
                            expect(fromUrl('http://www.youtube.c')).toBeNull();
                            expect(fromUrl('http://www.vzaar.t/123')).toBeNull();
                            expect(fromUrl('http://www.jwplayer.com/123')).toBeNull();
                            expect(fromUrl('http://embed.vidyard.com/Eu6TAcwwJZaHDlfiJTsW-A'));
                        });
                    });

                    describe('embedIdFromVideoId(service, videoid)', function() {
                        var ids = ['8439htf4', '8394tr8u394r', '2984ru43', '4892ur43', 'r892ur4'];

                        ['vimeo', 'dailymotion', 'aol', 'wistia'].forEach(function(service, index) {
                            describe('for ' + service, function() {
                                var result;

                                beforeEach(function() {
                                    result = VideoService.embedIdFromVideoId(service, ids[index]);
                                });

                                it('should return the videoid', function() {
                                    expect(result).toBe(ids[index]);
                                });
                            });
                        });
                    });

                    describe('embedCodeFromData(service, id)', function() {
                        it('should create a Vine embed code', function() {
                            expect(VideoService.embedCodeFromData('vine', '12345')).toEqual(
                                '<iframe src="https://vine.co/v/12345/embed/simple" style="width:100%;height:100%" frameborder="0"></iframe><script src="https://platform.vine.co/static/scripts/embed.js"></script>'
                            );
                        });

                        it('should create Vzaar embed code', function() {
                            expect(VideoService.embedCodeFromData('vzaar', '12345')).toBe(
                                '<iframe allowFullScreen allowTransparency="true"' +
                                ' width="100%" height="100%"' +
                                ' class="vzaar-video-player" frameborder="0" id="vzvd-12345"' +
                                ' mozallowfullscreen name="vzvd-12345"' +
                                ' src="//view.vzaar.com/12345/player" title="vzaar video player"' +
                                ' type="text/html" webkitAllowFullScreen width="768"></iframe>'
                            );
                        });

                        it('should create Wistia embed code', function() {
                            expect(VideoService.embedCodeFromData('wistia', '12345')).toBe(
                                '<div class="wistia_responsive_padding"' +
                                ' style="padding:56.25% 0 0 0;position:relative;">' +
                                '<div class="wistia_responsive_wrapper"' +
                                ' style="height:100%;left:0;position:absolute;top:0;width:100%;">' +
                                '<iframe src="//fast.wistia.net/embed/iframe/12345?videoFoam=true" allowtransparency="true"' +
                                ' frameborder="0" scrolling="no" class="wistia_embed"' +
                                ' name="wistia_embed" allowfullscreen mozallowfullscreen' +
                                ' webkitallowfullscreen oallowfullscreen msallowfullscreen' +
                                ' width="100%" height="100%"></iframe></div></div>' +
                                '<script src="//fast.wistia.net/assets/external/E-v1.js" async></script>'
                            );
                        });

                        it('should create a JWPlayer embed code', function() {
                            expect(VideoService.embedCodeFromData('jwplayer', 'iGznZrKK-n5DiyUyn')).toBe(
                                '<iframe src="//content.jwplatform.com/players/iGznZrKK-n5DiyUyn.html" style="width:100%;height:100%" frameborder="0" scrolling="auto" allowfullscreen></iframe>'
                            );
                        });
                    });
                });
            });
        });
    });
}());
