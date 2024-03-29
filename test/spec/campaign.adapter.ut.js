define(['app', 'angular'], function(appModule, angular) {
    'use strict';

    var copy = angular.copy;

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
            cinema6,
            MiniReelService,
            VoteService;

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
                MiniReelService = $injector.get('MiniReelService');
                VoteService = $injector.get('VoteService');

                CampaignAdapter.config = {
                    apiBase: '/api'
                };
                adapter = $injector.instantiate(CampaignAdapter, {
                    config: CampaignAdapter.config
                });
            });
        });

        afterAll(function() {
            CampaignAdapter = null;
            adapter = null;
            $rootScope = null;
            $q = null;
            $httpBackend = null;
            cinema6 = null;
            MiniReelService = null;
            VoteService = null;
            success = null;
            failure = null;
        });

        it('should exist', function() {
            expect(adapter).toEqual(jasmine.any(Object));
        });

        describe('decorateCampaign(campaign)', function() {
            var campaign,
                advertiserId, sponsoredMiniReels, sponsoredCards,
                minireels, cards, advertisers;

            beforeEach(function() {
                campaign = {
                    id: 'c-c66191ccc3eb37',
                    advertiserId: 'a-3f7cf5012b15b4',
                    miniReels: [
                        {
                            endDate: '2015-03-04T19:54:09.397Z',
                            id: 'e-18306aa3d27d54'
                        },
                        {
                            endDate: null,
                            id: 'e-f3b45211f2d9b7'
                        }
                    ],
                    cards: [
                        {
                            campaign: {
                                endDate: '2015-11-16T22:56:50.180Z',
                            },
                            id: 'rc-223a31e4d985c4'
                        },
                        {
                            campaign: {
                                endDate: null,
                            },
                            id: 'rc-06f6db8ba1877f'
                        }
                    ],
                    staticCardMap: {
                        'e-d43686a9835df1': {
                            'rc-72ba2dff0fdebf': 'rc-223a31e4d985c4',
                            'rc-bd83763f6a7a5a': 'rc-06f6db8ba1877f',
                            'rc-not-found': 'rc-06f6db8ba1877f'
                        },
                        'e-fb0e54efddc44c': {
                            'rc-b56a249106d3d8': 'rc-a6ca92dfd09795'
                        },
                        'e-91705e579c27cc': {
                            'rc-32c5ebb72266ab': 'rc-06f6db8ba1877f'
                        }
                    }
                };

                advertiserId = campaign.advertiserId;
                sponsoredMiniReels = campaign.miniReels.slice().map(function(item) { return copy(item); });
                sponsoredCards = campaign.cards.slice().map(function(item) { return copy(item); });

                advertisers = {
                    'a-3f7cf5012b15b4': {
                        id: 'a-3f7cf5012b15b4',
                        name: 'Toyota'
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
                        data: {},
                        type: 'video',
                        campaign: {
                            endDate: '2015-11-16T22:56:50.180Z',
                        }
                    },
                    'rc-06f6db8ba1877f': {
                        id: 'rc-06f6db8ba1877f',
                        data: {},
                        type: 'video',
                        campaign: {
                            endDate: null,
                        }
                    }
                };

                spyOn(cinema6.db, 'find').and.callFake(function(type, id) {
                    var object = (function() {
                        switch (type) {
                        case 'experience':
                            return minireels[id];
                        case 'card':
                            return cards[id];
                        case 'advertiser':
                            return advertisers[id];
                        default:
                            return undefined;
                        }
                    }());

                    return object ? $q.when(object) : $q.reject({
                        data: '404 NOT FOUND',
                        code: 404
                    });
                });

                spyOn(MiniReelService, 'convertCardForEditor').and.callFake(function(card) {
                    return $q.when(cards[card.id]);
                });

                $rootScope.$apply(function() {
                    adapter.decorateCampaign(campaign).then(success, failure);
                });
            });

            it('should resolve to the campaign', function() {
                expect(success).toHaveBeenCalledWith(campaign);
            });

            it('should decorate references to minireels with actual objects', function() {
                expect(campaign.advertiser).toBe(advertisers[advertiserId]);
                expect(campaign.miniReels).toEqual(sponsoredMiniReels.map(function(data) {
                    return {
                        endDate: data.endDate && new Date(data.endDate),
                        item: minireels[data.id],
                        id: data.id
                    };
                }));
            });

            it('should convert cards for the editor', function() {
                expect(campaign.cards[0]).toBe(cards['rc-223a31e4d985c4']);
                expect(campaign.cards[1]).toBe(cards['rc-06f6db8ba1877f']);
            });

            it('should convert the endDates into real dates', function() {
                expect(campaign.cards[0].campaign.endDate).toEqual(new Date('2015-11-16T22:56:50.180Z'));
                expect(campaign.cards[1].campaign.endDate).toBeNull();
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
                            },
                            {
                                wildcard: cards['rc-06f6db8ba1877f'],
                                placeholder: {}
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
                expect(campaign.staticCardMap[0].cards[0].wildcard).toBe(campaign.cards[0]);
                expect(campaign.staticCardMap[0].cards[1].wildcard).toBe(campaign.cards[1]);
                expect(campaign.staticCardMap[0].cards[2].wildcard).toBe(campaign.cards[1]);
                expect(campaign.staticCardMap[1].cards[0].wildcard).toBe(campaign.cards[1]);
            });

            describe('when advertiser decoration fails', function() {
                it('shoudl reject the promise', function() {
                    cinema6.db.find.and.callFake(function(type, id) {
                        var object = (function() {
                            switch (type) {
                            case 'experience':
                                return minireels[id];
                            case 'card':
                                return cards[id];
                            case 'advertiser':
                                return undefined;
                            default:
                                return undefined;
                            }
                        }());

                        return object ? $q.when(object) : $q.reject({
                            data: '404 NOT FOUND',
                            code: 404
                        });
                    });

                    $rootScope.$apply(function() {
                        adapter.decorateCampaign(campaign).then(success, failure);
                    });

                    expect(failure).toHaveBeenCalled();
                });
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

            [403, 500].forEach(function(status) {
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
                    miniReels: [
                        {
                            endDate: new Date().toISOString(),
                            id: 'e-eedf5ac16a340c',
                            item: {
                                id: 'e-eedf5ac16a340c',
                                title: 'My MiniReel',
                                data: {
                                    deck: []
                                }
                            }
                        }
                    ],
                    cards: [
                        {
                            id: 'rc-e7d87387399afb',
                            campaign: {
                                endDate: null,
                            },
                            item: {
                                id: 'rc-e7d87387399afb',
                                type: 'vimeo',
                                endDate: null,
                                data: {
                                    autoplay: true
                                }
                            }
                        },
                        {
                            campaign: {
                                endDate: new Date().toISOString(),
                            },
                            id: 'rc-eba4ebd9796e24',
                            item: {
                                id: 'rc-eba4ebd9796e24',
                                type: 'youtube',
                                data: {}
                            }
                        }
                    ],
                    staticCardMap: [],
                    miniReelGroups: []
                };

                spyOn(MiniReelService, 'convertCardForPlayer').and.callFake(function(card) {
                    var playerCard = copy(card);

                    delete playerCard.item;

                    return $q.when(playerCard);
                });

                postData = without(['advertiser'], extend(campaign, {
                    advertiserId: campaign.advertiser.id,
                    miniReels: campaign.miniReels.map(function(data) {
                        return {
                            endDate: data.endDate,
                            id: data.id
                        };
                    }),
                    cards: campaign.cards.map(function(card) {
                        return {
                            ballot: {
                                election: 'e-whr89f43hr8'
                            },
                            campaign: {
                                endDate: card.campaign.endDate
                            },
                            id: card.id
                        };
                    }),
                    staticCardMap: {}
                }));

                response = extend(postData, {
                    id: 'c-b2532a42ea21d6',
                    created: (new Date()).toISOString()
                });

                spyOn(adapter, 'decorateCampaign').and.returnValue($q.when(response));
                spyOn(VoteService, 'syncCard').and.callFake(function(card) {
                    expect(adapter.decorateCampaign).not.toHaveBeenCalled();
                    card.ballot = { election: 'e-whr89f43hr8' };
                    return $q.when(card);
                });

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

            it('should sync each card with the vote service', function() {
                expect(campaign.cards.length).toBeGreaterThan(0);
                campaign.cards.forEach(function(card) {
                    expect(VoteService.syncCard).toHaveBeenCalledWith(card);
                });
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
                    miniReels: [
                        {
                            endDate: new Date().toISOString(),
                            id: 'e-5b984daae2786c'
                        }
                    ],
                    cards: [
                        {
                            ballot: { election: 'e-f9834yr8734' },
                            campaign: {
                                endDate: new Date().toISOString()
                            },
                            id: 'rc-ddc10b88e25b44'
                        },
                        {
                            ballot: { election: 'e-f9834yr8734' },
                            campaign: {
                                endDate: new Date().toISOString()
                            },
                            id: 'rc-c755e74bb92856'
                        }
                    ],
                    staticCardMap: {
                        'e-50a82df1192d11': {
                            'rc-7bd45eb26582e5': 'rc-ddc10b88e25b44',
                            'rc-1d2de31db9ecdb': 'rc-c755e74bb92856'
                        },
                        'e-6a76407457ebc4': {
                            'rc-5e7caca2cd0180': 'rc-c755e74bb92856'
                        },
                        'e-2fa13f2f543cfb': {
                            'rc-1d2de31db9ecdb': 'rc-c755e74bb92856'
                        }
                    }
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

                spyOn(MiniReelService, 'convertCardForEditor').and.callFake(function(card) {
                    return $q.when(extend(card, { editor: true, ballot: undefined }));
                });

                spyOn(MiniReelService, 'convertCardForPlayer').and.callFake(function(card) {
                    var playerCard = copy(card);

                    delete playerCard.editor;

                    return $q.when(playerCard);
                });

                $rootScope.$apply(function() {
                    adapter.decorateCampaign(copy(rawCampaign)).then(function(_campaign) {
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
                spyOn(VoteService, 'syncCard').and.callFake(function(card) {
                    expect(adapter.decorateCampaign).not.toHaveBeenCalled();
                    card.ballot = { election: 'e-f9834yr8734' };
                    return $q.when(card);
                });

                $httpBackend.expectPUT('/api/campaign/' + campaign.id, without(['created'], rawCampaign))
                    .respond(200, response);

                adapter.update('campaign', campaign).then(success, failure);

                $httpBackend.flush();
            });

            it('should resolve to the response in an array', function() {
                expect(success).toHaveBeenCalledWith([response]);
            });

            it('should sync each card with the vote service', function() {
                expect(campaign.cards.length).toBeGreaterThan(0);
                campaign.cards.forEach(function(card) {
                    expect(VoteService.syncCard).toHaveBeenCalledWith(card);
                });
            });

            it('should decorate the campaign', function() {
                expect(adapter.decorateCampaign).toHaveBeenCalledWith(response);
            });
        });
    });
});
