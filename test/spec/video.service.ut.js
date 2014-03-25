(function() {
    'use strict';

    define(['services'], function() {
        describe('VideoService', function() {
            var VideoService;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function($injector) {
                    VideoService = $injector.get('VideoService');
                });
            });

            it('should exist', function() {
                expect(VideoService).toEqual(jasmine.any(Object));
            });

            describe('@public', function() {
                describe('methods', function() {
                    describe('createVideoUrl(computed, ctrl, ctrlName)', function() {
                        var computed, ctrl, ctrlName;

                        beforeEach(function() {
                            computed = jasmine.createSpy('computed()');
                            ctrl = {
                                model: {
                                    data: {
                                        service: 'youtube',
                                        videoid: 'gy1B3agGNxw'
                                    }
                                }
                            };
                            ctrlName = 'MyCtrl';

                            VideoService.createVideoUrl(computed, ctrl, ctrlName);
                        });

                        it('should create a videoUrlBuffer property', function() {
                            expect(ctrl.videoUrlBuffer).toBe('');
                        });

                        it('should create a computed property', function() {
                            expect(computed).toHaveBeenCalledWith(ctrl, 'videoUrl', jasmine.any(Function), [
                                'MyCtrl.model.data.service',
                                'MyCtrl.model.data.videoid',
                                'MyCtrl.videoUrlBuffer'
                            ]);
                        });

                        describe('the computation', function() {
                            var compute, model;

                            beforeEach(function() {
                                model = ctrl.model;
                                compute = function() {
                                    return computed.calls.mostRecent().args[2].apply(ctrl, arguments);
                                };
                            });

                            describe('getting', function() {
                                it('should use the service and videoid to formulate a url for the video', function() {
                                    expect(compute()).toBe('https://www.youtube.com/watch?v=gy1B3agGNxw');

                                    model.data.service = 'vimeo';
                                    model.data.videoid = '89203931';
                                    expect(compute()).toBe('http://vimeo.com/89203931');

                                    model.data.service = 'dailymotion';
                                    model.data.videoid = 'x17nw7w';
                                    expect(compute()).toBe('http://www.dailymotion.com/video/x17nw7w');
                                });
                            });

                            describe('setting', function() {
                                it('should parse the service and videoid', function() {
                                    compute('https://www.youtube.com/watch?v=jFJUz1DO20Q&list=PLFD1E8B0910A73A12&index=11');
                                    expect(model.data.service).toBe('youtube');
                                    expect(model.data.videoid).toBe('jFJUz1DO20Q');

                                    compute('http://vimeo.com/89495751');
                                    expect(model.data.service).toBe('vimeo');
                                    expect(model.data.videoid).toBe('89495751');

                                    compute('http://www.dailymotion.com/video/x120oui_vincent-and-the-doctor-vincent-van-gogh-visits-the-museum-doctor-who-museum-scene_shortfilms?search_algo=2');
                                    expect(model.data.service).toBe('dailymotion');
                                    expect(model.data.videoid).toBe('x120oui');
                                });

                                it('should not freak out when getting a mangled url', function() {
                                    compute('apple.com');
                                    expect(compute()).toBe('apple.com');
                                    expect(model.data.service).toBeNull();

                                    compute('84fh439#');
                                    expect(compute()).toBe('84fh439#');
                                    expect(model.data.service).toBeNull();

                                    compute('http://www.youtube.com/');
                                    expect(model.data.service).toBeNull();
                                    expect(compute()).toBe('http://www.youtube.com/');

                                    compute('http://www.vimeo.com/');
                                    expect(model.data.service).toBeNull();
                                    expect(compute()).toBe('http://www.vimeo.com/');

                                    compute('http://www.dailymotion.com/');
                                    expect(model.data.service).toBeNull();
                                    expect(compute()).toBe('http://www.dailymotion.com/');

                                    compute('http://www.youtube.c');
                                    expect(model.data.service).toBeNull();
                                    expect(compute()).toBe('http://www.youtube.c');
                                });
                            });
                        });
                    });

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
                    });

                    describe('dataFromUrl(url)', function() {
                        function fromUrl() {
                            return VideoService.dataFromUrl.apply(VideoService, arguments);
                        }

                        it('should parse a youtube url', function() {
                            expect(fromUrl('https://www.youtube.com/watch?v=jFJUz1DO20Q&list=PLFD1E8B0910A73A12&index=11')).toEqual({
                                service: 'youtube',
                                id: 'jFJUz1DO20Q'
                            });
                        });

                        it('should parse a vimeo url', function() {
                            expect(fromUrl('http://vimeo.com/89495751')).toEqual({
                                service: 'vimeo',
                                id: '89495751'
                            });
                        });

                        it('should parse a dailymotion url', function() {
                            expect(fromUrl('http://www.dailymotion.com/video/x120oui_vincent-and-the-doctor-vincent-van-gogh-visits-the-museum-doctor-who-museum-scene_shortfilms?search_algo=2')).toEqual({
                                service: 'dailymotion',
                                id: 'x120oui'
                            });
                        });

                        it('should return null if the url is not valid', function() {
                            expect(fromUrl('apple.com')).toBeNull();
                            expect(fromUrl('84fh439#')).toBeNull();
                            expect(fromUrl('http://www.youtube.com/')).toBeNull();
                            expect(fromUrl('http://www.vimeo.com/')).toBeNull();
                            expect(fromUrl('http://www.dailymotion.com/')).toBeNull();
                            expect(fromUrl('http://www.youtube.c')).toBeNull();
                        });
                    });
                });
            });
        });
    });
}());
