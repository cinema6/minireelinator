define(['app'], function(appModule) {
    'use strict';

    var state, SettingsService, c6State;

    describe('Selfie:Demo:Preview:Full', function() {
        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
                SettingsService = $injector.get('SettingsService');
            });
            spyOn(SettingsService, 'register').and.returnValue(SettingsService);
            spyOn(c6State, 'goTo');
            state = c6State.get('Selfie:Demo:Preview:Full');
        });

        it('should be using the correct template', function() {
            expect(state.templateUrl).toBe('views/selfie/demo/preview.html');
        });

        it('should be using the correct controller', function() {
            expect(state.controller).toBe('SelfieDemoPreviewController');
        });

        it('should use controllerAs', function() {
            expect(state.controllerAs).toBe('SelfieDemoPreviewCtrl');
        });

        describe('beforeModel', function() {
            beforeEach(function() {
                state.beforeModel();
            });

            it('should register MR::org', function() {
                expect(SettingsService.register).toHaveBeenCalledWith('MR::org', {
                    embedTypes: ['script'],
                    minireelDefaults: {
                        mode: 'light',
                        autoplay: true,
                        splash: {
                            ratio: '3-2',
                            theme: 'img-text-overlay'
                        }
                    },
                    embedDefaults: {
                        size: null
                    }
                });
            });

            it('should register MR::user', function() {
                expect(SettingsService.register).toHaveBeenCalledWith('MR::user', {
                    minireelDefaults: {
                        splash: {
                            ratio: '3-2',
                            theme: 'img-text-overlay'
                        }
                    }
                });
            });
        });

        describe('model', function() {
            it('should use the model of the parent', function() {
                state.cParent.cModel = 'model';
                expect(state.model()).toBe('model');
            });
        });
    });

    describe('Selfie:Demo:Preview:Frame', function() {
        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
                SettingsService = $injector.get('SettingsService');
            });
            spyOn(SettingsService, 'register').and.returnValue(SettingsService);
            spyOn(c6State, 'goTo');
            state = c6State.get('Selfie:Demo:Preview:Frame');
        });

        it('should be using the correct template', function() {
            expect(state.templateUrl).toBe('views/selfie/demo/preview.html');
        });

        it('should be using the correct controller', function() {
            expect(state.controller).toBe('SelfieDemoPreviewController');
        });

        it('should use controllerAs', function() {
            expect(state.controllerAs).toBe('SelfieDemoPreviewCtrl');
        });

        describe('beforeModel', function() {
            beforeEach(function() {
                state.beforeModel();
            });

            it('should register MR::org', function() {
                expect(SettingsService.register).toHaveBeenCalledWith('MR::org', {
                    embedTypes: ['script'],
                    minireelDefaults: {
                        mode: 'light',
                        autoplay: true,
                        splash: {
                            ratio: '3-2',
                            theme: 'img-text-overlay'
                        }
                    },
                    embedDefaults: {
                        size: null
                    }
                });
            });

            it('should register MR::user', function() {
                expect(SettingsService.register).toHaveBeenCalledWith('MR::user', {
                    minireelDefaults: {
                        splash: {
                            ratio: '3-2',
                            theme: 'img-text-overlay'
                        }
                    }
                });
            });
        });

        describe('model', function() {
            it('should use the model of the parent', function() {
                state.cParent.cModel = 'model';
                expect(state.model()).toBe('model');
            });
        });

        describe('enter', function() {
            it('should redirect if there is no video data', function() {
                state.cParent.cModel = {
                    card: {
                        data: {
                            videoid: null
                        }
                    }
                };
                state.enter();
                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Demo:Input:Full');
            });

            it('should not redirect if there is video data', function() {
                state.cParent.cModel = {
                    card: {
                        data: {
                            videoid: 'videoid'
                        }
                    }
                };
                state.enter();
                expect(c6State.goTo).not.toHaveBeenCalled();
            });
        });
    });
});
