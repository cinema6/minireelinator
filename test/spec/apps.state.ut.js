define(['app'], function(appModule) {
    'use strict';

    describe('Apps State', function() {
        var c6State,
            $rootScope,
            $q,
            cinema6,
            apps;

        beforeEach(function() {
            module('ng', function($provide) {
                $provide.value('$location', {});
            });
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');

                apps = c6State.get('Apps');
            });
        });

        it('should exist', function() {
            expect(apps).toEqual(jasmine.any(Object));
        });

        describe('enter()', function() {
            var minireel;

            beforeEach(function() {
                minireel = {
                    appUri: 'mini-reel-maker'
                };

                apps.cModel = ['e-efaa765476bd5b'];
                spyOn(cinema6.db, 'find').and.returnValue($q.when(minireel));
                spyOn(c6State, 'goTo');
                $rootScope.$apply(function() {
                    apps.enter();
                });
            });

            it('should find the user\'s first app', function() {
                expect(cinema6.db.find).toHaveBeenCalledWith('experience', apps.cModel[0]);
            });

            it('should transition to the MiniReel state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('MiniReel', [minireel]);
            });

            it('should go to the error state if the minireel\'s uri is not "mini-reel-maker"', function() {
                minireel.appUri = 'foo';
                $rootScope.$apply(function() {
                    apps.enter();
                });

                expect(c6State.goTo).toHaveBeenCalledWith('Error', [jasmine.any(String)]);
            });
        });
    });
});
