define(['app'], function(appModule) {
    'use strict';

    describe('MR:Studio', function() {
        var c6State,
            studio;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            studio = c6State.get('MR:Studio');
        });

        it('should exist', function() {
            expect(studio).toEqual(jasmine.any(Object));
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                studio.enter();
            });

            it('should redirect to the manager', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('MR:Manager', null, null, true);
            });
        });
    });
});
