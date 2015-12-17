define(['app','c6uilib'], function(appModule, c6uilib) {
    'use strict';

    describe('SelfieCampaignVideoController', function() {
        var $rootScope,
            $scope,
            $controller,
            $timeout,
            $q,
            ThumbnailService,
            SelfieVideoService,
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
                ThumbnailService = $injector.get('ThumbnailService');
                SelfieVideoService = $injector.get('SelfieVideoService');
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
            describe('videoUrl', function() {
                it('should call SelfieVideoService with service, id, and data', function() {
                    spyOn(SelfieVideoService, 'urlFromData').and.callThrough();

                    compileCtrl();

                    expect(SelfieVideoService.urlFromData).toHaveBeenCalledWith(undefined, undefined, {});
                    expect(SelfieCampaignVideoCtrl.videoUrl).toEqual(undefined);

                    card.data.service = 'youtube';
                    card.data.videoid = '12345';
                    card.data.hostname = 'company';
                    SelfieVideoService.urlFromData.and.returnValue('https://www.youtube.com/watch?v=12345');

                    compileCtrl();

                    expect(SelfieVideoService.urlFromData).toHaveBeenCalledWith('youtube', '12345', {
                        service: 'youtube',
                        videoid: '12345',
                        hostname: 'company'
                    });
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

            describe('updateUrl(url)', function() {
                var dataDeferred, statsDeferred, thumbnailDeferred;

                beforeEach(function() {
                    dataDeferred = $q.defer();
                    statsDeferred = $q.defer();
                    thumbnailDeferred = $q.defer();

                    spyOn(SelfieVideoService,'dataFromText').and.returnValue(dataDeferred.promise);
                    spyOn(SelfieVideoService, 'statsFromService').and.returnValue(statsDeferred.promise);
                    spyOn(ThumbnailService, 'getThumbsFor').and.callFake(function() {
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
                        expect(SelfieCampaignVideoCtrl.videoError).toBe(false);
                    });
                });

                describe('when there is a url', function() {
                    beforeEach(function() {
                        c6Debounce.debouncedFn(['http://youtube.com/watch?v=12345']);
                    });

                    it('should call the Video Service for data', function() {
                        expect(SelfieVideoService.dataFromText).toHaveBeenCalledWith('http://youtube.com/watch?v=12345');
                    });

                    describe('when data is returned', function() {
                        describe('fetching stats', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    dataDeferred.resolve({
                                        service: 'youtube',
                                        id: '12345',
                                        data: {
                                            hostname: 'company'
                                        }
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
                                    expect(card.data.hostname).toBe('company');
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
