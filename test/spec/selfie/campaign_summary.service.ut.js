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
            var model;

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

            it('should generate interest list', function() {
                expect(SelfieCampaignSummaryService.model.interests).toEqual('Comedy, Technology');
            });

            it('should generate demographics data', function() {
                expect(SelfieCampaignSummaryService.model.demographics).toEqual([
                    {
                        name: 'Age',
                        list: '18-24, 25-36'
                    },
                    {
                        name: 'Gender',
                        list: 'Male'
                    }
                ]);
            });

            it('should generate geo data', function() {
                expect(SelfieCampaignSummaryService.model.geo).toEqual([
                    {
                        name: 'States',
                        list: 'Alabama, Alaska'
                    },
                    {
                        name: 'DMA',
                        list: 'NYC'
                    }
                ]);
            });

            it('should set duration based on start and end date', function() {
                expect(SelfieCampaignSummaryService.model.duration).toEqual('Once approved, run until stopped.');

                model.campaign.cards[0].campaign.startDate = '2015-06-26T05:01:00.000Z';

                SelfieCampaignSummaryService.display(model);

                expect(SelfieCampaignSummaryService.model.duration).toEqual('06/26/2015 until stopped.');

                model.campaign.cards[0].campaign.endDate = '2015-07-26T05:01:00.000Z';

                SelfieCampaignSummaryService.display(model);

                expect(SelfieCampaignSummaryService.model.duration).toEqual('06/26/2015 to 07/26/2015');

                model.campaign.cards[0].campaign.startDate = undefined;

                SelfieCampaignSummaryService.display(model);

                expect(SelfieCampaignSummaryService.model.duration).toEqual('Once approved until 07/26/2015');
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