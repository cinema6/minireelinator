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
                    describe('urlFromData(service, id, data)', function() {
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
                            expect(fromData('wistia', '12345', { hostname: 'cinema6.wistia.com' })).toBe('https://cinema6.wistia.com/medias/12345?preview=true');
                            expect(fromData('wistia', '12345', { hostname: 'home.wistia.com' })).toBe('https://home.wistia.com/medias/12345?preview=true');
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

                        it('should create an instagram url', function() {
                            expect(fromData('instagram', '-xCZTNtOdo')).toBe('https://instagram.com/p/-xCZTNtOdo');
                            expect(fromData('instagram', '12345')).toBe('https://instagram.com/p/12345');
                        });

                        it('should create a brightcove url', function() {
                            expect(fromData('brightcove', '4655415742001', {
                                accountid: '4652941506001',
                                playerid: '71cf5be9-7515-44d8-bb99-29ddc6224ff8',
                                embedid: 'default'
                            })).toBe('https://players.brightcove.net/4652941506001/71cf5be9-7515-44d8-bb99-29ddc6224ff8_default/index.html?videoId=4655415742001');
                        });

                        it('should create a kaltura url', function() {
                            expect(fromData('kaltura', '1_dsup2iqd', {
                                playerid: '32784031',
                                partnerid: '2054981'
                            })).toBe('https://www.kaltura.com/index.php/extwidget/preview/partner_id/2054981/uiconf_id/32784031/entry_id/1_dsup2iqd/embed/iframe');
                        });

                        it('should create a facebook url', function() {
                            expect(fromData('facebook', 'https://www.facebook.com/Google/videos/10154011581287838/')).toBe('https://www.facebook.com/Google/videos/10154011581287838/');
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
                                data: { }
                            });
                        });

                        it('should parse a youtu.be url', function() {
                            expect(fromUrl('https://www.youtube.com/watch?v=jFJUz1DO20Q&list=PLFD1E8B0910A73A12&index=11')).toEqual({
                                service: 'youtube',
                                id: 'jFJUz1DO20Q',
                                data: { }
                            });
                        });

                        it('should parse a youtube embed code', function() {
                            expect(fromUrl('<iframe width="560" height="315" src="https://www.youtube.com/embed/jFJUz1DO20Q?list=PLFD1E8B0910A73A12" frameborder="0" allowfullscreen></iframe>')).toEqual({
                                service: 'youtube',
                                id: 'jFJUz1DO20Q',
                                data: { }
                            });
                        });

                        it('should parse a vimeo url', function() {
                            expect(fromUrl('http://vimeo.com/89495751')).toEqual({
                                service: 'vimeo',
                                id: '89495751',
                                data: { }
                            });
                        });

                        it('should parse a vimeo embed code', function() {
                            expect(fromUrl('<iframe src="https://player.vimeo.com/video/89495751?color=ffffff" width="500" height="192" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe> <p><a href="https://vimeo.com/89495751">molt.</a> from <a href="https://vimeo.com/user13462546">▲Bipolar Spider▲</a> on <a href="https://vimeo.com">Vimeo</a>.</p>')).toEqual({
                                service: 'vimeo',
                                id: '89495751',
                                data: { }
                            });
                        });

                        it('should parse a dailymotion url', function() {
                            expect(fromUrl('http://www.dailymotion.com/video/x120oui_vincent-and-the-doctor-vincent-van-gogh-visits-the-museum-doctor-who-museum-scene_shortfilms?search_algo=2')).toEqual({
                                service: 'dailymotion',
                                id: 'x120oui',
                                data: { }
                            });
                        });

                        it('should parse a dai.ly url', function() {
                            expect(fromUrl('http://dai.ly/x120oui')).toEqual({
                                service: 'dailymotion',
                                id: 'x120oui',
                                data: { }
                            });
                        });

                        it('should parse a dailymotion embed code', function() {
                            expect(fromUrl('<iframe frameborder="0" width="480" height="270" src="//www.dailymotion.com/embed/video/x120oui" allowfullscreen></iframe><br /><a href="http://www.dailymotion.com/video/x120oui_vincent-van-gogh-visits-the-museum-doctor-who-museum-scene-vincent-and-the-doctor_shortfilms" target="_blank">Vincent van Gogh visits the Museum (Doctor Who...</a> <i>by <a href="http://www.dailymotion.com/PuertoLibre" target="_blank">PuertoLibre</a></i>')).toEqual({
                                service: 'dailymotion',
                                id: 'x120oui',
                                data: { }
                            });
                        });

                        it('should parse a vine url', function() {
                            expect(fromUrl('https://vine.co/v/12345')).toEqual({
                                service: 'vine',
                                id: '12345',
                                data: { }
                            });
                        });

                        it('should parse a vzaar url', function() {
                            expect(fromUrl('http://vzaar.tv/1380051')).toEqual({
                                service: 'vzaar',
                                id: '1380051',
                                data: { }
                            });
                        });

                        it('should parse a wistia url', function() {
                            expect(fromUrl('https://cinema6.wistia.com/medias/12345')).toEqual({
                                service: 'wistia',
                                id: '12345',
                                data: {
                                    hostname: 'cinema6.wistia.com'
                                }
                            });
                        });

                        it('should parse a jwplayer url', function() {
                            expect(fromUrl('https://content.jwplatform.com/previews/iGznZrKK-n5DiyUyn')).toEqual({
                                service: 'jwplayer',
                                id: 'iGznZrKK-n5DiyUyn',
                                data: { }
                            });
                        });

                        it('should parse jwplayer embed codes', function() {
                            var scriptEmbed = '<script type="application/javascript" src="//content.jwplatform.com/players/iGznZrKK-n5DiyUyn.js"></script>';
                            var iframeEmbed = '<iframe src="//content.jwplatform.com/players/iGznZrKK-n5DiyUyn.html" width="480" height="270" frameborder="0" scrolling="auto" allowfullscreen></iframe>';
                            var expected = {
                                service: 'jwplayer',
                                id: 'iGznZrKK-n5DiyUyn',
                                data: { }
                            };
                            expect(fromUrl(scriptEmbed)).toEqual(expected);
                            expect(fromUrl(iframeEmbed)).toEqual(expected);
                        });

                        it('should parse wistia embed codes', function() {
                            var inlineEmbed = '<div class="wistia_responsive_padding" style="padding:56.25% 0 0 0;position:relative;"><div class="wistia_responsive_wrapper" style="height:100%;left:0;position:absolute;top:0;width:100%;"><iframe src="//fast.wistia.net/embed/iframe/9iqvphjp4u?videoFoam=true" allowtransparency="true" frameborder="0" scrolling="no" class="wistia_embed" name="wistia_embed" allowfullscreen mozallowfullscreen webkitallowfullscreen oallowfullscreen msallowfullscreen width="100%" height="100%"></iframe></div></div><script src="//fast.wistia.net/assets/external/E-v1.js" async></script>';
                            var expected = {
                                service: 'wistia',
                                id: '9iqvphjp4u',
                                data: { }
                            };
                            expect(fromUrl(inlineEmbed)).toEqual(expected);
                        });

                        it('should parse vzaar embed codes', function() {
                            var embedCode = '<iframe allowFullScreen allowTransparency="true" class="vzaar-video-player" frameborder="0" height="252" id="vzvd-5700429" mozallowfullscreen name="vzvd-5700429" src="//view.vzaar.com/5700429/player" title="vzaar video player" type="text/html" webkitAllowFullScreen width="448"></iframe>';
                            var expected = {
                                service: 'vzaar',
                                id: '5700429',
                                data: { }
                            };
                            expect(fromUrl(embedCode)).toEqual(expected);
                        });

                        it('should parse a vidyard url', function() {
                            expect(fromUrl('http://embed.vidyard.com/share/Eu6TAcwwJZaHDlfiJTsW-A')).toEqual({
                                service: 'vidyard',
                                id: 'Eu6TAcwwJZaHDlfiJTsW-A',
                                data: { }
                            });
                        });

                        it('should parse vidyard embed codes', function() {
                            var scriptEmbed = '<script type=\'text/javascript\' id=\'vidyard_embed_code_Eu6TAcwwJZaHDlfiJTs_W-A\' src=\'//play.vidyard.com/Eu6TAcwwJZaHDlfiJTs_W-A.js?v=3.1.1&type=inline\'></script>';
                            var iframeEmbed = '<iframe class=\'vidyard_iframe\' src=\'//play.vidyard.com/Eu6TAcwwJZaHDlfiJTs_W-A.html?v=3.1.1\' width=\'640\' height=\'360\' scrolling=\'no\' frameborder=\'0\' allowtransparency=\'true\' allowfullscreen></iframe>';
                            var expected = {
                                service: 'vidyard',
                                id: 'Eu6TAcwwJZaHDlfiJTs_W-A',
                                data: { }
                            };
                            expect(fromUrl(scriptEmbed)).toEqual(expected);
                            expect(fromUrl(iframeEmbed)).toEqual(expected);
                        });

                        it('should parse an Instagram url', function() {
                            expect(fromUrl('https://www.instagram.com/p/-xCZTNtOdo/')).toEqual({
                                service: 'instagram',
                                id: '-xCZTNtOdo',
                                data: { }
                            });
                        });

                        it('should parse instagram embed codes', function() {
                            var embedCode = '<blockquote class="instagram-media" data-instgrm-captioned data-instgrm-version="6" style=" background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:658px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"><div style="padding:8px;"> <div style=" background:#F8F8F8; line-height:0; margin-top:40px; padding:50.0% 0; text-align:center; width:100%;"> <div style=" background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAsCAMAAAApWqozAAAAGFBMVEUiIiI9PT0eHh4gIB4hIBkcHBwcHBwcHBydr+JQAAAACHRSTlMABA4YHyQsM5jtaMwAAADfSURBVDjL7ZVBEgMhCAQBAf//42xcNbpAqakcM0ftUmFAAIBE81IqBJdS3lS6zs3bIpB9WED3YYXFPmHRfT8sgyrCP1x8uEUxLMzNWElFOYCV6mHWWwMzdPEKHlhLw7NWJqkHc4uIZphavDzA2JPzUDsBZziNae2S6owH8xPmX8G7zzgKEOPUoYHvGz1TBCxMkd3kwNVbU0gKHkx+iZILf77IofhrY1nYFnB/lQPb79drWOyJVa/DAvg9B/rLB4cC+Nqgdz/TvBbBnr6GBReqn/nRmDgaQEej7WhonozjF+Y2I/fZou/qAAAAAElFTkSuQmCC); display:block; height:44px; margin:0 auto -44px; position:relative; top:-22px; width:44px;"></div></div> <p style=" margin:8px 0 0 0; padding:0 4px;"> <a href="https://www.instagram.com/p/-xCZTNtOdo/" style=" color:#000; font-family:Arial,sans-serif; font-size:14px; font-style:normal; font-weight:normal; line-height:17px; text-decoration:none; word-wrap:break-word;" target="_blank">Kipling, Labrador Retriever/Golden Retriever mix (1 y/o), CCI Northeast Regional Center, Medford, NY • Kipling demonstrates conducting a transaction, behaving around other animals, and refusing treats from strangers. @ccicanine</a></p> <p style=" color:#c9c8cd; font-family:Arial,sans-serif; font-size:14px; line-height:17px; margin-bottom:0; margin-top:8px; overflow:hidden; padding:8px 0 7px; text-align:center; text-overflow:ellipsis; white-space:nowrap;">A photo posted by The Dogist (@thedogist) on <time style=" font-family:Arial,sans-serif; font-size:14px; line-height:17px;" datetime="2015-12-01T22:37:10+00:00">Dec 1, 2015 at 2:37pm PST</time></p></div></blockquote><script async defer src="//platform.instagram.com/en_US/embeds.js"></script>';
                            var expected = {
                                service: 'instagram',
                                id: '-xCZTNtOdo',
                                data: { }
                            };
                            expect(fromUrl(embedCode)).toEqual(expected);
                        });

                        it('should parse a brightcove url', function() {
                            var url = 'http://players.brightcove.net/4652941506001/71cf5be9-7515-44d8-bb99-29ddc6224ff8_default/index.html?videoId=4655415742001';
                            var expected = {
                                service: 'brightcove',
                                id: '4655415742001',
                                data: {
                                    accountid: '4652941506001',
                                    playerid: '71cf5be9-7515-44d8-bb99-29ddc6224ff8',
                                    embedid: 'default'
                                }
                            };
                            expect(fromUrl(url)).toEqual(expected);
                        });

                        it('should parse a brightcove standard embed code', function() {
                            var embed = '<iframe src=\'//players.brightcove.net/4652941506001/default_default/index.html?videoId=4655415742001\' allowfullscreen webkitallowfullscreen mozallowfullscreen></iframe>';
                            var expected = {
                                service: 'brightcove',
                                id: '4655415742001',
                                data: {
                                    accountid: '4652941506001',
                                    playerid: 'default',
                                    embedid: 'default'
                                }
                            };
                            expect(fromUrl(embed)).toEqual(expected);
                        });

                        it('should parse a brightcove advanced embed code', function() {
                            var embed = '<video\n  data-video-id="4655415742001"\n  data-account="4652941506001"\n  data-player="default"\n  data-embed="default"\n  class="video-js" controls></video>\n<script src="//players.brightcove.net/4652941506001/default_default/index.min.js"></script>';
                            var expected = {
                                service: 'brightcove',
                                id: '4655415742001',
                                data: {
                                    accountid: '4652941506001',
                                    playerid: 'default',
                                    embedid: 'default'
                                }
                            };
                            expect(fromUrl(embed)).toEqual(expected);
                        });

                        it('should parse a kaltura url', function() {
                            var url = 'http://www.kaltura.com/index.php/extwidget/preview/partner_id/2054981/uiconf_id/32334692/entry_id/1_dsup2iqd/embed/auto?&flashvars[streamerType]=auto';
                            expect(fromUrl(url)).toEqual({
                                service: 'kaltura',
                                id: '1_dsup2iqd',
                                data: {
                                    partnerid: '2054981',
                                    playerid: '32334692'
                                }
                            });
                        });

                        it('should parse a kaltura auto embed code', function() {
                            var autoEmbed = '<script src="http://cdnapi.kaltura.com/p/2054981/sp/205498100/embedIframeJs/uiconf_id/32334692/partner_id/2054981?autoembed=true&entry_id=1_dsup2iqd&playerId=kaltura_player_1450890477&cache_st=1450890477&width=400&height=333&flashvars[streamerType]=auto"></script>';
                            expect(fromUrl(autoEmbed)).toEqual({
                                service: 'kaltura',
                                id: '1_dsup2iqd',
                                data: {
                                    partnerid: '2054981',
                                    playerid: '32334692'
                                }
                            });
                        });

                        it('should parse a kaltura dynamic embed code', function() {
                            var dynamicEmbed = '<script src="http://cdnapi.kaltura.com/p/2054981/sp/205498100/embedIframeJs/uiconf_id/32334692/partner_id/2054981"></script>\n' +
                                '<div id="kaltura_player_1450892308" style="width: 400px; height: 333px;"><a href="http://corp.kaltura.com/products/video-platform-features">Video Platform</a>\n' +
                                '<a href="http://corp.kaltura.com/Products/Features/Video-Management">Video Management</a> \n' +
                                '<a href="http://corp.kaltura.com/Video-Solutions">Video Solutions</a>\n' +
                                '<a href="http://corp.kaltura.com/Products/Features/Video-Player">Video Player</a></div>\n' +
                                '<script>\n' +
                                'kWidget.embed({\n' +
                                '  "targetId": "kaltura_player_1450892308",\n' +
                                '  "wid": "_2054981",\n' +
                                '  "uiconf_id": 32334692,\n' +
                                '  "flashvars": {\n' +
                                '    "streamerType": "auto"\n' +
                                '  },\n' +
                                '  "cache_st": 1450892308,\n' +
                                '  "entry_id": "1_dsup2iqd"\n' +
                                '});\n' +
                                '</script>';
                            expect(fromUrl(dynamicEmbed)).toEqual({
                                service: 'kaltura',
                                id: '1_dsup2iqd',
                                data: {
                                    partnerid: '2054981',
                                    playerid: '32334692'
                                }
                            });
                        });

                        it('should parse a kaltura thumbnail embed', function() {
                            var thumbnailEmbed = '<script src="http://cdnapi.kaltura.com/p/2054981/sp/205498100/embedIframeJs/uiconf_id/32334692/partner_id/2054981"></script>\n' +
                                '<div id="kaltura_player_1450892865" style="width: 400px; height: 333px;"><a href="http://corp.kaltura.com/products/video-platform-features">Video Platform</a>\n' +
                                '<a href="http://corp.kaltura.com/Products/Features/Video-Management">Video Management</a> \n' +
                                '<a href="http://corp.kaltura.com/Video-Solutions">Video Solutions</a>\n' +
                                '<a href="http://corp.kaltura.com/Products/Features/Video-Player">Video Player</a></div>\n' +
                                '<script>\n' +
                                'kWidget.thumbEmbed({\n' +
                                '  "targetId": "kaltura_player_1450892865",\n' +
                                '  "wid": "_2054981",\n' +
                                '  "uiconf_id": 32334692,\n' +
                                '  "flashvars": {\n' +
                                '    "streamerType": "auto"\n' +
                                '  },\n' +
                                '  "cache_st": 1450892865,\n' +
                                '  "entry_id": "1_dsup2iqd"\n' +
                                '});\n' +
                                '</script>';
                            expect(fromUrl(thumbnailEmbed)).toEqual({
                                service: 'kaltura',
                                id: '1_dsup2iqd',
                                data: {
                                    partnerid: '2054981',
                                    playerid: '32334692'
                                }
                            });
                        });

                        it('should parse a kaltura iframe embed', function() {
                            var iframeEmbed = '<iframe src="http://cdnapi.kaltura.com/p/2054981/sp/205498100/embedIframeJs/uiconf_id/32334692/partner_id/2054981?iframeembed=true&playerId=kaltura_player_1450893164&entry_id=1_dsup2iqd&flashvars[streamerType]=auto" width="400" height="333" allowfullscreen webkitallowfullscreen mozAllowFullScreen frameborder="0"><a href="http://corp.kaltura.com/products/video-platform-features">Video Platform</a>' +
                                '<a href="http://corp.kaltura.com/Products/Features/Video-Management">Video Management</a> \n' +
                                '<a href="http://corp.kaltura.com/Video-Solutions">Video Solutions</a>\n' +
                                '<a href="http://corp.kaltura.com/Products/Features/Video-Player">Video Player</a></iframe>';
                            expect(fromUrl(iframeEmbed)).toEqual({
                                service: 'kaltura',
                                id: '1_dsup2iqd',
                                data: {
                                    partnerid: '2054981',
                                    playerid: '32334692'
                                }
                            });
                        });

                        it('should parse a kaltura legacy flash embed', function() {
                            var legacyFlashEmbed = '<script src="http://cdnapi.kaltura.com/p/2054981/sp/205498100/embedIframeJs/uiconf_id/32334692/partner_id/2054981"></script>\n' +
                                '<object id="kaltura_player_1450893338" name="kaltura_player_1450893338" type="application/x-shockwave-flash" allowFullScreen="true" allowNetworking="all" allowScriptAccess="always" height="333" width="400" bgcolor="#000000" data="http://cdnapi.kaltura.com/index.php/kwidget/cache_st/1450893338/wid/_2054981/uiconf_id/32334692/entry_id/1_dsup2iqd">\n' +
                                '	<param name="allowFullScreen" value="true" />\n' +
                                '	<param name="allowNetworking" value="all" />\n' +
                                '	<param name="allowScriptAccess" value="always" />\n' +
                                '	<param name="bgcolor" value="#000000" />\n' +
                                '	<param name="flashVars" value="&streamerType=auto" />\n' +
                                '	<param name="movie" value="http://cdnapi.kaltura.com/index.php/kwidget/cache_st/1450893338/wid/_2054981/uiconf_id/32334692/entry_id/1_dsup2iqd" />\n' +
                                '	<a href="http://corp.kaltura.com/products/video-platform-features">Video Platform</a>\n' +
                                '<a href="http://corp.kaltura.com/Products/Features/Video-Management">Video Management</a> \n' +
                                '<a href="http://corp.kaltura.com/Video-Solutions">Video Solutions</a>\n' +
                                '<a href="http://corp.kaltura.com/Products/Features/Video-Player">Video Player</a>\n' +
                                '</object>';
                            expect(fromUrl(legacyFlashEmbed)).toEqual({
                                service: 'kaltura',
                                id: '1_dsup2iqd',
                                data: {
                                    partnerid: '2054981',
                                    playerid: '32334692'
                                }
                            });
                        });

                        it('should parse a facebook video url', function() {
                            expect(fromUrl('https://www.facebook.com/Google/videos/10154011581287838')).toEqual({
                                service: 'facebook',
                                id: 'https://www.facebook.com/Google/videos/10154011581287838',
                                data: { }
                            });
                        });

                        it('should parse a facebook embed code', function() {
                            var embed = '<div id="fb-root"></div><script>(function(d, s, id) {  var js, fjs = d.getElementsByTagName(s)[0];  ' +
                                'if (d.getElementById(id)) return;  js = d.createElement(s); js.id = id;  js.src = "//connect.faceboo' +
                                'k.net/en_US/sdk.js#xfbml=1&version=v2.3";  fjs.parentNode.insertBefore(js, fjs);}(document, \'script\'' +
                                ', \'facebook-jssdk\'));</script><div class="fb-video" data-allowfullscreen="1" data-href="/Google/vide' +
                                'os/vb.104958162837/10154011581287838/?type=3"><div class="fb-xfbml-parse-ignore"><blockquote cite="h' +
                                'ttps://www.facebook.com/Google/videos/10154011581287838/"><a href="https://www.facebook.com/Google/v' +
                                'ideos/10154011581287838/">Dublin Rising</a><p>The Easter Rising of 1916 has defined Irish history. O' +
                                'ne hundred years on, join Colin Farrell on the streets of Dublin: dublinrising.withgoogle.com</p>Pos' +
                                'ted by <a href="https://www.facebook.com/Google/">Google</a> on Thursday, March 17, 2016</blockquote' +
                                '></div></div>';
                            var embed2 = '<div class="fb-video" data-href="https://www.facebook.com/facebook/videos/10153231379946729/" data-w' +
                                'idth="500"><div class="fb-xfbml-parse-ignore"><blockquote cite="https://www.facebook.com/facebook/videos/10153231379946729/">' +
                                '<a href="https://www.facebook.com/facebook/videos/10153231379946729/">How to Share With Just Friends</a><p>How to share with '+
                                'just friends.</p>Posted by <a href="https://www.facebook.com/facebook/">Facebook</a> on Friday, December 5, 2014</blockquote></div></div>';
                            expect(fromUrl(embed)).toEqual({
                                service: 'facebook',
                                id: 'https://www.facebook.com/Google/videos/10154011581287838',
                                data: { }
                            });
                            expect(fromUrl(embed2)).toEqual({
                                service: 'facebook',
                                id: 'https://www.facebook.com/facebook/videos/10153231379946729',
                                data: { }
                            });
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
                            expect(fromUrl('http://embed.vidyard.com/Eu6TAcwwJZaHDlfiJTsW-A')).toBeNull();
                            expect(fromUrl('http://players.brightcove.net/INVALID/71cf5be9-7515-44d8-bb99-29ddc6224ff8_default/index.html?videoId=123')).toBeNull();
                            expect(fromUrl('http://players.brightcove.net/4652941506001/71cf5be9-7515-44d8-bb99-29ddc6224ff8_default/index.html?videoId=INVALID')).toBeNull();
                            expect(fromUrl('http://www.kaltura.com/index.php/extwidget/preview/partner_id/2054981/uiconf_id/entry_id/1_dsup2iqd/embed/auto?&flashvars[streamerType]=auto')).toBeNull();
                            expect(fromUrl('https://www.facebook.com/videos/10154011581287838/')).toBeNull();
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
