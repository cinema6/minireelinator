define(['app', 'minireel/services'], function(appModule, servicesModule) {
    'use strict';

    describe('VideoSearchController', function() {
        var $rootScope,
            $controller,
            VideoSearchService,
            $q,
            $scope,
            MiniReelService,
            c6State,
            VideoSearchCtrl,
            EditorCtrl;

        var videoCard;

        beforeEach(function() {
            module('ng', function($provide) {
                $provide.decorator('$log', function($delegate) {
                    $delegate.context = function() {
                        return this;
                    };

                    return $delegate;
                });
            });

            module(servicesModule.name, function($provide) {
                $provide.decorator('MiniReelService', function($delegate) {
                    var createCard = $delegate.createCard;

                    $delegate.createCard = jasmine.createSpy('MiniReelService.createCard()')
                        .and.callFake(function() {
                            return (videoCard = createCard.apply($delegate, arguments));
                        });

                    return $delegate;
                });
            });

            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                MiniReelService = $injector.get('MiniReelService');
                VideoSearchService = $injector.get('VideoSearchService');
                c6State = $injector.get('c6State');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    $scope.EditorCtrl = EditorCtrl = $controller('EditorController', {
                        $scope: $scope
                    });
                    EditorCtrl.model = {
                        data: {
                            deck: [{}]
                        }
                    };
                    VideoSearchCtrl = $controller('VideoSearchController', { $scope: $scope });
                });
            });
        });

        it('should exist', function() {
            expect(VideoSearchCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('result', function() {
                it('should be null', function() {
                    expect(VideoSearchCtrl.result).toBeNull();
                });
            });

            describe('query', function() {
                it('should be an object', function() {
                    expect(VideoSearchCtrl.query).toEqual({
                        query: '',
                        sites: {
                            youtube: true,
                            vimeo: true,
                            dailymotion: true
                        },
                        hd: false
                    });
                });
            });

            describe('currentPreview', function() {
                it('should be null', function() {
                    expect(VideoSearchCtrl.currentPreview).toBeNull();
                });
            });

            describe('sites', function() {
                it('should be a map of site values to labels', function() {
                    expect(VideoSearchCtrl.sites).toEqual({
                        youtube: 'YouTube',
                        vimeo: 'Vimeo',
                        dailymotion: 'Dailymotion'
                    });
                });
            });

            describe('showQueryDropdown', function() {
                it('should be false', function() {
                    expect(VideoSearchCtrl.showQueryDropdown).toBe(false);
                });
            });
        });

        describe('methods', function() {
            describe('toggleQueryDropdown()', function() {
                it('should toggle the showQueryDropdown property', function() {
                    VideoSearchCtrl.toggleQueryDropdown();
                    expect(VideoSearchCtrl.showQueryDropdown).toBe(true);

                    VideoSearchCtrl.toggleQueryDropdown();
                    expect(VideoSearchCtrl.showQueryDropdown).toBe(false);
                });
            });

            describe('toggleProp(object, prop)', function() {
                describe('if no object is passed in', function() {
                    it('should toggle props on itself', function() {
                        VideoSearchCtrl.toggleProp('foo');
                        expect(VideoSearchCtrl.foo).toBe(true);

                        VideoSearchCtrl.toggleProp('foo');
                        expect(VideoSearchCtrl.foo).toBe(false);
                    });
                });

                describe('if an object is passed in', function() {
                    it('should toggle the prop on the object', function() {
                        VideoSearchCtrl.toggleProp(VideoSearchCtrl.query, 'hd');
                        expect(VideoSearchCtrl.query.hd).toBe(true);

                        VideoSearchCtrl.toggleProp(VideoSearchCtrl.query, 'hd');
                        expect(VideoSearchCtrl.query.hd).toBe(false);
                    });
                });
            });

            describe('search()', function() {
                var result,
                    success, failure;

                function VideoSearchResult(items) {
                    this.videos = items;
                }

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    VideoSearchResult.prototype = {
                        next: jasmine.createSpy('result.next()')
                            .and.returnValue($q.defer().promise),
                        prev: jasmine.createSpy('result.prev()')
                            .and.returnValue($q.defer().promise),
                        page: jasmine.createSpy('result.page()')
                            .and.returnValue($q.defer().promise)
                    };

                    result = new VideoSearchResult([
                        {
                            title: 'Blah'
                        },
                        {
                            title: 'hey'
                        },
                        {
                            title: 'foo'
                        }
                    ]);

                    VideoSearchCtrl.query.query = 'Find Me Something Awesome!';

                    spyOn(VideoSearchService, 'find').and.returnValue($q.when(result));

                    $scope.$apply(function() {
                        VideoSearchCtrl.search().then(success, failure);
                    });
                });

                it('should search for the video', function() {
                    expect(VideoSearchService.find).toHaveBeenCalledWith({
                        query: VideoSearchCtrl.query.query,
                        sites: 'youtube,vimeo,dailymotion',
                        hd: undefined
                    });
                });

                describe('if hd is true on the query', function() {
                    beforeEach(function() {
                        VideoSearchService.find.calls.reset();
                        VideoSearchCtrl.query.hd = true;

                        $scope.$apply(function() {
                            VideoSearchCtrl.search().then(success, failure);
                        });
                    });

                    it('should search with hd: true', function() {
                        expect(VideoSearchService.find).toHaveBeenCalledWith({
                            query: VideoSearchCtrl.query.query,
                            sites: 'youtube,vimeo,dailymotion',
                            hd: true
                        });
                    });
                });

                describe('if certain sites are not included', function() {
                    beforeEach(function() {
                        VideoSearchService.find.calls.reset();
                        VideoSearchCtrl.query.sites = {
                            youtube: false,
                            dailymotion: true,
                            vimeo: true
                        };

                        $scope.$apply(function() {
                            VideoSearchCtrl.search().then(success, failure);
                        });
                    });

                    it('should not be included in the query', function() {
                        expect(VideoSearchService.find).toHaveBeenCalledWith({
                            query: VideoSearchCtrl.query.query,
                            sites: 'vimeo,dailymotion',
                            hd: undefined
                        });
                    });
                });

                it('should resolve to the result', function() {
                    expect(success).toHaveBeenCalledWith(result);
                });

                it('should assign the result to its "result" property', function() {
                    expect(VideoSearchCtrl.result).toBe(result);
                });
            });

            describe('preview(video)', function() {
                var video,
                    result;

                beforeEach(function() {
                    video = {};

                    $scope.$apply(function() {
                        result = VideoSearchCtrl.preview(video);
                    });
                });

                it('should set the currentPreview property', function() {
                    expect(VideoSearchCtrl.currentPreview).toBe(video);
                });

                it('should return the video', function() {
                    expect(result).toBe(video);
                });
            });

            describe('addVideo(video)', function() {
                var video;

                beforeEach(function() {
                    spyOn(c6State, '$emitThroughStates');

                    $scope.$apply(function() {
                        VideoSearchCtrl.addVideo((video = {
                            site: 'youtube',
                            videoid: 'abc',
                            title: 'This Video Rules!',
                            description: 'This video is the best video I\'ve ever seen'
                        }));
                    });
                });

                it('should create a new video card', function() {
                    expect(MiniReelService.createCard).toHaveBeenCalledWith('video');
                });

                it('should set properties on the card to match the video', function() {
                    expect(videoCard.data.service).toBe('youtube');
                    expect(videoCard.data.videoid).toBe('abc');
                    expect(videoCard.title).toBe(video.title);
                    expect(videoCard.note).toBe(video.description);
                });

                it('should $emit the "VideoSearchCtrl:addVideo" event through the states', function() {
                    expect(c6State.$emitThroughStates).toHaveBeenCalledWith('VideoSearchCtrl:addVideo', videoCard);
                });
            });

            describe('close()', function() {
                beforeEach(function() {
                    VideoSearchCtrl.currentPreview = {};
                    spyOn(EditorCtrl, 'toggleSearch').and.callThrough();

                    VideoSearchCtrl.close();
                });

                it('should nullify the currentPreview', function() {
                    expect(VideoSearchCtrl.currentPreview).toBeNull();
                });

                it('should toggle the search panel', function() {
                    expect(EditorCtrl.toggleSearch).toHaveBeenCalled();
                });
            });

            describe('idFor(video)', function() {
                var video1, video2, video3;

                beforeEach(function() {
                    video1 = {}; video2 = {}; video3 = {};
                });

                it('should give objects unique IDs', function() {
                    var videos = [video1, video2, video3],
                        ids = videos.map(function(video) {
                            return VideoSearchCtrl.idFor(video);
                        });

                    ids.forEach(function(id) {
                        expect(id).toMatch(/\b[a-z0-9]{5,}\b/);
                    });
                    expect(ids).toEqual(ids.filter(function(id, index) {
                        return ids.indexOf(id) === index;
                    }));

                    expect(ids).toEqual(videos.map(function(video) {
                        return VideoSearchCtrl.idFor(video);
                    }));
                });
            });
        });
    });
});
