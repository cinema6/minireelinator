define (['app'], function(appModule) {
    'use strict';

    describe('MiniReel state', function() {
        var c6State,
            minireel;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            minireel = c6State.get('MiniReel');
        });

        it('should exist', function() {
            expect(minireel).toEqual(jasmine.any(Object));
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                minireel.enter();
            });

            it('should go to the manager state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('MR:Manager');
            });
        });
    });
});
