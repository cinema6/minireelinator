define(['app','c6uilib'], function(appModule, c6uilib) {
    'use strict';

    describe('SelfieCampaignVideoController', function() {
        var $rootScope,
            $scope,
            $controller,
            $timeout,
            $q,
            VideoThumbnailService,
            SelfieVideoService,
            FileService,
            CollateralService,
            SelfieCampaignVideoCtrl,
            SelfieCampaignCtrl,
            c6Debounce;

        var card;

        function compileCtrl() {
            $scope.$apply(function() {
                SelfieCampaignVideoCtrl = $controller('SelfieCampaignVideoController', { $scope: $scope });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            module(c6uilib.name, function($provide) {
                $provide.decorator('c6Debounce', function($delegate) {
                    return jasmine.createSpy('c6Debounce()').and.callFake(function(fn, time) {
                        c6Debounce.debouncedFn = fn;
                        spyOn(c6Debounce, 'debouncedFn').and.callThrough();

                        return $delegate.call(null, c6Debounce.debouncedFn, time);
                    });
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $timeout = $injector.get('$timeout');
                $q = $injector.get('$q');
                VideoThumbnailService = $injector.get('VideoThumbnailService');
                SelfieVideoService = $injector.get('SelfieVideoService');
                CollateralService = $injector.get('CollateralService');
                c6Debounce = $injector.get('c6Debounce');

                card = {
                    data: {}
                };

                $scope = $rootScope.$new();
                $scope.SelfieCampaignCtrl = {
                    card: card,
                    disableVideoTitleOverwrite: false
                };
            });

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieCampaignVideoCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('useDefaultThumb', function() {
                it('should be true if card has no thumbnail', function() {
                    expect(SelfieCampaignVideoCtrl.useDefaultThumb).toBe(true);
                });

                it('should be false if card has a custom thumbnail', function() {
                    card.thumb = '/custom-thumbnail.jpg';

                    compileCtrl();

                    expect(SelfieCampaignVideoCtrl.useDefaultThumb).toBe(false);
                });
            });

            describe('customThumbSrc', function() {
                it('should be the custom path if defined', function() {
                    expect(SelfieCampaignVideoCtrl.customThumbSrc).toBe(undefined);

                    card.thumb = '/custom-thumbnail.jpg';

                    compileCtrl();

                    expect(SelfieCampaignVideoCtrl.customThumbSrc).toBe('/custom-thumbnail.jpg');
                });
            });

            describe('videoUrl', function() {
                it('should call SelfieVideoService with service and id', function() {
                    spyOn(SelfieVideoService, 'urlFromData').and.callThrough();

                    compileCtrl();

                    expect(SelfieVideoService.urlFromData).toHaveBeenCalledWith(undefined, undefined);
                    expect(SelfieCampaignVideoCtrl.videoUrl).toEqual(undefined);

                    card.data.service = 'youtube';
                    card.data.videoid = '12345';
                    SelfieVideoService.urlFromData.and.returnValue('https://www.youtube.com/watch?v=12345');

                    compileCtrl();

                    expect(SelfieVideoService.urlFromData).toHaveBeenCalledWith('youtube', '12345');
                    expect(SelfieCampaignVideoCtrl.videoUrl).toEqual('https://www.youtube.com/watch?v=12345');
                });
            });

            describe('disableTitleOverwrite', function() {
                describe('when parent controller (SelfieCampaignCtrl) allows overwriting', function() {
                    it('should be true if there is a video on initiation', function() {
                        $scope.SelfieCampaignCtrl.disableVideoTitleOverwrite = false;
                        card.data.service = 'youtube';
                        card.data.videoid = '12345';

                        compileCtrl();

                        expect(SelfieCampaignVideoCtrl.disableTitleOverwrite).toBe(true);
                    });

                    it('should be false if there is no video on initiation', function() {
                        $scope.SelfieCampaignCtrl.disableVideoTitleOverwrite = false;
                        card.data.service = null;
                        card.data.videoid = null;

                        compileCtrl();

                        expect(SelfieCampaignVideoCtrl.disableTitleOverwrite).toBe(false);
                    });
                });

                describe('when parent controller (SelfieCampaignCtrl) does not allow overwriting', function() {
                    it('should be true if there is a video on initiation', function() {
                        $scope.SelfieCampaignCtrl.disableVideoTitleOverwrite = true;
                        card.data.service = 'youtube';
                        card.data.videoid = '12345';

                        compileCtrl();

                        expect(SelfieCampaignVideoCtrl.disableTitleOverwrite).toBe(true);
                    });

                    it('should be true even if there is no video on initiation', function() {
                        $scope.SelfieCampaignCtrl.disableVideoTitleOverwrite = true;
                        card.data.service = null;
                        card.data.videoid = null;

                        compileCtrl();

                        expect(SelfieCampaignVideoCtrl.disableTitleOverwrite).toBe(true);
                    });
                });
            });
        });

        describe('methods', function() {
            describe('disableTrimmer()', function() {
                it('should always return true', function() {
                    //this is for disabling trimmer on video preview directive
                    expect(SelfieCampaignVideoCtrl.disableTrimmer()).toBe(true);
                });
            });

            describe('updateThumbs()', function() {
                describe('when choosing to use default thumbnail', function() {
                    it('should remove any custom thumb on the card', function() {
                        card.thumb = 'my-custom-thumb.jpg';
                        SelfieCampaignVideoCtrl.useDefaultThumb = true;

                        SelfieCampaignVideoCtrl.updateThumbs();

                        expect(card.thumb).toBe(null);
                    });
                });

                describe('when choosing to use a custom thumbnail', function() {
                    it('should set the custom thumbnail on the card', function() {
                        card.thumb = null;
                        SelfieCampaignVideoCtrl.useDefaultThumb = false;
                        SelfieCampaignVideoCtrl.customThumbSrc = 'custom-thumb.jpg';

                        SelfieCampaignVideoCtrl.updateThumbs();

                        expect(card.thumb).toBe('custom-thumb.jpg');
                    });
                });
            });

            describe('updateUrl(url)', function() {
                var dataDeferred, statsDeferred, thumbnailDeferred;

                beforeEach(function() {
                    dataDeferred = $q.defer();
                    statsDeferred = $q.defer();
                    thumbnailDeferred = $q.defer();

                    spyOn(SelfieVideoService,'dataFromUrl').and.returnValue(dataDeferred.promise);
                    spyOn(SelfieVideoService, 'statsFromService').and.returnValue(statsDeferred.promise);
                    spyOn(VideoThumbnailService, 'getThumbsFor').and.callFake(function() {
                        return {
                            ensureFulfillment: jasmine.createSpy('ensureFulfillment()')
                                .and.returnValue(thumbnailDeferred.promise)
                        };
                    });
                });

                it('should debounce the call for 1 second', function() {
                    expect(c6Debounce).toHaveBeenCalled();
                    expect(c6Debounce.debouncedFn).not.toHaveBeenCalled();

                    SelfieCampaignVideoCtrl.updateUrl('http://youtube.com/watch?v=12345');
                    SelfieCampaignVideoCtrl.updateUrl('http://youtube.com/watch?v=12345');
                    SelfieCampaignVideoCtrl.updateUrl('http://youtube.com/watch?v=12345');
                    SelfieCampaignVideoCtrl.updateUrl('http://youtube.com/watch?v=12345');
                    SelfieCampaignVideoCtrl.updateUrl('http://youtube.com/watch?v=12345');
                    SelfieCampaignVideoCtrl.updateUrl('http://youtube.com/watch?v=12345');
                    SelfieCampaignVideoCtrl.updateUrl('http://youtube.com/watch?v=12345');
                    SelfieCampaignVideoCtrl.updateUrl('http://youtube.com/watch?v=12345');
                    SelfieCampaignVideoCtrl.updateUrl('http://youtube.com/watch?v=12345');
                    SelfieCampaignVideoCtrl.updateUrl('http://youtube.com/watch?v=12345');

                    $timeout.flush(1000);

                    expect(c6Debounce.debouncedFn).toHaveBeenCalled();
                    expect(c6Debounce.debouncedFn.calls.count()).toBe(1);
                });

                describe('when there is no url', function() {
                    it('should set the video to null', function() {
                        SelfieCampaignVideoCtrl.video = { title: 'My Video' };

                        c6Debounce.debouncedFn(['']);

                        expect(SelfieCampaignVideoCtrl.video).toBe(null);
                    });
                });

                describe('when there is a url', function() {
                    beforeEach(function() {
                        c6Debounce.debouncedFn(['http://youtube.com/watch?v=12345']);
                    });

                    it('should call the Video Service for data', function() {
                        expect(SelfieVideoService.dataFromUrl).toHaveBeenCalledWith('http://youtube.com/watch?v=12345');
                    });

                    describe('when data is returned', function() {
                        describe('setting thumbs', function() {
                            describe('when video is an ad unit', function() {
                                it('should disable default thumb because an ad unit does not have one', function() {
                                    $scope.$apply(function() {
                                        dataDeferred.resolve({
                                            service: 'adUnit',
                                            id: '12345'
                                        });
                                    });

                                    expect(SelfieCampaignVideoCtrl.useDefaultThumb).toBe(false);
                                    expect(SelfieCampaignVideoCtrl.defaultThumb).toBe(null);
                                });
                            });

                            describe('when video is not an ad unit', function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        dataDeferred.resolve({
                                            service: 'youtube',
                                            id: '12345'
                                        });
                                    });
                                });

                                it('should call VideoThumbnailService', function() {
                                    expect(VideoThumbnailService.getThumbsFor).toHaveBeenCalledWith('youtube', '12345');
                                });

                                describe('when thumbs are resolved', function() {
                                    it('should set the default thumb', function() {
                                        $scope.$apply(function() {
                                            thumbnailDeferred.resolve({
                                                large: 'default-thumb.jpg'
                                            });
                                        });
                                        expect(SelfieCampaignVideoCtrl.defaultThumb).toEqual('default-thumb.jpg');
                                    });

                                    describe('if there is a already custom thumb', function() {
                                        it('should set not show default thumb as selected', function() {
                                            card.thumb = 'custom-thumb.jpg';

                                            $scope.$apply(function() {
                                                thumbnailDeferred.resolve({
                                                    large: 'default-thumb.jpg'
                                                });
                                            });

                                            expect(SelfieCampaignVideoCtrl.useDefaultThumb).toBe(false);
                                        });
                                    });

                                    describe('if there is no custom thumb', function() {
                                        it('should set show default thumb as selected', function() {
                                            card.thumb = null;

                                            $scope.$apply(function() {
                                                thumbnailDeferred.resolve({
                                                    large: 'default-thumb.jpg'
                                                });
                                            });

                                            expect(SelfieCampaignVideoCtrl.useDefaultThumb).toBe(true);
                                        });
                                    });
                                });
                            });
                        });

                        describe('fetching stats', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    dataDeferred.resolve({
                                        service: 'youtube',
                                        id: '12345'
                                    });
                                });
                            });

                            it('should call Video Service for stats', function() {
                                expect(SelfieVideoService.statsFromService).toHaveBeenCalledWith('youtube', '12345');
                            });

                            describe('when stats are returned', function() {
                                describe('when title overwriting is allowed', function() {
                                    it('should overwrite the title on the card', function() {
                                        $scope.$apply(function() {
                                            statsDeferred.resolve({
                                                title: 'New Video Title'
                                            });
                                        });

                                        expect(card.title).toEqual('New Video Title');
                                    });
                                });

                                describe('when title overwriting is not allowed', function() {
                                    it('should not overwrite the title on the card', function() {
                                        $scope.SelfieCampaignCtrl.disableVideoTitleOverwrite = true;
                                        card.title = 'Original Title';

                                        $scope.$apply(function() {
                                            statsDeferred.resolve({
                                                title: 'New Video Title'
                                            });
                                        });

                                        expect(card.title).toEqual('Original Title');
                                    });
                                });

                                it('should set the service and videoid on the card', function() {
                                    var data = {
                                        title: 'New Video Title',
                                        duration: 3000,
                                        views: 123645
                                    };

                                    $scope.$apply(function() {
                                        statsDeferred.resolve(data);
                                    });

                                    expect(SelfieCampaignVideoCtrl.video).toEqual(data);
                                    expect(SelfieCampaignVideoCtrl.videoError).toBe(false);
                                    expect(card.data.service).toBe('youtube');
                                    expect(card.data.videoid).toBe('12345');
                                });
                            });

                            describe('if stats promise is rejected', function() {
                                it('should display error', function() {
                                    $scope.$apply(function() {
                                        statsDeferred.reject();
                                    });

                                    expect(SelfieCampaignVideoCtrl.videoError).toBe(true);
                                    expect(SelfieCampaignVideoCtrl.video).toBe(null);
                                });
                            });
                        });
                    });

                    describe('if data promise is rejected', function() {
                        it('should show error', function() {
                            $scope.$apply(function() {
                                dataDeferred.reject();
                            });

                            expect(SelfieCampaignVideoCtrl.videoError).toBe(true);
                            expect(SelfieCampaignVideoCtrl.video).toBe(null);
                        });
                    });
                });
            });
        });

        describe('$watchers', function() {
            describe('useDefaultThumb', function() {
                it('should remove custom thumb if true', function() {
                    card.thumb = 'my-thumb.jpg';

                    $scope.$apply(function() {
                        SelfieCampaignVideoCtrl.useDefaultThumb = false;
                    });

                    $scope.$apply(function() {
                        SelfieCampaignVideoCtrl.useDefaultThumb = true;
                    });

                    expect(card.thumb).toBe(null);
                });

                it('should add custom thumb to card if false', function() {
                    SelfieCampaignVideoCtrl.customThumbSrc = 'my-thumb.jpg';

                    $scope.$apply(function() {
                        SelfieCampaignVideoCtrl.useDefaultThumb = true;
                    });

                    $scope.$apply(function() {
                        SelfieCampaignVideoCtrl.useDefaultThumb = false;
                    });

                    expect(card.thumb).toBe('my-thumb.jpg');
                });
            });

            describe('customThumbFile', function() {
                var deferred;

                beforeEach(function() {
                    deferred = $q.defer();

                    spyOn(CollateralService, 'uploadFromFile').and.returnValue(deferred.promise);

                    $scope.$apply(function() {
                        SelfieCampaignVideoCtrl.customThumbFile = {filename: 'file'};
                    });
                });

                it('should upload via Collateral Service', function() {
                    expect(CollateralService.uploadFromFile).toHaveBeenCalledWith({filename: 'file'});
                });

                describe('when promise resolves', function() {
                    it('should set the path on the controller', function() {
                        $scope.$apply(function() {
                            deferred.resolve('collateral/userFiles/iuyewriujksdfhjh.jpg');
                        });

                        expect(SelfieCampaignVideoCtrl.customThumbSrc).toEqual('/collateral/userFiles/iuyewriujksdfhjh.jpg');
                        expect(SelfieCampaignVideoCtrl.useDefaultThumb).toEqual(false);
                        expect(card.thumb).toEqual('/collateral/userFiles/iuyewriujksdfhjh.jpg');
                    });
                });
            });

            describe('videoUrl', function() {
                it('should updateUrl()', function() {
                    $scope.$apply(function() {
                        SelfieCampaignVideoCtrl.videoUrl = 'http://youtube.com/watch?v=76565';
                    });

                    $timeout.flush(1000);

                    expect(c6Debounce.debouncedFn).toHaveBeenCalled();
                });
            });
        });
    });
});