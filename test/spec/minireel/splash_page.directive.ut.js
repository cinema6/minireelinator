(function() {
    'use strict';

    define(['minireel/editor', 'minireel/services', 'app', 'templates'], function(editorModule, servicesModule, appModule) {
        /* global angular */
        var jqLite = angular.element;

        describe('splash-page=""', function() {
            var $rootScope,
                $scope,
                $compile,
                $q,
                $httpBackend;

            var requireCJS,
                splashJS,
                delegate;

            var $splash,
                scope;

            beforeEach(function() {
                delegate = {
                    didShow: jasmine.createSpy('delegate.didShow()'),
                    didHide: jasmine.createSpy('delegate.didHide()')
                };

                splashJS = jasmine.createSpy('splashJS(c6, settings, splash)')
                    .and.returnValue(delegate);

                module(appModule.name);
                module(servicesModule.name, function($provide) {
                    $provide.value('requireCJS', jasmine.createSpy('requireCJS()')
                        .and.callFake(function() {
                            return $q.when(splashJS);
                        }));
                });

                module(editorModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $httpBackend = $injector.get('$httpBackend');
                    $q = $injector.get('$q');

                    requireCJS = $injector.get('requireCJS');

                    $scope = $rootScope.$new();
                    $scope.model = {
                        data: {
                            title: 'Hello',
                            splash: {
                                ratio: '1-1',
                                theme: 'img-text-overlay'
                            },
                            collateral: {
                                splash: '/collateral/e-123/splash'
                            }
                        }
                    };
                    $scope.splashSrc = null;
                });

                $splash = jqLite('<div splash-page="model" splash-src="{{splashSrc}}"></div>');

                $('body').append($splash);

                $httpBackend.expectGET('/collateral/splash/img-text-overlay/1-1.html')
                    .respond(200, '');

                $scope.$apply(function() {
                    $compile($splash)($scope);
                });
                scope = $splash.isolateScope();

                $httpBackend.flush();
            });

            afterEach(function() {
                $splash.remove();
            });

            it('should set up an isolate scope with bindings', function() {
                expect(scope.title).toBe($scope.model.data.title);
                $scope.model.data.title = 'Foo';
                expect(scope.title).toBe($scope.model.data.title);

                expect(scope.splash).toBe($scope.model.data.collateral.splash);
                $scope.model.data.collateral.splash = '/collateral/null';
                expect(scope.splash).toBe($scope.model.data.collateral.splash);
            });

            it('should bind the src to a provided value if one is provided', function() {
                $scope.$apply(function() {
                    $scope.splashSrc = '/collateral/foo?cb=1';
                });
                expect(scope.splash).toBe($scope.splashSrc);
            });

            describe('when splashLoad() is called', function() {
                beforeEach(function() {
                    splashJS.calls.reset();
                    $scope.$apply(function() {
                        scope.splashLoad();
                    });
                });

                it('should get the splashJS', function() {
                    expect(requireCJS).toHaveBeenCalledWith('/collateral/splash/splash.js');
                });

                it('should execute splashJS', function() {
                    expect(splashJS).toHaveBeenCalledWith({ loadExperience: jasmine.any(Function) }, jasmine.any(Object), $splash.find('ng-include')[0]);
                });

                describe('when loadExperience() is called', function() {
                    var c6;

                    beforeEach(function() {
                        c6 = splashJS.calls.mostRecent().args[0];

                        spyOn(scope, '$emit').and.callThrough();
                        spyOn(scope, '$apply').and.callThrough();

                        c6.loadExperience();
                    });

                    it('should $emit mrPreview:splashClick', function() {
                        expect(scope.$emit).toHaveBeenCalledWith('mrPreview:splashClick');
                        expect(scope.$apply).toHaveBeenCalled();
                    });
                });

                describe('delegate', function() {
                    describe('if there is no delegate', function() {
                        beforeEach(function() {
                            splashJS.and.returnValue(null);

                            $scope.$apply(function() {
                                scope.splashLoad();
                            });
                        });

                        it('should not throw any errors', function() {
                            expect(function() {
                                $scope.$broadcast('mrPreview:splashHide');
                                $scope.$broadcast('mrPreview:splashShow');
                            }).not.toThrow();
                        });
                    });

                    describe('when mrPreview:splashHide is $broadcast', function() {
                        beforeEach(function() {
                            $scope.$broadcast('mrPreview:splashHide');
                        });

                        it('should call didHide() on the delegate', function() {
                            expect(delegate.didHide).toHaveBeenCalled();
                        });
                    });

                    describe('when mrPreview:splashShow is $broadcast', function() {
                        beforeEach(function() {
                            $scope.$broadcast('mrPreview:splashShow');
                        });

                        it('should call didShow() on the delegate', function() {
                            expect(delegate.didShow).toHaveBeenCalled();
                        });
                    });

                    describe('if the delegate is missing methods', function() {
                        beforeEach(function() {
                            delete delegate.didShow;
                            delete delegate.didHide;
                        });

                        it('should not throw any errors', function() {
                            expect(function() {
                                $scope.$broadcast('mrPreview:splashHide');
                                $scope.$broadcast('mrPreview:splashShow');
                            }).not.toThrow();
                        });
                    });
                });
            });
        });
    });
}());
