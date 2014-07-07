(function() {
    'use strict';

    define(['c6_state'], function(c6StateModule) {
        ddescribe('c6State', function() {
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
                        search: jasmine.createSpy('$location.search()'),
                        replace: jasmine.createSpy('$location.replace()')
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

                                    it('should make the root state\'s cUrl \'\'', function() {
                                        c6State.in('foo', function() {
                                            expect(c6State.get('Main').cUrl).toBe('');
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
                                    .state('Posts.Post.Favs.Stars', [function() {}]);
                            });

                            describe('specifying a parent state', function() {
                                beforeEach(function() {
                                    c6StateProvider.map(function() {
                                        this.state('About');
                                        this.route('/posts', 'Posts');
                                    });

                                    c6StateProvider.map('Posts', function() {
                                        this.route('/:postId', 'Posts.Post', function() {
                                            this.route('/comments', 'Posts.Post.Comments');
                                        });
                                    });

                                    get();
                                });

                                it('should allow children to be defined under the specified parent', function() {
                                    var postsPost = c6State.get('Posts.Post'),
                                        postsPostComments = c6State.get('Posts.Post.Comments'),
                                        posts = c6State.get('Posts');

                                    expect(postsPost.cParent).toBe(posts);
                                    expect(postsPostComments.cUrl).toBe('/posts/:postId/comments');
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
                            expect(c6State.goTo).toHaveBeenCalledWith('Home', null, $location.search());

                            broadcast('/about');
                            expect(c6State.goTo).toHaveBeenCalledWith('About', null, $location.search());

                            broadcast('/pages');
                            expect(c6State.goTo).toHaveBeenCalledWith('Pages', null, $location.search());

                            broadcast('/pages/p-1234');
                            expect(c6State.goTo).toHaveBeenCalledWith('Page', null, $location.search());

                            broadcast('/posts');
                            expect(c6State.goTo).toHaveBeenCalledWith('Posts', null, $location.search());

                            broadcast('/posts/po-e343f');
                            expect(c6State.goTo).toHaveBeenCalledWith('Post', null, $location.search());

                            broadcast('/posts/po-e343f/comments');
                            expect(c6State.goTo).toHaveBeenCalledWith('Comments', null, $location.search());

                            broadcast('/posts/po-e343f/comments/c-a');
                            expect(c6State.goTo).toHaveBeenCalledWith('Comment', null, $location.search());
                        });

                        it('if there are multiple route matches, the first state to be mapped should be preferred', function() {
                            broadcast('/settings/');
                            expect(c6State.goTo).toHaveBeenCalledWith('General', null, $location.search());
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
                        describe('syncUrl(states)', function() {
                            var application, posts, auth, post, comment;

                            function setup() {
                                get();

                                application = c6State.get('Application');
                                posts = c6State.get('Posts');
                                auth = c6State.get('Auth');
                                post = c6State.get('Post');
                                comment = c6State.get('Comment');

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

                        describe('resolveStates(states)', function() {
                            var applicationHTML, postsHTML, commentsHTML,
                                application, posts, post, comments,
                                success, failure;

                            beforeEach(function() {
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
                                    })
                                    .state('Post', function() {
                                        this.template = [
                                            '<p>Hello</p>'
                                        ].join('\n');

                                        this.model = jasmine.createSpy('post.model()');
                                    })
                                    .state('Comments', function() {
                                        this.templateUrl = 'assets/views/posts/post/comments.html';

                                        this.model = jasmine.createSpy('comments.model()');
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
                                    _private.resolveStates([application, posts, post, comments]).then(success, failure);
                                });

                                $httpBackend.flush();
                            });

                            describe('the root state', function() {
                                it('should be resolved', function() {
                                    expect(application.cTemplate).toBe(applicationHTML);
                                    expect(application.beforeModel).toHaveBeenCalled();
                                    expect(application.model).not.toHaveBeenCalled();
                                    expect(application.cModel).toEqual({});
                                });
                            });

                            describe('the posts state', function() {
                                it('should have a template', function() {
                                    expect(posts.cTemplate).toBe(postsHTML);
                                });

                                it('should resolve the beforeModel hook', function() {
                                    expect(posts.beforeModel).toHaveBeenCalled();
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
                                        expect(posts.model).toHaveBeenCalledWith(posts.cParams);
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
                                        expect(posts.afterModel).toHaveBeenCalledWith(posts.myModel);
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
                                    expect(comments.afterModel).toHaveBeenCalledWith(undefined);
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
                                expect(c6State.goTo).toHaveBeenCalledWith('Child', null, {});

                                c6State.goTo.calls.reset();

                                c6State._registerView(childView);
                                expect(c6State.goTo).not.toHaveBeenCalled();
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

                        describe('goTo(state, models, params)', function() {
                            var success, failure,
                                resolveStatesDeferred, renderStatesDeferred,
                                application, home, about,
                                stateChange;

                            beforeEach(function() {
                                stateChange = jasmine.createSpy('stateChange()');

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
                                $rootScope.$apply(function() {
                                    c6State.goTo('Home');
                                });

                                expect(_private.resolveStates).toHaveBeenCalledWith([application, home]);

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
                                expect(_private.resolveStates).toHaveBeenCalledWith([application, home, about]);
                            });

                            describe('if called with only a state name', function() {
                                beforeEach(function() {
                                    $rootScope.$apply(function() {
                                        c6State.goTo('About').then(success, failure);
                                    });
                                });

                                it('should resolve the state', function() {
                                    expect(_private.resolveStates).toHaveBeenCalledWith([application, home, about]);
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
                                            expect(_private.syncUrl).toHaveBeenCalledWith([application, home, about]);
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
                        });

                        describe('get(state)', function() {
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

                            describe('the auto-generated Application state', function() {
                                it('should be gettable', function() {
                                    var application = get().get('Application');

                                    expect(application.cModel).toBeNull();
                                    expect(application.cParent).toBeNull();
                                    expect(application.cUrl).toBe('');
                                    expect(application.cContext).toBe('main');
                                    expect(application.cName).toBe('Application');
                                    expect(application.cParams).toEqual({});
                                });

                                it('should be overwriteable', function() {
                                    var application;

                                    c6StateProvider.state('Application', [function() {
                                        this.templateUrl = 'assets/views/app.html';
                                    }]);

                                    application = get().get('Application');

                                    expect(application.templateUrl).toBe('assets/views/app.html');
                                    expect(application.cModel).toBeNull();
                                    expect(application.cUrl).toBe('');
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
                                    expect(home.cUrl).toBe('');
                                    expect(home.cTemplate).toBeNull();
                                    expect(home.cContext).toBe('main');
                                    expect(home.cName).toBe('Home');
                                    expect(home.cParams).toBeNull();
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
