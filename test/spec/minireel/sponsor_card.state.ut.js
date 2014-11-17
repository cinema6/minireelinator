define(['app','minireel/services'], function(appModule, servicesModule) {
    'use strict';

    describe('MR:SponsorCard state', function() {
        var $rootScope,
            c6State,
            cinema6,
            SettingsService,
            EditorService,
            MiniReelService,
            $location,
            $q,
            sponsorCard,
            portal;

        var card;

        beforeEach(function() {
            module(appModule.name);
            module(servicesModule.name, function($provide) {
                $provide.decorator('MiniReelService', function($delegate) {
                    var createCard = $delegate.createCard;

                    spyOn($delegate, 'createCard').and.callFake(function() {
                        return (card = createCard.apply($delegate, arguments));
                    });

                    return $delegate;
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                SettingsService = $injector.get('SettingsService');
                EditorService = $injector.get('EditorService');
                MiniReelService = $injector.get('MiniReelService');
                $location = $injector.get('$location');
                $q = $injector.get('$q');
            });

            portal = c6State.get('Portal');
            portal.cModel = {};
            sponsorCard = c6State.get('MR:SponsorCard');
        });

        it('should exist', function() {
            expect(sponsorCard).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var success;

            beforeEach(function() {
                success = jasmine.createSpy('success()');

                spyOn(EditorService, 'close').and.callThrough();

                $rootScope.$apply(function() {
                    sponsorCard.model({
                        cardId: null
                    }).then(success);
                });
            });

            it('should return a sponsored card', function() {
                expect(MiniReelService.createCard).toHaveBeenCalledWith('video');
                expect(success).toHaveBeenCalledWith(card);
                expect(card.sponsored).toBe(true);
                expect(card.data.autoadvance).toBe(false);
            });

            describe('if there is a minireel parameter', function() {
                var minireel,
                    card;

                beforeEach(function() {
                    success.calls.reset();

                    card = MiniReelService.createCard('video');
                    card.id = 'rc-71a55729757283';
                    minireel = {
                        id: 'e-c79d5512fb7739',
                        data: {
                            splash: {
                                ratio: '5-4',
                                theme: 'horizontal-stack',
                                source: 'specified'
                            },
                            deck: [
                                MiniReelService.createCard('text'),
                                MiniReelService.createCard('video'),
                                MiniReelService.createCard('video'),
                                MiniReelService.createCard('recap')
                            ]
                        }
                    };
                    minireel.data.deck = minireel.data.deck.map(function(card) {
                        return MiniReelService.convertCard(card, minireel);
                    });
                    card = minireel.data.deck[1];

                    SettingsService.register('MR::user', {
                        minireelDefaults: {
                            splash: {
                                ratio: '5-4',
                                theme: 'horizontal-stack',
                                source: 'specified'
                            }
                        }
                    }, {
                        localSync: false
                    });

                    spyOn(cinema6.db, 'find').and.returnValue($q.when(minireel));
                    spyOn($location, 'search').and.returnValue({
                        minireel: 'e-c79d5512fb7739'
                    });
                    spyOn(EditorService, 'open').and.callThrough();

                    $rootScope.$apply(function() {
                        sponsorCard.model({ cardId: card.id }).then(success);
                    });
                });

                it('should close the EditorService', function() {
                    expect(EditorService.close).toHaveBeenCalled();
                });

                it('should find the minireel', function() {
                    expect(cinema6.db.find).toHaveBeenCalledWith('experience', 'e-c79d5512fb7739');
                });

                it('should open the minireel', function() {
                    expect(EditorService.open).toHaveBeenCalledWith(minireel);
                });

                it('should return the card', function() {
                    expect(success).toHaveBeenCalledWith(EditorService.state.minireel.data.deck[1]);
                });

                describe('if there is a MiniReel open', function() {
                    beforeEach(function() {
                        EditorService.open(minireel);
                        card = EditorService.state.minireel.data.deck[1];

                        success.calls.reset();
                        EditorService.open.calls.reset();
                        EditorService.close.calls.reset();
                        cinema6.db.find.calls.reset();
                    });

                    describe('with the same ID', function() {
                        beforeEach(function() {
                            $location.search.and.returnValue({
                                minireel: minireel.id
                            });

                            $rootScope.$apply(function() {
                                sponsorCard.model({ cardId: card.id }).then(success);
                            });
                        });

                        it('should not close the EditorService', function() {
                            expect(EditorService.close).not.toHaveBeenCalled();
                        });

                        it('should not open a new MiniReel', function() {
                            expect(EditorService.open).not.toHaveBeenCalled();
                        });

                        it('should resolve to the card', function() {
                            expect(success.calls.mostRecent().args[0]).toBe(card);
                        });
                    });

                    describe('with a different ID', function() {
                        beforeEach(function() {
                            $location.search.and.returnValue({
                                minireel: 'e-83c1ff30c7a113'
                            });

                            $rootScope.$apply(function() {
                                sponsorCard.model({ cardId: card.id }).then(success);
                            });
                        });

                        it('should close the EditorService', function() {
                            expect(EditorService.close).toHaveBeenCalled();
                        });

                        it('should find the minireel', function() {
                            expect(cinema6.db.find).toHaveBeenCalledWith('experience', 'e-83c1ff30c7a113');
                        });

                        it('should open the minireel', function() {
                            expect(EditorService.open).toHaveBeenCalledWith(minireel);
                        });

                        it('should return the card', function() {
                            expect(success).toHaveBeenCalledWith(EditorService.state.minireel.data.deck[1]);
                        });
                    });
                });
            });
        });
    });
});
