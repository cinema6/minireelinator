define(['app','minireel/mixins/WizardController','angular'], function(appModule, WizardController, angular) {
    'use strict';

    var copy = angular.copy;

    describe('SponsorCardController', function() {
        var $injector,
            $rootScope,
            $controller,
            $q,
            $location,
            cinema6,
            c6State,
            MiniReelService,
            EditorService,
            $scope,
            sponsorCard,
            SponsorManagerCtrl,
            SponsorCardCtrl;

        var minireel, card;

        beforeEach(function() {
            card = {
                id: 'rc-779983f6e2e231',
                sponsored: true,
                collateral: {},
                data: {}
            };

            module(appModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;

                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                $location = $injector.get('$location');
                cinema6 = $injector.get('cinema6');
                c6State = $injector.get('c6State');
                EditorService = $injector.get('EditorService');
                MiniReelService = $injector.get('MiniReelService');

                minireel = {
                    id: 'e-6a5bfb268a4447',
                    data: {
                        deck: [
                            MiniReelService.createCard('video'),
                            MiniReelService.createCard('recap')
                        ]
                    }
                };

                sponsorCard = c6State.get('MR:SponsorCard');

                Object.defineProperty(EditorService.state, 'minireel', {
                    value: minireel
                });

                $scope = $rootScope.$new();
                $scope.AppCtrl = $controller('AppController', { cState: {} });
                $scope.$apply(function() {
                    SponsorManagerCtrl = $scope.SponsorManagerCtrl = $controller('SponsorManagerController', {
                        $scope: $scope,
                        cState: c6State.get('MR:Sponsor.Manager')
                    });

                    SponsorCardCtrl = $controller('SponsorCardController', {
                        $scope: $scope,
                        cState: sponsorCard
                    });
                    SponsorCardCtrl.initWithModel(card);
                });
            });
        });

        afterAll(function() {
            $injector = null;
            $rootScope = null;
            $controller = null;
            $q = null;
            $location = null;
            cinema6 = null;
            c6State = null;
            MiniReelService = null;
            EditorService = null;
            $scope = null;
            sponsorCard = null;
            SponsorManagerCtrl = null;
            SponsorCardCtrl = null;
            minireel = null;
            card = null;
        });

        it('should exist', function() {
            expect(SponsorCardCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the WizardController', function() {
            expect(Object.keys(SponsorCardCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(WizardController))));
        });

        describe('properties', function() {
            describe('model', function() {
                it('should be the card', function() {
                    expect(SponsorCardCtrl.model).toBe(card);
                });
            });

            describe('minireel', function() {
                it('should be the EditorService\'s minireel', function() {
                    expect(SponsorCardCtrl.minireel).toBe(EditorService.state.minireel);
                });
            });

            describe('tabs', function() {
                describe('if the card is not sponsored', function() {
                    beforeEach(function() {
                        card.sponsored = false;

                        SponsorCardCtrl.initWithModel(card);
                    });

                    it('should be an array of fewer tabs', function() {
                        expect(SponsorCardCtrl.tabs).toEqual([
                            {
                                name: 'Video Content',
                                sref: 'MR:SponsorCard.Video',
                                required: true
                            },
                            {
                                name: 'Branding',
                                sref: 'MR:SponsorCard.Branding',
                                required: true
                            }
                        ]);
                    });
                });

                describe('if there is no MiniReel', function() {
                    beforeEach(function() {
                        Object.defineProperty(EditorService.state, 'minireel', {
                            value: null
                        });

                        SponsorCardCtrl.initWithModel(card);
                    });

                    it('should be an array of tabs', function() {
                        expect(SponsorCardCtrl.tabs).toEqual([
                            {
                                name: 'Editorial Content',
                                sref: 'MR:SponsorCard.Copy',
                                required: true
                            },
                            {
                                name: 'Video Content',
                                sref: 'MR:SponsorCard.Video',
                                required: true
                            },
                            {
                                name: 'Survey',
                                sref: 'MR:SponsorCard.Survey',
                                required: false
                            },
                            {
                                name: 'Branding',
                                sref: 'MR:SponsorCard.Branding',
                                required: true
                            },
                            {
                                name: 'Links',
                                sref: 'MR:SponsorCard.Links',
                                required: false
                            },
                            {
                                name: 'Advertising',
                                sref: 'MR:SponsorCard.Ads',
                                required: true
                            },
                            {
                                name: 'Tracking',
                                sref: 'MR:SponsorCard.Tracking',
                                required: true
                            },
                            {
                                name: 'Placement',
                                sref: 'MR:SponsorCard.Placement',
                                required: true
                            }
                        ]);
                    });
                });

                describe('if there is a minireel', function() {
                    beforeEach(function() {
                        Object.defineProperty(EditorService.state, 'minireel', {
                            value: minireel
                        });

                        SponsorCardCtrl.initWithModel(card);
                    });

                    it('should be an array of tabs', function() {
                        expect(SponsorCardCtrl.tabs).toEqual([
                            {
                                name: 'Editorial Content',
                                sref: 'MR:SponsorCard.Copy',
                                required: true
                            },
                            {
                                name: 'Video Content',
                                sref: 'MR:SponsorCard.Video',
                                required: true
                            },
                            {
                                name: 'Survey',
                                sref: 'MR:SponsorCard.Survey',
                                required: false
                            },
                            {
                                name: 'Branding',
                                sref: 'MR:SponsorCard.Branding',
                                required: true
                            },
                            {
                                name: 'Links',
                                sref: 'MR:SponsorCard.Links',
                                required: false
                            },
                            {
                                name: 'Advertising',
                                sref: 'MR:SponsorCard.Ads',
                                required: true
                            },
                            {
                                name: 'Tracking',
                                sref: 'MR:SponsorCard.Tracking',
                                required: true
                            },
                            {
                                name: 'Placement',
                                sref: 'MR:SponsorCard.Position',
                                required: false
                            }
                        ]);
                    });

                    describe('if the minireel has one card', function() {
                        beforeEach(function() {
                            minireel.data.deck = [MiniReelService.createCard('video')];

                            SponsorCardCtrl.initWithModel(card);
                        });

                        it('should not include the placement tab', function() {
                            expect(SponsorCardCtrl.tabs).toEqual([
                                {
                                    name: 'Editorial Content',
                                    sref: 'MR:SponsorCard.Copy',
                                    required: true
                                },
                                {
                                    name: 'Video Content',
                                    sref: 'MR:SponsorCard.Video',
                                    required: true
                                },
                                {
                                    name: 'Survey',
                                    sref: 'MR:SponsorCard.Survey',
                                    required: false
                                },
                                {
                                    name: 'Branding',
                                    sref: 'MR:SponsorCard.Branding',
                                    required: true
                                },
                                {
                                    name: 'Links',
                                    sref: 'MR:SponsorCard.Links',
                                    required: false
                                },
                                {
                                    name: 'Advertising',
                                    sref: 'MR:SponsorCard.Ads',
                                    required: true
                                },
                                {
                                    name: 'Tracking',
                                    sref: 'MR:SponsorCard.Tracking',
                                    required: true
                                }
                            ]);
                        });
                    });
                });
            });

            describe('placements', function() {
                it('should be an array', function() {
                    expect(SponsorCardCtrl.placements).toEqual([]);
                });
            });

            describe('validLogo', function() {
                describe('if logo url is undefined', function() {
                    it('should be true', function() {
                        delete SponsorCardCtrl.model.collateral.logo;
                        expect(SponsorCardCtrl.validLogo).toBe(true);
                    });
                });

                describe('if the url is valid', function() {
                    it('should be true', function() {
                        SponsorCardCtrl.model.collateral.logo = 'http://example.com/image.png';
                        expect(SponsorCardCtrl.validLogo).toBe(true);
                    });
                });

                describe('if the url is not valid', function() {
                    it('should be false', function() {
                        SponsorCardCtrl.model.collateral.logo = 'example.com/image.png';
                        expect(SponsorCardCtrl.validLogo).toBe(false);
                    });
                });
            });

            describe('validThumb', function() {
                describe('if thumb url is undefined', function() {
                    it('should be true', function() {
                        delete SponsorCardCtrl.model.thumb;
                        expect(SponsorCardCtrl.validThumb).toBe(true);
                    });
                });

                describe('if the thumb is valid', function() {
                    it('should be true', function() {
                        SponsorCardCtrl.model.thumb = 'http://example.com/image.png';
                        expect(SponsorCardCtrl.validThumb).toBe(true);
                    });
                });

                describe('if the thumb is not valid', function() {
                    it('should be false', function() {
                        SponsorCardCtrl.model.thumb = 'example.com/image.png';
                        expect(SponsorCardCtrl.validThumb).toBe(false);
                    });
                });
            });

            describe('validImageSrcs', function() {
                describe('if all image urls are undefined', function() {
                    it('should be true', function() {
                        delete SponsorCardCtrl.model.thumb;
                        delete SponsorCardCtrl.model.collateral.logo;
                        expect(SponsorCardCtrl.validImageSrcs).toBe(true);
                    });
                });

                describe('if all image urls are valid', function() {
                    it('should be true', function() {
                        SponsorCardCtrl.model.thumb = 'http://example.com/image.png';
                        SponsorCardCtrl.model.collateral.logo = 'http://example.com/image.png';
                        expect(SponsorCardCtrl.validImageSrcs).toBe(true);
                    });
                });

                describe('if any of the image urls are not valid', function() {
                    it('should be false', function() {
                        SponsorCardCtrl.model.thumb = 'example.com/image.png';
                        SponsorCardCtrl.model.collateral.logo = 'http://example.com/image.png';
                        expect(SponsorCardCtrl.validImageSrcs).toBe(false);

                        SponsorCardCtrl.model.thumb = 'http://example.com/image.png';
                        SponsorCardCtrl.model.collateral.logo = 'example.com/image.png';
                        expect(SponsorCardCtrl.validImageSrcs).toBe(false);
                    });
                });
            });
        });

        describe('methods', function() {
            describe('place(minireel, index)', function() {
                var originalPlacements,
                    minireel;

                beforeEach(function() {
                    minireel = {
                        id: 'e-a27b6db8338144'
                    };

                    SponsorCardCtrl.placements = [
                        { minireel: { id: 'e-765fae6e2e9d3b' }, index: 3 },
                        { minireel: { id: 'e-e4d260e806ad93' }, index: 0 }
                    ];
                    originalPlacements = SponsorCardCtrl.placements.slice();

                    SponsorCardCtrl.place(minireel, 2);
                });

                it('should add a placement', function() {
                    expect(SponsorCardCtrl.placements).toEqual(jasmine.objectContaining(originalPlacements));
                    expect(SponsorCardCtrl.placements[2]).toEqual({
                        minireel: minireel,
                        index: 2
                    });
                });
            });

            describe('unplace(minireel, index)', function() {
                var originalPlacements,
                    minireel;

                beforeEach(function() {
                    minireel = {
                        id: 'e-e4d260e806ad93'
                    };

                    SponsorCardCtrl.placements = [
                        { minireel: { id: 'e-765fae6e2e9d3b' }, index: 3 },
                        { minireel: minireel, index: 0 },
                        { minireel: { id: 'e-a27b6db8338144' }, index: 2 },
                        { minireel: minireel, index: 2 }
                    ];
                    originalPlacements = SponsorCardCtrl.placements;

                    SponsorCardCtrl.unplace(minireel, 0);
                });

                it('should remove the placement', function() {
                    expect(SponsorCardCtrl.placements).toEqual([
                        { minireel: { id: 'e-765fae6e2e9d3b' }, index: 3 },
                        { minireel: { id: 'e-a27b6db8338144' }, index: 2 },
                        { minireel: minireel, index: 2 }
                    ]);
                    expect(SponsorCardCtrl.placements).not.toBe(originalPlacements);
                });
            });

            describe('save()', function() {
                beforeEach(function() {
                    spyOn(c6State, 'goTo');
                    spyOn(EditorService, 'sync');
                    spyOn(SponsorManagerCtrl, 'refetchMiniReels');
                });

                describe('if there is no minireel', function() {
                    var mr1, mr2, mr3,
                        db1, db2, db3,
                        px1, px2, px3,
                        db, px,
                        openMr,
                        syncedWith;

                    beforeEach(function() {
                        SponsorCardCtrl.minireel = null;

                        syncedWith = [];

                        mr1 = {
                            id: 'e-9fdf1ff998049a',
                            data: {
                                deck: [{},{},{},{}]
                            }
                        };
                        mr2 = {
                            id: 'e-1db60368271322',
                            data: {
                                deck: [{},{}]
                            }
                        };
                        mr3 = {
                            id: 'e-705e6c708e661e',
                            data: {
                                deck: [{},{},{},{},{},{}]
                            }
                        };

                        db1 = {
                            id: 'e-9fdf1ff998049a',
                            data: {
                                deck: []
                            }
                        };
                        db2 = {
                            id: 'e-1db60368271322',
                            data: {
                                deck: []
                            }
                        };
                        db3 = {
                            id: 'e-705e6c708e661e',
                            data: {
                                deck: []
                            }
                        };

                        px1 = copy(mr1);
                        px2 = copy(mr2);
                        px3 = copy(mr3);

                        db = [db1, db2, db3];
                        px = [px1, px2, px3];

                        spyOn(cinema6.db, 'find').and.callFake(function(type, id) {
                            var mr = db.reduce(function(result, mr) {
                                return mr.id === id ? mr : result;
                            }, null);

                            return mr ? $q.when(mr) : $q.reject('Not found.');
                        });
                        spyOn(EditorService, 'open').and.callFake(function(mr) {
                            if (db.indexOf(mr) < 0) { throw new Error('Invalid MR.'); }

                            return $q.when((openMr = px.reduce(function(result, px) {
                                return px.id === mr.id ? px : result;
                            }, null)));
                        });
                        spyOn(EditorService, 'close').and.callFake(function() {
                            openMr = null;
                        });
                        EditorService.sync.and.callFake(function() {
                            syncedWith.push(openMr);

                            return $q.when(openMr);
                        });

                        SponsorCardCtrl.place(mr1, 0);
                        SponsorCardCtrl.place(mr2, 1);
                        SponsorCardCtrl.place(mr3, 3);

                        $scope.$apply(function() {
                            SponsorCardCtrl.save();
                        });
                    });

                    describe('if one of the minireels has no id', function() {
                        var minireel,
                            proxy;

                        beforeEach(function() {
                            minireel = {
                                data: {
                                    deck: []
                                }
                            };
                            proxy = copy(minireel);

                            EditorService.open.and.returnValue($q.when(proxy));

                            SponsorCardCtrl.placements.length = 0;
                            SponsorCardCtrl.place(minireel, 0);

                            EditorService.open.calls.reset();
                            cinema6.db.find.calls.reset();

                            $scope.$apply(function() {
                                SponsorCardCtrl.save();
                            });
                        });

                        it('should open with the provided minireel', function() {
                            expect(EditorService.open).toHaveBeenCalledWith(minireel);
                            expect(cinema6.db.find).not.toHaveBeenCalled();
                        });
                    });

                    it('should insert the card at every placement', function() {
                        expect(px1.data.deck[0]).toBe(card);
                        expect(px2.data.deck[1]).toBe(card);
                        expect(px3.data.deck[3]).toBe(card);
                    });

                    it('should sync every minireel', function() {
                        expect(syncedWith).toEqual(px);
                    });

                    it('should close the editor service', function() {
                        expect(openMr).toBeNull();
                    });

                    it('should refetch the minireels', function() {
                        expect(SponsorManagerCtrl.refetchMiniReels).toHaveBeenCalledWith();
                    });

                    it('should close the modal', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith(sponsorCard.cParent.cName);
                    });
                });

                describe('if there is a minireel', function() {
                    var minireel;

                    beforeEach(function() {
                        SponsorCardCtrl.minireel = {
                            id: 'e-d9166c305524e3'
                        };
                        minireel = {
                            id: 'e-d9166c305524e3',
                            data: {
                                deck: []
                            }
                        };
                        spyOn(cinema6.db, 'find').and.returnValue($q.when(minireel));
                        EditorService.sync.and.returnValue($q.when(SponsorCardCtrl.minireel));

                        $scope.$apply(function() {
                            SponsorCardCtrl.save();
                        });
                    });

                    it('should get the minireel', function() {
                        expect(cinema6.db.find).toHaveBeenCalledWith('experience', SponsorCardCtrl.minireel.id);
                    });

                    it('should close the modal and go back to the modal for the MiniReel', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('MR:SponsorMiniReel', [minireel]);
                    });
                });
            });
        });

        describe('$events', function() {
            describe('$destroy', function() {
                beforeEach(function() {
                    spyOn($location, 'search');
                    spyOn(EditorService, 'close').and.callThrough();

                    $scope.$broadcast('$destroy');
                });

                it('should clear out the minrieel param', function() {
                    expect($location.search).toHaveBeenCalledWith('minireel', null);
                });
            });
        });
    });
});
