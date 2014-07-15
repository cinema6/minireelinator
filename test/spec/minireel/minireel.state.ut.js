define (['app'], function(appModule) {
    'use strict';

    describe('MiniReel state', function() {
        var c6State,
            minireel,
            apps;

        var minireelExp;

        beforeEach(function() {
            minireelExp = {};

            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            minireel = c6State.get('MiniReel');
            apps = c6State.get('Apps');
            apps.cModel = [minireelExp];
        });

        it('should exist', function() {
            expect(minireel).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var result;

            beforeEach(function() {
                result = minireel.model();
            });

            it('should be the MiniReel experience', function() {
                expect(result).toBe(minireelExp);
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                minireel.enter();
            });

            it('should go to the manager state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('MR:Manager', null, null, true);
            });
        });
    });
});
