(function() {
    'use strict';

    define(['c6_state'], function() {
        ddescribe('c6State', function() {
            var c6StateProvider,
                c6State;

            beforeEach(function() {
                module('c6.state', function($injector) {
                    c6StateProvider = $injector.get('c6StateProvider');
                });

                inject(function($injector) {
                    c6State = $injector.get('c6State');
                });
            });

            describe('provider', function() {
                it('should exist', function() {
                    expect(c6StateProvider).toEqual(jasmine.any(Object));
                });
            });
        });
    });
}());
