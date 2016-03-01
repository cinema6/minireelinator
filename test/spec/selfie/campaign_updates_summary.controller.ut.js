define(['app'], function(appModule) {
    'use strict';

    describe('SelfieCampaignUpdatesSummaryController', function() {
        var $rootScope,
            $scope,
            $controller,
            CampaignService,
            Ctrl;

        var campaign,
            updatedCampaign;

        function compileCtrl() {
            $scope = $rootScope.$new();
            $scope.campaign = campaign;
            $scope.updatedCampaign = updatedCampaign;

            $scope.$apply(function() {
                Ctrl = $controller('SelfieCampaignUpdatesSummaryController', {
                    $scope: $scope
                });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                CampaignService = $injector.get('CampaignService');

                campaign = {
                    id: 'cam-123',
                    status: 'active',
                    name: 'original name',
                    foo: 'bar',
                    cards: [
                        {
                            title: 'original title',
                            campaign: {
                                startDate: 'original start date',
                                endDate: 'original end date'
                            }
                        }
                    ],
                    advertiserId: 'original id'
                };
                updatedCampaign = {
                    id: 'cam-123',
                    status: 'active',
                    name: 'updated name',
                    foo: 'derp',
                    cards: [
                        {
                            title: 'updated title',
                            campaign: {
                                startDate: 'updated start date',
                                endDate: 'updated end date'
                            },
                            data: {
                                duration: 30,
                                bad: 'property'
                            }
                        }
                    ],
                    advertiserId: 'updated id'
                };
            });

            spyOn(CampaignService, 'campaignDiffSummary').and.callThrough();

            compileCtrl();
        });

        it('should exist', function() {
            expect(Ctrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('edits', function() {
                it('should be initialized to an object', function() {
                    expect(Ctrl.edits).toEqual(jasmine.any(Object));
                });
            });

            describe('firstUpdate', function() {
                it('should be initialized to false', function() {
                    expect(Ctrl.firstUpdate).toBe(false);
                });
            });

            describe('summary', function() {
                it('should be initialized to an empty array', function() {
                    expect(Ctrl.summary).toEqual([]);
                });
            });
        });

        describe('methods', function() {
            describe('_loadSummary', function() {
                it('should set firstUpdate to true for pending campaigns', function() {
                    campaign.status = 'pending';
                    Ctrl._loadSummary(campaign, updatedCampaign);
                    expect(Ctrl.firstUpdate).toBe(true);
                });

                it('should set firstUpdate to false for active campaigns', function() {
                    campaign.status = 'active';
                    Ctrl._loadSummary(campaign, updatedCampaign);
                    expect(Ctrl.firstUpdate).toBe(false);
                });
            });

            it('should get a campaign difference summary from the campaign service', function() {
                campaign.status = 'active';
                Ctrl._loadSummary(campaign, updatedCampaign);
                expect(CampaignService.campaignDiffSummary).toHaveBeenCalledWith(campaign, updatedCampaign, 'Campaign', 'Card');
            });

            it('should compare with an empty object for first-time update approvals', function() {
                campaign.status = 'pending';
                Ctrl._loadSummary(campaign, updatedCampaign);
                expect(CampaignService.campaignDiffSummary).toHaveBeenCalledWith({}, updatedCampaign, 'Campaign', 'Card');
            });

            it('should properly set the tableData property', function() {
                Ctrl._loadSummary(campaign, updatedCampaign);
                var expected = [
                    {
                        originalValue: 'original name',
                        updatedValue: 'updated name',
                        title: 'Campaign.name',
                        editable: true
                    },
                    {
                        originalValue: 'original title',
                        updatedValue: 'updated title',
                        title: 'Card.title',
                        editable: true
                    },
                    {
                        originalValue: 'original id',
                        updatedValue: 'updated id',
                        title: 'Campaign.advertiserId',
                        editable: false
                    },
                    {
                        originalValue: 'original start date',
                        updatedValue: 'updated start date',
                        title: 'Card.campaign.startDate',
                        editable: false
                    },
                    {
                        originalValue: 'original end date',
                        updatedValue: 'updated end date',
                        title: 'Card.campaign.endDate',
                        editable: false
                    },
                    {
                        originalValue: undefined,
                        updatedValue: 30,
                        title: 'Card.data.duration',
                        editable: false
                    }
                ];
                expect(Ctrl.tableData.length).toBe(expected.length);
                expected.forEach(function(tableEntry) {
                    expect(Ctrl.tableData).toContain(tableEntry);
                });
            });

            it('should initialize the edits object to have default values', function() {
                Ctrl._loadSummary(campaign, updatedCampaign);
                expect(Ctrl.edits).toEqual({
                    'Campaign.name': 'updated name',
                    'Card.title': 'updated title'
                });
            });

            it('should check the campaign changes against a whitelist', function() {
                spyOn(Ctrl, '_isWhitelisted').and.callThrough();
                Ctrl._loadSummary(campaign, updatedCampaign);
                ['name', 'foo', 'title', 'advertiserId'].forEach(function(key) {
                    expect(Ctrl._isWhitelisted).toHaveBeenCalledWith(jasmine.any(Array), key);
                });
            });
        });

        describe('$watchers', function() {
            describe('the edits object', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        Ctrl.edits = {
                            'Campaign.name': 'edited name',
                            'Card.title': 'edited title'
                        };
                    });
                });

                it('should update the corresponding properties on the updatedCampaign', function() {
                    expect($scope.updatedCampaign.name).toBe('edited name');
                    expect($scope.updatedCampaign.cards[0].title).toBe('edited title');
                });
            });
        });
    });
});
