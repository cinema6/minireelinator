define(['app'], function(appModule) {
    'use strict';

    describe('SelfieCampaignSummaryService', function() {
        var SelfieCampaignSummaryService,
            CampaignService;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                CampaignService = $injector.get('CampaignService');
                SelfieCampaignSummaryService = $injector.get('SelfieCampaignSummaryService');
            });
        });

        it('should exist', function() {
            expect(SelfieCampaignSummaryService).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('model', function() {
                it('should be an object', function() {
                    expect(SelfieCampaignSummaryService.model).toEqual(jasmine.any(Object));
                });

                it('should not be publically settable', function() {
                    expect(function() {
                        SelfieCampaignSummaryService.model = {};
                    }).toThrow();
                });
            });
        });

        describe('display(dialogModel)', function() {
            var model, summary;

            beforeEach(function() {
                model = {
                    campaign: {
                        cards: [
                            {
                                campaign: {
                                    startDate: undefined,
                                    endDate: undefined
                                }
                            }
                        ],
                        targeting: {
                            demographics: {
                                age: ['18-24','25-36'],
                                income: [],
                                gender: ['Male']
                            },
                            geo: {
                                states: ['Alabama','Alaska'],
                                dmas: ['NYC']
                            },
                            interests: ['cat-1','cat-3']
                        }
                    },
                    interests: [
                        {
                            id: 'cat-1',
                            label: 'Comedy'
                        },
                        {
                            id: 'cat-2',
                            label: 'Cars'
                        },
                        {
                            id: 'cat-3',
                            label: 'Technology'
                        },
                        {
                            id: 'cat-4',
                            label: 'Cooking'
                        }
                    ],
                    schema: {

                    },
                    onAffirm: function() {}
                };

                summary = {};

                spyOn(CampaignService, 'getSummary').and.returnValue(summary);
                spyOn(CampaignService, 'getCpv').and.returnValue(0.08);

                SelfieCampaignSummaryService.display(model);
            });

            it('should show the dialog', function() {
                expect(SelfieCampaignSummaryService.model.show).toBe(true);
            })

            it('should extend the service model', function() {
                expect(SelfieCampaignSummaryService.model).toEqual(jasmine.objectContaining({
                    onAffirm: model.onAffirm,
                    campaign: model.campaign
                }));
            });

            it('should getSummary() with campaign and interests', function() {
                expect(CampaignService.getSummary).toHaveBeenCalledWith({
                    campaign: model.campaign,
                    interests: model.interests
                });
                expect(SelfieCampaignSummaryService.model).toEqual(jasmine.objectContaining(summary));
            });

            it('should get the cpv', function() {
                expect(CampaignService.getCpv).toHaveBeenCalledWith(model.campaign, model.schema);
                expect(SelfieCampaignSummaryService.model.cpv).toBe(0.08);
            });
        });

        describe('close()', function() {
            beforeEach(function() {
                SelfieCampaignSummaryService.display({});
                SelfieCampaignSummaryService.close();
            });

            it('should hide the dialog', function() {
                expect(SelfieCampaignSummaryService.model.show).toBe(false);
            });
        });
    });
});