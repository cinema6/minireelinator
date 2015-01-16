define(['app'], function(appModule) {
    'use strict';

    describe('CampaignPlacementsController', function() {
        var $rootScope,
            $controller,
            $q,
            c6State,
            cinema6,
            MiniReelService,
            scopePromise,
            ScopedPromise,
            $scope,
            CampaignPlacementsState,
            PortalCtrl,
            CampaignPlacementsCtrl;

        var staticCardMap;

        var myWildcard;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                MiniReelService = $injector.get('MiniReelService');
                scopePromise = $injector.get('scopePromise');

                ScopedPromise = scopePromise($q.defer().promise).constructor;

                myWildcard = cinema6.db.create('card', {
                    id: 'rc-17e31bd5abcd54',
                    type: 'video',
                    data: {}
                });

                CampaignPlacementsState = c6State.get('MR:Campaign.Placements');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    $scope.PortalCtrl = PortalCtrl = $controller('PortalController', {
                        $scope: $scope
                    });
                    PortalCtrl.model = {
                        org: {
                            id: 'o-af832d9d946478'
                        }
                    };

                    $scope.CampaignPlacementsCtrl = CampaignPlacementsCtrl = $controller('CampaignPlacementsController', {
                        $scope: $scope,
                        cState: CampaignPlacementsState
                    });
                    CampaignPlacementsCtrl.initWithModel((CampaignPlacementsState.cModel = (function() {
                        var minireel = cinema6.db.create('experience', {
                            id: 'e-cc597c4791834f',
                            data: {
                                deck: [
                                    {
                                        id: 'rc-0cf7574bedb733',
                                        type: 'text'
                                    },
                                    {
                                        id: 'rc-e9a3504eea35af',
                                        type: 'wildcard'
                                    },
                                    {
                                        id: 'rc-b10a89b8373ce4',
                                        type: 'video'
                                    },
                                    {
                                        id: 'rc-39c0db593bf6d1',
                                        type: 'wildcard'
                                    }
                                ]
                            }
                        });

                        return (staticCardMap = [
                            {
                                minireel: minireel,
                                cards: [
                                    {
                                        placeholder: minireel.data.deck[3],
                                        wildcard: myWildcard
                                    }
                                ]
                            }
                        ]);
                    }())));
                });
            });
        });

        it('should exist', function() {
            expect(CampaignPlacementsCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('result', function() {
                it('should be null', function() {
                    expect(CampaignPlacementsCtrl.result).toBeNull();
                });
            });

            describe('query', function() {
                it('should be an empty string', function() {
                    expect(CampaignPlacementsCtrl.query).toBe('');
                });
            });

            describe('model', function() {
                it('should be the static card map', function() {
                    expect(CampaignPlacementsCtrl.model).toBe(staticCardMap);
                });

                it('should be augmented to include an entry for every minireel\'s placeholder cards', function() {
                    var minireel = staticCardMap[0].minireel;

                    expect(staticCardMap[0].cards).toEqual([
                        {
                            placeholder: minireel.data.deck[1],
                            wildcard: null
                        },
                        {
                            placeholder: minireel.data.deck[3],
                            wildcard: myWildcard
                        }
                    ]);
                });
            });
        });

        describe('methods', function() {
            describe('search()', function() {
                var findAllDeferred,
                    result;

                beforeEach(function() {
                    findAllDeferred = $q.defer();

                    spyOn(cinema6.db, 'findAll').and.returnValue(findAllDeferred.promise);

                    CampaignPlacementsCtrl.query = 'Foo Bar';

                    $scope.$apply(function() {
                        result = CampaignPlacementsCtrl.search();
                    });
                });

                it('should query for experiences', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('experience', {
                        org: PortalCtrl.model.org.id,
                        text: CampaignPlacementsCtrl.query
                    });
                });

                it('should return the query\'s promise', function() {
                    expect(result).toBe(findAllDeferred.promise);
                });

                it('should set the result to a scoped promise for the request', function() {
                    expect(CampaignPlacementsCtrl.result).toEqual(jasmine.any(ScopedPromise));
                    expect(CampaignPlacementsCtrl.result.promise).toBe(findAllDeferred.promise);
                });
            });

            describe('add(minireel)', function() {
                var minireel;

                beforeEach(function() {
                    minireel = cinema6.db.create('expeience', {
                        id: 'e-2af4cc821a6b04',
                        data: {
                            deck: [
                                {
                                    id: 'rc-92df6f0e4b361c',
                                    type: 'video'
                                },
                                {
                                    id: 'rc-c2a9655f75e245',
                                    type: 'videoBallot'
                                },
                                {
                                    id: 'rc-a1688bb26326ec',
                                    type: 'wildcard'
                                },
                                {
                                    id: 'rc-f94b6351eaefe5',
                                    type: 'wildcard'
                                },
                                {
                                    id: 'rc-653a9712dbb6ca',
                                    type: 'recap'
                                }
                            ]
                        }
                    });

                    spyOn(c6State, 'goTo');

                    CampaignPlacementsCtrl.add(minireel);
                });

                it('should add the minireel to the staticCardMap', function() {
                    expect(staticCardMap.length).not.toBe(1);
                    expect(staticCardMap[1]).toEqual({
                        minireel: minireel,
                        cards: [
                            {
                                placeholder: minireel.data.deck[2],
                                wildcard: null
                            },
                            {
                                placeholder: minireel.data.deck[3],
                                wildcard: null
                            }
                        ]
                    });
                });

                it('should go to the "MR:Placements.MiniReel" state', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith('MR:Placements.MiniReel', [staticCardMap[1]]);
                });
            });

            describe('remove(minireel)', function() {
                var minireel, entry;

                beforeEach(function() {
                    minireel = cinema6.db.create('experience', {
                        id: 'e-8afbf48a0681cc',
                        data: {
                            deck: []
                        }
                    });

                    entry = staticCardMap[staticCardMap.push({
                        minireel: minireel,
                        cards: []
                    }) - 1];

                    CampaignPlacementsCtrl.remove(minireel);
                });

                it('should remove the minireel\'s entry from the staticCardMap', function() {
                    expect(staticCardMap.length).not.toBe(0);
                    expect(staticCardMap).not.toContain(entry);
                });
            });

            describe('filledCardsOf(entry)', function() {
                beforeEach(function() {
                    staticCardMap.push({
                        minireel: {},
                        cards: [
                            {
                                placeholder: {},
                                wildcard: {}
                            },
                            {
                                placeholder: {},
                                wildcard: {}
                            }
                        ]
                    });
                });

                it('should return the cards of an entry that have a wildcard', function() {
                    expect(CampaignPlacementsCtrl.filledCardsOf(staticCardMap[0])).toEqual([staticCardMap[0].cards[1]]);
                    expect(CampaignPlacementsCtrl.filledCardsOf(staticCardMap[1])).toEqual(staticCardMap[1].cards);
                });
            });

            describe('availableSlotsIn(minireel)', function() {
                var result;

                beforeEach(function() {
                    result = CampaignPlacementsCtrl.availableSlotsIn({
                        data: {
                            deck: ['text', 'video', 'videoBallot', 'wildcard', 'wildcard', 'video', 'wildcard', 'recap']
                                .map(MiniReelService.createCard)
                        }
                    });
                });

                it('should return the number of wildcards in the deck', function() {
                    expect(result).toBe(3);
                });
            });

            describe('isNotAlreadyTargeted(minireel)', function() {
                var isNotAlreadyTargeted;

                var notTargeted;

                beforeEach(function() {
                    isNotAlreadyTargeted = CampaignPlacementsCtrl.isNotAlreadyTargeted;

                    notTargeted = ['e-e9581182c1a22c', 'e-31cc21b9470ad7', 'e-1c9a3807418b45'].map(function(id) {
                        return cinema6.db.create('experience', {
                            id: id,
                            data: {
                                deck: []
                            }
                        });
                    });

                    staticCardMap.push.apply(staticCardMap, ['e-b9f84d3f9ee970', 'e-c59097d3a2bb06'].map(function(id) {
                        return {
                            minireel: cinema6.db.create('experience', {
                                id: id,
                                data: {
                                    deck: []
                                }
                            }),
                            cards: []
                        };
                    }));
                });

                describe('if the minireel is not being targeted', function() {
                    it('should return true', function() {
                        notTargeted.forEach(function(minireel) {
                            expect(isNotAlreadyTargeted(minireel)).toBe(true);
                        });
                    });
                });

                describe('if the minireel is being targeted', function() {
                    it('should return false', function() {
                        staticCardMap.forEach(function(entry) {
                            expect(isNotAlreadyTargeted(entry.minireel)).toBe(false);
                        });
                    });
                });
            });
        });

        describe('$events', function() {
            describe('CampaignCtrl:campaignDidSave', function() {
                beforeEach(function() {
                    spyOn(CampaignPlacementsCtrl, 'initWithModel').and.callThrough();

                    $rootScope.$broadcast('CampaignCtrl:campaignDidSave');
                });

                it('should call initWithModel again', function() {
                    expect(CampaignPlacementsCtrl.initWithModel).toHaveBeenCalledWith(CampaignPlacementsState.cModel);
                });
            });
        });
    });
});
