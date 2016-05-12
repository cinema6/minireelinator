(function() {
    'use strict';

    define(['angular', 'c6_state'], function(angular, c6StateModule) {
        function extend() {
            var objects = Array.prototype.slice.call(arguments);

            return objects.reduce(function(result, object) {
                return Object.keys(object).reduce(function(result, key) {
                    result[key] = object[key];
                    return result;
                }, result);
            }, {});
        }

        describe('c6State', function() {
            var c6StateProvider,
                $injector,
                c6State,
                $rootScope,
                $httpBackend,
                $q,
                $location,
                $timeout;

            var _private;

            function get() {
                c6State = $injector.get('c6State');
                _private = c6State._private;

                return c6State;
            }

            beforeEach(function() {
                module('ng', function($provide) {
                    $provide.value('$location', {
                        path: jasmine.createSpy('$location.path()')
                            .and.returnValue(''),
                        search: jasmine.createSpy('$location.search()')
                            .and.returnValue({}),
                        replace: jasmine.createSpy('$location.replace()'),
                        absUrl: function() {}
                    });
                });

                module(c6StateModule.name, function($injector) {
                    c6StateProvider = $injector.get('c6StateProvider');
                });

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    $rootScope = $injector.get('$rootScope');
                    $httpBackend = $injector.get('$httpBackend');
                    $q = $injector.get('$q');
                    $location = $injector.get('$location');
                    $timeout = $injector.get('$timeout');
                });
            });

            afterAll(function() {
                c6StateProvider = null;
                $injector = null;
                c6State = null;
                $rootScope = null;
                $httpBackend = null;
                $q = null;
                $location = null;
                $timeout = null;
                _private = null;
            });

            describe('provider', function() {
                it('should exist', function() {
                    expect(c6StateProvider).toEqual(jasmine.any(Object));
                });

                describe('@public', function() {
                    describe('methods', function() {
                        describe('config(context, config)', function() {
                            beforeEach(function() {
                                c6StateProvider.state('Main', function() {});
                            });

                            describe('enableUrlRouting', function() {
                                describe('when true', function() {
                                    beforeEach(function() {
                                        c6StateProvider.config({
                                            enableUrlRouting: false
                                        });

                                        c6StateProvider.config('foo', {
                                            rootState: 'Main',
                                            enableUrlRouting: true
                                        });

                                        get();
                                    });

                                    it('should make the root state\'s cUrl \'/\'', function() {
                                        c6State.in('foo', function() {
                                            expect(c6State.get('Main').cUrl).toBe('/');
                                        });
                                    });
                                });

                                describe('when false', function() {
                                    beforeEach(function() {
                                        c6StateProvider.config('foo', {
                                            rootState: 'Main',
                                            enableUrlRouting: false
                                        });

                                        get();
                                    });

                                    it('should make the root state\'s cUrl null', function() {
                                        c6State.in('foo', function() {
                                            expect(c6State.get('Main').cUrl).toBeNull();
                                        });
                                    });
                                });

                                describe('if enableUrlRouting is already true in another context', function() {
                                    beforeEach(function() {
                                        c6StateProvider
                                            .state('One', function() {})
                                            .state('Two', function() {})
                                            .state('Three', function() {});

                                        c6StateProvider.config({
                                            enableUrlRouting: false
                                        });

                                        c6StateProvider.config('one', {
                                            enableUrlRouting: true,
                                            rootState: 'One'
                                        });

                                        c6StateProvider.config('two', {
                                            enableUrlRouting: false,
                                            rootState: 'Two'
                                        });

                                        get();
                                    });

                                    it('should throw an error if set to true as well', function() {
                                        expect(function() {
                                            c6StateProvider.config('three', {
                                                enableUrlRouting: true,
                                                rootState: 'Three'
                                            });
                                        }).toThrow(new Error('Cannot enable URL routing in context "three" because it is already enabled in context "one".'));
                                    });
                                });
                            });

                            describe('reconfiguring', function() {
                                it('should reconfigure a context if called again on an existing context', function() {
                                    var application;

                                    c6StateProvider.config('main', {
                                        enableUrlRouting: false
                                    });

                                    get();

                                    application = c6State.get('Application');

                                    expect(application.cUrl).toBeNull();
                                });

                                it('should apply to the main context if called with just an object', function() {
                                    c6StateProvider.config({
                                        enableUrlRouting: false,
                                    });

                                    get();

                                    expect(c6State.get('Application').cUrl).toBeNull();
                                });
                            });
                        });

                        describe('map(fn)', function() {
                            beforeEach(function() {
                                c6StateProvider
                                    .state('About', [function() {}])
                                    .state('Posts', [function() {}])
                                    .state('Posts.Post', [function() {}])
                                    .state('Posts.Post.Comments', [function() {}])
                                    .state('Posts.Post.Favs', [function() {}])
                                    .state('Posts.Post.Favs.Stars', [function() {}])
                                    .state('Comments.Meta', [function() {}]);
                            });

                            describe('mapping a state in multiple places', function() {
                                var aboutChildren, postsChildren;

                                beforeEach(function() {
                                    c6StateProvider.map(function() {
                                        this.route('/about', 'About', function() {
                                            this.route('/:postId', 'Posts.Post', 'about.post', function() {
                                                this.route('/comments', 'Posts.Post.Comments', 'about.post.comments');
                                            });
                                        });
                                        this.route('/posts', 'Posts', function() {
                                            this.route('/:postId', 'Posts.Post', 'posts.post', function() {
                                                this.route('/comments', 'Posts.Post.Comments', 'posts.post.comments');
                                            });
                                        });
                                    });

                                    get();

                                    aboutChildren = {
                                        post: c6State.get('about.post'),
                                        comments: c6State.get('about.post.comments')
                                    };

                                    postsChildren = {
                                        post: c6State.get('posts.post'),
                                        comments: c6State.get('posts.post.comments')
                                    };
                                });

                                it('should create unique instances of the states', function() {
                                    expect(aboutChildren.post).not.toBe(postsChildren.post);
                                    expect(aboutChildren.comments).not.toBe(postsChildren.comments);

                                    expect(aboutChildren.post.constructor).toBe(postsChildren.post.constructor);
                                    expect(aboutChildren.comments.constructor).toBe(postsChildren.comments.constructor);
                                });

                                it('should create differences in the properties on each instance', function() {
                                    expect(aboutChildren.post.cParent).toBe(c6State.get('About'));
                                    expect(postsChildren.post.cParent).toBe(c6State.get('Posts'));
                                    expect(aboutChildren.comments.cParent).toBe(aboutChildren.post);
                                    expect(postsChildren.comments.cParent).toBe(postsChildren.post);

                                    expect(aboutChildren.post.cName).toBe('about.post');
                                    expect(postsChildren.post.cName).toBe('posts.post');
                                    expect(aboutChildren.comments.cName).toBe('about.post.comments');
                                    expect(postsChildren.comments.cName).toBe('posts.post.comments');

                                    expect(aboutChildren.post.cUrl).toBe('/about/:postId');
                                    expect(postsChildren.post.cUrl).toBe('/posts/:postId');
                                    expect(aboutChildren.comments.cUrl).toBe('/about/:postId/comments');
                                    expect(postsChildren.comments.cUrl).toBe('/posts/:postId/comments');
                                });
                            });

                            describe('specifying a parent state', function() {
                                beforeEach(function() {
                                    c6StateProvider.map('Posts', function() {
                                        this.route('/:postId', 'Posts.Post', function() {
                                            this.route('/comments', 'Posts.Post.Comments', function() {
                                                this.state('Comments.Meta');
                                            });
                                        });
                                    });

                                    c6StateProvider.map(function() {
                                        this.state('About');
                                        this.route('/posts', 'Posts');
                                    });

                                    get();
                                });

                                it('should allow children to be defined under the specified parent', function() {
                                    var postsPost = c6State.get('Posts.Post'),
                                        postsPostComments = c6State.get('Posts.Post.Comments'),
                                        posts = c6State.get('Posts'),
                                        meta = c6State.get('Comments.Meta');

                                    expect(postsPost.cParent).toBe(posts);
                                    expect(postsPostComments.cUrl).toBe('/posts/:postId/comments');
                                    expect(meta.cUrl).toBe('/posts/:postId/comments');
                                });
                            });

                            describe('this.state(state, mapFn)', function() {
                                beforeEach(function() {
                                    c6StateProvider.map(function() {
                                        this.state('About');
                                        this.state('Posts', function() {
                                            this.state('Posts.Post', function() {
                                                this.state('Posts.Post.Comments');
                                            });
                                        });
                                    });

                                    get();
                                });

                                it('should set up relationships between states', function() {
                                    var about = c6State.get('About'),
                                        posts = c6State.get('Posts'),
                                        postsPost = c6State.get('Posts.Post'),
                                        postsPostComments = c6State.get('Posts.Post.Comments'),
                                        application = c6State.get('Application');

                                    expect(about.cParent).toBe(application);
                                    expect(posts.cParent).toBe(application);
                                    expect(postsPost.cParent).toBe(posts);
                                    expect(postsPostComments.cParent).toBe(postsPost);
                                });
                            });

                            describe('this.route(route, state, mapFn)', function() {
                                var about, posts, postsPost, postsPostComments,
                                    postsPostFavs, postsPostFavsStars, application;

                                beforeEach(function() {
                                    c6StateProvider.map(function() {
                                        this.route('/about', 'About');
                                        this.route('/posts', 'Posts', function() {
                                            this.route('/:postId', 'Posts.Post', function() {
                                                this.route('/comments', 'Posts.Post.Comments');
                                                this.state('Posts.Post.Favs', function() {
                                                    this.route('/stars', 'Posts.Post.Favs.Stars');
                                                });
                                            });
                                        });
                                    });

                                    get();

                                    about = c6State.get('About');
                                    posts = c6State.get('Posts');
                                    postsPost = c6State.get('Posts.Post');
                                    postsPostComments = c6State.get('Posts.Post.Comments');
                                    postsPostFavs = c6State.get('Posts.Post.Favs');
                                    postsPostFavsStars = c6State.get('Posts.Post.Favs.Stars');
                                    application = c6State.get('Application');
                                });

                                it('should set up relationships between states', function() {
                                    expect(about.cParent).toBe(application);
                                    expect(posts.cParent).toBe(application);
                                    expect(postsPost.cParent).toBe(posts);
                                    expect(postsPostComments.cParent).toBe(postsPost);
                                });

                                it('should set cUrl to the full URL of the route', function() {
                                    expect(about.cUrl).toBe('/about');
                                    expect(posts.cUrl).toBe('/posts');
                                    expect(postsPost.cUrl).toBe('/posts/:postId');
                                    expect(postsPostComments.cUrl).toBe('/posts/:postId/comments');
                                    expect(postsPostFavs.cUrl).toBe(postsPost.cUrl);
                                    expect(postsPostFavsStars.cUrl).toBe('/posts/:postId/stars');
                                });
                            });

                            describe('this.route() in a context without URL routing', function() {
                                beforeEach(function() {
                                    c6StateProvider.config('foo', {
                                        rootState: 'Posts',
                                        rootView: 'post-view',
                                        enableUrlRouting: false
                                    });
                                });

                                it('should throw an error', function() {
                                    expect(function() {
                                        c6StateProvider.map('foo', null, function() {
                                            this.route('/post', 'Posts.Post');
                                        });
                                    }).toThrow(new Error('Cannot map route "/post" in context "foo". URL Routing is not enabled.'));
                                });
                            });
                        });
                    });
                });
            });

            describe('service', function() {
                it('should exist', function() {
                    expect($injector.get('c6State')).toEqual(jasmine.any(Object));
                });

                describe('scope $events', function() {
                    beforeEach(function() {
                        c6StateProvider
                            .state('Home', function() {})
                            .state('About', function() {})
                            .state('Pages', function() {})
                            .state('Page', function() {})
                            .state('Posts', function() {})
                            .state('Post', function() {})
                            .state('Comments', function() {})
                            .state('Comment', function() {})
                            .state('Meta', function() {})
                            .state('Settings', function() {})
                            .state('General', function() {})
                            .state('User', function() {});

                        c6StateProvider.config({
                            enableUrlRouting: false
                        });

                        c6StateProvider.config('test', {
                            enableUrlRouting: true,
                            rootState: 'Home'
                        });

                        c6StateProvider.map('test', null, function() {
                            this.route('/about', 'About');
                            this.route('/pages', 'Pages', function() {
                                this.route('/:pageId', 'Page');
                            });
                            this.route('/posts', 'Posts', function() {
                                this.route('/:postId', 'Post', function() {
                                    this.route('/comments', 'Comments', function() {
                                        this.state('Meta', function() {
                                            this.route('/:commentId', 'Comment');
                                        });
                                    });
                                });
                            });
                            this.route('/settings', 'Settings', function() {
                                this.route('/', 'General');
                                this.route('/', 'User');
                            });
                        });

                        get();
                    });

                    describe('$locationChangeSuccess', function() {
                        function broadcast(path) {
                            $location.path.and.returnValue(path);
                            $rootScope.$broadcast('$locationChangeSuccess');
                        }

                        beforeEach(function() {
                            spyOn(c6State, 'goTo');
                            $location.path.and.returnValue('');
                            $location.search.and.returnValue({
                                name: 'foo'
                            });
                        });

                        it('should call goTo based on the path', function() {
                            broadcast('');
                            expect(c6State.goTo).toHaveBeenCalledWith('Home', null, $location.search(), true);

                            broadcast('/about');
                            expect(c6State.goTo).toHaveBeenCalledWith('About', null, $location.search(), true);

                            broadcast('/pages');
                            expect(c6State.goTo).toHaveBeenCalledWith('Pages', null, $location.search(), true);

                            broadcast('/pages/p-1234');
                            expect(c6State.goTo).toHaveBeenCalledWith('Page', null, $location.search(), true);

                            broadcast('/posts');
                            expect(c6State.goTo).toHaveBeenCalledWith('Posts', null, $location.search(), true);

                            broadcast('/posts/po-e343f');
                            expect(c6State.goTo).toHaveBeenCalledWith('Post', null, $location.search(), true);

                            broadcast('/posts/po-e343f/comments');
                            expect(c6State.goTo).toHaveBeenCalledWith('Comments', null, $location.search(), true);

                            broadcast('/posts/po-e343f/comments/c-a');
                            expect(c6State.goTo).toHaveBeenCalledWith('Comment', null, $location.search(), true);

                            c6State.goTo.calls.all().forEach(function(call) {
                                expect(call.args[2]).not.toBe($location.search());
                            });
                        });

                        it('should call goTo() with null params if there are no search params', function() {
                            $location.search.and.returnValue({});
                            broadcast('/about');

                            expect(c6State.goTo).toHaveBeenCalledWith('About', null, null, true);
                        });

                        it('should match the error state if the route is not found', function() {
                            broadcast('/dfhs/sdkhf/dsklf');
                            expect(c6State.goTo).toHaveBeenCalledWith('Error', null, $location.search(), true);

                            c6State.goTo.calls.reset();

                            broadcast('/abc/dskfh');
                            expect(c6State.goTo).toHaveBeenCalledWith('Error', null, $location.search(), true);
                        });

                        it('if there are multiple route matches, the first state to be mapped should be preferred', function() {
                            broadcast('/settings/');
                            expect(c6State.goTo).toHaveBeenCalledWith('General', null, $location.search(), true);
                        });

                        it('should not call goTo again if the path hasn\'t changed', function() {
                            var home, about, pages, page;

                            c6State.in('test', function() {
                                home = c6State.get('Home');
                                about = c6State.get('About');
                                pages = c6State.get('Pages');
                                page = c6State.get('Page');
                            });

                            broadcast('/about');
                            expect(c6State.goTo).toHaveBeenCalled();

                            c6State.goTo.calls.reset();

                            _private.syncUrl([home, about]);
                            broadcast('/about');
                            expect(c6State.goTo).not.toHaveBeenCalled();

                            broadcast('/pages/p-abc');
                            expect(c6State.goTo).toHaveBeenCalled();
                            home.cModel = {};
                            pages.cModel = {};
                            page.cModel = { id: 'p-abc' };
                            _private.syncUrl([home, pages, page]);

                            c6State.goTo.calls.reset();

                            broadcast('/pages/p-123');
                            page.cModel = { id: 'p-123' };
                            _private.syncUrl([home, pages, page]);
                            expect(c6State.goTo).toHaveBeenCalled();
                        });

                        it('should null-out the cModel of the states that are changing', function() {
                            var posts, post, comments, comment,
                                postsModel, postModel, commentsModel, commentModel;

                            c6State.in('test', function() {
                                posts = c6State.get('Posts');
                                post = c6State.get('Post');
                                comments = c6State.get('Comments');
                                comment = c6State.get('Comment');
                            });

                            postsModel = posts.cModel = {};
                            postModel = post.cModel = {};
                            commentsModel = comments.cModel = {};
                            commentModel = comment.cModel = {};

                            posts.cParams = {};
                            post.cParams = { postId: 'po-abc' };
                            comments.cParams = {};
                            comment.cParams = { commentId: 'c-abc' };

                            broadcast('/posts/po-abc/comments/c-abc');
                            expect(posts.cModel).toBe(postsModel);
                            expect(post.cModel).toBe(postModel);
                            expect(comments.cModel).toBe(commentsModel);
                            expect(comment.cModel).toBe(commentModel);

                            broadcast('/posts/po-abc/comments/c-123');
                            expect(posts.cModel).toBe(postsModel);
                            expect(post.cModel).toBe(postModel);
                            expect(comments.cModel).toBe(commentsModel);
                            expect(comment.cModel).toBeNull();
                            expect(comment.cParams).toEqual({ commentId: 'c-123' });
                        });
                    });
                });

                describe('@private', function() {
                    describe('methods', function() {
                        describe('syncUrl(states, replace)', function() {
                            var application, posts, auth, post, comment, error;

                            function setup() {
                                get();

                                application = c6State.get('Application');
                                posts = c6State.get('Posts');
                                auth = c6State.get('Auth');
                                post = c6State.get('Post');
                                comment = c6State.get('Comment');
                                error = c6State.get('Error');

                                posts.cModel = [];
                                post.cModel = {
                                    id: 'the-name'
                                };
                                comment.cModel = {
                                    uri: 'blah-blah'
                                };
                            }

                            beforeEach(function() {
                                c6StateProvider
                                    .state('Posts', function() {})
                                    .state('Post', function() {})
                                    .state('Comment', function() {
                                        this.serializeParams = function(model) {
                                            return {
                                                commentUri: model.uri
                                            };
                                        };
                                    })
                                    .state('Auth', function() {});
                            });

                            describe('if the context supports URL routing', function() {
                                beforeEach(function() {
                                    c6StateProvider.map(function() {
                                        this.route('/posts', 'Posts', function() {
                                            this.state('Auth', function() {
                                                this.route('/:postId/content', 'Post', function() {
                                                    this.route('/comments/:commentUri', 'Comment');
                                                });
                                            });
                                        });
                                    });

                                    setup();
                                    error.cModel = {};

                                    spyOn(c6State, 'goTo').and.callThrough();
                                });

                                it('should return a full url for the state family', function() {
                                    expect(_private.syncUrl([application, posts, auth, post, comment])).toBe('/posts/the-name/content/comments/blah-blah');
                                });

                                it('should change the URL path, but not trigger a call to goTo', function() {
                                    $location.path.and.callFake(function(path) {
                                        if (!arguments.length) {
                                            return '';
                                        } else {
                                            $location.path.and.returnValue(path);
                                            $rootScope.$broadcast('$locationChangeSuccess');
                                            return $location;
                                        }
                                    });

                                    _private.syncUrl([application, posts, post, comment]);
                                    expect($location.path).toHaveBeenCalledWith('/posts/the-name/content/comments/blah-blah');
                                    expect(c6State.goTo).not.toHaveBeenCalled();

                                    _private.syncUrl([application]);
                                    expect($location.path).toHaveBeenCalledWith('/');
                                    expect(c6State.goTo).not.toHaveBeenCalled();

                                    expect($location.replace).not.toHaveBeenCalled();
                                });

                                it('should replace the URL if replace is true', function() {
                                    $location.path.and.returnValue($location);

                                    _private.syncUrl([application, posts, post, comment], true);
                                    expect($location.path).toHaveBeenCalledWith('/posts/the-name/content/comments/blah-blah');
                                    expect($location.replace).toHaveBeenCalled();
                                });

                                it('should not change the URL if the final state\'s cUrl is null', function() {
                                    _private.syncUrl([application, error]);
                                    expect($location.path).not.toHaveBeenCalledWith(jasmine.any(String));
                                });

                                it('should not set the path if the path is not changing', function() {
                                    $location.path.and.callFake(function() {
                                        if (!arguments.length) {
                                            return '/posts/p-123/content';
                                        } else {
                                            return $location;
                                        }
                                    });
                                    post.cModel = { id: 'p-123' };
                                    _private.syncUrl([application, posts, post]);

                                    expect($location.path).not.toHaveBeenCalledWith('/posts/p-123/content');
                                });

                                it('should set the cParams on the state', function() {
                                    _private.syncUrl([application, posts, post, comment]);

                                    expect(application.cParams).toEqual({});
                                    expect(posts.cParams).toEqual({});
                                    expect(auth.cParams).toBeNull();
                                    expect(post.cParams).toEqual({ postId: 'the-name' });
                                    expect(comment.cParams).toEqual({ commentUri: 'blah-blah' });
                                });
                            });

                            describe('if the context does not support URL routing', function() {
                                beforeEach(function() {
                                    c6StateProvider.config({
                                        enableUrlRouting: false
                                    });

                                    c6StateProvider.map(function() {
                                        this.state('Posts', function() {
                                            this.state('Post', function() {
                                                this.state('Comment');
                                            });
                                        });
                                    });

                                    setup();
                                });

                                it('should return null', function() {
                                    expect(_private.syncUrl([application, posts, post, comment])).toBeNull();
                                });

                                it('should not change the path', function() {
                                    _private.syncUrl([application, posts, post, comment]);

                                    expect($location.path).not.toHaveBeenCalledWith(jasmine.any(String));
                                });
                            });
                        });

                        describe('renderStates(states)', function() {
                            var application, posts, post,
                                sidebar,
                                applicationView, postsView, postView,
                                sidebarView,
                                success, failure;

                            function ViewDelegate(id, parent) {
                                this.id = id;
                                this.parent = parent;

                                this.renderDeferred = $q.defer();

                                this.render = jasmine.createSpy('view.render()')
                                    .and.returnValue(this.renderDeferred.promise);
                                this.clear = jasmine.createSpy('view.clear()');
                            }

                            beforeEach(function() {
                                success = jasmine.createSpy('success');
                                failure = jasmine.createSpy('failure');

                                application = {
                                    cContext: 'main'
                                };
                                posts = {
                                    cContext: 'main'
                                };
                                post = {
                                    cContext: 'main'
                                };

                                sidebar = {
                                    cContext: 'sidebar'
                                };

                                applicationView = new ViewDelegate(null, null);
                                postsView = new ViewDelegate(null, applicationView);
                                postView = new ViewDelegate(null, postsView);

                                sidebarView = new ViewDelegate('sidebar-view');

                                c6StateProvider.config('sidebar', {
                                    rootView: 'sidebar-view',
                                    rootState: 'Sidebar'
                                });

                                c6StateProvider.state('Sidebar', function() {});

                                get();

                                c6State._registerView(sidebarView);
                                c6State._registerView(applicationView);
                            });

                            describe('backing out of a state', function() {
                                beforeEach(function() {
                                    c6State._registerView(postsView);
                                    c6State._registerView(postView);

                                    $rootScope.$apply(function() {
                                        _private.renderStates([application]);
                                    });
                                });

                                it('should call render() on the application view', function() {
                                    expect(applicationView.render).toHaveBeenCalledWith(application);
                                });

                                describe('when the application view is rendered', function() {
                                    beforeEach(function() {
                                        $rootScope.$apply(function() {
                                            applicationView.renderDeferred.resolve();
                                        });
                                    });

                                    it('should call clear() on the rest of the child views', function() {
                                        [postsView, postView].forEach(function(view) {
                                            expect(view.clear).toHaveBeenCalled();
                                        });
                                    });
                                });
                            });

                            describe('moving into a state', function() {
                                beforeEach(function() {
                                    $rootScope.$apply(function() {
                                        _private.renderStates([application, posts, post]).then(success, failure);
                                    });
                                });

                                it('should render the application state into the application view', function() {
                                    expect(applicationView.render).toHaveBeenCalledWith(application);
                                });

                                describe('after the application view is rendered', function() {
                                    beforeEach(function() {
                                        c6State._registerView(postsView);

                                        $rootScope.$apply(function() {
                                            applicationView.renderDeferred.resolve();
                                        });
                                    });

                                    it('should render the posts view', function() {
                                        expect(postsView.render).toHaveBeenCalledWith(posts);
                                    });

                                    describe('after the posts view is rendered', function() {
                                        beforeEach(function() {
                                            c6State._registerView(postView);

                                            $rootScope.$apply(function() {
                                                postsView.renderDeferred.resolve();
                                            });
                                        });

                                        it('should render the post view', function() {
                                            expect(postView.render).toHaveBeenCalledWith(post);
                                        });

                                        describe('after the post view is rendered', function() {
                                            beforeEach(function() {
                                                $rootScope.$apply(function() {
                                                    postView.renderDeferred.resolve();
                                                });
                                            });

                                            it('should resolve the promise with the family', function() {
                                                expect(success).toHaveBeenCalledWith([application, posts, post]);
                                            });
                                        });
                                    });
                                });
                            });
                        });

                        describe('exitState(current, next)', function() {
                            var application, posts, postsNew, post, comments, pages, page;
                            var success, failure;

                            beforeEach(function() {
                                success = jasmine.createSpy('success');
                                failure = jasmine.createSpy('failure');

                                c6StateProvider
                                    .state('Application', function() {
                                        this.exitDeferred = $q.defer();
                                        this.exit = jasmine.createSpy('state.exit()').and.callFake(function() {
                                            return this.exitDeferred.promise;
                                        });
                                    })
                                        .state('Posts', function() {
                                            this.exitDeferred = $q.defer();
                                            this.exit = jasmine.createSpy('state.exit()').and.callFake(function() {
                                                return this.exitDeferred.promise;
                                            });
                                        })
                                            .state('Post', function() {
                                                this.exitDeferred = $q.defer();
                                                this.exit = jasmine.createSpy('state.exit()').and.callFake(function() {
                                                    return this.exitDeferred.promise;
                                                });
                                            })
                                                .state('Comments', function() {
                                                    this.exitDeferred = $q.defer();
                                                    this.exit = jasmine.createSpy('state.exit()').and.callFake(function() {
                                                        return this.exitDeferred.promise;
                                                    });
                                                })
                                            .state('Posts:New', function() {
                                                this.exitDeferred = $q.defer();
                                                this.exit = jasmine.createSpy('state.exit()').and.callFake(function() {
                                                    return this.exitDeferred.promise;
                                                });
                                            })
                                        .state('Pages', function() {
                                            this.exitDeferred = $q.defer();
                                            this.exit = jasmine.createSpy('state.exit()').and.callFake(function() {
                                                return this.exitDeferred.promise;
                                            });
                                        })
                                            .state('Page', function() {
                                                this.exitDeferred = $q.defer();
                                                this.exit = jasmine.createSpy('state.exit()').and.callFake(function() {
                                                    return this.exitDeferred.promise;
                                                });
                                            });

                                c6StateProvider.map(function() {
                                    this.state('Posts', function() {
                                        this.state('Post', function() {
                                            this.state('Comments');
                                        });
                                        this.state('Posts:New');
                                    });
                                    this.state('Pages', function() {
                                        this.state('Page');
                                    });
                                });

                                get();

                                application = c6State.get('Application');
                                posts = c6State.get('Posts');
                                post = c6State.get('Post');
                                postsNew = c6State.get('Posts:New');
                                comments = c6State.get('Comments');
                                pages = c6State.get('Pages');
                                page = c6State.get('Page');

                                $rootScope.$apply(function() {
                                    _private.exitState(comments, page).then(success, failure);
                                });
                            });

                            it('should call exit on each state that is being exited starting at the child-most state', function() {
                                expect(comments.exit).toHaveBeenCalledWith(page);
                                expect(post.exit).not.toHaveBeenCalled();
                                expect(posts.exit).not.toHaveBeenCalled();

                                $rootScope.$apply(function() {
                                    comments.exitDeferred.resolve();
                                });
                                expect(post.exit).toHaveBeenCalledWith(page);
                                expect(posts.exit).not.toHaveBeenCalled();

                                $rootScope.$apply(function() {
                                    post.exitDeferred.resolve();
                                });
                                expect(posts.exit).toHaveBeenCalledWith(page);

                                expect(success).not.toHaveBeenCalled();
                                $rootScope.$apply(function() {
                                    posts.exitDeferred.resolve();
                                });
                                expect(application.exit).not.toHaveBeenCalled();
                                expect(success).toHaveBeenCalledWith(comments);
                            });

                            describe('if transitioning to a sibling', function() {
                                beforeEach(function() {
                                    success.calls.reset();
                                    failure.calls.reset();

                                    $rootScope.$apply(function() {
                                        _private.exitState(post, postsNew).then(success, failure);
                                    });
                                });

                                it('should only call exit() on the states that are being left', function() {
                                    expect(post.exit).toHaveBeenCalledWith(postsNew);
                                    expect(posts.exit).not.toHaveBeenCalled();
                                    expect(application.exit).not.toHaveBeenCalled();

                                    expect(success).not.toHaveBeenCalled();
                                    $rootScope.$apply(function() {
                                        post.exitDeferred.resolve();
                                    });
                                    expect(posts.exit).not.toHaveBeenCalled();
                                    expect(application.exit).not.toHaveBeenCalled();
                                    expect(success).toHaveBeenCalledWith(post);
                                });
                            });

                            describe('if transitioning to a child', function() {
                                beforeEach(function() {
                                    success.calls.reset();
                                    failure.calls.reset();

                                    $rootScope.$apply(function() {
                                        _private.exitState(posts, post).then(success, failure);
                                    });
                                });

                                it('should succeed', function() {
                                    expect(success).toHaveBeenCalledWith(posts);
                                });
                            });

                            describe('if a state doesn\'t have an exit hook', function() {
                                beforeEach(function() {
                                    delete post.exit;

                                    $rootScope.$apply(function() {
                                        comments.exitDeferred.resolve();
                                    });
                                });

                                it('should be skipped', function() {
                                    expect(posts.exit).toHaveBeenCalledWith(page);
                                });
                            });

                            describe('if the current state is null', function() {
                                beforeEach(function() {
                                    $rootScope.$apply(function() {
                                        _private.exitState(null, postsNew).then(success, failure);
                                    });
                                });

                                it('should fulfill with null', function() {
                                    expect(success).toHaveBeenCalledWith(null);
                                });
                            });
                        });

                        describe('resolveStates(states, params)', function() {
                            var applicationHTML, postsHTML, commentsHTML,
                                application, posts, post, comments,
                                success, failure,
                                params;

                            beforeEach(function() {
                                params = {
                                    test: 'Hello',
                                    foo: 'bar'
                                };

                                success = jasmine.createSpy('success');
                                failure = jasmine.createSpy('failure');

                                applicationHTML = [
                                    '<c6-view></c6-view>'
                                ].join('\n');
                                postsHTML = [
                                    '<ul>',
                                    '    <li>Posts here</li>',
                                    '</ul>'
                                ].join('\n');
                                commentsHTML = [
                                    '<span>Comments here</span>'
                                ].join('\n');

                                $httpBackend.expectGET('assets/views/posts.html')
                                    .respond(200, postsHTML);

                                c6StateProvider
                                    .state('Application', function() {
                                        this.beforeModel = jasmine.createSpy('application.beforeModel()')
                                            .and.returnValue({});
                                        this.model = jasmine.createSpy('application.model()');
                                        this.afterModel = jasmine.createSpy('application.afterModel()');
                                        this.title = jasmine.createSpy('application.title()')
                                            .and.returnValue('My App!');
                                    })
                                    .state('Posts', function($q) {
                                        this.templateUrl = 'assets/views/posts.html';

                                        this.beforeModelDeferred = $q.defer();
                                        this.myModel = {};
                                        this.afterModelDeferred = $q.defer();

                                        this.beforeModel = jasmine.createSpy('posts.beforeModel()')
                                            .and.returnValue(this.beforeModelDeferred.promise);
                                        this.model = jasmine.createSpy('posts.model()')
                                            .and.returnValue($q.when(this.myModel));
                                        this.afterModel = jasmine.createSpy('posts.afterModel()')
                                            .and.returnValue(this.afterModelDeferred.promise);
                                        this.title = jasmine.createSpy('posts.title()')
                                            .and.returnValue('My App: Posts');
                                    })
                                    .state('Post', function() {
                                        this.template = [
                                            '<p>Hello</p>'
                                        ].join('\n');

                                        this.model = jasmine.createSpy('post.model()');
                                    })
                                    .state('Comments', function() {
                                        this.templateUrl = 'assets/views/posts/post/comments.html';

                                        this.model = jasmine.createSpy('comments.model()').and.returnValue({});
                                        this.afterModel = jasmine.createSpy('comments.afterModel()');
                                    });

                                c6StateProvider.map(function() {
                                    this.state('Posts', function() {
                                        this.state('Post', function() {
                                            this.state('Comments');
                                        });
                                    });
                                });

                                get();

                                application = c6State.get('Application');
                                posts = c6State.get('Posts');
                                post = c6State.get('Post');
                                comments = c6State.get('Comments');

                                application.cModel = {};
                                posts.cParams = {
                                    postId: 'foo'
                                };

                                $rootScope.$apply(function() {
                                    _private.resolveStates([application, posts, post, comments], params).then(success, failure);
                                });

                                $httpBackend.flush();
                            });

                            describe('the root state', function() {
                                it('should be resolved', function() {
                                    expect(application.cTemplate).toBe(applicationHTML);
                                    expect(application.beforeModel).not.toHaveBeenCalled();
                                    expect(application.model).not.toHaveBeenCalled();
                                    expect(application.cModel).toEqual({});
                                    expect(application.afterModel).toHaveBeenCalled();
                                    expect(application.title).toHaveBeenCalledWith(application.cModel);
                                    expect(application.cTitle).toBe('My App!');
                                });
                            });

                            describe('the posts state', function() {
                                it('should have a template', function() {
                                    expect(posts.cTemplate).toBe(postsHTML);
                                });

                                it('should resolve the beforeModel hook', function() {
                                    expect(posts.beforeModel).toHaveBeenCalled();
                                });

                                describe('when called again', function() {
                                    beforeEach(function() {
                                        $rootScope.$apply(function() {
                                            posts.beforeModelDeferred.resolve();
                                        });
                                        posts.afterModel.calls.reset();
                                        posts.cModel = null;
                                    });

                                    describe('when already rendered', function() {
                                        beforeEach(function() {
                                            posts.cRendered = true;
                                            $rootScope.$apply(function() {
                                                _private.resolveStates([posts], null);
                                            });
                                        });

                                        it('should not call afterModel()', function() {
                                            expect(posts.afterModel).not.toHaveBeenCalled();
                                        });
                                    });

                                    describe('when not rendered', function() {
                                        beforeEach(function() {
                                            posts.cRendered = false;
                                            $rootScope.$apply(function() {
                                                _private.resolveStates([posts], null);
                                            });
                                        });

                                        it('should call afterModel()', function() {
                                            expect(posts.afterModel).toHaveBeenCalled();
                                        });
                                    });
                                });

                                describe('after beforeModel() resolves', function() {
                                    beforeEach(function() {
                                        expect(posts.model).not.toHaveBeenCalled();

                                        $httpBackend.expectGET(comments.templateUrl)
                                            .respond(200, '');

                                        $rootScope.$apply(function() {
                                            posts.beforeModelDeferred.resolve();
                                        });
                                    });

                                    it('should resolve the model', function() {
                                        expect(posts.model).toHaveBeenCalledWith(extend(posts.cParams, params));
                                    });
                                });

                                describe('after model() resolves', function() {
                                    beforeEach(function() {
                                        $httpBackend.expectGET(comments.templateUrl)
                                            .respond(200, '');

                                        $rootScope.$apply(function() {
                                            posts.beforeModelDeferred.resolve();
                                        });
                                    });

                                    it('should set the cModel', function() {
                                        expect(posts.cModel).toBe(posts.myModel);
                                    });

                                    it('should call afterModel() with the model', function() {
                                        expect(posts.afterModel).toHaveBeenCalledWith(posts.myModel, extend(posts.cParams, params));
                                    });

                                    it('should call the title() hook with the model and assign the result to the cTitle property', function() {
                                        expect(posts.title).toHaveBeenCalledWith(posts.myModel);
                                        expect(posts.cTitle).toBe('My App: Posts');
                                    });

                                    describe('if afterModel() rejects', function() {
                                        beforeEach(function() {
                                            $rootScope.$apply(function() {
                                                posts.afterModelDeferred.reject('I FAILED');
                                            });
                                        });

                                        it('should set the model back to null', function() {
                                            expect(posts.cModel).toBeNull();
                                        });

                                        it('should reject the promise', function() {
                                            expect(failure).toHaveBeenCalledWith('I FAILED');
                                        });
                                    });
                                });
                            });

                            describe('the post state', function() {
                                beforeEach(function() {
                                    expect(post.model).not.toHaveBeenCalled();

                                    $httpBackend.expectGET(comments.templateUrl)
                                        .respond(200, '');

                                    $rootScope.$apply(function() {
                                        posts.beforeModelDeferred.resolve();
                                        posts.afterModelDeferred.resolve();
                                    });
                                });

                                it('should set the template to the cTemplate', function() {
                                    expect(post.cTemplate).toBe(post.template);
                                });

                                it('should resolve the model', function() {
                                    expect(post.model).toHaveBeenCalled();
                                });

                                it('should inherit its parent\'s cTitle', function() {
                                    expect(post.cTitle).toBe(posts.cTitle);
                                });
                            });

                            describe('the comments state', function() {
                                beforeEach(function() {
                                    $httpBackend.expectGET(comments.templateUrl)
                                        .respond(200, commentsHTML);

                                    expect(comments.model).not.toHaveBeenCalled();
                                    expect(comments.afterModel).not.toHaveBeenCalled();

                                    $rootScope.$apply(function() {
                                        posts.beforeModelDeferred.resolve();
                                        posts.afterModelDeferred.resolve();
                                    });

                                    $httpBackend.flush();
                                });

                                it('should setup the cTemplate', function() {
                                    expect(comments.cTemplate).toBe(commentsHTML);
                                });

                                it('should call model()', function() {
                                    expect(comments.model).toHaveBeenCalled();
                                });

                                it('should call afterModel()', function() {
                                    expect(comments.afterModel).toHaveBeenCalledWith({}, params);
                                });

                                it('should inherit its parent\'s cTitle', function() {
                                    expect(comments.cTitle).toBe(post.cTitle);
                                });

                                it('should succeed with the family', function() {
                                    expect(success).toHaveBeenCalledWith([application, posts, post, comments]);
                                });
                            });
                        });
                    });
                });

                describe('@public', function() {
                    describe('properties', function() {
                        beforeEach(function() {
                            get();
                        });

                        describe('current', function() {
                            it('should start as null', function() {
                                expect(c6State.current).toBeNull();
                            });

                            it('should not be settable', function() {
                                expect(function() {
                                    c6State.current = 'foo';
                                }).toThrow();
                            });
                        });
                    });

                    describe('methods', function() {
                        describe('isActive', function() {
                            beforeEach(function() {
                                c6StateProvider
                                    .state('Posts', function() {})
                                    .state('Post', function() {})
                                    .state('Comments', function() {})
                                    .state('About', function() {});

                                c6StateProvider.map(function() {
                                    this.state('About');
                                    this.state('Posts', function() {
                                        this.state('Post', function() {
                                            this.state('Comments');
                                        });
                                    });
                                });

                                get();
                            });

                            it('should be true if the provided state is in the current state\'s family', function() {
                                var current = jasmine.createSpy('c6State.current').and.returnValue('Application');

                                Object.defineProperty(c6State, 'current', {
                                    get: current
                                });

                                expect(c6State.isActive(c6State.get('Application'))).toBe(true);
                                expect(c6State.isActive(c6State.get('About'))).toBe(false);

                                current.and.returnValue('Comments');
                                expect(c6State.isActive(c6State.get('Comments'))).toBe(true);
                                expect(c6State.isActive(c6State.get('Posts'))).toBe(true);
                                expect(c6State.isActive(c6State.get('About'))).toBe(false);
                            });
                        });

                        describe('_registerView(viewDelegate)', function() {
                            var parentView, childView, sidebarView;

                            beforeEach(function() {
                                parentView = {
                                    id: null,
                                    parent: null
                                };

                                childView = {
                                    id: null,
                                    parent: parentView
                                };

                                sidebarView = {
                                    id: 'sidebar',
                                    parent: null
                                };

                                c6StateProvider
                                    .state('Sidebar', function() {})
                                    .state('Parent', function() {})
                                    .state('Child', function() {});

                                c6StateProvider.config('sidebar', {
                                    rootView: 'sidebar',
                                    rootState: 'Sidebar'
                                });

                                c6StateProvider.map(function() {
                                    this.state('Parent', function() {
                                        this.route('/child', 'Child');
                                    });
                                });

                                get();
                                $location.path.and.returnValue('/child');
                                $location.search.and.returnValue({});
                                spyOn(c6State, 'goTo');
                            });

                            it('should goTo the state of the current path when the rootView of the URL-routed context is registered', function() {
                                c6State._registerView(sidebarView);
                                expect(c6State.goTo).not.toHaveBeenCalled();

                                c6State._registerView(parentView);
                                expect(c6State.goTo).toHaveBeenCalledWith('Child', null, null, true);

                                c6State.goTo.calls.reset();

                                c6State._registerView(childView);
                                expect(c6State.goTo).not.toHaveBeenCalled();
                            });

                            it('should only goTo the state once if a $locationChangeSuccess is fired', function() {
                                c6State._registerView(parentView);
                                $rootScope.$emit('$locationChangeSuccess');

                                expect(c6State.goTo).toHaveBeenCalledWith('Child', null, null, true);
                                expect(c6State.goTo.calls.count()).toBe(1);
                            });
                        });

                        describe('_deregisterView(viewDelegate)', function() {
                            var parentView, childView,
                                failure;

                            beforeEach(function() {
                                var application = c6State.get('Application'),
                                    child = c6State.get('Child');

                                failure = jasmine.createSpy('failure()');

                                parentView = {
                                    id: null,
                                    parent: null,
                                    render: function() {}
                                };
                                childView = {
                                    id: null,
                                    parent: parentView,
                                    render: function() {}
                                };

                                c6StateProvider.state('Child', function() {});

                                c6StateProvider.map(function() {
                                    this.state('Child');
                                });

                                get();

                                c6State._registerView(parentView);
                                c6State._registerView(childView);

                                c6State._deregisterView(childView);

                                $rootScope.$apply(function() {
                                    _private.renderStates([application, child]).catch(failure);
                                });
                            });

                            it('should remove references to the view delegate', function() {
                                expect(failure).toHaveBeenCalled();
                            });
                        });

                        describe('goTo(state, models, params, replace)', function() {
                            var success, failure,
                                exitStateDeferred, resolveStatesDeferred, renderStatesDeferred,
                                application, home, about,
                                stateChange;

                            beforeEach(function() {
                                stateChange = jasmine.createSpy('stateChange()');

                                exitStateDeferred = $q.defer();
                                resolveStatesDeferred = $q.defer();
                                renderStatesDeferred = $q.defer();

                                c6StateProvider.config('foo', {
                                    rootState: 'Foo'
                                });

                                c6StateProvider
                                    .state('Foo', function() {})
                                    .state('Home', function() {
                                        this.enter = jasmine.createSpy('home.enter()');
                                    })
                                    .state('About', function() {
                                        this.enter = jasmine.createSpy('about.enter()');
                                    })
                                    .map(function() {
                                        this.state('Home', function() {
                                            this.state('About');
                                        });
                                    });

                                get();

                                c6State.on('stateChange', stateChange);

                                spyOn(_private, 'exitState')
                                    .and.returnValue(exitStateDeferred.promise);
                                spyOn(_private, 'resolveStates')
                                    .and.returnValue(resolveStatesDeferred.promise);
                                spyOn(_private, 'renderStates')
                                    .and.returnValue(renderStatesDeferred.promise);
                                spyOn(_private, 'syncUrl')
                                    .and.returnValue('/foo/bar/okay');

                                success = jasmine.createSpy('success()');
                                failure = jasmine.createSpy('failure()');

                                application = c6State.get('Application');
                                home = c6State.get('Home');
                                about = c6State.get('About');
                            });

                            it('should wait for other goTo calls to finish before start a new one', function() {
                                exitStateDeferred.resolve(null);
                                $rootScope.$apply(function() {
                                    c6State.goTo('Home');
                                });

                                expect(_private.resolveStates).toHaveBeenCalledWith([application, home], null);

                                $rootScope.$apply(function() {
                                    c6State.goTo('About');
                                });

                                expect(_private.resolveStates.calls.count()).toBe(1);

                                $rootScope.$apply(function() {
                                    resolveStatesDeferred.resolve([application, home]);
                                    renderStatesDeferred.resolve([application, home]);
                                });
                                $timeout.flush();

                                expect(_private.resolveStates.calls.count()).toBe(2);
                                expect(_private.resolveStates).toHaveBeenCalledWith([application, home, about], null);
                            });

                            describe('if called with only a state name', function() {
                                beforeEach(function() {
                                    $rootScope.$apply(function() {
                                        c6State.goTo('About').then(success, failure);
                                    });
                                });

                                it('should exit the current state', function() {
                                    expect(_private.exitState).toHaveBeenCalledWith(null, c6State.get('About'));
                                });

                                describe('when the state is exited', function() {
                                    beforeEach(function() {
                                        expect(_private.resolveStates).not.toHaveBeenCalled();

                                        $rootScope.$apply(function() {
                                            exitStateDeferred.resolve(null);
                                        });
                                    });

                                    it('should resolve the state', function() {
                                        expect(_private.resolveStates).toHaveBeenCalledWith([application, home, about], null);
                                    });

                                    describe('when the states are resolved', function() {
                                        beforeEach(function() {
                                            expect(_private.renderStates).not.toHaveBeenCalled();

                                            $rootScope.$apply(function() {
                                                resolveStatesDeferred.resolve([application, home, about]);
                                            });
                                        });

                                        it('should render the states', function() {
                                            expect(_private.renderStates).toHaveBeenCalledWith([application, home, about]);
                                        });

                                        describe('when the states are rendered', function() {
                                            beforeEach(function() {
                                                $rootScope.$apply(function() {
                                                    renderStatesDeferred.resolve([application, home, about]);
                                                });
                                            });

                                            it('should sync the URL', function() {
                                                expect(_private.syncUrl).toHaveBeenCalledWith([application, home, about], false);
                                            });

                                            describe('in the next $digest()', function() {
                                                beforeEach(function() {
                                                    $timeout.flush();
                                                });

                                                it('should resolve to the state being transitioned to', function() {
                                                    expect(success).toHaveBeenCalledWith(about);
                                                });

                                                it('should not update the query params', function() {
                                                    expect($location.search).not.toHaveBeenCalled();
                                                });

                                                it('should emit the stateChange event', function() {
                                                    expect(stateChange).toHaveBeenCalledWith(about, null);

                                                    $rootScope.$apply(function() {
                                                        c6State.goTo('Application');
                                                    });
                                                    $timeout.flush();

                                                    expect(stateChange).toHaveBeenCalledWith(application, about);
                                                });

                                                it('should call the enter() hook on the state', function() {
                                                    expect(about.enter).toHaveBeenCalled();
                                                });

                                                it('should set the "current" property', function() {
                                                    expect(c6State.current).toBe(about.cName);
                                                    c6State.in('foo', function() {
                                                        expect(c6State.current).toBeNull();
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });

                            describe('if called with models', function() {
                                var aboutModel, homeModel;

                                beforeEach(function() {
                                    aboutModel = {};
                                    homeModel = {};

                                    $rootScope.$apply(function() {
                                        c6State.goTo('About', [homeModel, aboutModel]).then(success, failure);
                                    });
                                });

                                it('should set the cModel on the state', function() {
                                    expect(home.cModel).toBe(homeModel);
                                    expect(about.cModel).toBe(aboutModel);
                                });
                            });

                            describe('if called with query params', function() {
                                beforeEach(function() {
                                    exitStateDeferred.resolve(null);
                                    _private.resolveStates.calls.reset();

                                    $location.search.and.returnValue($location);

                                    $rootScope.$apply(function() {
                                        c6State.goTo('About', null, {
                                            hello: 'foo',
                                            test: 'bar'
                                        });

                                        resolveStatesDeferred.resolve([application, about]);
                                        renderStatesDeferred.resolve([application, about]);
                                    });
                                    $timeout.flush();
                                });

                                it('should call resolveStates with the params', function() {
                                    expect(_private.resolveStates).toHaveBeenCalledWith([application, home, about], {
                                        hello: 'foo',
                                        test: 'bar'
                                    });
                                });

                                it('should update the query params', function() {
                                    expect($location.search).toHaveBeenCalledWith({
                                        hello: 'foo',
                                        test: 'bar'
                                    });
                                });

                                it('should replace the $location', function() {
                                    expect($location.replace).toHaveBeenCalled();
                                });
                            });

                            describe('if called with replace as true', function() {
                                beforeEach(function() {
                                    $rootScope.$apply(function() {
                                        exitStateDeferred.resolve(null);
                                        _private.syncUrl.calls.reset();

                                        c6State.goTo('About', null, null, true);

                                        resolveStatesDeferred.resolve([application, about]);
                                        renderStatesDeferred.resolve([application, about]);
                                    });
                                });

                                it('should sync the url with replace as true', function() {
                                    expect(_private.syncUrl).toHaveBeenCalledWith([application, about], true);
                                });
                            });

                            describe('if already on a state', function() {
                                beforeEach(function() {
                                    Object.defineProperty(c6State, 'current', {
                                        value: 'Application'
                                    });
                                    _private.exitState.calls.reset();

                                    $rootScope.$apply(function() {
                                        c6State.goTo('About');
                                    });
                                });

                                it('should call exitState() with the current state and new state', function() {
                                    expect(_private.exitState).toHaveBeenCalledWith(c6State.get(c6State.current), c6State.get('About'));
                                });
                            });
                        });

                        describe('$emitThroughStates()', function() {
                            var scope1, scope2, scope3;

                            beforeEach(function() {
                                scope1 = $rootScope.$new();
                                scope2 = scope1.$new();
                                scope3 = scope2.$new();

                                [scope1, scope2, scope3].forEach(function(scope) {
                                    c6State._registerView({
                                        scope: scope,
                                        id: null
                                    });
                                });
                                c6State._registerView({
                                    scope: null,
                                    id: null
                                });

                                spyOn(scope3, '$emit').and.callThrough();
                                spyOn(c6State, '$emitThroughStates').and.callThrough();

                                $rootScope.$apply(function() {
                                    c6State.$emitThroughStates('foo', {}, { name: 'Josh' });
                                });
                            });

                            it('should call $emit on the child-most state\'s scope', function() {
                                expect(scope3.$emit).toHaveBeenCalled();
                                expect(scope3.$emit.calls.mostRecent().args).toEqual(c6State.$emitThroughStates.calls.mostRecent().args);
                            });
                        });

                       describe('get(nameOrConstructorName)', function() {
                            var Home, Sidebar, Contacts,
                                home, sidebar, contacts, post;

                            beforeEach(function() {
                                Home = [function() {}];
                                Sidebar = [function() {}];
                                Contacts = [function() {}];

                                c6StateProvider.config('sidebar', {
                                    rootState: 'Sidebar'
                                });

                                c6StateProvider.map(function() {
                                    this.state('Home');
                                    this.route('/posts/:postId', 'Post');
                                });

                                c6StateProvider.map('sidebar', null, function() {
                                    this.state('Contacts');
                                });

                                c6StateProvider.state('Home', Home);
                                c6StateProvider.state('Post', function() {});
                                c6StateProvider.state('Sidebar', Sidebar);
                                c6StateProvider.state('Contacts', Contacts);
                            });

                            describe('when called with the name of a constructor', function() {
                                var NewPage, EditPage,
                                    Page, PageCopy, PageMeta;

                                function setCurrent(name) {
                                    Object.defineProperty(c6State, 'current', { value: name });
                                }

                                beforeEach(function() {
                                    NewPage = function() {};
                                    EditPage = function() {};

                                    Page = function() {};
                                    PageCopy = function() {};
                                    PageMeta = function() {};

                                    c6StateProvider
                                        .state('NewPage', NewPage)
                                        .state('EditPage', EditPage)

                                        .state('Page', Page)
                                        .state('PageCopy', PageCopy)
                                        .state('PageMeta', PageMeta);

                                    c6StateProvider.map(function() {
                                        this.state('NewPage', function() {
                                            this.state('Page', 'New:Page', function() {
                                                this.state('PageCopy', 'New:PageCopy');
                                                this.state('PageMeta', 'New:PageMeta');
                                            });
                                        });

                                        this.state('EditPage', function() {
                                            this.state('Page', 'Edit:Page', function() {
                                                this.state('PageCopy', 'Edit:PageCopy');
                                                this.state('PageMeta', 'Edit:PageMeta', function() {
                                                    this.state('Page', 'Meta:Page');
                                                });
                                            });
                                        });
                                    });

                                    get();
                                });

                                it('should get the instance of that constructor closest to the current state', function() {
                                    setCurrent('NewPage');
                                    expect(c6State.get('Page')).toBe(c6State.get('New:Page'));
                                    expect(c6State.get('PageCopy')).toBe(c6State.get('New:PageCopy'));
                                    expect(c6State.get('PageMeta')).toBe(c6State.get('New:PageMeta'));

                                    setCurrent('New:Page');
                                    expect(c6State.get('Page')).toBe(c6State.get('New:Page'));
                                    expect(c6State.get('PageCopy')).toBe(c6State.get('New:PageCopy'));
                                    expect(c6State.get('PageMeta')).toBe(c6State.get('New:PageMeta'));

                                    setCurrent('New:PageCopy');
                                    expect(c6State.get('Page')).toBe(c6State.get('New:Page'));
                                    expect(c6State.get('PageCopy')).toBe(c6State.get('New:PageCopy'));
                                    expect(c6State.get('PageMeta')).toBe(c6State.get('New:PageMeta'));

                                    setCurrent('EditPage');
                                    expect(c6State.get('Page')).toBe(c6State.get('Edit:Page'));
                                    expect(c6State.get('PageCopy')).toBe(c6State.get('Edit:PageCopy'));
                                    expect(c6State.get('PageMeta')).toBe(c6State.get('Edit:PageMeta'));

                                    setCurrent('Edit:Page');
                                    expect(c6State.get('Page')).toBe(c6State.get('Edit:Page'));
                                    expect(c6State.get('PageCopy')).toBe(c6State.get('Edit:PageCopy'));
                                    expect(c6State.get('PageMeta')).toBe(c6State.get('Edit:PageMeta'));

                                    setCurrent('Edit:PageMeta');
                                    expect(c6State.get('Page')).toBe(c6State.get('Meta:Page'));
                                    expect(c6State.get('PageCopy')).toBe(c6State.get('Edit:PageCopy'));
                                    expect(c6State.get('PageMeta')).toBe(c6State.get('Edit:PageMeta'));
                                });
                            });

                            describe('the auto-generated Error state', function() {
                                it('should be gettable', function() {
                                    var error = get().get('Error');

                                    expect(error).toEqual(jasmine.objectContaining({
                                        cModel: null,
                                        cParent: c6State.get('Application'),
                                        cUrl: null,
                                        cName: 'Error',
                                        cParams: null,
                                        cRendered: false
                                    }));
                                });
                            });

                            describe('the auto-generated Application state', function() {
                                it('should be gettable', function() {
                                    var application = get().get('Application');

                                    expect(application.cModel).toBeNull();
                                    expect(application.cParent).toBeNull();
                                    expect(application.cUrl).toBe('/');
                                    expect(application.cContext).toBe('main');
                                    expect(application.cName).toBe('Application');
                                    expect(application.cParams).toEqual({});
                                    expect(application.cRendered).toBe(false);
                                    expect(application.cTitle).toBeNull();
                                });

                                it('should be overwriteable', function() {
                                    var application;

                                    c6StateProvider.state('Application', [function() {
                                        this.templateUrl = 'assets/views/app.html';
                                    }]);

                                    application = get().get('Application');

                                    expect(application.templateUrl).toBe('assets/views/app.html');
                                    expect(application.cModel).toBeNull();
                                    expect(application.cUrl).toBe('/');
                                    expect(application.cTemplate).toBeNull();
                                    expect(application.cContext).toBe('main');
                                });
                            });

                            describe('normal states', function() {
                                beforeEach(function() {
                                    get();

                                    home = c6State.get('Home');
                                    post = c6State.get('Post');
                                });

                                it('should be an instance of the provided constructor', function() {
                                    expect(home).toEqual(jasmine.any(Home[0]));
                                });

                                it('should be decorated with properties', function() {
                                    expect(home.cModel).toBeNull();
                                    expect(home.cParent).toBe(c6State.get('Application'));
                                    expect(home.cUrl).toBe('/');
                                    expect(home.cTemplate).toBeNull();
                                    expect(home.cContext).toBe('main');
                                    expect(home.cName).toBe('Home');
                                    expect(home.cParams).toBeNull();
                                    expect(home.cRendered).toBe(false);
                                    expect(home.cTitle).toBeNull();
                                });

                                it('should return the same instance', function() {
                                    var home2 = c6State.get('Home');

                                    expect(home).toBe(home2);
                                });

                                it('should be context-aware', function() {
                                    sidebar = c6State.get('Sidebar');
                                    contacts = c6State.get('Contacts');

                                    expect(sidebar).toBeUndefined();
                                    expect(contacts).toBeUndefined();

                                    c6State.in('sidebar', function() {
                                        sidebar = c6State.get('Sidebar');
                                        contacts = c6State.get('Contacts');
                                    });

                                    expect(sidebar).toEqual(jasmine.any(Sidebar[0]));
                                    expect(contacts).toEqual(jasmine.any(Contacts[0]));
                                    expect(sidebar.cContext).toBe('sidebar');
                                    expect(contacts.cContext).toBe('sidebar');
                                });

                                it('should set the cParams based on the dynamic segments of the URL', function() {
                                    expect(post.cParams).toEqual({ postId: null });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}());
