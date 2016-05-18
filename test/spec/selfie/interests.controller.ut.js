define(['app'], function(appModule) {
    'use strict';

    describe('SelfieInterestsController', function() {
        var $rootScope,
            $scope,
            $controller,
            SelfieInterestsCtrl,
            CampaignService;

        var campaign,
            categories,
            costData;

        function compileCtrl() {
            $scope.$apply(function() {
                SelfieInterestsCtrl = $controller('SelfieInterestsController', {
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

                costData = {
                    categories: {
                        areEqual: true,
                        geo: 0.1,
                        demo: 0.1,
                        interests: 0.1
                    }
                };

                spyOn(CampaignService, 'getTargetingCost').and.returnValue(costData);

                campaign = {
                    targeting: {
                        interests: []
                    }
                };

                categories = [
                    {
                        id: 'int-111',
                        name: 'comedy',
                        label: 'Comedy',
                        externalId: 'IAB1'
                    },
                    {
                        id: 'int-112',
                        name: 'cars',
                        label: 'Cars',
                        externalId: 'IAB1-1'
                    },
                    {
                        id: 'int-113',
                        name: 'entertainment',
                        label: 'Entertainment',
                        externalId: 'IAB1-2'
                    },
                    {
                        id: 'int-114',
                        name: 'food',
                        label: 'Food',
                        externalId: 'IAB1-3'
                    },
                    {
                        id: 'int-115',
                        name: 'howto',
                        label: 'Howto',
                        externalId: 'IAB2'
                    },
                    {
                        id: 'int-116',
                        name: 'cooking',
                        label: 'Cooking',
                        externalId: 'IAB2-1'
                    },
                    {
                        id: 'int-117',
                        name: 'gaming',
                        label: 'Gaming',
                        externalId: 'IAB2-2'
                    },
                    {
                        id: 'int-118',
                        name: 'technology',
                        label: 'Technology',
                        externalId: 'IAB2-3'
                    },
                    {
                        id: 'int-119',
                        name: 'karate',
                        label: 'Karate',
                        externalId: 'IAB3'
                    }
                ];

                $scope = $rootScope.$new();
                $scope.schema = {
                    pricing: {
                        budget: {
                            __min:50,
                            __max:20000
                        },
                        dailyLimit: {
                            __percentMin:0.015,
                            __percentMax:1,
                            __percentDefault:0.03
                        },
                        cost: {
                            __base: 0.05,
                            __pricePerGeo: 0.01,
                            __pricePerDemo: 0.01,
                            __priceForInterests: 0.01
                        }
                    }
                };
                $scope.campaign = campaign;
                $scope.categories = categories;
            });

            compileCtrl();
        });

        afterAll(function() {
            $rootScope = null;
            $scope = null;
            $controller = null;
            SelfieInterestsCtrl = null;
            CampaignService = null;
            campaign = null;
            categories = null;
            costData = null;
        });

        it('should exist', function() {
            expect(SelfieInterestsCtrl).toEqual(jasmine.any(Object));
        });

        it('should remove any old, unused, unsupported categories/interests', function() {
            $scope.campaign.targeting.interests.push('cat-xxxxxx');

            compileCtrl();

            expect($scope.campaign.targeting.interests).toEqual([]);
        });

        it('should get the targeting cost data', function() {
            expect(CampaignService.getTargetingCost).toHaveBeenCalled();
            expect(SelfieInterestsCtrl.cost).toBe(costData);
        });

        describe('properties', function() {
            describe('tiers', function() {
                it('should be an array of objects each containing all the interests in its tier', function() {
                    expect(SelfieInterestsCtrl.tiers.length).toBe(3);

                    expect(SelfieInterestsCtrl.tiers[0]).toEqual({
                        name: categories[0].name,
                        label: categories[0].label,
                        id: categories[0].id,
                        iab: categories[0].externalId,
                        selected: false,
                        children: [
                            {
                                id: categories[1].id,
                                iab: categories[1].externalId,
                                name: categories[1].name,
                                label: categories[1].label,
                                selected: false
                            },
                            {
                                id: categories[2].id,
                                iab: categories[2].externalId,
                                name: categories[2].name,
                                label: categories[2].label,
                                selected: false
                            },
                            {
                                id: categories[3].id,
                                iab: categories[3].externalId,
                                name: categories[3].name,
                                label: categories[3].label,
                                selected: false
                            }
                        ]
                    });

                    expect(SelfieInterestsCtrl.tiers[1]).toEqual({
                        name: categories[4].name,
                        label: categories[4].label,
                        id: categories[4].id,
                        iab: categories[4].externalId,
                        selected: false,
                        children: [
                            {
                                id: categories[5].id,
                                iab: categories[5].externalId,
                                name: categories[5].name,
                                label: categories[5].label,
                                selected: false
                            },
                            {
                                id: categories[6].id,
                                iab: categories[6].externalId,
                                name: categories[6].name,
                                label: categories[6].label,
                                selected: false
                            },
                            {
                                id: categories[7].id,
                                iab: categories[7].externalId,
                                name: categories[7].name,
                                label: categories[7].label,
                                selected: false
                            }
                        ]
                    });

                    expect(SelfieInterestsCtrl.tiers[2]).toEqual({
                        name: categories[8].name,
                        label: categories[8].label,
                        id: categories[8].id,
                        iab: categories[8].externalId,
                        selected: false,
                        children: []
                    });
                });

                it('should indicate which interests or top tiers have been selected', function() {
                    // include on lower tier item
                    campaign.targeting.interests.push('int-112');

                    // include one top tier item
                    campaign.targeting.interests.push('int-115');

                    // include one top tier item that has no children
                    campaign.targeting.interests.push('int-119');

                    compileCtrl();

                    expect(SelfieInterestsCtrl.tiers[0]).toEqual({
                        name: categories[0].name,
                        label: categories[0].label,
                        id: categories[0].id,
                        iab: categories[0].externalId,
                        selected: 'indeterminate',
                        children: [
                            {
                                id: categories[1].id,
                                iab: categories[1].externalId,
                                name: categories[1].name,
                                label: categories[1].label,
                                selected: true
                            },
                            {
                                id: categories[2].id,
                                iab: categories[2].externalId,
                                name: categories[2].name,
                                label: categories[2].label,
                                selected: false
                            },
                            {
                                id: categories[3].id,
                                iab: categories[3].externalId,
                                name: categories[3].name,
                                label: categories[3].label,
                                selected: false
                            }
                        ]
                    });

                    expect(SelfieInterestsCtrl.tiers[1]).toEqual({
                        name: categories[4].name,
                        label: categories[4].label,
                        id: categories[4].id,
                        iab: categories[4].externalId,
                        selected: true,
                        children: [
                            {
                                id: categories[5].id,
                                iab: categories[5].externalId,
                                name: categories[5].name,
                                label: categories[5].label,
                                selected: true
                            },
                            {
                                id: categories[6].id,
                                iab: categories[6].externalId,
                                name: categories[6].name,
                                label: categories[6].label,
                                selected: true
                            },
                            {
                                id: categories[7].id,
                                iab: categories[7].externalId,
                                name: categories[7].name,
                                label: categories[7].label,
                                selected: true
                            }
                        ]
                    });

                    expect(SelfieInterestsCtrl.tiers[2]).toEqual({
                        name: categories[8].name,
                        label: categories[8].label,
                        id: categories[8].id,
                        iab: categories[8].externalId,
                        selected: true,
                        children: []
                    });
                });
            });
        });

        describe('methods', function() {
            describe('toggleTier(tier)', function() {
                describe('when tier is indeterminate', function() {
                    var tier;

                    beforeEach(function() {
                        tier = SelfieInterestsCtrl.tiers[0];
                        tier.selected = 'indeterminate';
                    });

                    it('should set selected to true', function() {
                        SelfieInterestsCtrl.toggleTier(tier);

                        expect(tier.selected).toBe(true);
                    });

                    it('should add the tier id to the interests array', function() {
                        SelfieInterestsCtrl.toggleTier(tier);

                        expect(campaign.targeting.interests).toContain(tier.id);
                    });

                    it('should remove any tier child ids', function() {
                        campaign.targeting.interests.push('int-112');
                        campaign.targeting.interests.push('int-114');

                        SelfieInterestsCtrl.toggleTier(tier);

                        expect(campaign.targeting.interests).not.toContain('int-112');
                        expect(campaign.targeting.interests).not.toContain('int-114');
                    });

                    it('should mark all children as selected', function() {
                        SelfieInterestsCtrl.toggleTier(tier);

                        tier.children.forEach(function(child) {
                            expect(child.selected).toBe(true);
                        });
                    });
                });

                describe('when tier is already selected', function() {
                    var tier;

                    beforeEach(function() {
                        tier = SelfieInterestsCtrl.tiers[0];
                        tier.selected = true;
                    });

                    it('should set selected to false', function() {
                        SelfieInterestsCtrl.toggleTier(tier);

                        expect(tier.selected).toBe(false);
                    });

                    it('should remove the tier id from the interests array', function() {
                        SelfieInterestsCtrl.toggleTier(tier);

                        expect(campaign.targeting.interests).not.toContain(tier.id);
                    });

                    it('should remove any tier child ids', function() {
                        campaign.targeting.interests.push('int-112');
                        campaign.targeting.interests.push('int-114');

                        SelfieInterestsCtrl.toggleTier(tier);

                        expect(campaign.targeting.interests).not.toContain('int-112');
                        expect(campaign.targeting.interests).not.toContain('int-114');
                    });

                    it('should mark all children as un-selected', function() {
                        SelfieInterestsCtrl.toggleTier(tier);

                        tier.children.forEach(function(child) {
                            expect(child.selected).toBe(false);
                        });
                    });
                });

                describe('when tier is not selected', function() {
                    var tier;

                    beforeEach(function() {
                        tier = SelfieInterestsCtrl.tiers[0];
                        tier.selected = false;
                    });

                    it('should set selected to true', function() {
                        SelfieInterestsCtrl.toggleTier(tier);

                        expect(tier.selected).toBe(true);
                    });

                    it('should add the tier id to the interests array', function() {
                        SelfieInterestsCtrl.toggleTier(tier);

                        expect(campaign.targeting.interests).toContain(tier.id);
                    });

                    it('should remove any tier child ids', function() {
                        campaign.targeting.interests.push('int-112');
                        campaign.targeting.interests.push('int-114');

                        SelfieInterestsCtrl.toggleTier(tier);

                        expect(campaign.targeting.interests).not.toContain('int-112');
                        expect(campaign.targeting.interests).not.toContain('int-114');
                    });

                    it('should mark all children as selected', function() {
                        SelfieInterestsCtrl.toggleTier(tier);

                        tier.children.forEach(function(child) {
                            expect(child.selected).toBe(true);
                        });
                    });
                });
            });

            describe('toggleInterest(item, tier)', function() {
                describe('when adding selection but tier is not full', function() {
                    var tier, item;

                    beforeEach(function() {
                        tier = SelfieInterestsCtrl.tiers[0];
                        item = tier.children[1];
                        item.selected = true;

                        SelfieInterestsCtrl.toggleInterest(item, tier);
                    });

                    it('should add the id to the interests array', function() {
                        expect(campaign.targeting.interests).toContain(item.id);
                    });

                    it('should mark the tier as indeterminate', function() {
                        expect(tier.selected).toEqual('indeterminate');
                    });
                });

                describe('when adding selection and tier is now full', function() {
                    var tier, item;

                    beforeEach(function() {
                        tier = SelfieInterestsCtrl.tiers[0];

                        // other two items are selected
                        tier.children[0].selected = true;
                        tier.children[2].selected = true;

                        // campaign has other two items stored
                        campaign.targeting.interests.push('int-112');
                        campaign.targeting.interests.push('int-114');

                        // now add the third/last item in the tier
                        item = tier.children[1];
                        item.selected = true;

                        SelfieInterestsCtrl.toggleInterest(item, tier);
                    });

                    it('should add the top tier id to the interests array', function() {
                        expect(campaign.targeting.interests).toContain(tier.id);
                    });

                    it('should remove all child ids form the interests array', function() {
                        expect(campaign.targeting.interests).not.toContain('int-112');
                        expect(campaign.targeting.interests).not.toContain('int-113');
                        expect(campaign.targeting.interests).not.toContain('int-114');
                    });

                    it('should mark the tier as selected', function() {
                        expect(tier.selected).toEqual(true);
                    });
                });

                describe('when removing selection and tier was full', function() {
                    var tier, item;

                    beforeEach(function() {
                        tier = SelfieInterestsCtrl.tiers[0];

                        // tier is selected
                        tier.selected = true;

                        // other two items are selected
                        tier.children[0].selected = true;
                        tier.children[2].selected = true;

                        // campaign has the top tier id stored stored
                        campaign.targeting.interests.push('int-111');

                        // now remove the third/last item in the tier
                        item = tier.children[1];
                        item.selected = false;

                        SelfieInterestsCtrl.toggleInterest(item, tier);
                    });

                    it('should remove the top tier id from the interests array', function() {
                        expect(campaign.targeting.interests).not.toContain(tier.id);
                    });

                    it('should add all other selected child ids to the interests array', function() {
                        expect(campaign.targeting.interests).toContain('int-112');
                        expect(campaign.targeting.interests).not.toContain('int-113');
                        expect(campaign.targeting.interests).toContain('int-114');
                    });

                    it('should mark the tier as indeterminate', function() {
                        expect(tier.selected).toEqual('indeterminate');
                    });
                });

                describe('when removing selection and tier is now empty', function() {
                    var tier, item;

                    beforeEach(function() {
                        tier = SelfieInterestsCtrl.tiers[0];

                        // tier is partially selected
                        tier.selected = 'indeterminate';

                        // other two items are selected
                        tier.children[0].selected = false;
                        tier.children[2].selected = false;

                        // campaign has the top tier id stored stored
                        campaign.targeting.interests.push('int-113');

                        // now remove the third/last item in the tier
                        item = tier.children[1];
                        item.selected = false;

                        SelfieInterestsCtrl.toggleInterest(item, tier);
                    });

                    it('should remove the id from the interests array', function() {
                        expect(campaign.targeting.interests).not.toContain(item.id);
                    });

                    it('should remove all other selected child ids from the interests array', function() {
                        expect(campaign.targeting.interests).not.toContain('int-112');
                        expect(campaign.targeting.interests).not.toContain('int-113');
                        expect(campaign.targeting.interests).not.toContain('int-114');
                    });

                    it('should mark the tier as indeterminate', function() {
                        expect(tier.selected).toEqual(false);
                    });
                });

                describe('when removing selection and tier was not full and is not empty now', function() {
                    var tier, item;

                    beforeEach(function() {
                        tier = SelfieInterestsCtrl.tiers[0];

                        // tier is partially selected
                        tier.selected = 'indeterminate';

                        // other two items are selected
                        tier.children[0].selected = true;
                        tier.children[2].selected = false;

                        // campaign has the top tier id stored stored
                        campaign.targeting.interests.push('int-112');
                        campaign.targeting.interests.push('int-113');

                        // now remove the third/last item in the tier
                        item = tier.children[1];
                        item.selected = false;

                        SelfieInterestsCtrl.toggleInterest(item, tier);
                    });

                    it('should remove the id from the interests array', function() {
                        expect(campaign.targeting.interests).not.toContain(item.id);
                    });

                    it('should remove all other selected child ids from the interests array', function() {
                        expect(campaign.targeting.interests).toContain('int-112');
                        expect(campaign.targeting.interests).not.toContain('int-113');
                        expect(campaign.targeting.interests).not.toContain('int-114');
                    });

                    it('should mark the tier as indeterminate', function() {
                        expect(tier.selected).toEqual('indeterminate');
                    });
                });
            });

            describe('removeInterest(item, tier)', function() {
                it('should mark is as un-selected and pass it to toggleInterest()', function() {
                    var tier = SelfieInterestsCtrl.tiers[0],
                        item = tier.children[1];

                    item.selected = true;

                    spyOn(SelfieInterestsCtrl, 'toggleInterest');

                    SelfieInterestsCtrl.removeInterest(item, tier);

                    expect(item.selected).toBe(false);
                    expect(SelfieInterestsCtrl.toggleInterest).toHaveBeenCalledWith(item, tier);
                });
            });

            describe('expandTier(tier)', function() {
                beforeEach(function() {
                    spyOn(SelfieInterestsCtrl, 'toggleTier');
                });

                describe('when tier has children', function() {
                    it('should toggle the "show" prop and not call toggle tier', function() {
                        SelfieInterestsCtrl.expandTier(SelfieInterestsCtrl.tiers[0]);

                        expect(SelfieInterestsCtrl.tiers[0].show).toBe(true);

                        SelfieInterestsCtrl.expandTier(SelfieInterestsCtrl.tiers[0]);

                        expect(SelfieInterestsCtrl.tiers[0].show).toBe(false);

                        SelfieInterestsCtrl.expandTier(SelfieInterestsCtrl.tiers[0]);

                        expect(SelfieInterestsCtrl.tiers[0].show).toBe(true);

                        expect(SelfieInterestsCtrl.toggleTier).not.toHaveBeenCalled();
                    });
                });

                describe('when tier does not have children', function() {
                    it('should toggle the "show" prop and call toggle tier', function() {
                        SelfieInterestsCtrl.expandTier(SelfieInterestsCtrl.tiers[2]);
                        expect(SelfieInterestsCtrl.tiers[2].show).toBe(true);
                        expect(SelfieInterestsCtrl.toggleTier).toHaveBeenCalledWith(SelfieInterestsCtrl.tiers[2]);
                        SelfieInterestsCtrl.toggleTier.calls.reset();

                        SelfieInterestsCtrl.expandTier(SelfieInterestsCtrl.tiers[2]);
                        expect(SelfieInterestsCtrl.tiers[2].show).toBe(false);
                        expect(SelfieInterestsCtrl.toggleTier).toHaveBeenCalledWith(SelfieInterestsCtrl.tiers[2]);
                        SelfieInterestsCtrl.toggleTier.calls.reset();

                        SelfieInterestsCtrl.expandTier(SelfieInterestsCtrl.tiers[2]);
                        expect(SelfieInterestsCtrl.tiers[2].show).toBe(true);
                        expect(SelfieInterestsCtrl.toggleTier).toHaveBeenCalledWith(SelfieInterestsCtrl.tiers[2]);
                    });
                });
            });
        });
    });
});
