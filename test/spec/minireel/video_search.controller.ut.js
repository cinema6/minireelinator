define(['app', 'minireel/services'], function(appModule, servicesModule) {
    'use strict';

    describe('VideoSearchController', function() {
        var $rootScope,
            $controller,
            VideoSearchService,
            $q,
            $scope,
            MiniReelService,
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
                        sites: undefined,
                        hd: undefined
                    });
                });
            });

            describe('currentPreview', function() {
                it('should be null', function() {
                    expect(VideoSearchCtrl.currentPreview).toBeNull();
                });
            });
        });

        describe('methods', function() {
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
                    expect(VideoSearchService.find).toHaveBeenCalledWith(VideoSearchCtrl.query);
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
                    spyOn(EditorCtrl, 'pushCard').and.callThrough();
                    spyOn(EditorCtrl, 'editCard');

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

                it('should push the new card into the deck', function() {
                    expect(EditorCtrl.pushCard).toHaveBeenCalledWith(videoCard);
                });
            });
        });
    });
});
