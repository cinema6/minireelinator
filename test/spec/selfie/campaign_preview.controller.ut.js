define(['app','c6uilib'], function(appModule, c6uilib) {
    'use strict';

    var copy = angular.copy;

    describe('SelfieCampaignPreviewControler', function() {
        var $rootScope,
            $scope,
            $controller,
            $timeout,
            c6Debounce,
            SelfieCampaignCtrl,
            SelfieCampaignPreviewCtrl;

        var card;

        function compileCtrl() {
            $scope.$apply(function() {
                SelfieCampaignPreviewCtrl = $controller('SelfieCampaignPreviewController', { $scope: $scope });
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
                c6Debounce = $injector.get('c6Debounce');

                card = {
                    data: {}
                };

                $scope = $rootScope.$new();
                $scope.SelfieCampaignCtrl = {
                    card: card
                };
            });

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieCampaignPreviewCtrl).toEqual(jasmine.any(Object));
        });

        it('should load the preview if there is a service and video id on instantiation', function() {
            card.data.service = 'youtube';
            card.data.videoid = '12345';

            compileCtrl();

            $timeout.flush(2000);

            expect(c6Debounce.debouncedFn).toHaveBeenCalled();
        });

        describe('methods', function() {
            describe('loadPreview()', function() {
                it('should debounce for 2 seconds', function() {
                    expect(c6Debounce.debouncedFn).not.toHaveBeenCalled();

                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();
                    SelfieCampaignPreviewCtrl.loadPreview();

                    $timeout.flush(2000);

                    expect(c6Debounce.debouncedFn).toHaveBeenCalled();
                    expect(c6Debounce.debouncedFn.calls.count()).toBe(1);
                });

                it('should put a copy of the card on the controller', function() {
                    expect(SelfieCampaignPreviewCtrl.card).toBe(undefined);

                    SelfieCampaignPreviewCtrl.loadPreview();

                    $timeout.flush(2000);

                    expect(SelfieCampaignPreviewCtrl.card).toEqual(card);
                });
            });
        });

        describe('$broadcast handler', function() {
            it('should load preview', function() {
                $rootScope.$broadcast('loadPreview');

                $timeout.flush(2000);

                expect(c6Debounce.debouncedFn).toHaveBeenCalled();
            });
        });
    });
});