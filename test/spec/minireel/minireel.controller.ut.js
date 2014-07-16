(function(){
    'use strict';

    define(['minireel/app', 'c6ui', 'c6_defines'], function(minireelModule, c6uiModule, c6Defines) {
        describe('MiniReelController', function() {
            var $rootScope,
                $scope,
                $q,
                c6State,
                $window,
                MiniReelCtrl,
                tracker;

            var gsap,
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
