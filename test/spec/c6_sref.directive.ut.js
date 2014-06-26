(function() {
    'use strict';

    define(['c6_state'], function() {
        describe('c6-sref=""', function() {
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
                        .state('Bar', function() {})
                        .state('Team', function() {})
                        .state('Users', function() {})
                        .state('Posts', function() {})
                        .state('Post', function() {})
                        .state('Comment', function() {})
                        .state('Like', function() {});

                    c6StateProvider.config('foo', {
                        rootState: 'Foo'
                    });

                    c6StateProvider.map(function() {
                        this.route('/home', 'Home');
                        this.route('/about', 'About', function() {
                            this.route('/team', 'Team');
                        });
                        this.route('/posts', 'Posts', function() {
                            this.route('/:postId', 'Post', function() {
                                this.route('/comments/:commentId', 'Comment', function() {
                                    this.route('/likes/:likeId', 'Like');
                                });
                            });
                        });
                        this.state('Users');
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
                    delete $scope.context;
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

            describe('the href', function() {
                describe('on a non-anchor tag', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $sref = $compile('<button c6-sref="{{state}}">Button</button>')($scope);
                        });
                    });

                    it('should not be present', function() {
                        expect($sref.attr('href')).toBeUndefined();
                    });
                });

                describe('on an anchor tag', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.state = 'Team';
                            delete $scope.context;
                        });
                    });

                    it('should set the href to a URL representation of the state', function() {
                        expect($sref.attr('href')).toBe('#/about/team');
                    });

                    describe('if the route has dynamic segments', function() {
                        beforeEach(function() {
                            var post = c6State.get('Post'),
                                comment = c6State.get('Comment'),
                                like = c6State.get('Like');

                            post.cModel = { id: 'p-1' };
                            comment.cModel = { id: 'c-a' };
                            like.cModel = { id: 'l-5' };

                            $scope.$apply(function() {
                                $scope.state = 'Like';
                            });
                        });

                        it('should be a compiled URL', function() {
                            expect($sref.attr('href')).toBe('#/posts/p-1/comments/c-a/likes/l-5');
                        });

                        describe('if models are provided', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    $scope.models = [{ id: 'c-c' },{ id: 'l-0' }];
                                });
                            });

                            it('should use the models', function() {
                                expect($sref.attr('href')).toBe('#/posts/p-1/comments/c-c/likes/l-0');
                            });
                        });
                    });

                    describe('if the state has no route', function() {
                        beforeEach(function() {
                            var bar = c6State.in('foo', function() {
                                return c6State.get('Bar');
                            });

                            bar.cModel = {};

                            $scope.$apply(function() {
                                $scope.state = 'Bar';
                                $scope.context = 'foo';
                            });
                        });

                        it('should set the href to ""', function() {
                            expect($sref.attr('href')).toBe('');
                        });
                    });
                });
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
