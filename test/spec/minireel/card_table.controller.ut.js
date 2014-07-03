(function() {
    'use strict';

    define(['minireel/card_table'], function(cardTableModule) {
        describe('CardTableController', function() {
            var $rootScope,
                $controller,
                $scope,
                c6EventEmitter,
                $interval,
                VideoThumbnailService,
                DragCtrl,
                EditorCtrl,
                CardTableCtrl;

            var prototype = {
                refresh: function() {},
                collidesWith: function() {}
            };

            function Zone(id) {
                this.id = id;
                this.currentlyUnder = [];

                c6EventEmitter(this);
            }
            Zone.prototype = prototype;

            function Draggable(id) {
                this.id = id;
                this.currentlyOver = [];

                c6EventEmitter(this);
            }
            Draggable.prototype = prototype;

            beforeEach(function() {
                module(cardTableModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    c6EventEmitter = $injector.get('c6EventEmitter');
                    $interval = $injector.get('$interval');
                    VideoThumbnailService = $injector.get('VideoThumbnailService');

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        EditorCtrl = $scope.EditorCtrl = {
                            model: {
                                data: {
                                    deck: []
                                }
                            }
                        };
                        CardTableCtrl = $controller('CardTableController', { $scope: $scope });
                        $scope.Ctrl = CardTableCtrl;
                    });
                    $scope.$apply(function() {
                        DragCtrl = $controller('C6DragSpaceController', { $scope: $scope });
                    });
                });
            });

            it('should exist', function() {
                expect(CardTableCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('position', function() {
                    it('should be an object with an x property of 0', function() {
                        expect(CardTableCtrl.position).toEqual({ x: 0 });
                    });
                });

                describe('enableDrop', function() {
                    it('should be true', function() {
                        expect(CardTableCtrl.enableDrop).toBe(true);
                    });
                });
            });

            describe('methods', function() {
                describe('getThumbs(card)', function() {
                    var thumbs;

                    beforeEach(function() {
                        thumbs = {};

                        spyOn(VideoThumbnailService, 'getThumbsFor')
                            .and.returnValue(thumbs);
                    });

                    it('should proxy to the VideoThumbnailService.getThumbsFor() method', function() {
                        expect(CardTableCtrl.getThumbs({
                            data: {
                                service: 'youtube',
                                videoid: 'abc123'
                            }
                        })).toBe(thumbs);
                        expect(VideoThumbnailService.getThumbsFor).toHaveBeenCalledWith('youtube', 'abc123');

                        expect(CardTableCtrl.getThumbs({
                            data: {
                                service: 'vimeo',
                                videoid: '12345'
                            }
                        })).toBe(thumbs);
                        expect(VideoThumbnailService.getThumbsFor).toHaveBeenCalledWith('vimeo', '12345');
                    });
                });
            });

            describe('when a card should be reordered', function() {
                var card1, card2, card3, card4, card5,
                    zone0, zone1, zone2, zone3, zone4, zone5,
                    model1, model2, model3, model4, model5,
                    watchDeck, deck;

                beforeEach(function() {
                    watchDeck = jasmine.createSpy('$watch deck');

                    model1 = { id: 'rc-7bc713f331ae68' };
                    model2 = { id: 'rc-b56ea317bbd92b' };
                    model3 = { id: 'rc-8b25c1792c6ba1' };
                    model4 = { id: 'rc-8c658546dc5c5f' };
                    model5 = { id: 'rc-bc717117888f80' };

                    deck = EditorCtrl.model.data.deck = [model1, model2, model3, model4, model5];

                    card1 = new Draggable('rc-7bc713f331ae68');
                    card2 = new Draggable('rc-b56ea317bbd92b');
                    card3 = new Draggable('rc-8b25c1792c6ba1');
                    card4 = new Draggable('rc-8c658546dc5c5f');
                    card5 = new Draggable('rc-bc717117888f80');

                    zone0 = new Zone('drop-zone-0');
                    zone1 = new Zone('drop-zone-rc-7bc713f331ae68');
                    zone2 = new Zone('drop-zone-rc-b56ea317bbd92b');
                    zone3 = new Zone('drop-zone-rc-8b25c1792c6ba1');
                    zone4 = new Zone('drop-zone-rc-8c658546dc5c5f');
                    zone5 = new Zone('drop-zone-rc-bc717117888f80');

                    DragCtrl.addZone(new Zone('scroll-left'));
                    DragCtrl.addZone(new Zone('scroll-right'));
                    DragCtrl.addZone(zone0);
                    DragCtrl.addDraggable(card1);
                    DragCtrl.addZone(zone1);
                    DragCtrl.addDraggable(card2);
                    DragCtrl.addZone(zone2);
                    DragCtrl.addDraggable(card3);
                    DragCtrl.addZone(zone3);
                    DragCtrl.addDraggable(card4);
                    DragCtrl.addZone(zone4);
                    DragCtrl.addDraggable(card5);
                    DragCtrl.addZone(zone5);

                    $scope.$apply(function() {
                        $scope.DragCtrl = DragCtrl;
                    });
                    $scope.$watchCollection('EditorCtrl.model.data.deck', watchDeck);
                });

                it('should reorder the deck so the dropped card is placed after the card of the zone it was dropped on', function() {
                    card3.emit('reorder', zone1);
                    expect(deck).toEqual([model1, model3, model2, model4, model5]);

                    card2.emit('reorder', zone5);
                    expect(deck).toEqual([model1, model3, model4, model5, model2]);

                    card1.emit('reorder', zone2);
                    expect(deck).toEqual([model3, model4, model5, model2, model1]);

                    card2.emit('reorder', zone5);
                    expect(deck).toEqual([model3, model4, model5, model2, model1]);

                    card5.emit('reorder', zone0);
                    expect(deck).toEqual([model5, model3, model4, model2, model1]);

                    expect(watchDeck.calls.count()).toBe(4);
                });

                it('should work on "new" cards', function() {
                    var modelA = { id: 'rc-5162b1e7e7e3b9' },
                        cardA = new Draggable('rc-5162b1e7e7e3b9'),
                        zoneA = new Zone('drop-zone-rc-5162b1e7e7e3b9');

                    deck.splice(1, 0, modelA);

                    DragCtrl.addDraggable(cardA);
                    DragCtrl.addZone(zoneA);

                    cardA.emit('reorder', zone4);
                    expect(deck).toEqual([model1, model2, model3, model4, modelA, model5]);
                });
            });

            describe('when the card currently being dragged enters a "scroll zone".', function() {
                var card1, card2, card3,
                    scrollZoneLeft, scrollZoneRight,
                    dropZone1, dropZone2, dropZone3;

                beforeEach(function() {
                    card1 = new Draggable('rc-bf5eb89986fb4b');
                    card2 = new Draggable('rc-60c0ab194cdc56');
                    card3 = new Draggable('rc-94f1a5a52fc843');
                    scrollZoneLeft = new Zone('scroll-left');
                    scrollZoneRight = new Zone('scroll-right');
                    dropZone1 = new Zone('drop-zone-rc-bf5eb89986fb4b');
                    dropZone2 = new Zone('drop-zone-rc-60c0ab194cdc56');
                    dropZone3 = new Zone('drop-zone-rc-94f1a5a52fc843');

                    DragCtrl.addZone(scrollZoneLeft);
                    DragCtrl.addZone(scrollZoneRight);
                    DragCtrl.addZone(dropZone1);
                    DragCtrl.addDraggable(card1);
                    DragCtrl.addZone(dropZone2);
                    DragCtrl.addDraggable(card2);
                    DragCtrl.addZone(dropZone3);
                    DragCtrl.addDraggable(card3);

                    spyOn(DragCtrl, 'refresh');
                    $scope.$apply(function() {
                        $scope.DragCtrl = DragCtrl;
                    });
                });

                describe('on the right side', function() {
                    it('should do nothing if a draggable other than the card currently being dragged enters it', function() {
                        DragCtrl.currentDrags.push(card2);

                        scrollZoneRight.currentlyUnder.push(card3);
                        scrollZoneRight.emit('draggableEnter', card3);

                        $interval.flush(5000);
                        expect(CardTableCtrl.position.x).toBe(0);
                    });

                    it('should set enableDrop to false', function() {
                        DragCtrl.currentDrags.push(card2);

                        scrollZoneRight.currentlyUnder.push(card3);
                        scrollZoneRight.emit('draggableEnter', card3);

                        scrollZoneRight.currentlyUnder.push(card2);
                        scrollZoneRight.emit('draggableEnter', card2);

                        expect(CardTableCtrl.enableDrop).toBe(false);

                        scrollZoneRight.currentlyUnder.length = 0;
                        scrollZoneRight.emit('draggableLeave', card2);

                        expect(CardTableCtrl.enableDrop).toBe(true);
                    });

                    it('should scroll to the right 5px every 17ms while the card is in the zone', function() {
                        DragCtrl.currentDrags.push(card2);

                        scrollZoneRight.currentlyUnder.push(card3);
                        scrollZoneRight.emit('draggableEnter', card3);

                        scrollZoneRight.currentlyUnder.push(card2);
                        scrollZoneRight.emit('draggableEnter', card2);

                        $interval.flush(17);
                        expect(CardTableCtrl.position.x).toBe(5);
                        $interval.flush(17);
                        expect(CardTableCtrl.position.x).toBe(10);
                        $interval.flush(17);
                        expect(CardTableCtrl.position.x).toBe(15);

                        scrollZoneRight.currentlyUnder.splice(
                            scrollZoneRight.currentlyUnder.indexOf(
                                card3
                            ),
                            1
                        );
                        scrollZoneRight.emit('draggableLeave', card3);

                        $interval.flush(17);
                        expect(CardTableCtrl.position.x).toBe(20);

                        scrollZoneRight.currentlyUnder.splice(
                            scrollZoneRight.currentlyUnder.indexOf(
                                card2
                            ),
                            1
                        );
                        scrollZoneRight.emit('draggableLeave', card2);

                        $interval.flush(500);
                        expect(CardTableCtrl.position.x).toBe(20);
                    });

                    it('should stop scrolling if the card is released during scrolling', function() {
                        DragCtrl.currentDrags.push(card2);

                        scrollZoneRight.currentlyUnder.push(card2);
                        scrollZoneRight.emit('draggableEnter', card2);

                        DragCtrl.currentDrags.splice(
                            DragCtrl.currentDrags.indexOf(
                                card2
                            ),
                            1
                        );
                        scrollZoneRight.currentlyUnder.splice(
                            scrollZoneRight.currentlyUnder.indexOf(
                                card2
                            ),
                            1
                        );
                        scrollZoneRight.emit('draggableLeave', card2);

                        $interval.flush(1000);
                        expect(CardTableCtrl.position.x).toBe(0);
                        expect(CardTableCtrl.enableDrop).toBe(true);
                    });
                });

                describe('on the left side', function() {
                    it('should do nothing if a draggable other than the card currently being dragged enters it', function() {
                        DragCtrl.currentDrags.push(card2);

                        scrollZoneLeft.currentlyUnder.push(card1);
                        scrollZoneLeft.emit('draggableEnter', card1);

                        $interval.flush(5000);
                        expect(CardTableCtrl.position.x).toBe(0);
                    });

                    it('should set enableDrop to false', function() {
                        DragCtrl.currentDrags.push(card2);

                        scrollZoneLeft.currentlyUnder.push(card3);
                        scrollZoneLeft.emit('draggableEnter', card3);

                        scrollZoneLeft.currentlyUnder.push(card2);
                        scrollZoneLeft.emit('draggableEnter', card2);

                        expect(CardTableCtrl.enableDrop).toBe(false);

                        scrollZoneLeft.currentlyUnder.length = 0;
                        scrollZoneLeft.emit('draggableLeave', card2);

                        expect(CardTableCtrl.enableDrop).toBe(true);
                    });

                    it('should scroll to the left 1px every 17ms while the card is in the zone', function() {
                        CardTableCtrl.position.x = 50;

                        DragCtrl.currentDrags.push(card2);

                        scrollZoneLeft.currentlyUnder.push(card1);
                        scrollZoneLeft.emit('draggableEnter', card1);

                        scrollZoneLeft.currentlyUnder.push(card2);
                        scrollZoneLeft.emit('draggableEnter', card2);

                        $interval.flush(17);
                        expect(CardTableCtrl.position.x).toBe(45);
                        $interval.flush(17);
                        expect(CardTableCtrl.position.x).toBe(40);
                        $interval.flush(17);
                        expect(CardTableCtrl.position.x).toBe(35);

                        scrollZoneLeft.currentlyUnder.splice(
                            scrollZoneLeft.currentlyUnder.indexOf(
                                card3
                            ),
                            1
                        );
                        scrollZoneLeft.emit('draggableLeave', card3);

                        $interval.flush(17);
                        expect(CardTableCtrl.position.x).toBe(30);

                        scrollZoneLeft.currentlyUnder.splice(
                            scrollZoneLeft.currentlyUnder.indexOf(
                                card2
                            ),
                            1
                        );
                        scrollZoneLeft.emit('draggableLeave', card2);

                        $interval.flush(500);
                        expect(CardTableCtrl.position.x).toBe(30);
                    });

                    it('should stop scrolling if the card is released during scrolling', function() {
                        CardTableCtrl.position.x = 300;

                        DragCtrl.currentDrags.push(card2);

                        scrollZoneLeft.currentlyUnder.push(card2);
                        scrollZoneLeft.emit('draggableEnter', card2);

                        DragCtrl.currentDrags.splice(
                            DragCtrl.currentDrags.indexOf(
                                card2
                            ),
                            1
                        );
                        scrollZoneLeft.currentlyUnder.splice(
                            scrollZoneLeft.currentlyUnder.indexOf(
                                card2
                            ),
                            1
                        );
                        scrollZoneLeft.emit('draggableLeave', card2);

                        $interval.flush(1000);
                        expect(CardTableCtrl.position.x).toBe(300);
                        expect(CardTableCtrl.enableDrop).toBe(true);
                    });
                });
            });
        });
    });
}());
