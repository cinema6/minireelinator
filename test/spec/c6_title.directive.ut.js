define(['c6_state'], function(c6StateModule) {
    'use strict';

    describe('<c6-title>', function() {
        var $rootScope,
            $compile,
            c6State,
            $scope,
            $c6Title;

        var application, home, about,
            main;

        function setCurrent(name) {
            Object.defineProperty(c6State, 'current', {
                configurable: true,
                get: function() {
                    return name;
                }
            });
        }

        beforeEach(function() {
            module('ng', function($provide) {
                $provide.value('$location', {
                    absUrl: function() {
                        return window.location.href;
                    }
                });
            });

            module(c6StateModule.name);
            module(function(c6StateProvider) {
                c6StateProvider.config({
                    rootState: 'Main',
                    rootView: null,
                    enableUrlRouting: false
                });

                c6StateProvider.config('foo', {
                    enableUrlRouting: true,
                    rootState: 'Application',
                    rootView: null
                });

                c6StateProvider.state('Home', function() {})
                    .state('About', function() {})
                    .state('Main', function() {});

                c6StateProvider.map('foo', 'Application', function() {
                    this.route('/home', 'Home');
                    this.route('/about', 'About');
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                c6State = $injector.get('c6State');
                setCurrent(null);

                $scope = $rootScope.$new();
                $scope.context = 'foo';
                $scope.$apply(function() {
                    $c6Title = $compile('<c6-title context="{{context}}"></c6-title>')($scope);
                });
            });

            c6State.in('foo', function() {
                application = c6State.get('Application');
                home = c6State.get('Home');
                about = c6State.get('About');
            });

            c6State.in('main', function() {
                main = c6State.get('Main');
            });

            application.cTitle = 'My Awesome App!';
            home.cTitle = 'My Awesome Homepage';
            about.cTitle = 'About This Awesome App!';

            main.cTitle = 'Main Title!';
        });

        afterEach(function() {
            $c6Title.remove();
        });

        afterAll(function() {
            $rootScope = null;
            $compile = null;
            c6State = null;
            $scope = null;
            $c6Title = null;
            application = null;
            home = null;
            about = null;
            main = null;
        });

        it('should be replaced with a title tag', function() {
            expect($c6Title.length).toBe(1);
            expect($c6Title.prop('tagName')).toBe('TITLE');
        });

        it('should set the title to whatever the cTitle of the current state is', function() {
            expect($c6Title.text()).toBe('');

            $scope.$apply(function() {
                setCurrent('Home');
            });
            expect($c6Title.text()).toBe(home.cTitle);

            $scope.$apply(function() {
                setCurrent('Application');
            });
            expect($c6Title.text()).toBe(application.cTitle);

            $scope.$apply(function() {
                setCurrent('About');
            });
            expect($c6Title.text()).toBe(about.cTitle);

            $scope.$apply(function() {
                $scope.context = null;
                setCurrent('Main');
            });
            expect($c6Title.text()).toBe(main.cTitle);
        });
    });
});
