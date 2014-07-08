(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('Application State', function() {
            var c6State,
                application;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');
                });

                application = c6State.get('Application');
            });

            it('should exist', function() {
                expect(application).toEqual(jasmine.any(Object));
            });

            describe('enter()', function() {
                beforeEach(function() {
                    spyOn(c6State, 'goTo');
                    application.enter();
                });

                it('should go to the portal', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('Portal');
                });
            });
        });
    });
}());
