(function() {
    'use strict';

    define(['c6_state'], function() {
        ddescribe('c6State', function() {
            var c6StateProvider,
                c6State,
                $rootScope,
                $httpBackend,
                $q;

            var _private;

            beforeEach(function() {
                module('c6.state', function($injector) {
                    c6StateProvider = $injector.get('c6StateProvider');
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    c6State = $injector.get('c6State');
                    $httpBackend = $injector.get('$httpBackend');
                    $q = $injector.get('$q');
                });

                _private = c6State._private;
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
                                    });

                                    it('should make the root state\'s cUrl null', function() {
                                        c6State.in('foo', function() {
                                            expect(c6State.get('Main').cUrl).toBeNull();
                                        });
                                    });
                                });

                                describe('if enableUrlRouting is already true in another context', function() {
                                    beforeEach(function() {
                                        c6StateProvider.config({
                                            enableUrlRouting: false
                                        });

                                        c6StateProvider.config('one', {
                                            enableUrlRouting: true
                                        });

                                        c6StateProvider.config('two', {
                                            enableUrlRouting: false
                                        });
                                    });

                                    it('should throw an error if set to true as well', function() {
                                        expect(function() {
                                            c6StateProvider.config('three', {
                                                enableUrlRouting: true
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

                                    application = c6State.get('Application');

                                    expect(application.cUrl).toBeNull();
                                });

                                it('should apply to the main context if called with just an object', function() {
                                    c6StateProvider.config({
                                        enableUrlRouting: false,
                                    });

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
                                });

                                it('should allow children to be defined under the specified parent', function() {
                                    var postsPost = c6State.get('Posts.Post'),
                                        posts = c6State.get('Posts');

                                    expect(postsPost.cParent).toBe(posts);
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
                    expect(c6State).toEqual(jasmine.any(Object));
                });

                describe('@private', function() {
                    describe('methods', function() {
                        describe('syncUrl(states)', function() {
                            var application, posts, post, comment;

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
                                    });

                                c6StateProvider.map(function() {
                                    this.route('/posts', 'Posts', function() {
                                        this.route('/:postId/content', 'Post', function() {
                                            this.route('/comments/:commentUri', 'Comment');
                                        });
                                    });
                                });

                                application = c6State.get('Application');
                                posts = c6State.get('Posts');
                                post = c6State.get('Post');
                                comment = c6State.get('Comment');

                                posts.cModel = [];
                                post.cModel = {
                                    id: 'the-name'
                                };
                                comment.cModel = {
                                    uri: 'blah-blah'
                                };
                            });

                            it('should return a full url for the state family', function() {
                                expect(_private.syncUrl([application, posts, post, comment])).toBe('/posts/the-name/content/comments/blah-blah');
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
                                    rootView: 'sidebar-view'
                                });

                                c6State._registerView(sidebarView);
                                c6State._registerView(applicationView);

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

                                application = c6State.get('Application');
                                posts = c6State.get('Posts');
                                post = c6State.get('Post');
                                comments = c6State.get('Comments');

                                application.cModel = {};

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
                                        expect(posts.model).toHaveBeenCalled();
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
                        describe('goTo(state, models, params)', function() {
                            var success, failure,
                                resolveStatesDeferred, renderStatesDeferred,
                                application, home, about;

                            beforeEach(function() {
                                resolveStatesDeferred = $q.defer();
                                renderStatesDeferred = $q.defer();

                                spyOn(_private, 'resolveStates')
                                    .and.returnValue(resolveStatesDeferred.promise);
                                spyOn(_private, 'renderStates')
                                    .and.returnValue(renderStatesDeferred.promise);

                                success = jasmine.createSpy('success()');
                                failure = jasmine.createSpy('failure()');

                                c6StateProvider
                                    .state('Home', function() {

                                    })
                                    .state('About', function() {

                                    })
                                    .map(function() {
                                        this.state('Home', function() {
                                            this.state('About');
                                        });
                                    });

                                application = c6State.get('Application');
                                home = c6State.get('Home');
                                about = c6State.get('About');
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

                                        it('should resolve to the state being transitioned to', function() {
                                            expect(success).toHaveBeenCalledWith(about);
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
                        });

                        describe('get(state)', function() {
                            var Home, Sidebar, Contacts,
                                home, sidebar, contacts;

                            beforeEach(function() {
                                Home = [function() {}];
                                Sidebar = [function() {}];
                                Contacts = [function() {}];

                                c6StateProvider.state('Home', Home);
                                c6StateProvider.state('Sidebar', Sidebar);
                                c6StateProvider.state('Contacts', Contacts);

                                c6StateProvider.config('sidebar', {
                                    rootState: 'Sidebar'
                                });

                                c6StateProvider.map(function() {
                                    this.state('Home');
                                });

                                c6StateProvider.map('sidebar', null, function() {
                                    this.state('Contacts');
                                });
                            });

                            describe('the auto-generated Application state', function() {
                                it('should be gettable', function() {
                                    var application = c6State.get('Application');

                                    expect(application.cModel).toBeNull();
                                    expect(application.cParent).toBeNull();
                                    expect(application.cUrl).toBe('');
                                    expect(application.cContext).toBe('main');
                                });

                                it('should be overwriteable', function() {
                                    var application;

                                    c6StateProvider.state('Application', [function() {
                                        this.templateUrl = 'assets/views/app.html';
                                    }]);

                                    application = c6State.get('Application');

                                    expect(application.templateUrl).toBe('assets/views/app.html');
                                    expect(application.cModel).toBeNull();
                                    expect(application.cUrl).toBe('');
                                    expect(application.cTemplate).toBeNull();
                                    expect(application.cContext).toBe('main');
                                });
                            });

                            describe('normal states', function() {
                                beforeEach(function() {
                                    home = c6State.get('Home');
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
                            });
                        });
                    });
                });
            });
        });
    });
}());
