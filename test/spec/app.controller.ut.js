define(['app', 'version'], function(appModule, version) {
    'use strict';

    describe('AppController', function() {
        var $rootScope,
            _$rootScope_,
            $controller,
            $scope,
            AppCtrl,
            CSSLoadingService,
            c6State;

        function initCtrl(appName) {
            $rootScope = {};
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

                spyOn(CSSLoadingService, 'load');

                c6State = {
                    current: 'Selfie:State:Name'
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
