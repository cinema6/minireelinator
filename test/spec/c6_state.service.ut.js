(function() {
    'use strict';

    define(['c6_state'], function() {
        ddescribe('c6State', function() {
            var c6StateProvider,
                c6State;

            beforeEach(function() {
                module('c6.state', function($injector) {
                    c6StateProvider = $injector.get('c6StateProvider');
                });

                inject(function($injector) {
                    c6State = $injector.get('c6State');
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
                            });
                        });

                        describe('map(fn)', function() {
                            beforeEach(function() {
                                c6StateProvider
                                    .state('About', [function() {}])
                                    .state('Posts', [function() {}])
                                    .state('Posts.Post', [function() {}])
                                    .state('Posts.Post.Comments', [function() {}]);
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
                                var about, posts, postsPost, postsPostComments, application;

                                beforeEach(function() {
                                    c6StateProvider.map(function() {
                                        this.route('/about', 'About');
                                        this.route('/posts', 'Posts', function() {
                                            this.route('/:postId', 'Posts.Post', function() {
                                                this.route('/comments', 'Posts.Post.Comments');
                                            });
                                        });
                                    });

                                    about = c6State.get('About');
                                    posts = c6State.get('Posts');
                                    postsPost = c6State.get('Posts.Post');
                                    postsPostComments = c6State.get('Posts.Post.Comments');
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

                describe('@public', function() {
                    describe('methods', function() {
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
                                    expect(home.cUrl).toBeNull();
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
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}());
