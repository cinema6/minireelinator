(function(){
    'use strict';

    define(['app', 'templates'], function() {
        var jqLite = angular.element;

        describe('AppController', function() {
            var $rootScope,
                $scope,
                $q,
                c6State,
                $window,
                AppCtrl,
                c6Defines,
                tracker;

            var cinema6,
                gsap,
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
                
                c6Defines = {
                    kTracker : {
                        accountId : 'account1',
                        config    : 'auto'
                    }
                };

                tracker = {
                    create   :  jasmine.createSpy('tracker.create'),
                    send     :  jasmine.createSpy('tracker.send'),
                    event    :  jasmine.createSpy('tracker.event'),
                    pageview :  jasmine.createSpy('tracker.pageview')
                };

                appData = {
                    experience: {
                        img: {}
                    },
                    profile: {
                        raf: {}
                    },
                    user: {}
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
                                    return cinema6._.getSessionDeferred.promise;
                                }),
                                getAppData: jasmine.createSpy('cinema6.getAppData()')
                                    .and.callFake(function() {
                                        return cinema6._.getAppDataDeferred.promise;
                                    }),
                                _: {
                                    getSessionDeferred: $q.defer(),
                                    getAppDataDeferred: $q.defer()
                                }
                            };

                            return cinema6;
                        };
                    });
                });

                module('c6.mrmaker', function($provide) {
                    $provide.value('gsap', gsap);
                });

                inject(function($injector, $controller, c6EventEmitter) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    spyOn(c6State, 'goTo');
                    $window = $injector.get('$window');

                    $scope = $rootScope.$new();
                    AppCtrl = $controller('AppController', {
                        tracker        : tracker,
                        c6Defines      : c6Defines,
                        $scope: $scope
                    });

                    cinema6Session = c6EventEmitter({
                        ping: jasmine.createSpy('session.ping()'),
                        request: jasmine.createSpy('session.request()')
                            .and.returnValue($q.defer().promise)
                    });
                });
            });

            it('should exist',function() {
                expect(AppCtrl).toBeDefined();
            });

            it('should publish itself to the $scope', function() {
                expect($scope.AppCtrl).toBe(AppCtrl);
            });

            it('should initialize the screenSpace', function() {
                cinema6Session.request.and.returnValue($q.when({ width: 300, height: 200 }));
                $scope.$apply(function() {
                    cinema6._.getSessionDeferred.resolve(cinema6Session);
                });

                expect(AppCtrl.screenSpace).toEqual({
                    width: 300,
                    height: 200
                });
            });

            describe('properties', function() {
                var appDataDeferred;

                beforeEach(function() {
                    appDataDeferred = $q.defer();
                });

                describe('config', function() {
                    it('should initially be null', function() {
                        expect(AppCtrl.config).toBeNull();
                    });

                    it('should be the experience when the appData is fetched', function() {
                        $scope.$apply(function() {
                            cinema6._.getAppDataDeferred.resolve(appData);
                        });

                        expect(AppCtrl.config).toBe(appData.experience);
                    });
                });

                describe('branding', function() {
                    it('should be null', function() {
                        expect(AppCtrl.branding).toBeNull();
                    });
                });

                describe('user', function() {
                    it('should initially be null', function() {
                        expect(AppCtrl.user).toBeNull();
                    });

                    it('should be the current user when the appData is fetched', function() {
                        $scope.$apply(function() {
                            cinema6._.getAppDataDeferred.resolve(appData);
                        });

                        expect(AppCtrl.user).toBe(appData.user);
                    });
                });

                describe('screenSpace', function() {
                    it('should be initialzied with minimal information', function() {
                        expect(AppCtrl.screenSpace).toEqual({
                            width: null,
                            height: null
                        });
                    });
                });
            });

            describe('methods', function() {
                describe('setScreenSpace()', function() {
                    var success;

                    beforeEach(function() {
                        success = jasmine.createSpy('success');

                        cinema6.getSession.and.returnValue($q.when(cinema6Session));
                        cinema6Session.request.and.returnValue($q.when({ width: 800, height: 450 }));

                        $scope.$apply(function() {
                            AppCtrl.setScreenSpace().then(success);
                        });
                    });

                    it('should get the available space from cinema6 and set the screenSpace property with the result', function() {
                        expect(cinema6Session.request).toHaveBeenCalledWith('availableSpace');
                        expect(AppCtrl.screenSpace).toEqual({
                            width: 800,
                            height: 450
                        });
                        expect(success).toHaveBeenCalledWith(AppCtrl.screenSpace);
                    });
                });
            });

            describe('events', function() {
                describe('$window resize', function() {
                    beforeEach(function() {
                        spyOn(AppCtrl, 'setScreenSpace');
                    });

                    it('should set the screen space', function() {
                        var $parentWindow = jqLite($window.parent);

                        $parentWindow.trigger('resize');
                        expect(AppCtrl.setScreenSpace).toHaveBeenCalled();
                    });
                });
            });

            describe('events', function() {
                describe('c6State: stateChange', function() {
                    it('should ping the session', function() {
                        spyOn(AppCtrl,'trackStateChange');
                        cinema6.getSession.calls.reset();
                        expect(cinema6.getSession).not.toHaveBeenCalled();
                        c6State.emit('stateChange', c6State.get('MR:Manager'), null);
                        $rootScope.$apply(function() {
                            cinema6._.getSessionDeferred.resolve(cinema6Session);
                        });
                        expect(cinema6Session.ping).toHaveBeenCalledWith('stateChange', { name: 'MR:Manager' });
                        cinema6.getSession.calls.reset();

                        $rootScope.$apply(function() {
                            c6State.emit('stateChange', c6State.get('MR:Editor'), c6State.get('MR:Manager'));
                        });
                        expect(AppCtrl.trackStateChange).toHaveBeenCalled();
                        expect(cinema6.getSession).toHaveBeenCalled();
                        expect(cinema6Session.ping).toHaveBeenCalledWith('stateChange', { name: 'MR:Editor' });
                    });
                });
            });

            describe('tracking',function(){
                describe('create',function(){
                    it('should initialize the tracker',function(){
                        expect(tracker.create).toHaveBeenCalledWith('account1','auto');

                    });
                });
                describe('sendPageView',function(){
                    it('does nothing if AppCtrl.config is null',function(){
                        AppCtrl.config = null;
                        AppCtrl.sendPageView({ page: 'test', title: 'Test'});
                        expect(tracker.pageview).not.toHaveBeenCalled();
                    });

                    it('calls tracker.pageview if config is set',function(){
                        AppCtrl.config = {
                            title : 'Some Title',
                            uri   : 'mini-reel-maker'
                        };
                        AppCtrl.sendPageView({page : 'test', title: 'Test'});
                        expect(tracker.pageview)
                            .toHaveBeenCalledWith('/mini-reel-maker/test','Some Title - Test');
                    });
                });

                describe('sendPageEvent',function(){
                    it('does nothing if AppCtrl.config is null',function(){
                        AppCtrl.config = null;
                        AppCtrl.sendPageEvent('Editor','Click','Add New',{page:'test',title:'Test'});
                        expect(tracker.event).not.toHaveBeenCalled();
                    });
                    it(' calls tracker.event',function(){
                        AppCtrl.config = {
                            title : 'Some Title',
                            uri   : 'mini-reel-maker'
                        };
                        AppCtrl.sendPageEvent('Editor','Click','Add New',{page:'test',title:'Test'});
                        expect(tracker.event)
                            .toHaveBeenCalledWith('Editor','Click','Add New',{page:'/mini-reel-maker/test',title:'Some Title - Test'});
                    });

                });

                describe('trackStateChange',function(){
                    it('does nothing if no config',function(){
                        AppCtrl.config = null;
                        AppCtrl.trackStateChange({ templateUrl : 'assets/views/manager.html' });
                        expect(tracker.pageview)
                            .not.toHaveBeenCalled();
                    });

                    it('does nothing if no templateUrl',function(){
                        AppCtrl.config = {
                            title : 'Some Title',
                            uri   : 'mini-reel-maker'
                        };
                        AppCtrl.trackStateChange({  });
                        expect(tracker.pageview)
                            .not.toHaveBeenCalled();
                    });

                    it('calls tracker.pageview',function(){
                        AppCtrl.config = {
                            title : 'Some Title',
                            uri   : 'mini-reel-maker'
                        };
                        AppCtrl.trackStateChange({
                            templateUrl : 'assets/views/manager.html' ,
                            name        : 'manager'
                        });
                        expect(tracker.pageview.calls.mostRecent().args)
                            .toEqual(['/mini-reel-maker/manager',
                                'Some Title - manager']);
                       
                        AppCtrl.trackStateChange({
                            templateUrl : 'assets/views/manager/experience.html' ,
                            name        : 'experience'
                        });
                        expect(tracker.pageview.calls.mostRecent().args)
                            .toEqual(['/mini-reel-maker/manager/experience',
                                'Some Title - experience']);
                    });

                });
            });
        });
    });
}());
