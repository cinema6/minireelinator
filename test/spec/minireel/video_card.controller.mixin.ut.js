define(['minireel/mixins/VideoCardController','minireel/services'], function(VideoCardController, servicesModule) {
    'use strict';

    describe('VideoCardController mixin', function() {
        var VideoCardCtrl, VideoService;

        var model;

        beforeEach(function() {
            module(servicesModule.name);

            inject(function($injector) {
                VideoCardCtrl = $injector.instantiate(VideoCardController);
                model = VideoCardCtrl.model = {
                    data: {
                        service: null,
                        videoid: null
                    }
                };
            });
        });

        afterAll(function() {
            VideoCardCtrl = null;
            VideoService = null;
            model = null;
        });

        it('should exist', function() {
            expect(VideoCardCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('videoUrl', function() {
                describe('getting', function() {
                    it('should use the service and videoid to formulate a url for the video', function() {
                        model.data.service = 'youtube';
                        model.data.videoid = 'gy1B3agGNxw';
                        expect(VideoCardCtrl.videoUrl).toBe('https://www.youtube.com/watch?v=gy1B3agGNxw');

                        model.data.service = 'vimeo';
                        model.data.videoid = '89203931';
                        expect(VideoCardCtrl.videoUrl).toBe('http://vimeo.com/89203931');

                        model.data.service = 'dailymotion';
                        model.data.videoid = 'x17nw7w';
                        expect(VideoCardCtrl.videoUrl).toBe('http://www.dailymotion.com/video/x17nw7w');

                        model.data.service = 'wistia';
                        model.data.videoid = '12345';
                        model.data.hostname = 'cinema6.wistia.com';
                        expect(VideoCardCtrl.videoUrl).toBe('https://cinema6.wistia.com/medias/12345?preview=true');

                        model.data.service = 'brightcove';
                        model.data.videoid = '4655415742001';
                        model.data.playerid = '71cf5be9-7515-44d8-bb99-29ddc6224ff8';
                        model.data.embedid = 'default';
                        model.data.accountid = '4652941506001';
                        expect(VideoCardCtrl.videoUrl).toBe('https://players.brightcove.net/4652941506001/71cf5be9-7515-44d8-bb99-29ddc6224ff8_default/index.html?videoId=4655415742001');
                    });
                });

                describe('setting', function() {
                    it('should parse the service, videoid, and any other required data', function() {
                        VideoCardCtrl.videoUrl = 'https://www.youtube.com/watch?v=jFJUz1DO20Q&list=PLFD1E8B0910A73A12&index=11';
                        expect(model.data.service).toBe('youtube');
                        expect(model.data.videoid).toBe('jFJUz1DO20Q');

                        VideoCardCtrl.videoUrl = 'http://vimeo.com/89495751';
                        expect(model.data.service).toBe('vimeo');
                        expect(model.data.videoid).toBe('89495751');

                        VideoCardCtrl.videoUrl = 'http://www.dailymotion.com/video/x120oui_vincent-and-the-doctor-vincent-van-gogh-visits-the-museum-doctor-who-museum-scene_shortfilms?search_algo=2';
                        expect(model.data.service).toBe('dailymotion');
                        expect(model.data.videoid).toBe('x120oui');

                        VideoCardCtrl.videoUrl = 'fj8439nfc34';
                        expect(VideoCardCtrl.videoUrl).toBe('fj8439nfc34');
                        expect(model.data.service).toBeNull();
                        expect(model.data.videoid).toBeNull();

                        VideoCardCtrl.videoUrl = 'https://cinema6.wistia.com/medias/12345?preview=true';
                        expect(model.data.service).toBe('wistia');
                        expect(model.data.videoid).toBe('12345');
                        expect(model.data.hostname).toBe('cinema6.wistia.com');

                        VideoCardCtrl.videoUrl = 'https://players.brightcove.net/4652941506001/71cf5be9-7515-44d8-bb99-29ddc6224ff8_default/index.html?videoId=4655415742001';
                        expect(model.data.service).toBe('brightcove');
                        expect(model.data.videoid).toBe('4655415742001');
                        expect(model.data.playerid).toBe('71cf5be9-7515-44d8-bb99-29ddc6224ff8');
                        expect(model.data.embedid).toBe('default');
                        expect(model.data.accountid).toBe('4652941506001');
                    });

                    it('should not freak out when getting a mangled url', function() {
                        expect(function() {
                            VideoCardCtrl.videoUrl = 'apple.com';
                        }).not.toThrow();
                        expect(VideoCardCtrl.videoUrl).toBe('apple.com');
                        expect(model.data.service).toBeNull();

                        expect(function() {
                            VideoCardCtrl.videoUrl = '84fh439#';
                        }).not.toThrow();
                        expect(VideoCardCtrl.videoUrl).toBe('84fh439#');
                        expect(model.data.service).toBeNull();

                        expect(function() {
                            VideoCardCtrl.videoUrl = 'http://www.youtube.com/';
                        }).not.toThrow();
                        expect(model.data.service).toBeNull();
                        expect(VideoCardCtrl.videoUrl).toBe('http://www.youtube.com/');

                        expect(function() {
                            VideoCardCtrl.videoUrl = 'http://www.vimeo.com/';
                        }).not.toThrow();
                        expect(model.data.service).toBeNull();
                        expect(VideoCardCtrl.videoUrl).toBe('http://www.vimeo.com/');

                        expect(function() {
                            VideoCardCtrl.videoUrl = 'http://www.dailymotion.com/';
                        }).not.toThrow();
                        expect(model.data.service).toBeNull();
                        expect(VideoCardCtrl.videoUrl).toBe('http://www.dailymotion.com/');

                        expect(function() {
                            VideoCardCtrl.videoUrl = 'http://www.youtube.c';
                        }).not.toThrow();
                        expect(model.data.service).toBeNull();

                        VideoCardCtrl.videoUrl = 'http://www.dailymotion.com/v';
                        expect(VideoCardCtrl.videoUrl).toBe('http://www.dailymotion.com/v');

                        VideoCardCtrl.videoUrl = 'https://players.brightcove.net/';
                        expect(VideoCardCtrl.videoUrl).toBe('https://players.brightcove.net/');
                    });
                });
            });
        });
    });
});
