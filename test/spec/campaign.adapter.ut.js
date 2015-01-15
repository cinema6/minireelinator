define(['app'], function(appModule) {
    'use strict';

    function extend() {
        var objects = Array.prototype.slice.call(arguments);

        return objects.reduce(function(result, object) {
            return Object.keys(object).reduce(function(result, key) {
                result[key] = object[key];
                return result;
            }, result);
        }, {});
    }

    function without(keys, object) {
        return Object.keys(object)
            .filter(function(key) {
                return keys.indexOf(key) < 0;
            })
            .reduce(function(result, key) {
                result[key] = object[key];
                return result;
            }, {});
    }

    describe('CampaignAdapter', function() {
        var CampaignAdapter,
            adapter,
            $rootScope,
            $q,
            $httpBackend,
            cinema6;

        var success, failure;

        beforeEach(function() {
            success = jasmine.createSpy('success()');
            failure = jasmine.createSpy('failure()');

            module(appModule.name);

            inject(function($injector) {
                CampaignAdapter = $injector.get('CampaignAdapter');
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                $httpBackend = $injector.get('$httpBackend');
                cinema6 = $injector.get('cinema6');

                CampaignAdapter.config = {
                    apiBase: '/api'
                };
                adapter = $injector.instantiate(CampaignAdapter, {
                    config: CampaignAdapter.config
                });
            });
        });

        it('should exist', function() {
            expect(adapter).toEqual(jasmine.any(Object));
        });

        describe('decorateCampaign(campaign)', function() {
            var campaign,
                advertiserId, customerId, miniReelIds, cardIds, targetMiniReelIds,
                minireels, cards, advertisers, customers;

            beforeEach(function() {
                campaign = {
                    id: 'c-c66191ccc3eb37',
                    advertiserId: 'a-3f7cf5012b15b4',
                    customerId: 'cus-5156b33a6f834c',
                    miniReels: [
                        {
                            id: 'e-18306aa3d27d54',
                            adtechId: '1234567'
                        },
                        {
                            id: 'e-f3b45211f2d9b7',
                            adtechId: '7654321'
                        }
                    ],
                    cards: [
                        {
                            id: 'rc-223a31e4d985c4',
                            adtechId: '24681379'
                        },
                        {
                            id: 'rc-06f6db8ba1877f',
                            adtechId: '13792468'
                        }
                    ],
                    targetMiniReels: [
                        {
                            id: 'e-e182df71093fdd',
                            adtechId: '86429753'
                        }
                    ],
                    staticCardMap: {
                        'e-d43686a9835df1': {
                            'rc-72ba2dff0fdebf': 'rc-223a31e4d985c4',
                            'rc-bd83763f6a7a5a': 'rc-06f6db8ba1877f'
                        },
                        'e-91705e579c27cc': {
                            'rc-32c5ebb72266ab': 'rc-06f6db8ba1877f'
                        }
                    },
                    miniReelGroups: [
                        {
                            label: 'My Favorite Group',
                            miniReels: ['e-18306aa3d27d54', 'e-d43686a9835df1', 'e-91705e579c27cc'],
                            cards: ['rc-223a31e4d985c4', 'rc-06f6db8ba1877f']
                        },
                        {
                            label: 'My Other Favorite Group',
                            miniReels: ['e-f3b45211f2d9b7', 'e-d43686a9835df1'],
                            cards: ['rc-223a31e4d985c4']
                        }
                    ]
                };

                advertiserId = campaign.advertiserId;
                customerId = campaign.customerId;
                miniReelIds = campaign.miniReels.map(function(data) {
                    return data.id;
                });
                cardIds = campaign.cards.map(function(data) {
                    return data.id;
                });
                targetMiniReelIds = campaign.targetMiniReels.map(function(data) {
                    return data.id;
                });

                advertisers = {
                    'a-3f7cf5012b15b4': {
                        id: 'a-3f7cf5012b15b4',
                        name: 'Toyota'
                    }
                };

                customers = {
                    'cus-5156b33a6f834c': {
                        id: 'cus-5156b33a6f834c',
                        name: 'Sterling Cooper Draper Pryce'
                    }
                };

                minireels = {
                    'e-18306aa3d27d54': {
                        id: 'e-18306aa3d27d54',
                        title: 'Awesome MR'
                    },
                    'e-f3b45211f2d9b7': {
                        id: 'e-f3b45211f2d9b7',
                        title: 'The Best MR Ever'
                    },
                    'e-e182df71093fdd': {
                        id: 'e-e182df71093fdd',
                        title: 'You HAVE to Watch This NOW!'
                    },
                    'e-d43686a9835df1': {
                        id: 'e-d43686a9835df1',
                        data: {
                            deck: [
                                {
                                    id: 'rc-72ba2dff0fdebf'
                                },
                                {
                                    id: 'rc-bd83763f6a7a5a'
                                }
                            ]
                        }
                    },
                    'e-91705e579c27cc': {
                        id: 'e-91705e579c27cc',
                        data: {
                            deck: [
                                {
                                    id: 'rc-32c5ebb72266ab'
                                }
                            ]
                        }
                    }
                };

                cards = {
                    'rc-223a31e4d985c4': {
                        id: 'rc-223a31e4d985c4',
                        title: 'You NEED to Buy This Thing!'
                    },
                    'rc-06f6db8ba1877f': {
                        id: 'rc-06f6db8ba1877f',
                        title: 'This Product Will Fix EVERYTHING in Your Life!'
                    }
                };

                spyOn(cinema6.db, 'find').and.callFake(function(type, id) {
                    switch (type) {
                    case 'experience':
                        return $q.when(minireels[id]);
                    case 'card':
                        return $q.when(cards[id]);
                    case 'advertiser':
                        return $q.when(advertisers[id]);
                    case 'customer':
                        return $q.when(customers[id]);
                    default:
                        return $q.reject('NOT FOUND');
                    }
                });

                $rootScope.$apply(function() {
                    adapter.decorateCampaign(campaign).then(success, failure);
                });
            });

            it('should resolve to the campaign', function() {
                expect(success).toHaveBeenCalledWith(campaign);
            });

            it('should decorate references to cards and minireels with actual objects', function() {
                expect(campaign.advertiser).toBe(advertisers[advertiserId]);
                expect(campaign.customer).toBe(customers[customerId]);
                expect(campaign.miniReels).toEqual(miniReelIds.map(function(id) {
                    return minireels[id];
                }));
                expect(campaign.cards).toEqual(cardIds.map(function(id) {
                    return cards[id];
                }));
                expect(campaign.targetMiniReels).toEqual(targetMiniReelIds.map(function(id) {
                    return minireels[id];
                }));
            });

            it('should convert the staticCardMap to a larger format', function() {
                expect(campaign.staticCardMap).toEqual([
                    {
                        minireel: minireels['e-d43686a9835df1'],
                        cards: [
                            {
                                wildcard: cards['rc-223a31e4d985c4'],
                                placeholder: minireels['e-d43686a9835df1'].data.deck[0]
                            },
                            {
                                wildcard: cards['rc-06f6db8ba1877f'],
                                placeholder: minireels['e-d43686a9835df1'].data.deck[1]
                            }
                        ]
                    },
                    {
                        minireel: minireels['e-91705e579c27cc'],
                        cards: [
                            {
                                wildcard: cards['rc-06f6db8ba1877f'],
                                placeholder: minireels['e-91705e579c27cc'].data.deck[0]
                            }
                       ]
                    }
                ]);
            });

            it('should convert the miniReelGroups into an object with actual instances', function() {
                expect(campaign.miniReelGroups).toEqual([
                    {
                        label: 'My Favorite Group',
                        miniReels: [minireels['e-18306aa3d27d54'], minireels['e-d43686a9835df1'], minireels['e-91705e579c27cc']],
                        cards: [cards['rc-223a31e4d985c4'], cards['rc-06f6db8ba1877f']]
                    },
                    {
                        label: 'My Other Favorite Group',
                        miniReels: [minireels['e-f3b45211f2d9b7'], minireels['e-d43686a9835df1']],
                        cards: [cards['rc-223a31e4d985c4']]
                    }
                ]);
            });
        });

        describe('findAll(type)', function() {
            var campaigns;

            beforeEach(function() {
                campaigns = [
                    {
                        id: 'c-b4aa9c3f6b49eb'
                    },
                    {
                        id: 'c-a9378d9b2ede14'
                    },
                    {
                        id: 'c-9818a0fb34cd3c'
                    }
                ];

                spyOn(adapter, 'decorateCampaign').and.callFake(function(campaign) {
                    return $q.when(campaign);
                });

                $httpBackend.expectGET('/api/campaigns')
                    .respond(200, campaigns);

                adapter.findAll('campaign').then(success, failure);

                $httpBackend.flush();
            });

            it('should decorate every campaign', function() {
                expect(adapter.decorateCampaign.calls.count()).toBe(3);
                campaigns.forEach(function(campaign) {
                    expect(adapter.decorateCampaign).toHaveBeenCalledWith(campaign);
                });
            });

            it('should resolve to the campaigns', function() {
                expect(success).toHaveBeenCalledWith(campaigns);
            });
        });

        describe('find(type, id)', function() {
            var campaign;

            beforeEach(function() {
                campaign = {
                    id: 'c-1deba77c90bfcb'
                };

                spyOn(adapter, 'decorateCampaign').and.returnValue($q.when(campaign));

                $httpBackend.expectGET('/api/campaign/' + campaign.id)
                    .respond(200, campaign);

                adapter.find('campaign', campaign.id).then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the campaign in an array', function() {
                expect(success).toHaveBeenCalledWith([campaign]);
            });

            it('should decorate the campaign', function() {
                expect(adapter.decorateCampaign).toHaveBeenCalledWith(campaign);
            });
        });

        describe('findQuery(type, query, meta)', function() {
            var campaigns,
                meta;

            beforeEach(function() {
                meta = {};

                campaigns = [
                    {
                        id: 'c-0e94754de1bc35'
                    },
                    {
                        id: 'c-dbe004becbcf77'
                    }
                ];

                spyOn(adapter, 'decorateCampaign').and.callFake(function(campaign) {
                    return $q.when(campaign);
                });

                $httpBackend.expectGET('/api/campaigns?limit=50&skip=100')
                    .respond(200, campaigns, {
                        'Content-Range': 'items 51-100/320'
                    });

                adapter.findQuery('campaign', {
                    limit: 50,
                    skip: 100
                }, meta).then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the campaigns', function() {
                expect(success).toHaveBeenCalledWith(campaigns);
            });

            it('should decorate the meta object with pagination info', function() {
                expect(meta.items).toEqual({
                    start: 51,
                    end: 100,
                    total: 320
                });
            });

            it('should decorate every campaign', function() {
                expect(adapter.decorateCampaign.calls.count()).toBe(2);
                campaigns.forEach(function(campaign) {
                    expect(adapter.decorateCampaign).toHaveBeenCalledWith(campaign);
                });
            });

            describe('if the status is 404', function() {
                beforeEach(function() {
                    success.calls.reset();

                    $httpBackend.expectGET('/api/campaigns?user=u-25d5a5bab3e33c')
                        .respond(404, 'NOT FOUND');

                    adapter.findQuery('campaign', {
                        user: 'u-25d5a5bab3e33c'
                    }).then(success, failure);

                    $httpBackend.flush();
                });

                it('should resolve to an empty array', function() {
                    expect(success).toHaveBeenCalledWith([]);
                });
            });

            [401, 403, 500].forEach(function(status) {
                describe('if the status is ' + status, function() {
                    beforeEach(function() {
                        failure.calls.reset();

                        $httpBackend.expectGET('/api/campaigns?org=o-9294f9bb2f92b8')
                            .respond(status, 'IT FAILED');

                        adapter.findQuery('campaign', {
                            org: 'o-9294f9bb2f92b8'
                        }).then(success, failure);

                        $httpBackend.flush();
                    });

                    it('should reject', function() {
                        expect(failure).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: 'IT FAILED'
                        }));
                    });
                });
            });
        });

        describe('create(type, data)', function() {
            var campaign, postData, response;

            beforeEach(function() {
                campaign = {
                    advertiser: {
                        id: 'a-94b3a91e07a8c1',
                        name: 'Coca-Cola'
                    },
                    customer: {
                        id: 'cus-1e061e7a787603',
                        name: 'Sterling Cooper Draper Pryce'
                    },
                    miniReels: [
                        {
                            id: 'e-eedf5ac16a340c',
                            title: 'My MiniReel',
                            data: {
                                deck: []
                            }
                        }
                    ],
                    cards: [
                        {
                            id: 'rc-e7d87387399afb',
                            type: 'vimeo',
                            data: {
                                autoplay: true
                            }
                        },
                        {
                            id: 'rc-eba4ebd9796e24',
                            type: 'youtube',
                            data: {}
                        }
                    ],
                    targetMiniReels: [
                        {
                            id: 'e-287bb6c1441a04',
                            title: 'It\'s a Target!',
                            data: {
                                deck: [{}]
                            }
                        }
                    ],
                    staticCardMap: [],
                    miniReelGroups: []
                };

                postData = without(['advertiser', 'customer'], extend(campaign, {
                    advertiserId: campaign.advertiser.id,
                    customerId: campaign.customer.id,
                    miniReels: campaign.miniReels.map(function(minireel) {
                        return {
                            id: minireel.id
                        };
                    }),
                    cards: campaign.cards.map(function(card) {
                        return {
                            id: card.id
                        };
                    }),
                    targetMiniReels: campaign.targetMiniReels.map(function(minireel) {
                        return {
                            id: minireel.id
                        };
                    }),
                    staticCardMap: {}
                }));

                response = extend(postData, {
                    id: 'c-b2532a42ea21d6',
                    created: (new Date()).toISOString()
                });

                spyOn(adapter, 'decorateCampaign').and.returnValue($q.when(response));

                $httpBackend.expectPOST('/api/campaign', postData)
                    .respond(201, response);

                adapter.create('campaign', campaign).then(success, failure);

                $httpBackend.flush();
            });

            it('should return the response in an array', function() {
                expect(success).toHaveBeenCalledWith([response]);
            });

            it('should decorate the campaign', function() {
                expect(adapter.decorateCampaign).toHaveBeenCalledWith(response);
            });
        });

        describe('erase(type, model)', function() {
            var campaign;

            beforeEach(function() {
                campaign = {
                    id: 'c-f3199b8de31932'
                };

                $httpBackend.expectDELETE('/api/campaign/' + campaign.id)
                    .respond(204, '');

                adapter.erase('campaign', campaign).then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to null', function() {
                expect(success).toHaveBeenCalledWith(null);
            });
        });

        describe('update(type, model)', function() {
            var rawCampaign, campaign, response;

            beforeEach(function() {
                rawCampaign = {
                    id: 'c-2d56941fa19b69',
                    created: '2014-12-01T23:26:46.182Z',
                    advertiserId: 'a-6d54ea5400aa8e',
                    customerId: 'cus-1e061e7a787603',
                    miniReels: [
                        {
                            id: 'e-5b984daae2786c',
                            adtechId: '1234567'
                        }
                    ],
                    cards: [
                        {
                            id: 'rc-ddc10b88e25b44',
                            adtechId: '7654321'
                        }
                    ],
                    targetMiniReels: [
                        {
                            id: 'e-6bcadd5f84d9d8',
                            adtechId: '24681379'
                        }
                    ],
                    staticCardMap: {
                        'e-50a82df1192d11': {
                            'rc-7bd45eb26582e5': 'rc-789f23554ad597',
                            'rc-1d2de31db9ecdb': 'rc-c755e74bb92856'
                        },
                        'e-6a76407457ebc4': {
                            'rc-5e7caca2cd0180': 'rc-c755e74bb92856'
                        },
                        'e-2fa13f2f543cfb': {
                            'rc-1d2de31db9ecdb': 'rc-c755e74bb92856'
                        }
                    },
                    miniReelGroups: [
                        {
                            label: 'My Favorite Group',
                            miniReels: ['e-e06b2c4c0f3f3a', 'e-c0bb634aeb9d09'],
                            cards: ['rc-219c8b95e584b2']
                        },
                        {
                            label: 'My Other Favorite Group',
                            miniReels: ['e-49c349d99d7ae0', 'e-c0bb634aeb9d09', 'e-e849f8df3a8939', 'e-5dfb9da8b5b1d4'],
                            cards: ['rc-219c8b95e584b2', 'rc-87f4d923c3a844']
                        }
                    ]
                };

                spyOn(cinema6.db, 'find').and.callFake(function(type, id) {
                    return $q.when({
                        id: id,
                        title: type,
                        data: {
                            deck: [
                                { id: 'rc-7bd45eb26582e5' },
                                { id: 'rc-1d2de31db9ecdb' },
                                { id: 'rc-5e7caca2cd0180' }
                            ]
                        }
                    });
                });

                $rootScope.$apply(function() {
                    adapter.decorateCampaign(extend(rawCampaign)).then(function(_campaign) {
                        campaign = _campaign;
                    });
                });

                campaign.staticCardMap.push({
                    minireel: {
                        id: 'e-499b27c3f68b5f',
                        data: {
                            deck: []
                        }
                    },
                    cards: [
                        {
                            placeholder: { id: 'rc-e0844f6c12a7b7' },
                            wildcard: null
                        },
                        {
                            placeholder: { id: 'rc-68f44577ae362b' },
                            wildcard: null
                        }
                    ]
                });
                campaign.staticCardMap[2].cards.push({
                    placeholder: { id: 'rc-dc6ebb1fa9fdb5' },
                    wildcard: null
                });

                response = extend(rawCampaign, {
                    lastUpdated: (new Date()).toISOString()
                });

                spyOn(adapter, 'decorateCampaign').and.returnValue($q.when(response));

                $httpBackend.expectPUT('/api/campaign/' + campaign.id, rawCampaign)
                    .respond(200, response);

                adapter.update('campaign', campaign).then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the response in an array', function() {
                expect(success).toHaveBeenCalledWith([response]);
            });

            it('should decorate the campaign', function() {
                expect(adapter.decorateCampaign).toHaveBeenCalledWith(response);
            });
        });
    });
});
