define( ['angular','c6uilib','minireel/services','minireel/c6_drag'],
function( angular , c6uilib , services          , c6Drag           ) {
    'use strict';

    var forEach = angular.forEach;

    function refresh($element) {
        $element.inheritedData('cDragCtrl').refresh();
    }

    return angular.module('c6.app.minireel.cardTable', [c6uilib.name, c6Drag.name, services.name])
        .animation('.card__drop-zone', function() {
            return {
                beforeRemoveClass: function($element, className, done) {
                    function shrink($element, done) {
                        $element
                            .animate({
                                width: '2px'
                            },{
                                complete: done,
                                progress: function() {
                                    refresh($element);
                                }
                            });

                        return function() {
                            $element.stop();
                        };
                    }

                    switch (className) {
                    case 'c6-drag-zone-active':
                        return shrink($element, done);
                    default:
                        return done();
                    }
                },
                beforeAddClass: function($element, className, done) {
                    function grow($element, done) {
                        var remPx = parseInt(
                            angular.element('html')
                                .css('font-size'),
                            10
                        );

                        $element
                            .animate({
                                width: ((13.5 * remPx)) + 'px'
                            },{
                                complete: done,
                                progress: function() {
                                    refresh($element);
                                }
                            });

                        return function() {
                            $element.stop();
                        };
                    }

                    switch (className) {
                    case 'c6-drag-zone-active':
                        return grow($element, done);
                    default:
                        return done();
                    }
                }
            };
        })

        .animation('.new__container', function() {
            return {
                beforeAddClass: function($element, className, done) {
                    function hide($element, done) {
                        $element.animate({
                            width: 0,
                            margin: 0
                        },{
                            complete: done,
                            progress: function() {
                                refresh($element);
                            }
                        });

                        return function() {
                            $element.stop();
                        };
                    }

                    switch (className) {
                    case 'ng-hide':
                        return hide($element, done);
                    default:
                        return done();
                    }
                },
                removeClass: function($element, className, done) {
                    function show($element, done) {
                        $element.animate({
                            width: '2.25em',
                            margin: '0 0.75em 0 0'
                        }, {
                            complete: done,
                            progress: function() {
                                refresh($element);
                            }
                        });

                        return function() {
                            $element.stop();
                        };
                    }

                    switch (className) {
                    case 'ng-hide':
                        return show($element, done);
                    default:
                        return done();
                    }
                }
            };
        })

        .animation('.card__container', function() {
            return {
                removeClass: function($element, className, done) {
                    function grow($element, done) {
                        var zone = $element.data('cDragZone');

                        $element.animate({
                            width: '10rem'
                        }, {
                            complete: function() {
                                done();
                            },
                            progress: function() {
                                refresh($element);
                            }
                        });

                        return function() {
                            $element.stop();
                            $element.removeAttr('style');
                            zone.emit('animationComplete');
                        };
                    }

                    switch (className) {
                    case 'card__container--dragging':
                        return grow($element, done);
                    default:
                        return done();
                    }
                }
            };
        })

        .animation('.card__item', ['$animate',
        function                  ( $animate ) {
            var forEach = angular.forEach,
                $ = angular.element;

            return {
                beforeRemoveClass: function($element, className, done) {
                    function zipBack($element, done) {
                        var draggable = $element.data('cDrag'),
                            dropZones = draggable.currentlyOver.filter(function(zone) {
                                return zone.id.search(/drop-zone-\w+/) > -1;
                            }),
                            dropZone = dropZones[dropZones.length - 1],
                            zone = $element.inheritedData('cDragZone');

                        function toNewPosition() {
                            var $ul = $element.closest('ul'),
                                $dropZones = $ul.find('.card__drop-zone');

                            dropZone.$element.addClass('card__drop-zone--reordering');
                            draggable.emit('reorder', dropZone);

                            zone.once('animationComplete', function() {
                                $element.animate({
                                    top: zone.display.top,
                                    left: zone.display.left
                                }, {
                                    progress: function() {
                                        draggable.refresh();
                                    },
                                    complete: function() {
                                        dropZone.$element.removeClass(
                                            [
                                                'card__drop-zone--reordering',
                                                'c6-drag-zone-active'
                                            ].join(' ')
                                        );
                                        $element.css({'top' : 0, 'left' : 0});
                                        forEach($dropZones, function(dropZone) {
                                            $animate.removeClass(
                                                $(dropZone),
                                                'c6-drag-zone-active'
                                            );
                                        });
                                        done();
                                        refresh($element);
                                    }
                                });
                            });

                            return function() {
                                dropZone.$element.removeClass(
                                    'card__drop-zone--reordering'
                                );
                            };
                        }

                        function toOldPosition() {
                            zone.once('animationComplete', function() {
                                $element.animate({
                                    top: zone.display.top,
                                    left: zone.display.left
                                }, {
                                    complete: function() {
                                        $element.css({'top' : 0, 'left' : 0});
                                        done();
                                    }
                                });
                            });
                        }

                        if (dropZone) {
                            return toNewPosition();
                        } else {
                            return toOldPosition();
                        }
                    }

                    switch (className) {
                    case 'c6-dragging':
                        return zipBack($element, done);
                    default:
                        return done();
                    }
                }
            };
        }])

        .directive('c6BindScroll', ['c6Debounce',
        function                   ( c6Debounce ) {
            return {
                restrict: 'A',
                link: function(scope, $element, $attrs) {
                    var element_ = $element[0],
                        update = c6Debounce(function() {
                            var scroll = scope.$eval($attrs.c6BindScroll);

                            scope.$apply(function() {
                                scroll.x = element_.scrollLeft;
                                scroll.y = element_.scrollTop;
                            });
                        }, 100);

                    function handleScroll() {
                        scope.$emit(
                            'c6-bind-scroll(' + $attrs.id + '):scroll',
                            element_.scrollLeft,
                            element_.scrollTop
                        );
                        update();
                    }

                    scope.$watch($attrs.c6BindScroll, function(scroll) {
                        element_.scrollTop = scroll.y;
                        element_.scrollLeft = scroll.x;

                        scroll.y = element_.scrollTop;
                        scroll.x = element_.scrollLeft;
                    }, true);

                    $element.on('scroll', handleScroll);
                }
            };
        }])

        .directive('renderDeck', [function() {
            return {
                transclude: 'element',
                link: function(scope, $element, attrs, controller, transclude) {
                    var deck = attrs.renderDeck,
                        $parent = $element.parent(),
                        cache = {};

                    function CardView(data) {
                        var cardScope = scope.$new();

                        cardScope.$this = data;

                        this.$element = transclude(cardScope, function($clone) {
                            $parent.append($clone);
                        });
                        this.data = data;
                        this.scope = cardScope;
                    }

                    scope.$watchCollection(deck, function(deck) {
                        forEach(deck, function(card, index) {
                            var view = cache[card.id];

                            if (view) {
                                $parent.append(view.$element);
                            } else {
                                view = cache[card.id] = new CardView(card);
                            }

                            view.scope.$index = index;
                        });

                        forEach(cache, function(view, id) {
                            if (deck.indexOf(view.data) < 0) {
                                delete cache[id];
                                view.scope.$destroy();
                                view.$element.remove();
                            }
                        });
                    });
                }
            };
        }])

        .directive('cardTablePaginatorItem', [function() {
            return {
                restrict: 'A',
                require: '^cardTablePaginator',
                link: function(scope, $element, attrs, controller) {
                    controller.itemReady();
                }
            };
        }])

        .controller('CardTablePaginatorController', ['$scope',function($scope) {
            var buttonCounter = 0;

            $scope.ready = false;

            this.itemReady = function() {
                buttonCounter++;

                if (buttonCounter === $scope.deck.length - 1) {
                    $scope.ready = true;
                }
            };
        }])

        .directive('cardTablePaginator', [function() {
            return {
                restrict: 'E',
                templateUrl: 'views/minireel/directives/card_table_paginator.html',
                controller: 'CardTablePaginatorController',
                controllerAs: 'CardTablePaginatorCtrl',
                transclude: true,
                scope: {
                    deck: '=',
                    onScroll: '&',
                    scrollerViewRatio: '=',
                    scrollerViewPosition: '='
                },
                link: function(scope, $element) {
                    var $list = $element.find('.pageMap__list'),
                        $scrollBox = $element.find('.pageMap__scrollBox'),
                        $scroller = $element.find('.pageMap__scroller'),
                        scroller = $scroller.data('cDrag'),
                        buttonWidth = 0;

                    function getScrollBoxRect() {
                        return $scrollBox[0].getBoundingClientRect();
                    }

                    function beforeMove(marker, event) {
                        var scrollBoxRect = getScrollBoxRect(),
                            desired = event.desired,
                            position = Math.min(
                                    Math.max(
                                        desired.left,
                                        scrollBoxRect.left
                                    ),
                                    scrollBoxRect.right - scroller.display.width
                                ),
                            positionRatio = (position - scrollBoxRect.left) /
                                scrollBoxRect.width;

                        event.preventDefault();

                        scope.onScroll({ position: positionRatio });

                        $scroller.css({ left: position + 'px' });
                    }

                    function dropStart() {
                        var scrollBoxRect = getScrollBoxRect(),
                            currLeft = parseInt($scroller.css('left'));

                        $scroller.css({
                            top: '',
                            left: Math.min(
                                    currLeft - scrollBoxRect.left,
                                    scrollBoxRect.width - scroller.display.width
                                ) + 'px'
                        });
                    }

                    scroller.on('beforeMove', beforeMove)
                        .on('dropStart', dropStart);

                    scope.$watch('ready', function(ready) {
                        if (ready) {
                            var buttons = scope.deck.length + 1,
                                listWidth = $list.width();

                            buttonWidth = listWidth / buttons;
                            scope.scrollBoxWidth = listWidth;
                            scope.scrollerWidth = listWidth * scope.scrollerViewRatio;
                        }
                    });

                    scope.$watch('scrollerViewRatio', function(ratio) {
                        if (!scope.ready) { return; }

                        var scrollBoxWidth = buttonWidth;

                        scope.deck.forEach(function() {
                            scrollBoxWidth += buttonWidth;
                        });

                        scope.scrollBoxWidth = scrollBoxWidth;
                        scope.scrollerWidth = scrollBoxWidth * ratio;
                    });

                    scope.$watch('scrollerViewPosition', function(position) {
                        if (!scope.ready) { return; }

                        $scroller.css({ left: scope.scrollBoxWidth * position + 'px' });
                    });
                }
            };
        }])

        .directive('cardTable', ['$window','c6Debounce',
        function                ( $window , c6Debounce ) {
            return {
                restrict: 'E',
                templateUrl: 'views/minireel/directives/card_table.html',
                controller: 'CardTableController',
                controllerAs: 'CardTableCtrl',
                scope: true,
                link: function(scope, $element, attrs, controller) {
                    var $$window = angular.element($window),
                        $cardScroller = $element.find('#card-scroller'),
                        setDimensions = c6Debounce(function() {
                            var $items = $cardScroller.find('.card__list-item'),
                                firstButtonWidth = $items[0].clientWidth,
                                cardWidth = $items[1].clientWidth,
                                lastCardWidth = $items[$items.length - 1].clientWidth,
                                fullWidth = (cardWidth * (controller.deck.length - 1)) +
                                    lastCardWidth;

                            controller.setScrollerFullWidth(fullWidth);
                            controller.setFirstButtonWidth(firstButtonWidth);
                            controller.setScrollerRect($cardScroller[0].getBoundingClientRect());
                        }, 250);

                    setDimensions();
                    $$window.on('resize', setDimensions);
                    $element.on('$destroy', function() {
                        $$window.off('resize', setDimensions);
                    });

                    scope.$watchCollection('EditorCtrl.model.data.deck', setDimensions);
                }
            };
        }])

        .controller('CardTableController', ['$scope','$q','$interval','VideoThumbnailService',
        function                           ( $scope , $q , $interval , VideoThumbnailService ) {
            var self = this,
                EditorCtrl = $scope.EditorCtrl,
                forEach = angular.forEach;

            function getDragCtrl() {
                var deferred = $q.defer(),
                    stopWatch = $scope.$watch('DragCtrl', function(DragCtrl) {
                        if (DragCtrl) {
                            deferred.resolve(DragCtrl);
                            stopWatch();
                        }
                    });

                return deferred.promise;
            }

            function handleDragEvents(DragCtrl) {
                var scrollInterval;

                function addScrollZone(zone) {
                    var multiplyer = (function() {
                        var direction = zone.id.match(/-\w+$/)[0].slice(1);

                        switch (direction) {
                        case 'left':
                            return -1;
                        case 'right':
                            return 1;
                        }
                    }());

                    function enterScrollZone(draggable) {
                        if (DragCtrl.currentDrags.indexOf(draggable) < 0) {
                            return;
                        }

                        scrollInterval = $interval(function() {
                            self.position.x += (5 * multiplyer);
                        }, 17);
                        self.enableDrop = false;
                    }

                    function leaveScrollZone(draggable) {
                        var currentDrags = DragCtrl.currentDrags;

                        if (currentDrags.indexOf(draggable) < 0 && currentDrags.length) {
                            return;
                        }

                        $interval.cancel(scrollInterval);
                        self.enableDrop = true;
                    }

                    zone.on('draggableEnter', enterScrollZone)
                        .on('draggableLeave', leaveScrollZone);
                }

                function addCard(card) {
                    function reorder(zone) {
                        var deck = EditorCtrl.model.data.deck,
                            afterId = (zone.id.match(/rc-\w+/) || [])[0],
                            afterCard = null,
                            myCard = null,
                            myIndex = -1;

                        forEach(deck, function(crd, index) {
                            if (crd.id === afterId) {
                                afterCard = crd;
                            }

                            if (crd.id === card.id) {
                                myCard = crd;
                                myIndex = index;
                            }
                        });

                        $scope.$apply(function() {
                            deck.splice(myIndex, 1);
                            deck.splice(deck.indexOf(afterCard) + 1, 0, myCard);
                        });
                    }

                    card.on('reorder', reorder);
                }

                [
                    DragCtrl.zones['scroll-left'],
                    DragCtrl.zones['scroll-right']
                ].forEach(addScrollZone);

                forEach(DragCtrl.draggables, addCard);
                DragCtrl.on('draggableAdded', addCard);

                return DragCtrl;
            }

            function initPagination(DragCtrl) {
                function getAltDirection(direction) {
                    return direction === 'right' ? 'left' : 'right';
                }

                function isOverlapping(card, direction) {
                    var altDirection = getAltDirection(direction);

                    return (card.display[direction] > self.scrollerRect[direction]) &&
                        (card.display[altDirection] < self.scrollerRect[direction]);
                }

                function isCloser(card, closest, direction) {
                    var altDirection = getAltDirection(direction);

                    return (Math.abs(card.display[altDirection] - self.scrollerRect[direction])) <
                        (Math.abs(closest.display[altDirection] - self.scrollerRect[direction]));
                }

                self.scroll = function(direction) {
                    var altDirection = getAltDirection(direction),
                        overlappingCard,
                        closestCard;

                    DragCtrl.refresh();

                    angular.forEach(DragCtrl.draggables, function(card) {
                        if (isOverlapping(card, direction)) {
                            overlappingCard = card;
                        }

                        closestCard = closestCard ? (
                                isCloser(card, closestCard, direction) ?
                                card :
                                closestCard
                            ) :
                            card;
                    });

                    self.position.x = Math.max(
                            0, Math.min(
                                (self.scrollerFullWidth +
                                self.firstButtonWidth -
                                self.scrollerRect.width),
                                self.position.x -
                                self.scrollerRect[altDirection] + (
                                        direction === 'right' ?
                                        -(self.firstButtonWidth) :
                                        self.firstButtonWidth
                                    ) + (
                                        overlappingCard ?
                                        overlappingCard.display[altDirection] :
                                        closestCard.display[altDirection]
                                    )
                            )
                        );
                };

                self.scrollTo = function(position) {
                    self.position.x = self.scrollerFullWidth * position;
                    $scope.$digest();
                };

                self.scrollToCard = function(card) {
                    var draggable = DragCtrl.draggables[card.id];

                    DragCtrl.refresh();

                    self.position.x = self.position.x -
                        self.scrollerRect.left -
                        self.firstButtonWidth +
                        draggable.display.left;
                };

                Object.defineProperties(self, {
                    scrollerViewRatio: {
                        get: function() {
                            var percent = (self.scrollerRect.width - self.firstButtonWidth) /
                                self.scrollerFullWidth;

                            return Math.min(percent, 1);
                        }
                    },
                    scrollerViewPosition: {
                        get: function() {
                            return self.position.x / self.scrollerFullWidth;
                        }
                    }
                });
            }

            this.position = { x: 0 };
            this.enableDrop = true;
            this.scrollerRect = { width: 1 };
            this.firstButtonWidth = 1;
            this.scrollerFullWidth = 1;
            this.deck = EditorCtrl.model.data.deck;

            this.getThumbs = function(card) {
                var data = card.data;

                return VideoThumbnailService.getThumbsFor(data.service, data.videoid);
            };

            this.setScrollerFullWidth = function(width) {
                self.scrollerFullWidth = width;
            };

            this.setScrollerRect = function(rect) {
                self.scrollerRect = rect;
            };

            this.setFirstButtonWidth = function(width) {
                self.firstButtonWidth = width;
            };

            getDragCtrl()
                .then(handleDragEvents)
                .then(initPagination);
        }]);
});
