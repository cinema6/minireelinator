(function() {
    'use strict';

    define(['editor'], function() {
        /* global angular */
        var jqLite = angular.element;

        describe('splash-page=""', function() {
            var $rootScope,
                $scope,
                $compile,
                $window,
                $$window;

            var $splash,
                postMessage;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $window = $injector.get('$window');

                    $scope = $rootScope.$new();
                    $$window = jqLite($window);
                });

                $splash = jqLite('<iframe src="about:blank" splash-page></iframe>');

                $('body').append($splash);
                postMessage = spyOn($splash.prop('contentWindow'), 'postMessage').and.callThrough();

                $scope.$apply(function() {
                    $compile($splash)($scope);
                });
            });

            afterEach(function() {
                $splash.remove();
            });

            describe('events', function() {
                describe('mrPreview:splashShow', function() {
                    beforeEach(function() {
                        $scope.$broadcast('mrPreview:splashShow');
                    });

                    it('should post the "show" message to the splash page', function() {
                        expect(postMessage).toHaveBeenCalledWith('show', '*');
                    });
                });

                describe('mrPreview:splashHide', function() {
                    beforeEach(function() {
                        $scope.$broadcast('mrPreview:splashHide');
                    });

                    it('should post the "hide" message to the splash page', function() {
                        expect(postMessage).toHaveBeenCalledWith('hide', '*');
                    });
                });

                describe('message: { event: "click" }', function() {
                    beforeEach(function() {
                        var event = jqLite.Event('message');

                        event.originalEvent = {
                            data: JSON.stringify({
                                exp: 'e-123',
                                event: 'click'
                            })
                        };
                        spyOn($scope, '$emit');
                        $$window.trigger(event);
                    });

                    it('should $emit the mrPreview:splashClick event', function() {
                        expect($scope.$emit).toHaveBeenCalledWith('mrPreview:splashClick');
                    });

                    describe('when the scope is $destroyed', function() {
                        beforeEach(function() {
                            var event = jqLite.Event('message');

                            event.originalEvent = {
                                data: JSON.stringify({
                                    exp: 'e-123abc',
                                    event: 'click'
                                })
                            };
                            $scope.$emit.calls.reset();

                            $scope.$destroy();
                            $$window.trigger(event);
                        });

                        it('should not listen for messages anymore', function() {
                            expect($scope.$emit).not.toHaveBeenCalled();
                        });
                    });
                });

                it('should not emit scope events for other messages', function() {
                    var event = jqLite.Event('message');

                    event.originalEvent = {
                        data: JSON.stringify({
                            exp: 'e-123',
                            event: 'drag'
                        })
                    };
                    spyOn($scope, '$emit');
                    $$window.trigger(event);

                    expect($scope.$emit).not.toHaveBeenCalled();
                });

                it('should be able to handle other types of objects', function() {
                    var event = jqLite.Event('message');

                    event.originalEvent = {
                        data: JSON.stringify({
                            __c6__: {
                                event: 'foo'
                            }
                        })
                    };
                    expect(function() {
                        $$window.trigger(event);
                    }).not.toThrow();
                });

                it('should be able to handle non-JSON messages', function() {
                    var event = jqLite.Event('message');

                    event.originalEvent = { data: 'Hey' };

                    expect(function() {
                        $$window.trigger(event);
                    }).not.toThrow();
                });
            });
        });
    });
}());
