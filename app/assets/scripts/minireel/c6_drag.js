(function() {
    'use strict';
    /* global define:true */

    var forEach = angular.forEach;

    var styles = document.createElement('style');

    styles.type = 'text/css';
    styles.appendChild(document.createTextNode([
        '.c6-dragging {',
        '    position: fixed !important;',
        '}'
    ].join('\n')));
    document.getElementsByTagName('head')[0].appendChild(styles);

    define(['hammer'], function(hammer) {
        function DragEvent(config) {
            var key;

            this.defaultPrevented = false;

            for (key in config) {
                this[key] = config[key];
            }
        }
        DragEvent.prototype = {
            preventDefault: function() {
                this.defaultPrevented = true;
            }
        };

        function DragContext() {
            this._killed = false;
        }
        DragContext.prototype = {
            kill: function() {
                this._killed = true;
            }
        };

        angular.module('c6.drag', ['c6.ui'])
            .value('hammer', hammer)

            .factory('_Rect', [function() {
                function Rect() {
                    this.update.apply(this, arguments);
                }
                Rect.prototype = {
                    update: function(data) {
                        this.top = data.top;
                        this.right = data.right;
                        this.bottom = data.bottom;
                        this.left = data.left;

                        this.width = data.width || this.right - this.left;
                        this.height = data.height || this.bottom - this.top;

                        this.center = this.center || {};
                        this.center.x = this.left + (this.width / 2);
                        this.center.y = this.top + (this.height / 2);
                    }
                };

                return Rect;
            }])

            .factory('_PositionState', ['$animate','c6EventEmitter','_Rect',
            function                   ( $animate , c6EventEmitter ,  Rect ) {
                // PositionState: This is the base constructor for objects that represent a DOM
                // element with a position in the viewport. Its most important methods all center
                // around its "display" property. The "display" property is rect representing
                // the position and size of the element in the viewport.
                function PositionState() {}
                PositionState.prototype = {
                    init: function(id, $element) {
                        this.id = id;
                        this.$element = $element || null;
                        this.display = new Rect(this.$element[0].getBoundingClientRect());

                        c6EventEmitter(this);
                    },
                    // This method, given a rect object, will return a bool indicating if this
                    // element is colliding with the provided rect.
                    collidesWith: function(rect) {
                        var myRect = this.display;

                        return !(
                            rect.bottom < myRect.top ||
                            rect.top > myRect.bottom ||
                            rect.right < myRect.left ||
                            rect.left > myRect.right
                        );
                    },
                    // This method, given a rect object, will return a new rect object that
                    // represents the intersection of this element with the provided rect.
                    intersectionWith: function(rect) {
                        var myRect = this.display;

                        return new Rect({
                            top: Math.max(myRect.top, rect.top),
                            right: Math.min(myRect.right, rect.right),
                            bottom: Math.min(myRect.bottom, rect.bottom),
                            left: Math.max(myRect.left, rect.left)
                        });
                    },
                    // This method updates the "display" rect with the most up-to-date position of
                    // the element in the viewport.
                    refresh: function(skipNotify) {
                        var $element = this.$element,
                            rect;

                        if (!$element) { return null; }

                        rect = this.display.update($element[0].getBoundingClientRect());

                        if (!skipNotify) {
                            this.emit('refresh', this);
                        }

                        return rect;
                    },
                    // This method animates the addition of a class to the element and gets the
                    // most recent position information after the animation completes.
                    addClass: function(className) {
                        var self = this;

                        $animate.addClass(this.$element, className, function() {
                            self.refresh();
                        });
                    },
                    // This method animates the removal of a class to the element and gets the most
                    // recent position information after the animation completes.
                    removeClass: function(className) {
                        var self = this;

                        $animate.removeClass(this.$element, className, function() {
                            self.refresh();
                        });
                    }
                };

                return PositionState;
            }])
            .factory('_Draggable', ['_PositionState',
            function               (  PositionState ) {
                // This constructor represents a draggable DOM element. It inherits methods from
                // the PositionState constructor's prototype above.
                function Draggable() {
                    var self = this;

                    // Respond to entering a zone.
                    function enterZone(zone) {
                        var currentlyOver = self.currentlyOver;

                        currentlyOver.push(zone);

                        if (currentlyOver.length === 1) {
                            self.addClass('c6-over-zone');
                        }

                        self.addClass('c6-over-' + zone.id);
                    }

                    // Respond to leaving a zone.
                    function leaveZone(zone) {
                        var currentlyOver = self.currentlyOver;

                        currentlyOver.splice(currentlyOver.indexOf(zone), 1);

                        if (!currentlyOver.length) {
                            self.removeClass('c6-over-zone');
                        }

                        self.removeClass('c6-over-' + zone.id);
                    }

                    // Here, we'll notify all of the zones we are currently over that we're
                    // dropping on top of them.
                    function dropStart(self) {
                        var currentlyOver = self.currentlyOver,
                            length = currentlyOver.length, index = 0,
                            zone;

                        for ( ; index < length; index++) {
                            zone = currentlyOver[index];

                            zone.emit('drop', self);
                        }
                    }

                    this.currentlyOver = [];

                    this.init.apply(this, arguments);

                    // Setup handlers for events relating to our interactions with "zones." These
                    // events are triggered by a function in the C6DragSpaceController, a
                    // controller that has references to all draggable and zone elements.
                    this.on('enterZone', enterZone)
                        .on('leaveZone', leaveZone)
                        // This event is triggered by a HammerJS event listener as the beginning of
                        // the "dragend" event phase.
                        .on('dropStart', dropStart);

                }
                Draggable.prototype = new PositionState();

                return Draggable;
            }])
            .factory('_Zone', ['_PositionState',
            function          (  PositionState ) {
                // This constructor creates an object that will represent a "zone" DOM element. A
                // zone is an element that is not draggable itself, but reacts when draggable
                // elements are dragged on top of it. This objects created by this constructor
                // prototypically inherit from a PositionState object.
                function Zone() {
                    var self = this;

                    function draggableEnter(draggable) {
                        var currentlyUnder = self.currentlyUnder;

                        currentlyUnder.push(draggable);

                        if (currentlyUnder.length === 1) {
                            self.addClass('c6-drag-zone-active');
                        }

                        self.addClass('c6-drag-zone-under-' + draggable.id);
                    }

                    function draggableLeave(draggable) {
                        var currentlyUnder = self.currentlyUnder;

                        currentlyUnder.splice(currentlyUnder.indexOf(draggable), 1);

                        if (!currentlyUnder.length) {
                            self.removeClass('c6-drag-zone-active');
                        }

                        self.removeClass('c6-drag-zone-under-' + draggable.id);
                    }

                    this.enabled = true;
                    this.currentlyUnder = [];

                    this.init.apply(this, arguments);

                    // These events are triggered by a function in the C6DragSpaceController. This
                    // controller has references to all the draggables and zones, so as such, it is
                    // responsible for computing collisions between the two.
                    this.on('draggableEnter', draggableEnter)
                        .on('draggableLeave', draggableLeave);
                }
                Zone.prototype = new PositionState();

                return Zone;
            }])

            // The controller is instantiated by the <drag-space> directive. It receives references
            // to all draggable and zone items that it contains. Its primary responsibility is to
            // detect collisions between draggables and zones, and notify those items about the
            // collision.
            .controller('C6DragSpaceController', ['$scope','c6EventEmitter',
            function                             ( $scope , c6EventEmitter ) {

                var C6DragSpaceCtrl = this;

                this.draggables = {};
                this.zones = {};
                // This is a reference to all draggables currently being dragged. There could
                // theoretically be more than one item being dragged at a time on a multitouch
                // device.
                this.currentDrags = [];

                function draggableBeginDrag(draggable) {
                    forEach(C6DragSpaceCtrl.zones, function(zone) {
                        zone.refresh(true);
                    });

                    $scope.$apply(function() {
                        C6DragSpaceCtrl.currentDrags.push(draggable);
                    });
                }

                function emitCollision(zone, draggable, skipApply) {
                    var hit;

                    if (zone.currentlyUnder.indexOf(draggable) < 0 && zone.enabled) {
                        hit = function hit() {
                            zone.emit('draggableEnter', draggable);
                            draggable.emit('enterZone', zone);
                        };

                        if (skipApply) {
                            hit();
                        } else {
                            $scope.$apply(hit);
                        }
                    }
                }

                function emitMiss(zone, draggable, skipApply) {
                    var miss;

                    if (zone.currentlyUnder.indexOf(draggable) > -1) {
                        miss = function miss() {
                            zone.emit('draggableLeave', draggable);
                            draggable.emit('leaveZone', zone);
                        };

                        if (skipApply) {
                            miss();
                        } else {
                            $scope.$apply(miss);
                        }
                    }
                }

                function draggableRefresh(draggable) {
                    C6DragSpaceCtrl.computeCollisionsFor(
                        draggable,
                        C6DragSpaceCtrl.zones,
                        function hit(zone) {
                            emitCollision(zone, draggable);
                        },
                        function miss(zone) {
                            emitMiss(zone, draggable);
                        }
                    );
                }

                function zoneRefresh(zone) {
                    C6DragSpaceCtrl.computeCollisionsFor(
                        zone,
                        C6DragSpaceCtrl.draggables,
                        function hit(draggable) {
                            emitCollision(zone, draggable);
                        },
                        function miss(draggable) {
                            emitMiss(zone, draggable);
                        }
                    );
                }

                function draggableEndDrag(draggable) {
                    var currentDrags = C6DragSpaceCtrl.currentDrags;

                    $scope.$apply(function() {
                        currentDrags.splice(currentDrags.indexOf(draggable), 1);
                    });
                }

                // This method is accepts: item (a PositionState object), collection (an object
                // whose values are PositionState objects), everyCollision (a function that will be
                // invoked for every item in the collection that collides with the *item*), and
                // everyMiss (a function that will be invoked for every item in the collection that
                // does *not* collide with the *item*.
                // The method is used internally when a draggable is dragged, or when its refresh
                // method is called.
                this.computeCollisionsFor = function(item, collection, everyCollision, everyMiss) {
                    var key, otherItem,
                    rect = item.display;

                    for (key in collection) {
                        otherItem = collection[key];

                        if (otherItem.collidesWith(rect)) {
                            everyCollision(otherItem);
                        } else {
                            everyMiss(otherItem);
                        }
                    }
                };

                // This method updates all draggables and zones in the drag space with their most
                // up-to-date coordinates.
                this.refresh = function() {
                    function refresh(item) {
                        // We provide "true" to the refresh method here so the zone/draggable does
                        // not emit its "refresh" event. If this event were emitted, the collisions
                        // would be computed for each item many times unnecessarily. So, we skip
                        // the notification and do the computation once at the end.
                        item.refresh(true);
                    }

                    forEach(this.draggables, refresh);
                    forEach(this.zones, refresh);

                    forEach(this.draggables, function(draggable) {
                        this.computeCollisionsFor(
                            draggable,
                            this.zones,
                            function hit(zone) {
                                emitCollision(zone, draggable, true);
                            },
                            function miss(zone) {
                                emitMiss(zone, draggable, true);
                            }
                        );
                    }, this);
                };

                this.addDraggable = function(draggable) {
                    // These events are triggered by HammerJS drag events that are handled below in
                    // the c6-draggable directive.
                    draggable
                        .on('begin', draggableBeginDrag)
                        .on('refresh', draggableRefresh)
                        .on('end', draggableEndDrag);

                    this.draggables[draggable.id] = draggable;
                    this.refresh();

                    this.emit('draggableAdded', draggable);
                };

                this.removeDraggable = function(draggable) {
                    var currentDragIndex = this.currentDrags.indexOf(draggable);

                    if (currentDragIndex > -1) {
                        this.currentDrags.splice(currentDragIndex, 1);
                    }

                    forEach(this.zones, function(zone) {
                        if (zone.currentlyUnder.indexOf(draggable) > -1) {
                            zone.emit('draggableLeave', draggable);
                        }
                    });

                    delete this.draggables[draggable.id];

                    this.emit('draggableRemoved', draggable);
                };

                this.addZone = function(zone) {
                    zone.on('refresh', zoneRefresh);

                    this.zones[zone.id] = zone;
                    this.refresh();

                    this.emit('zoneAdded', zone);
                };

                this.removeZone = function(zone) {
                    forEach(this.draggables, function(draggable) {
                        if (draggable.currentlyOver.indexOf(zone) > -1) {
                            draggable.emit('leaveZone', zone);
                        }
                    });

                    delete this.zones[zone.id];

                    this.emit('zoneRemoved', zone);
                };

                c6EventEmitter(this);
            }])

            .directive('c6DragSpace', [function() {
                return {
                    restrict: 'EAC',
                    controller: 'C6DragSpaceController',
                    link: function(scope, $element, $attrs, Controller) {
                        $element.data('cDragCtrl', Controller);

                        if ($attrs.controllerAs) {
                            scope[$attrs.controllerAs] = Controller;
                        }
                    }
                };
            }])

            .directive('c6DragZone', ['_Zone',
            function                 (  Zone ) {
                return {
                    restrict: 'EAC',
                    require: '^c6DragSpace',
                    link: function(scope, $element, $attrs, C6DragSpaceCtrl) {
                        var zone = new Zone($attrs.id, $element);

                        function drop(draggable) {
                            scope.$emit('c6-drag-zone:drop', zone.id, zone, draggable);
                        }

                        // This event is triggered by a draggable when it is dropped over this
                        // zone.
                        zone.on('drop', drop);

                        C6DragSpaceCtrl.addZone(zone);
                        $element.data('cDragZone', zone);

                        $element.on('$destroy', function() {
                            zone.removeAllListeners();
                            C6DragSpaceCtrl.removeZone(zone);
                        });

                        scope.$watch($attrs.c6DragZone, function(enabled, wasEnabled) {
                            if (enabled === false) {
                                zone.enabled = false;

                                forEach(zone.currentlyUnder, function(draggable) {
                                    zone.emit('draggableLeave', draggable);
                                    draggable.emit('leaveZone', zone);
                                });
                            } else if (enabled !== wasEnabled) {
                                zone.enabled = true;
                                C6DragSpaceCtrl.refresh();
                            }
                        });
                    }
                };
            }])

            .directive('c6Draggable', ['hammer','_Draggable','_Rect',
            function                  ( hammer ,  Draggable ,  Rect ) {
                var noop = angular.noop;

                return {
                    restrict: 'AC',
                    require: '?^c6DragSpace',
                    priority: -100,
                    link: function(scope, $element, $attrs, C6DragSpaceCtrl) {
                        var touchable = hammer($element[0]),
                            draggable = new Draggable($attrs.id, $element),
                            emitBeforeMove = false,
                            hasDragged = false;

                        function px(num) {
                            return num + 'px';
                        }

                        function listenForEvents() {
                            var context,
                                // The "draggable" directive only cares about three events:
                                // dragstart, drag+ and dragend. These three events, executed in
                                // that particular order, make up one "drag lifecycle."
                                // Different business must be taken care of during each individual
                                // event, but there is a similar pattern. For this reason, each
                                // event can further be broken down into three phases: setup,
                                // modify and notify. Below, all three events and their phases are
                                // mapped out. Each function is invoked with a context object ({})
                                // as "this" that is created at the beginning of every lifecycle
                                // (the "dragstart" event.) So, for example, "this" is the same in
                                // the setup phase of dragstart AND the notify phase of dragend.
                                events = {
                                    dragstart: {
                                        setup: function() {
                                            var enabled =
                                                scope.$eval($attrs.c6Draggable) !== false;

                                            if (!enabled) {
                                                return this.kill();
                                            }

                                            draggable.refresh();

                                            this.start = {
                                                top: draggable.display.top,
                                                left: draggable.display.left
                                            };
                                        },
                                        modify: function() {
                                            draggable.addClass('c6-dragging');
                                            $element.css({
                                                top: px(this.start.top),
                                                left: px(this.start.left)
                                            });
                                        },
                                        notify: function() {
                                            draggable.emit('begin', draggable);
                                        }
                                    },
                                    drag: {
                                        setup: function(event) {
                                            hasDragged = true;

                                            event.gesture.preventDefault();
                                        },
                                        modify: function(event) {
                                            var top = this.start.top + event.gesture.deltaY,
                                                left = this.start.left + event.gesture.deltaX,
                                                dragEvent;

                                            // Emitting the "beforeMove" event requires creating a
                                            // lot of new objects and some math. Because of this,
                                            // we only create those objects if somebody is
                                            // listening for the event.
                                            if (emitBeforeMove) {
                                                dragEvent = new DragEvent({
                                                    desired: new Rect({
                                                        top: top,
                                                        left: left,
                                                        bottom: top + draggable.display.height,
                                                        right: left + draggable.display.width
                                                    })
                                                });

                                                draggable.emit('beforeMove', draggable, dragEvent);

                                                if (dragEvent.defaultPrevented) {
                                                    return;
                                                }
                                            }

                                            $element.css({
                                                top: px(top),
                                                left: px(left)
                                            });
                                        },
                                        notify: function() {
                                            draggable.refresh();
                                            draggable.emit('move', draggable, draggable.display);
                                        }
                                    },
                                    dragend: {
                                        setup: function() {
                                            // The public $scope event for the drop must be
                                            // $emitted in the setup phase so that listeners will
                                            // notified before the element is further modified
                                            // (and it potentially snaps to another position.)
                                            draggable.emit('dropStart', draggable);
                                            scope.$emit('c6-draggable:drop', draggable);
                                        },
                                        modify: function() {
                                            draggable.removeClass('c6-dragging');
                                        },
                                        notify: function() {
                                            draggable.refresh();
                                            draggable.emit('move', draggable, draggable.display);
                                            draggable.emit('end', draggable);
                                        }
                                    }
                                };

                            // This single event handler listens to all drag events of concern and
                            // delegates to the function defined on the "events" object above.
                            function delegate(event) {
                                var type = event.type,
                                    eventPhases = events[type];

                                if (type === 'dragstart') {
                                    // Create a new context at the start of the drag lifecycle.
                                    context = new DragContext();
                                }

                                // Call the hook for every phase
                                for (var hooks = ['setup', 'modify', 'notify'], index = 0;
                                    // Length of the array is hardcoded here for performance
                                    // reasons. If you add a hook, don't forget to increase this
                                    // number.
                                    index < 3;
                                    index++) {
                                    if (context._killed) { return; }

                                    (eventPhases[hooks[index]] || noop).call(context, event);
                                }
                            }

                            // Attach/remove touch event listeners to the element.
                            touchable.on('dragstart drag dragend', delegate);
                            $element.on('$destroy', function() {
                                touchable.off('dragstart drag dragend', delegate);
                            });
                            $element.on('click', function(event) {
                                if (hasDragged) {
                                    event.stopImmediatePropagation();
                                    hasDragged = false;
                                }
                            });
                        }

                        draggable.on('newListener', function(event) {
                            switch (event) {
                            case 'beforeMove':
                                emitBeforeMove = true;
                            }
                        });

                        if (C6DragSpaceCtrl) {
                            C6DragSpaceCtrl.addDraggable(draggable);
                        }

                        $element.data('cDrag', draggable);

                        listenForEvents();

                        $element.on('$destroy', function() {
                            draggable.removeAllListeners();

                            if (C6DragSpaceCtrl) {
                                C6DragSpaceCtrl.removeDraggable(draggable);
                            }
                        });
                    }
                };
            }]);
    });
}());
