(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('Application State', function() {
            var c6State,
                application,
                c6Defines;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');
                    c6Defines = $injector.get('c6Defines');
                });

                application = c6State.get('Application');
            });

            it('should exist', function() {
                expect(application).toEqual(jasmine.any(Object));
            });

            describe('enter()', function() {
                beforeEach(function() {
                    spyOn(c6State, 'goTo');
                });

                afterEach(function() {
                    c6Defines.kSelfie = false;
                });

                describe('when selfie is in the url', function() {
                    it('should go to Selfie state', function() {
                        spyOn(RegExp.prototype, 'test').and.returnValue(true);

                        application.enter();

                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie', null, null, true);
                    });
                });

                describe('when selfie is running locally', function() {
                    it('should go to Selfie state', function() {
                        c6Defines.kSelfie = true;

                        application.enter();

                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie', null, null, true);
                    });
                });

                describe('if this is not Selfie', function() {
                    it('should go to the portal', function() {
                        application.enter();

                        expect(c6State.goTo).toHaveBeenCalledWith('Portal', null, null, true);
                    });
                });
            });
        });
    });
}());
