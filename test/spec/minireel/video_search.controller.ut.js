define(['minireel/video_search'], function(videoSearchModule) {
    'use strict';

    describe('VideoSearchController', function() {
        var $rootScope,
            $controller,
            VideoSearchService,
            $q,
            $scope,
            VideoSearchCtrl;

        beforeEach(function() {
            module(videoSearchModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                VideoSearchService = $injector.get('VideoSearchService');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
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
                it('should be an empty string', function() {
                    expect(VideoSearchCtrl.query).toBe('');
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

                    VideoSearchCtrl.query = 'Find Me Something Awesome!';

                    spyOn(VideoSearchService, 'find').and.returnValue($q.when(result));

                    $scope.$apply(function() {
                        VideoSearchCtrl.search().then(success, failure);
                    });
                });

                it('should search for the video', function() {
                    expect(VideoSearchService.find).toHaveBeenCalledWith({
                        query: VideoSearchCtrl.query
                    });
                });

                it('should resolve to the result', function() {
                    expect(success).toHaveBeenCalledWith(result);
                });

                it('should assign the result to its "result" property', function() {
                    expect(VideoSearchCtrl.result).toBe(result);
                });
            });
        });
    });
});
