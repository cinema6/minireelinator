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

    describe('SelfieCampaignAdapter', function() {
        var CampaignAdapter,
            adapter,
            $rootScope,
            $q,
            $httpBackend,
            cinema6,
            MiniReelService;

        var success, failure;

        beforeEach(function() {
            success = jasmine.createSpy('success()');
            failure = jasmine.createSpy('failure()');

            module(appModule.name);

            inject(function($injector) {
                CampaignAdapter = $injector.get('SelfieCampaignAdapter');
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                $httpBackend = $injector.get('$httpBackend');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');

                spyOn(MiniReelService, 'convertCardForEditor').and.callFake(function(card) {
                    return card;
                });
                spyOn(MiniReelService, 'convertCardForPlayer').and.callFake(function(card) {
                    return card;
                });

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
            var campaign;

            beforeEach(function() {
                campaign = {
                    id: 'c-c66191ccc3eb37',
                    advertiserId: 'a-3f7cf5012b15b4',
                    customerId: 'cus-5156b33a6f834c',
                    cards: [
                        {
                            endDate: null,
                            id: 'rc-223a31e4d985c4'
                        },
                        {
                            endDate: '2015-03-04T19:54:26.806Z',
                            id: 'rc-06f6db8ba1877f'
                        }
                    ]
                };

                $rootScope.$apply(function() {
                    adapter.decorateCampaign(campaign).then(success, failure);
                });
            });

            it('should resolve to the campaign', function() {
                expect(success).toHaveBeenCalledWith(campaign);
            });

            it('should convert the cards for editor', function() {
                expect(MiniReelService.convertCardForEditor).toHaveBeenCalledWith(campaign.cards[0]);
                expect(MiniReelService.convertCardForEditor).toHaveBeenCalledWith(campaign.cards[1]);
            });

            it('should handle a campaign with no cards', function() {
                delete campaign.cards;

                $rootScope.$apply(function() {
                    adapter.decorateCampaign(campaign).then(success, failure);
                });

                expect(success).toHaveBeenCalledWith(campaign);
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
                    cards: [
                        {
                            endDate: null,
                            id: 'rc-e7d87387399afb',
                            type: 'vimeo',
                            data: {
                                autoplay: true
                            }
                        },
                        {
                            endDate: new Date().toISOString(),
                            id: 'rc-eba4ebd9796e24',
                            type: 'youtube',
                            data: {}
                        }
                    ],
                    categories: [],
                    pricing: {},
                    geoTargeting: [],
                    advertiserId: 'a-3f7cf5012b15b4',
                    customerId: 'cus-5156b33a6f834c',
                };

                response = extend(campaign, {
                    id: 'c-b2532a42ea21d6',
                    created: (new Date()).toISOString()
                });

                spyOn(adapter, 'decorateCampaign').and.returnValue($q.when(response));

                $httpBackend.expectPOST('/api/campaign', campaign)
                    .respond(201, response);

                adapter.create('campaign', campaign).then(success, failure);

                $httpBackend.flush();
            });

            it('should convert the cards for the player', function() {
                expect(MiniReelService.convertCardForPlayer).toHaveBeenCalledWith(campaign.cards[0]);
                expect(MiniReelService.convertCardForPlayer).toHaveBeenCalledWith(campaign.cards[1]);
            });

            it('should return the response in an array', function() {
                expect(success).toHaveBeenCalledWith([response]);
            });

            it('should decorate the campaign', function() {
                expect(adapter.decorateCampaign).toHaveBeenCalledWith(response);
            });

            it('should handle a campaign with no cards array', function() {
                // delete postData.cards;
                delete campaign.cards;

                response = extend(campaign, {
                    id: 'c-b2532a42ea21d6',
                    created: (new Date()).toISOString()
                });

                adapter.decorateCampaign.and.returnValue($q.when(response));

                $httpBackend.expectPOST('/api/campaign', postData)
                    .respond(201, response);

                adapter.create('campaign', campaign).then(success, failure);

                $httpBackend.flush();

                expect(success).toHaveBeenCalledWith([response]);
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
            var campaign, response;

            beforeEach(function() {
                campaign = {
                    id: 'c-2d56941fa19b69',
                    created: '2014-12-01T23:26:46.182Z',
                    advertiserId: 'a-6d54ea5400aa8e',
                    customerId: 'cus-1e061e7a787603',
                    cards: [
                        {
                            endDate: new Date().toISOString(),
                            id: 'rc-ddc10b88e25b44'
                        }
                    ]
                };

                response = extend(campaign, {
                    lastUpdated: (new Date()).toISOString()
                });

                spyOn(adapter, 'decorateCampaign').and.returnValue($q.when(response));

                $httpBackend.expectPUT('/api/campaign/' + campaign.id, without(['created'], campaign))
                    .respond(200, response);

                adapter.update('campaign', campaign).then(success, failure);

                $httpBackend.flush();
            });

            it('should convert the cards for the player', function() {
                expect(MiniReelService.convertCardForPlayer).toHaveBeenCalledWith(campaign.cards[0]);
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
