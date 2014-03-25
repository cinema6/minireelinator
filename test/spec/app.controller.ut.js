(function(){
    'use strict';

    define(['app', 'templates'], function() {
        describe('AppController', function() {
            var $rootScope,
                $scope,
                AppCtrl;

            var cinema6,
                gsap,
                googleAnalytics,
                appData,
                cinema6Session;

            beforeEach(function() {
                gsap = {
                    TweenLite: {
                        ticker: {
                            useRAF: jasmine.createSpy('gsap.TweenLite.ticker.useRAF()')
                        }
                    }
                };

                googleAnalytics = jasmine.createSpy('googleAnalytics');

                appData = {
                    experience: {
                        img: {}
                    },
                    profile: {
                        raf: {}
                    }
                };

                module('c6.ui', function($provide) {
                    $provide.provider('cinema6', function() {
                        this.adapters = {
                            fixture: [function() {}]
                        };

                        this.useAdapter = jasmine.createSpy('cinema6Provider.useAdapter()');

                        this.$get = function($q) {
                            cinema6 = {
                                init: jasmine.createSpy('cinema6.init()'),
                                getSession: jasmine.createSpy('cinema6.getSiteSession()').and.callFake(function() {
                                    return cinema6._.getSessionResult.promise;
                                }),
                                _: {
                                    getSessionResult: $q.defer()
                                }
                            };

                            return cinema6;
                        };
                    });
                });

                module('c6.mrmaker', function($provide) {
                    $provide.value('gsap', gsap);
                    $provide.value('googleAnalytics', googleAnalytics);
                });

                inject(function($injector, $controller, c6EventEmitter) {
                    $rootScope = $injector.get('$rootScope');

                    $scope = $rootScope.$new();
                    AppCtrl = $controller('AppController', {
                        $scope: $scope
                    });

                    cinema6Session = c6EventEmitter({});
                });
            });

            it('should exist',function() {
                expect(AppCtrl).toBeDefined();
            });

            it('should publish itself to the $scope', function() {
                expect($scope.AppCtrl).toBe(AppCtrl);
            });

            describe('cinema6 integration', function() {
                beforeEach(function() {
                    cinema6.init.calls.mostRecent().args[0].setup(appData);
                });

                it('should initialize a session with cinema6', function() {
                    expect(cinema6.init).toHaveBeenCalled();
                });

                it('should setup the session', function() {
                    expect(AppCtrl.experience).toBe(appData.experience);
                    expect(AppCtrl.profile).toBe(appData.profile);
                });

                it('should configure gsap', function() {
                    expect(gsap.TweenLite.ticker.useRAF).toHaveBeenCalledWith(appData.profile.raf);
                });
            });
        });
    });
}());
