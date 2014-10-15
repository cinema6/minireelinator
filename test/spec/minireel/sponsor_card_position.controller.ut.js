define(['app'], function(appModule) {
    'use strict';

    describe('SponsorCardPositionController', function() {
        var $rootScope,
            $controller,
            c6State,
            EditorService,
            MiniReelService,
            $scope,
            SponsorCardCtrl,
            SponsorCardPositionCtrl;

        var minireel, card;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');
                EditorService = $injector.get('EditorService');
                MiniReelService = $injector.get('MiniReelService');

                card = MiniReelService.createCard('video');

                minireel = {
                    id: 'e-320222e022518a',
                    data: {
                        deck: [
                            MiniReelService.createCard('text'),
                            MiniReelService.createCard('video'),
                            card,
                            MiniReelService.createCard('video'),
                            MiniReelService.createCard('recap')
                        ]
                    }
                };
                ['I', 'Love', 'To', 'Party']
                    .forEach(function(title, index) {
                        minireel.data.deck[index].title = title;
                    });

                Object.defineProperty(EditorService.state, 'minireel', {
                    value: minireel
                });

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorCardCtrl = $scope.SponsorCardCtrl = $controller('SponsorCardController', {
                        cState: c6State.get('MR:SponsorCard'),
                        $scope: $scope
                    });
                    SponsorCardCtrl.initWithModel(card);

                    SponsorCardPositionCtrl = $controller('SponsorCardPositionController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(SponsorCardPositionCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('position', function() {
                describe('getting', function() {
                    it('should be the index of the card in the deck', function() {
                        expect(SponsorCardPositionCtrl.position).toBe(minireel.data.deck.indexOf(card));

                        minireel.data.deck.splice(minireel.data.deck.indexOf(card), 1);
                        minireel.data.deck.splice(4, 0, card);
                        expect(SponsorCardPositionCtrl.position).toBe(minireel.data.deck.indexOf(card));
                    });
                });

                describe('setting', function() {
                    var length;

                    beforeEach(function() {
                        length = minireel.data.deck.length;
                    });

                    it('should move the card in the deck', function() {
                        SponsorCardPositionCtrl.position = 0;
                        expect(minireel.data.deck[0]).toBe(card);

                        SponsorCardPositionCtrl.position = 3;
                        expect(minireel.data.deck[3]).toBe(card);
                    });

                    it('should remove the card from the deck if set to below 0', function() {
                        SponsorCardPositionCtrl.position = -1;
                        expect(minireel.data.deck.indexOf(card)).toBe(-1);
                        expect(minireel.data.deck.length).toBe(length - 1);

                        SponsorCardPositionCtrl.position = 2;
                        expect(minireel.data.deck.indexOf(card)).toBe(2);
                        expect(minireel.data.deck.length).toBe(length);
                    });
                });
            });

            describe('positionOptions', function() {
                it('should be options for positions', function() {
                    expect(SponsorCardPositionCtrl.positionOptions).toEqual({
                        'Removed': -1,
                        'Before "I"': 0,
                        'Before "Love"': 1,
                        'Before "Party"': 2,
                        'Before Recap': 3
                    });
                });
            });
        });
    });
});
