(function(){
    'use strict';

    define(['minireel/app', 'c6ui'], function(minireelModule, c6uiModule) {
        /* global angular */
        var jqLite = angular.element;

        describe('MiniReelController', function() {
            var $rootScope,
                $scope,
                $q,
                c6State,
                $window,
                MiniReelCtrl,
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

                module(c6uiModule.name, function($provide) {
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

                module(minireelModule.name, function($provide) {
                    $provide.value('gsap', gsap);
                });

                inject(function($injector, $controller, c6EventEmitter) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    spyOn(c6State, 'goTo');
                    $window = $injector.get('$window');

                    $scope = $rootScope.$new();
                    MiniReelCtrl = $controller('MiniReelController', {
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
                expect(MiniReelCtrl).toBeDefined();
            });

            it('should initialize the screenSpace', function() {
                cinema6Session.request.and.returnValue($q.when({ width: 300, height: 200 }));
                $scope.$apply(function() {
                    cinema6._.getSessionDeferred.resolve(cinema6Session);
                });

                expect(MiniReelCtrl.screenSpace).toEqual({
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
                        expect(MiniReelCtrl.config).toBeNull();
                    });

                    it('should be the experience when the appData is fetched', function() {
                        $scope.$apply(function() {
                            cinema6._.getAppDataDeferred.resolve(appData);
                        });

                        expect(MiniReelCtrl.config).toBe(appData.experience);
                    });
                });

                describe('branding', function() {
                    it('should be null', function() {
                        expect(MiniReelCtrl.branding).toBeNull();
                    });
                });

                describe('user', function() {
                    it('should initially be null', function() {
                        expect(MiniReelCtrl.user).toBeNull();
                    });

                    it('should be the current user when the appData is fetched', function() {
                        $scope.$apply(function() {
                            cinema6._.getAppDataDeferred.resolve(appData);
                        });

                        expect(MiniReelCtrl.user).toBe(appData.user);
                    });
                });

                describe('screenSpace', function() {
                    it('should be initialzied with minimal information', function() {
                        expect(MiniReelCtrl.screenSpace).toEqual({
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
                            MiniReelCtrl.setScreenSpace().then(success);
                        });
                    });

                    it('should get the available space from cinema6 and set the screenSpace property with the result', function() {
                        expect(cinema6Session.request).toHaveBeenCalledWith('availableSpace');
                        expect(MiniReelCtrl.screenSpace).toEqual({
                            width: 800,
                            height: 450
                        });
                        expect(success).toHaveBeenCalledWith(MiniReelCtrl.screenSpace);
                    });
                });
            });

            describe('events', function() {
                describe('$window resize', function() {
                    beforeEach(function() {
                        spyOn(MiniReelCtrl, 'setScreenSpace');
                    });

                    it('should set the screen space', function() {
                        var $parentWindow = jqLite($window.parent);

                        $parentWindow.trigger('resize');
                        expect(MiniReelCtrl.setScreenSpace).toHaveBeenCalled();
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
                    it('does nothing if MiniReelCtrl.config is null',function(){
                        MiniReelCtrl.config = null;
                        MiniReelCtrl.sendPageView({ page: 'test', title: 'Test'});
                        expect(tracker.pageview).not.toHaveBeenCalled();
                    });

                    it('calls tracker.pageview if config is set',function(){
                        MiniReelCtrl.config = {
                            title : 'Some Title',
                            uri   : 'mini-reel-maker'
                        };
                        MiniReelCtrl.sendPageView({page : 'test', title: 'Test'});
                        expect(tracker.pageview)
                            .toHaveBeenCalledWith('/mini-reel-maker/test','Some Title - Test');
                    });
                });

                describe('sendPageEvent',function(){
                    it('does nothing if MiniReelCtrl.config is null',function(){
                        MiniReelCtrl.config = null;
                        MiniReelCtrl.sendPageEvent('Editor','Click','Add New',{page:'test',title:'Test'});
                        expect(tracker.event).not.toHaveBeenCalled();
                    });
                    it(' calls tracker.event',function(){
                        MiniReelCtrl.config = {
                            title : 'Some Title',
                            uri   : 'mini-reel-maker'
                        };
                        MiniReelCtrl.sendPageEvent('Editor','Click','Add New',{page:'test',title:'Test'});
                        expect(tracker.event)
                            .toHaveBeenCalledWith('Editor','Click','Add New',{page:'/mini-reel-maker/test',title:'Some Title - Test'});
                    });

                });

                describe('trackStateChange',function(){
                    it('does nothing if no config',function(){
                        MiniReelCtrl.config = null;
                        MiniReelCtrl.trackStateChange({ templateUrl : 'assets/views/manager.html' });
                        expect(tracker.pageview)
                            .not.toHaveBeenCalled();
                    });

                    it('does nothing if no templateUrl',function(){
                        MiniReelCtrl.config = {
                            title : 'Some Title',
                            uri   : 'mini-reel-maker'
                        };
                        MiniReelCtrl.trackStateChange({  });
                        expect(tracker.pageview)
                            .not.toHaveBeenCalled();
                    });

                    it('calls tracker.pageview',function(){
                        MiniReelCtrl.config = {
                            title : 'Some Title',
                            uri   : 'mini-reel-maker'
                        };
                        MiniReelCtrl.trackStateChange({
                            templateUrl : 'assets/views/manager.html' ,
                            name        : 'manager'
                        });
                        expect(tracker.pageview.calls.mostRecent().args)
                            .toEqual(['/mini-reel-maker/manager',
                                'Some Title - manager']);
                       
                        MiniReelCtrl.trackStateChange({
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
