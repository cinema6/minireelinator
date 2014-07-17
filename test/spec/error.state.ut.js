define(['app'], function(appModule) {
    'use strict';

    describe('Error state', function() {
        var c6State,
            error;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
            });

            error = c6State.get('Error');
        });

        it('should have properties', function() {
            expect(error).toEqual(jasmine.objectContaining({
                templateUrl: jasmine.any(String)
            }));
        });

        describe('model', function() {
            var result;

            beforeEach(function() {
                result = error.model();
            });

            it('should return a sad message', function() {
                expect(result).toEqual(jasmine.any(String));
            });
        });
    });
});
