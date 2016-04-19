define(['app'], function(appModule) {
    'use strict';

    var state, SettingsService, CampaignService;

    describe('Selfie:Demo', function() {
        beforeEach(function() {
            module(appModule.name);

            var c6State;
            inject(function($injector) {
                c6State = $injector.get('c6State');
                SettingsService = $injector.get('SettingsService');
                CampaignService = $injector.get('CampaignService');
            });
            spyOn(SettingsService, 'register');
            spyOn(CampaignService, 'create');
            state = c6State.get('Selfie:Demo');
        });

        describe('model', function() {
            it('should register the model with the settings service', function() {
                CampaignService.create.and.returnValue({ cards: [ { links:{ } } ] });
                var model = state.model();
                expect(CampaignService.create).toHaveBeenCalledWith(null, { }, null);
                expect(SettingsService.register).toHaveBeenCalledWith('Selfie::demo', { }, {
                    defaults: {
                        company: '',
                        email: '',
                        website: '',
                        card: {
                            title: 'Your Title Here!',
                            links: {
                                Action: {
                                    uri: 'https://www.reelcontent.com'
                                }
                            }
                        }
                    }
                });
                expect(model).toEqual({ });
            });
        });
    });
});
