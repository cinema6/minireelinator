define(['app', 'version', 'c6_defines'], function(appModule, version, c6Defines) {
    'use strict';

    describe('AppController', function() {
        var $rootScope,
            _$rootScope_,
            $controller,
            $scope,
            AppCtrl,
            CSSLoadingService,
            c6State,
            tracker;

        function initCtrl(appName) {
            $rootScope = {
                $on: jasmine.createSpy('$rootScope.$on()')
            };
            $scope = _$rootScope_.$new();
            $scope.$apply(function() {
                AppCtrl = $controller('AppController', {
                    cState: { name: appName },
                    c6State: c6State,
                    $rootScope: $rootScope
                });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                _$rootScope_ = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                CSSLoadingService = $injector.get('CSSLoadingService');
                tracker = $injector.get('tracker');

                spyOn(CSSLoadingService, 'load');
                spyOn(tracker, 'create');

                c6State = {
                    current: 'Selfie:State:Name',
                    on: jasmine.createSpy('c6State.on()')
                };

                initCtrl('Portal');
            });
        });

        it('should exist', function() {
            expect(AppCtrl).toEqual(jasmine.any(Object));
        });

        it('should have a computed property with current c6State name', function() {
            expect($rootScope.currentState).toEqual('Selfie:State:Name');

            c6State.current = 'Selfie:New:State';

            expect($rootScope.currentState).toEqual('Selfie:New:State');
        });

        describe('when Selfie app', function() {
            beforeEach(function() {
                initCtrl('Selfie');
            });

            it('should initialize a tracker', function() {
                expect(tracker.create).toHaveBeenCalledWith(c6Defines.kTracker.accountId, c6Defines.kTracker.config);
            });

            it('should add a listener for c6State changes', function() {
                expect(c6State.on).toHaveBeenCalledWith('stateChange', AppCtrl.trackStateChange);
            });
        });

        describe('when Portal app', function() {
            beforeEach(function() {
                initCtrl('Portal');
            });

            it('should not initialize a tracker', function() {
                expect(tracker.create).not.toHaveBeenCalledWith(c6Defines.kTracker.accountId, c6Defines.kTracker.config);
            });

            it('should add a listener for c6State changes', function() {
                expect(c6State.on).not.toHaveBeenCalledWith('stateChange', AppCtrl.trackStateChange);
            });
        });

        describe('trackStateChange(state)', function() {
            it('should track a page view', function() {
                var state = {
                    cUrl: '/selfie',
                    cName: 'Selfie Dashboard'
                };

                spyOn(tracker, 'pageview');

                AppCtrl.trackStateChange(state);

                expect(tracker.pageview).toHaveBeenCalledWith(state.cUrl, 'Platform - ' + state.cName);
            });
        });

        describe('loading app-specific CSS files', function() {
            ['Portal', 'Selfie'].forEach(function(app) {
                it('should load the app\'s CSS files', function() {
                    CSSLoadingService.load.calls.reset();

                    initCtrl(app);

                    expect(CSSLoadingService.load).toHaveBeenCalledWith(jasmine.any(Array));
                });
            });
        });

        describe('properties', function() {
            describe('version', function() {
                it('should be the version in the version module', function() {
                    expect(AppCtrl.version).toBe(version);
                });
            });

            describe('validImgSrc', function() {
                it('should be a regex that matches valid image sources', function() {
                    expect(AppCtrl.validImgSrc.test('http://example.com/image.jpg')).toBe(true);
                    expect(AppCtrl.validImgSrc.test('https://example.com/image.jpg')).toBe(true);
                    expect(AppCtrl.validImgSrc.test('//example.com/image.jpg')).toBe(true);
                    expect(AppCtrl.validImgSrc.test('http://a.b.c.example.com/a/b/c/image.jpg/something.png')).toBe(true);

                    expect(AppCtrl.validImgSrc.test('example.com/image.gif')).toBe(false);
                    expect(AppCtrl.validImgSrc.test('data:image/jpg;base64,hjdsgfiudhgkjdfdjfkg')).toBe(false);
                });
            });

            describe('validUrl', function() {
                it('should be a regex that matches valid urls', function() {
                    expect(AppCtrl.validUrl.test('http://example.com/some-page')).toBe(true);
                    expect(AppCtrl.validUrl.test('https://example.com/some-page')).toBe(true);
                    expect(AppCtrl.validUrl.test('//example.com/some-page')).toBe(true);

                    expect(AppCtrl.validUrl.test('example.com/some-page')).toBe(false);
                });
            });
        });
    });
});
