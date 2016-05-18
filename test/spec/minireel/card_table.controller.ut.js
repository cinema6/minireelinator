(function() {
    'use strict';

    define(['minireel/card_table'], function(cardTableModule) {
        describe('CardTableController', function() {
            var $rootScope,
                $controller,
                $scope,
                c6EventEmitter,
                $interval,
                ThumbnailService,
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

            function Draggable(id, left, right) {
                this.id = id;
                this.currentlyOver = [];
                this.display = {
                    left: left,
                    right: right
                };

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
                    ThumbnailService = $injector.get('ThumbnailService');

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

            afterAll(function() {
                $rootScope = null;
                $controller = null;
                $scope = null;
                c6EventEmitter = null;
                $interval = null;
                ThumbnailService = null;
                DragCtrl = null;
                EditorCtrl = null;
                CardTableCtrl = null;
                prototype = null;
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

                describe('scrollerRect', function() {
                    it('should be an object with width of 1', function() {
                        expect(CardTableCtrl.scrollerRect).toEqual({ width: 1 });
                    });
                });

                describe('firstButtonWidth', function() {
                    it('should be 1', function() {
                        expect(CardTableCtrl.firstButtonWidth).toBe(1);
                    });
                });

                describe('scrollerFullWidth', function() {
                    it('should be 1', function() {
                        expect(CardTableCtrl.scrollerFullWidth).toBe(1);
                    });
                });

                describe('deck', function() {
                    it('should be the deck', function() {
                        expect(CardTableCtrl.deck).toEqual($scope.EditorCtrl.model.data.deck);
                    });
                });

                describe('scrollerViewRatio', function() {
                    it('should be undefined', function() {
                        expect(CardTableCtrl.scrollerViewRatio).not.toBeDefined();
                    });

                    describe('when DragCtrl is loaded', function() {
                        beforeEach(function() {
                            DragCtrl.addZone(new Zone('scroll-left'));
                            DragCtrl.addZone(new Zone('scroll-right'));
                            $scope.$apply(function() {
                                $scope.DragCtrl = DragCtrl;
                            });
                        });

                        it('should be 0 once DragCtrl is found', function() {
                            expect(CardTableCtrl.scrollerViewRatio).toBe(0);
                        });

                        it('should calculate based on width of scroller area in view, width of the entire hidden scrollable container, and the first button width', function() {
                            CardTableCtrl.setScrollerRect({width: 1050});
                            CardTableCtrl.setScrollerFullWidth(4000);
                            CardTableCtrl.setFirstButtonWidth(50);

                            expect(CardTableCtrl.scrollerViewRatio).toBe(0.25);

                            CardTableCtrl.setScrollerRect({width: 550});
                            CardTableCtrl.setScrollerFullWidth(4000);
                            CardTableCtrl.setFirstButtonWidth(50);

                            expect(CardTableCtrl.scrollerViewRatio).toBe(0.125);
                        });

                        it('should not be more than 1 if the viewable area is wider than the scrollable container', function() {
                            CardTableCtrl.setScrollerRect({width: 1050});
                            CardTableCtrl.setScrollerFullWidth(500);
                            CardTableCtrl.setFirstButtonWidth(50);

                            expect(CardTableCtrl.scrollerViewRatio).toBe(1);

                            CardTableCtrl.setScrollerRect({width: 1050});
                            CardTableCtrl.setScrollerFullWidth(4000);
                            CardTableCtrl.setFirstButtonWidth(50);

                            expect(CardTableCtrl.scrollerViewRatio).toBe(0.25);
                        });
                    });
                });

                describe('scrollerViewPosition', function() {
                    it('should be undefined', function() {
                        expect(CardTableCtrl.scrollerViewPosition).not.toBeDefined();
                    });

                    describe('when DragCtrl is loaded', function() {
                        beforeEach(function() {
                            DragCtrl.addZone(new Zone('scroll-left'));
                            DragCtrl.addZone(new Zone('scroll-right'));
                            $scope.$apply(function() {
                                $scope.DragCtrl = DragCtrl;
                            });
                        });

                        it('should be 0', function() {
                            expect(CardTableCtrl.scrollerViewPosition).toBe(0);
                        });

                        it('should calculate based on position.x within the full scrollable container', function() {
                            CardTableCtrl.position.x = 50;
                            CardTableCtrl.setScrollerFullWidth(5000);

                            expect(CardTableCtrl.scrollerViewPosition).toBe(0.01);

                            CardTableCtrl.position.x = 100;
                            CardTableCtrl.setScrollerFullWidth(5000);

                            expect(CardTableCtrl.scrollerViewPosition).toBe(0.02);

                            CardTableCtrl.position.x = 100;
                            CardTableCtrl.setScrollerFullWidth(4000);

                            expect(CardTableCtrl.scrollerViewPosition).toBe(0.025);
                        });
                    });
                });
            });

            describe('methods', function() {
                describe('getThumbs(card)', function() {
                    var thumbs;

                    beforeEach(function() {
                        thumbs = {};

                        spyOn(ThumbnailService, 'getThumbsFor')
                            .and.returnValue(thumbs);
                    });

                    it('should proxy to the ThumbnailService.getThumbsFor() method', function() {
                        expect(CardTableCtrl.getThumbs({
                            data: {
                                service: 'youtube',
                                videoid: 'abc123'
                            }
                        })).toBe(thumbs);
                        expect(ThumbnailService.getThumbsFor).toHaveBeenCalledWith('youtube', 'abc123', {
                            service: 'youtube',
                            videoid: 'abc123'
                        });

                        expect(CardTableCtrl.getThumbs({
                            data: {
                                service: 'vimeo',
                                videoid: '12345'
                            }
                        })).toBe(thumbs);
                        expect(ThumbnailService.getThumbsFor).toHaveBeenCalledWith('vimeo', '12345', {
                            service: 'vimeo',
                            videoid: '12345'
                        });
                    });
                });

                describe('setScrollerFullWidth(width)', function() {
                    it('should set the scrollerFullWidth property', function() {
                        CardTableCtrl.setScrollerFullWidth(1000);
                        expect(CardTableCtrl.scrollerFullWidth).toBe(1000);
                    });
                });

                describe('setScrollerRect(rect)', function() {
                    it('should set the scrollerRect property', function() {
                        var rect = {
                            width: 900,
                            left: 50,
                            right: 1300,
                            top: 1000,
                            bottom: 600,
                            height: 400
                        };

                        CardTableCtrl.setScrollerRect(rect);
                        expect(CardTableCtrl.scrollerRect).toEqual(rect);
                    });
                });

                describe('setFirstButtonWidth(width)', function() {
                    it('should set the firstButtonWidth property', function() {
                        CardTableCtrl.setFirstButtonWidth(60);
                        expect(CardTableCtrl.firstButtonWidth).toBe(60);
                    });
                });

                describe('scroll(direction)', function() {
                    it('should be undefined', function() {
                        expect(CardTableCtrl.scroll).not.toBeDefined();
                    });

                    describe('after DragCtrl is loaded', function() {
                        describe('when going right', function() {
                            var scrollerRect, deck,
                                model1, model2, model3, model4, model5,
                                card1, card2, card3, card4, card5;

                            beforeEach(function() {
                                CardTableCtrl.setScrollerFullWidth(5500);
                                CardTableCtrl.setFirstButtonWidth(0);

                                model1 = { id: 'rc-7bc713f331ae68' };
                                model2 = { id: 'rc-b56ea317bbd92b' };
                                model3 = { id: 'rc-8b25c1792c6ba1' };
                                model4 = { id: 'rc-8c658546dc5c5f' };
                                model5 = { id: 'rc-bc717117888f80' };

                                deck = EditorCtrl.model.data.deck = [model1, model2, model3, model4, model5];

                                card1 = new Draggable('rc-7bc713f331ae68', 0, 1000);
                                card2 = new Draggable('rc-b56ea317bbd92b', 1100, 2100);
                                card3 = new Draggable('rc-8b25c1792c6ba1', 2200, 3200);
                                card4 = new Draggable('rc-8c658546dc5c5f', 3300, 4300);
                                card5 = new Draggable('rc-bc717117888f80', 4400, 5500);

                                DragCtrl.addDraggable(card1);
                                DragCtrl.addDraggable(card2);
                                DragCtrl.addDraggable(card3);
                                DragCtrl.addDraggable(card4);
                                DragCtrl.addDraggable(card5);

                                DragCtrl.addZone(new Zone('scroll-left'));
                                DragCtrl.addZone(new Zone('scroll-right'));

                                $scope.$apply(function() {
                                    $scope.DragCtrl = DragCtrl;
                                });
                            });

                            describe('when a card is partially in view', function() {
                                it('should move 100 pixels every 17ms until it reaches the target position', function() {
                                    CardTableCtrl.scrollerRect = {
                                        width: 1500,
                                        left: 0,
                                        right: 1500
                                    };
                                    CardTableCtrl.position.x = 0;

                                    CardTableCtrl.scroll('right');
                                    $interval.flush(17);
                                    expect(CardTableCtrl.position.x).toBe(100);
                                    $interval.flush(17);
                                    expect(CardTableCtrl.position.x).toBe(200);
                                    $interval.flush(17);
                                    expect(CardTableCtrl.position.x).toBe(300);
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(1100);
                                });

                                it('should set the position so that the overlapping card is first from left', function() {
                                    CardTableCtrl.scrollerRect = {
                                        width: 1500,
                                        left: 0,
                                        right: 1500
                                    };
                                    CardTableCtrl.position.x = 0;

                                    CardTableCtrl.scroll('right');
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(1100);
                                });

                                it('should account for first button width', function() {
                                    CardTableCtrl.firstButtonWidth = 50;
                                    CardTableCtrl.scrollerRect = {
                                        width: 1500,
                                        left: 0,
                                        right: 1500
                                    };
                                    CardTableCtrl.position.x = 0;

                                    CardTableCtrl.scroll('right');
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(1050);
                                });

                                it('should not set position too far to the right', function() {
                                    CardTableCtrl.scrollerRect = {
                                        width: 1500,
                                        left: 0,
                                        right: 1500
                                    };
                                    CardTableCtrl.position.x = 3800;
                                    CardTableCtrl.scroll('right');
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(4000);
                                });
                            });

                            describe('when there is no card overlapping the edge', function() {
                                it('should move 100 pixels every 17ms until it reaches the target position', function() {
                                    CardTableCtrl.scrollerRect = {
                                        width: 1000,
                                        left: 0,
                                        right: 1000
                                    };
                                    CardTableCtrl.position.x = 0;

                                    CardTableCtrl.scroll('right');
                                    $interval.flush(17);
                                    expect(CardTableCtrl.position.x).toBe(100);
                                    $interval.flush(17);
                                    expect(CardTableCtrl.position.x).toBe(200);
                                    $interval.flush(17);
                                    expect(CardTableCtrl.position.x).toBe(300);
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(1100);
                                });

                                it('should set the position so that the next card outside of view is first from left', function() {
                                    CardTableCtrl.scrollerRect = {
                                        width: 1000,
                                        left: 0,
                                        right: 1000
                                    };
                                    CardTableCtrl.position.x = 0;

                                    CardTableCtrl.scroll('right');
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(1100);
                                });

                                it('should account for first button width', function() {
                                    CardTableCtrl.firstButtonWidth = 50;
                                    CardTableCtrl.scrollerRect = {
                                        width: 1000,
                                        left: 0,
                                        right: 1000
                                    };
                                    CardTableCtrl.position.x = 0;

                                    CardTableCtrl.scroll('right');
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(1050);
                                });

                                it('should not set position too far to the right', function() {
                                    CardTableCtrl.scrollerRect = {
                                        width: 1000,
                                        left: 0,
                                        right: 1000
                                    };
                                    CardTableCtrl.position.x = 4200;
                                    CardTableCtrl.scroll('right');
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(4500);
                                });
                            });
                        });

                        describe('when going left', function() {
                            var scrollerRect, deck,
                                model1, model2, model3, model4, model5,
                                card1, card2, card3, card4, card5;

                            beforeEach(function() {
                                CardTableCtrl.setScrollerFullWidth(5500);
                                CardTableCtrl.setFirstButtonWidth(0);

                                model1 = { id: 'rc-7bc713f331ae68' };
                                model2 = { id: 'rc-b56ea317bbd92b' };
                                model3 = { id: 'rc-8b25c1792c6ba1' };
                                model4 = { id: 'rc-8c658546dc5c5f' };
                                model5 = { id: 'rc-bc717117888f80' };

                                deck = EditorCtrl.model.data.deck = [model1, model2, model3, model4, model5];

                                card1 = new Draggable('rc-7bc713f331ae68', -2700, -1700);
                                card2 = new Draggable('rc-b56ea317bbd92b', -1600, -600);
                                card3 = new Draggable('rc-8b25c1792c6ba1', -500, 500);
                                card4 = new Draggable('rc-8c658546dc5c5f', 600, 1600);
                                card5 = new Draggable('rc-bc717117888f80', 1700, 2700);

                                DragCtrl.addDraggable(card1);
                                DragCtrl.addDraggable(card2);
                                DragCtrl.addDraggable(card3);
                                DragCtrl.addDraggable(card4);
                                DragCtrl.addDraggable(card5);

                                DragCtrl.addZone(new Zone('scroll-left'));
                                DragCtrl.addZone(new Zone('scroll-right'));

                                $scope.$apply(function() {
                                    $scope.DragCtrl = DragCtrl;
                                });
                            });

                            describe('when a card is partially in view', function() {
                                it('should move 100 pixels every 17ms until it reaches the target position', function() {
                                    CardTableCtrl.scrollerRect = {
                                        width: 1500,
                                        left: 0,
                                        right: 1500
                                    };
                                    CardTableCtrl.position.x = 3000;

                                    CardTableCtrl.scroll('left');
                                    $interval.flush(17);
                                    expect(CardTableCtrl.position.x).toBe(2900);
                                    $interval.flush(17);
                                    expect(CardTableCtrl.position.x).toBe(2800);
                                    $interval.flush(17);
                                    expect(CardTableCtrl.position.x).toBe(2700);
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(2000);
                                });

                                it('should set the position so that the overlapping card is all the way right', function() {
                                    CardTableCtrl.scrollerRect = {
                                        width: 1500,
                                        left: 0,
                                        right: 1500
                                    };
                                    CardTableCtrl.position.x = 3000;

                                    CardTableCtrl.scroll('left');
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(2000);
                                });

                                it('should account for first button width', function() {
                                    CardTableCtrl.firstButtonWidth = 50;
                                    CardTableCtrl.scrollerRect = {
                                        width: 1500,
                                        left: 0,
                                        right: 1500
                                    };
                                    CardTableCtrl.position.x = 3000;

                                    CardTableCtrl.scroll('left');
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(2050);
                                });

                                it('should not set position too far to the right', function() {
                                    CardTableCtrl.scrollerRect = {
                                        width: 1500,
                                        left: 0,
                                        right: 1500
                                    };
                                    CardTableCtrl.position.x = 1000;
                                    CardTableCtrl.scroll('left');
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(0);
                                });
                            });

                            describe('when there is no card overlapping the edge', function() {
                                beforeEach(function() {
                                    CardTableCtrl.scrollerRect = {
                                        width: 1000,
                                        left: 0,
                                        right: 1000
                                    };
                                    card1.display.left = -2200
                                    card1.display.right = -1200;
                                    card2.display.left = -1100;
                                    card2.display.right = -100;
                                    card3.display.left = 0;
                                    card3.display.right = 1000;
                                    card4.display.left = 1100;
                                    card4.display.right = 2100;
                                    card5.display.left = 2200;
                                    card5.display.right = 3200;
                                });

                                it('should move 100 pixels every 17ms until it reaches the target position', function() {
                                    CardTableCtrl.position.x = 2200;

                                    CardTableCtrl.scroll('left');
                                    $interval.flush(17);
                                    expect(CardTableCtrl.position.x).toBe(2100);
                                    $interval.flush(17);
                                    expect(CardTableCtrl.position.x).toBe(2000);
                                    $interval.flush(17);
                                    expect(CardTableCtrl.position.x).toBe(1900);
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(1100);
                                });

                                it('should set the position so that the next card outside of view is first from left', function() {
                                    CardTableCtrl.position.x = 2200; // lines up with 3rd card

                                    CardTableCtrl.scroll('left');
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(1100); // moves to line up with 2nd card
                                });

                                it('should account for first button width', function() {
                                    CardTableCtrl.firstButtonWidth = 50;
                                    CardTableCtrl.position.x = 2200;

                                    CardTableCtrl.scroll('left');
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(1150);
                                });

                                it('should not set position too far to the right', function() {
                                    CardTableCtrl.scrollerRect = {
                                        width: 1000,
                                        left: 0,
                                        right: 1000
                                    };
                                    CardTableCtrl.position.x = 500;
                                    CardTableCtrl.scroll('left');
                                    $interval.flush(5000);
                                    expect(CardTableCtrl.position.x).toBe(0);
                                });
                            });
                        });
                    });
                });

                describe('scrollTo(position)', function() {
                    it('should be undefined', function() {
                        expect(CardTableCtrl.scrollTo).not.toBeDefined();
                    });

                    describe('when DragCtrl has been loaded', function() {
                        it('should set the position based on the width of the scrollable container', function() {
                            DragCtrl.addZone(new Zone('scroll-left'));
                            DragCtrl.addZone(new Zone('scroll-right'));

                            $scope.$apply(function() {
                                $scope.DragCtrl = DragCtrl;
                            });

                            spyOn($scope, '$digest');

                            CardTableCtrl.scrollerFullWidth = 1000;

                            CardTableCtrl.scrollTo(0.5);
                            $interval.flush(5000);

                            expect(CardTableCtrl.position.x).toBe(500);
                            expect($scope.$digest).toHaveBeenCalled();
                        });
                    });
                });

                describe('scrollToCard(card)', function() {
                    it('should be undefined', function() {
                        expect(CardTableCtrl.scrollToCard).not.toBeDefined();
                    });

                    describe('when DragCtrl has been loaded', function() {
                        var scrollerRect, deck,
                            model1, model2, model3, model4, model5,
                            card1, card2, card3, card4, card5;

                        beforeEach(function() {
                            CardTableCtrl.setScrollerFullWidth(5500);
                            CardTableCtrl.setFirstButtonWidth(0);

                            model1 = { id: 'rc-7bc713f331ae68' };
                            model2 = { id: 'rc-b56ea317bbd92b' };
                            model3 = { id: 'rc-8b25c1792c6ba1' };
                            model4 = { id: 'rc-8c658546dc5c5f' };
                            model5 = { id: 'rc-bc717117888f80' };

                            deck = EditorCtrl.model.data.deck = [model1, model2, model3, model4, model5];

                            card1 = new Draggable('rc-7bc713f331ae68', 0, 1000);
                            card2 = new Draggable('rc-b56ea317bbd92b', 1100, 2100);
                            card3 = new Draggable('rc-8b25c1792c6ba1', 2200, 3200);
                            card4 = new Draggable('rc-8c658546dc5c5f', 3300, 4300);
                            card5 = new Draggable('rc-bc717117888f80', 4400, 5500);

                            DragCtrl.addDraggable(card1);
                            DragCtrl.addDraggable(card2);
                            DragCtrl.addDraggable(card3);
                            DragCtrl.addDraggable(card4);
                            DragCtrl.addDraggable(card5);

                            DragCtrl.addZone(new Zone('scroll-left'));
                            DragCtrl.addZone(new Zone('scroll-right'));

                            $scope.$apply(function() {
                                $scope.DragCtrl = DragCtrl;
                            });
                        });

                        it('should set the position so that the selected card is all the way to left', function() {
                            CardTableCtrl.scrollerRect = {
                                width: 1500,
                                left: 0,
                                right: 1500
                            };
                            CardTableCtrl.position.x = 0;

                            CardTableCtrl.scrollToCard(model3);
                            $interval.flush(5000);
                            expect(CardTableCtrl.position.x).toBe(2200);

                            [card1,card2,card3,card4,card5].forEach(function(card) {
                                card.display.left -= 2200;
                                card.display.right -= 2200;
                            });

                            CardTableCtrl.scrollToCard(model1);
                            $interval.flush(5000);
                            expect(CardTableCtrl.position.x).toBe(0);

                            [card1,card2,card3,card4,card5].forEach(function(card) {
                                card.display.left += 2200;
                                card.display.right += 2200;
                            });
                        });

                        it('should move 100 pixels every 17ms until it reaches the target position', function() {
                            CardTableCtrl.scrollerRect = {
                                width: 1500,
                                left: 0,
                                right: 1500
                            };
                            CardTableCtrl.position.x = 0;

                            CardTableCtrl.scrollToCard(model3);
                            $interval.flush(17);
                            expect(CardTableCtrl.position.x).toBe(100);
                            $interval.flush(17);
                            expect(CardTableCtrl.position.x).toBe(200);
                            $interval.flush(17);
                            expect(CardTableCtrl.position.x).toBe(300);
                            $interval.flush(5000);
                            expect(CardTableCtrl.position.x).toBe(2200);

                            [card1,card2,card3,card4,card5].forEach(function(card) {
                                card.display.left -= 2200;
                                card.display.right -= 2200;
                            });

                            CardTableCtrl.scrollToCard(model1);
                            $interval.flush(17);
                            expect(CardTableCtrl.position.x).toBe(2100);
                            $interval.flush(17);
                            expect(CardTableCtrl.position.x).toBe(2000);
                            $interval.flush(17);
                            expect(CardTableCtrl.position.x).toBe(1900);
                            $interval.flush(5000);
                            expect(CardTableCtrl.position.x).toBe(0);

                            [card1,card2,card3,card4,card5].forEach(function(card) {
                                card.display.left += 2200;
                                card.display.right += 2200;
                            });
                        });
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
