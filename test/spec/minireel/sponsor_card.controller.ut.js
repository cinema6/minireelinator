define(['app','minireel/mixins/WizardController','angular'], function(appModule, WizardController, angular) {
    'use strict';

    var copy = angular.copy;

    describe('SponsorCardController', function() {
        var $injector,
            $rootScope,
            $controller,
            $q,
            cinema6,
            c6State,
            EditorService,
            $scope,
            sponsorCard,
            SponsorCardCtrl;

        var card;

        beforeEach(function() {
            card = {
                id: 'rc-779983f6e2e231',
                data: {}
            };

            module(appModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;

                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                c6State = $injector.get('c6State');
                EditorService = $injector.get('EditorService');

                sponsorCard = c6State.get('MR:SponsorCard');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorCardCtrl = $controller('SponsorCardController', {
                        $scope: $scope,
                        cState: sponsorCard
                    });
                    SponsorCardCtrl.model = card;
                });
            });
        });

        it('should exist', function() {
            expect(SponsorCardCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the WizardController', function() {
            expect(Object.keys(SponsorCardCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(WizardController))));
        });

        describe('properties', function() {
            describe('tabs', function() {
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

            describe('placements', function() {
                it('should be an array', function() {
                    expect(SponsorCardCtrl.placements).toEqual([]);
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
                var mr1, mr2, mr3,
                    db1, db2, db3,
                    px1, px2, px3,
                    db, px,
                    openMr,
                    syncedWith;

                beforeEach(function() {
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

                        return (openMr = px.reduce(function(result, px) {
                            return px.id === mr.id ? px : result;
                        }, null));
                    });
                    spyOn(EditorService, 'close').and.callFake(function() {
                        openMr = null;
                    });
                    spyOn(EditorService, 'sync').and.callFake(function() {
                        syncedWith.push(openMr);

                        return $q.when(openMr);
                    });

                    spyOn(c6State, 'goTo');

                    SponsorCardCtrl.place(mr1, 0);
                    SponsorCardCtrl.place(mr2, 1);
                    SponsorCardCtrl.place(mr3, 3);

                    $scope.$apply(function() {
                        SponsorCardCtrl.save();
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

                it('should close the modal', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith(sponsorCard.cParent.cName);
                });
            });
        });
    });
});
