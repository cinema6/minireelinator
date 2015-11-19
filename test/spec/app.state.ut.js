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
            });

            it('should exist', function() {
                application = c6State.get('Application');

                expect(application).toEqual(jasmine.any(Object));
            });

            describe('name', function() {
                afterEach(function() {
                    c6Defines.kSelfie = false;
                });

                describe('when selfie is running locally', function() {
                    it('should go to Selfie state', function() {
                        c6Defines.kSelfie = true;

                        application = c6State.get('Application');

                        expect(application.name).toBe('Selfie');
                    });
                });

                describe('if this is not Selfie', function() {
                    it('should go to the portal', function() {
                        application = c6State.get('Application');

                        expect(application.name).toBe('Portal');
                    });
                });
            });

            describe('title()', function() {
                describe('when Selfie', function() {
                    it('should be Reelcontent', function() {
                        c6Defines.kSelfie = true;

                        expect(application.title()).toEqual('Reelcontent');
                    });
                });

                describe('when Portal', function() {
                    it('should be Studio', function() {
                        c6Defines.kSelfie = false;

                        expect(application.title()).toEqual('Studio');
                    });
                });
            });

            describe('enter()', function() {
                beforeEach(function() {
                    application = c6State.get('Application');

                    spyOn(c6State, 'goTo');
                });

                describe('when selfie', function() {
                    it('should go to Selfie state', function() {
                        application.name = 'Selfie';

                        application.enter();

                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie', null, null, true);
                    });
                });

                describe('when Portal', function() {
                    it('should go to the portal', function() {
                        application.name = 'Portal';

                        application.enter();

                        expect(c6State.goTo).toHaveBeenCalledWith('Portal', null, null, true);
                    });
                });
            });
        });
    });
}());
