(function() {
    'use strict';

    define(['c6_state'], function() {
        ddescribe('c6-sref=""', function() {
            var $rootScope,
                $scope,
                $compile,
                c6State;

            var current;

            var $sref;

            beforeEach(function() {
                current = jasmine.createSpy('c6State.current').and.returnValue('Bar');

                module('c6.state', function(c6StateProvider) {
                    c6StateProvider
                        .state('Home', function() {})
                        .state('About', function() {})
                        .state('Foo', function() {})
                        .state('Bar', function() {});

                    c6StateProvider.config('foo', {
                        rootState: 'Foo'
                    });

                    c6StateProvider.map(function() {
                        this.state('Home');
                        this.state('About');
                    });

                    c6StateProvider.map('foo', null, function() {
                        this.state('Bar');
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    c6State = $injector.get('c6State');

                    $scope = $rootScope.$new();
                });

                spyOn(c6State, 'in').and.callThrough();
                spyOn(c6State, 'goTo')
                    .and.callFake(function() {
                        expect(function() {
                            $rootScope.$digest();
                        }).toThrow();
                    });

                Object.defineProperty(c6State, 'current', {
                    get: current
                });
                $scope.state = 'Bar';
                $scope.context = 'foo';
                $scope.$apply(function() {
                    $sref = $compile('<a c6-sref="{{state}}" c6-params="params" c6-models="models" c6-context="{{context}}">Click Me</a>')($scope);
                });
            });

            it('should call goTo with the given state and params and models when clicked', function() {
                $sref.click();
                expect(c6State.goTo).toHaveBeenCalledWith('Bar', undefined, undefined);

                $scope.$apply(function() {
                    $scope.state = 'Users';
                });
                $sref.click();
                expect(c6State.goTo).toHaveBeenCalledWith('Users', undefined, undefined);

                $scope.$apply(function() {
                    $scope.params = { id: 'foo' };
                });
                $sref.click();
                expect(c6State.goTo).toHaveBeenCalledWith('Users', undefined, $scope.params);

                $scope.$apply(function() {
                    $scope.models = [];
                });
                $sref.click();
                expect(c6State.goTo).toHaveBeenCalledWith('Users', $scope.models, $scope.params);

                expect(c6State.in).toHaveBeenCalledWith('main', jasmine.any(Function));
            });

            it('should support specifying a context', function() {
                $scope.$apply(function() {
                    $scope.context = 'foo';
                    $scope.state = 'Foo';
                });

                $sref.click();

                expect(c6State.in).toHaveBeenCalledWith('foo', jasmine.any(Function));
                expect(c6State.goTo).toHaveBeenCalled();
            });

            it('should give anchor tags an empty href property', function() {
                expect($sref.attr('href')).toBe('');
            });

            it('should not give non-anchor tags an href property', function() {
                $scope.$apply(function() {
                    $sref = $compile('<button c6-sref="{{state}}">Button</button>')($scope);
                });
                $sref.click();
                expect(c6State.goTo).toHaveBeenCalledWith('Bar', undefined, undefined);

                expect($sref.attr('href')).toBeUndefined();
            });

            it('should add the "c6-active" class when the state the sref points to is active', function() {
                spyOn(c6State, 'isActive').and.returnValue(false);

                expect($sref.hasClass('c6-active')).toBe(true);

                c6State.emit('stateChange');
                expect(c6State.isActive).toHaveBeenCalledWith(c6State.get('Bar'));
                expect($sref.hasClass('c6-active')).toBe(false);
                expect(c6State.in).toHaveBeenCalledWith('foo', jasmine.any(Function));

                $scope.$apply(function() {
                    $scope.state = 'About';
                    delete $scope.context;
                });
                c6State.isActive.and.returnValue(true);
                c6State.emit('stateChange');
                expect(c6State.isActive).toHaveBeenCalledWith(c6State.get('About'));
                expect($sref.hasClass('c6-active')).toBe(true);

                $scope.$apply(function() {
                    $scope.state = 'Bar';
                    $scope.context = 'foo';
                });
                c6State.emit('stateChange');
                expect(c6State.in).toHaveBeenCalledWith('foo', jasmine.any(Function));
            });

            it('should not throw an error if the state its loaded on is null', function() {
                current.and.returnValue(null);

                expect(function() {
                    $scope.$apply(function() {
                        $sref = $compile('<a c6-sref="{{state}}" params="params">Click Me</a>')($scope);
                    });
                }).not.toThrow();
            });
        });
    });
}());
