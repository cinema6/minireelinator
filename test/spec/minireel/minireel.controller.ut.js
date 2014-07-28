(function(){
    'use strict';

    define(['app', 'minireel/app', 'c6ui', 'c6_defines'], function(appModule, minireelModule, c6uiModule, c6Defines) {
        describe('MiniReelController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                c6State,
                $window,
                SettingsService,
                PortalCtrl,
                MiniReelCtrl,
                tracker;

            var gsap,
                user,
                appData,
                cinema6Session;

            function instantiate() {
                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    PortalCtrl = $scope.PortalCtrl = {
                        model: user
                    };
                    MiniReelCtrl = $controller('MiniReelController', {
                        tracker        : tracker,
                        c6Defines      : c6Defines,
                        $scope: $scope
                    });
                });

                return MiniReelCtrl;
            }

            beforeEach(function() {
                user = {
                    id: 'u-5dd4066eb1c277',
                    name: 'team member',
                    org: {
                        config: {
                            minireelinator: {}
                        },
                        save: jasmine.createSpy('org.save()')
                    }
                };

                gsap = {
                    TweenLite: {
                        ticker: {
                            useRAF: jasmine.createSpy('gsap.TweenLite.ticker.useRAF()')
                        }
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

                module(appModule.name);
                module(minireelModule.name, function($provide) {
                    $provide.value('gsap', gsap);
                });

                inject(function($injector, c6EventEmitter) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    spyOn(c6State, 'goTo');
                    $window = $injector.get('$window');
                    $controller = $injector.get('$controller');
                    SettingsService = $injector.get('SettingsService');
                    spyOn(SettingsService, 'register');

                    MiniReelCtrl = instantiate();

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

            describe('construction', function() {
                it('should register org settings with the settings service', function() {
                    expect(SettingsService.register).toHaveBeenCalledWith('MR::org', user.org.config.minireelinator, {
                        localSync: false,
                        sync: jasmine.any(Function),
                        defaults: {
                            embedTypes: ['script']
                        }
                    });
                });

                describe('if there is no minireelinator config', function() {
                    beforeEach(function() {
                        delete user.org.config.minireelinator;

                        MiniReelCtrl = instantiate();
                    });

                    it('should create a minireelinator config', function() {
                        expect(user.org.config.minireelinator).toEqual({});
                    });
                });

                describe('MR::org settings sync method', function() {
                    beforeEach(function() {
                        var config = SettingsService.register.calls.mostRecent().args[2];

                        config.sync();
                    });

                    it('should save the org', function() {
                        expect(user.org.save).toHaveBeenCalled();
                    });
                });
            });

            describe('properties', function() {
                var appDataDeferred;

                beforeEach(function() {
                    appDataDeferred = $q.defer();
                });

                describe('branding', function() {
                    it('should be null', function() {
                        expect(MiniReelCtrl.branding).toBeNull();
                    });
                });
            });

            describe('tracking',function(){
                describe('create',function(){
                    it('should initialize the tracker',function(){
                        expect(tracker.create).toHaveBeenCalledWith(c6Defines.kTracker.accountId,'auto');

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
