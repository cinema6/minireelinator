(function() {
    'use strict';

    define(['helpers/drag', 'minireel/c6_drag'], function(helpers, c6DragModule) {
        var Finger = helpers.Finger,
            TestFrame = helpers.TestFrame;

        describe('<c6-drag-space>', function() {
            var $rootScope,
                $scope,
                $compile;

            var testFrame;

            beforeEach(function() {
                testFrame = new TestFrame();

                module(c6DragModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');

                    $scope = $rootScope.$new();
                });
            });

            afterAll(function() {
                $rootScope = null;
                $scope = null;
                $compile = null;
                testFrame = null;
            });

            describe('attributes', function() {
                describe('controller-as', function() {
                    it('should make its controller available on the $scope as the provided name', function() {
                        var $dragSpace,
                            scope;

                        $scope.$apply(function() {
                            $dragSpace = $compile('<c6-drag-space controller-as="FooCtrl"><p>Foo</p></c6-drag-space>')($scope);
                        });
                        scope = $dragSpace.children().scope();

                        expect(scope.FooCtrl).toEqual(jasmine.any(Object));
                    });

                    it('should be optional', function() {
                        var $dragSpace,
                            scope;

                        $scope.$apply(function() {
                            $dragSpace = $compile('<c6-drag-space><p>Foo</p></c6-drag-space>')($scope);
                        });
                        scope = $dragSpace.children().scope();

                        expect(scope.undefined).not.toBeDefined();
                    });
                });

                describe('on-init', function() {
                    var $dragSpace;

                    beforeEach(function() {
                        $scope.init = jasmine.createSpy('init()');

                        $scope.$apply(function() {
                            $dragSpace = $compile('<c6-drag-space on-init="init(controller)"></c6-drag-space>')($scope);
                        });
                    });

                    it('should execute the expression with the controller', function() {
                        expect($scope.init).toHaveBeenCalledWith($dragSpace.data('cDragCtrl'));
                    });
                });
            });

            describe('controller', function() {
                var $dragSpace,
                    scope,
                    Controller;

                beforeEach(function() {
                    $dragSpace = $('<c6-drag-space controller-as="Ctrl" style="display: block; width: 800px; height: 600px; vertical-align: top;"><span style="display: inline-block; width: 50px; height: 50px; vertical-align: top;" id="drag1" c6-draggable>Drag 1</span></c6-drag-space>');
                    testFrame.$body.append($dragSpace);
                    $scope.$apply(function() {
                        $compile($dragSpace)($scope);
                    });
                    scope = $dragSpace.children().scope();
                    Controller = scope.Ctrl;
                });

                it('should be accessible via the jqLite .data() method', function() {
                    expect($dragSpace.data('cDragCtrl')).toBe(Controller);
                });

                it('should do its computations on initialization', function() {
                    var $mommy = $('<div id="mommy" c6-drag-zone style="width: 100px; height: 100px; display: inline-block; position: relative;"><div id="baby" c6-draggable style="position: absolute; top: 10px; right: 10px; bottom: 10px; left: 10px;"></div></div>'),
                        $baby = $mommy.find('#baby');

                    $dragSpace.append($mommy);
                    $scope.$apply(function() {
                        $compile($mommy)($scope);
                    });

                    expect($mommy.hasClass('c6-drag-zone-active')).toBe(true);
                    expect($mommy.hasClass('c6-drag-zone-under-baby')).toBe(true);
                    expect($baby.hasClass('c6-over-zone')).toBe(true);
                    expect($baby.hasClass('c6-over-mommy')).toBe(true);
                });

                it('should refresh everthing when an element is added (because everything could reflow)', function() {
                    var $drag = $('<span id="drag1" c6-draggable style="display: inline-block; width: 50px; height: 50px; margin-left: 5px;"></span>'),
                        $zone = $('<span id="zone1" c6-drag-zone style="display: inline-block; width: 50px; height: 50px;"></span>');

                    $dragSpace.empty();

                    $dragSpace.append($drag);
                    $scope.$apply(function() {
                        $compile($drag)($scope);
                    });

                    $dragSpace.prepend($zone);
                    $scope.$apply(function() {
                        $compile($zone)($scope);
                    });

                    expect($drag.hasClass('c6-over-zone1')).toBe(false);
                    expect($zone.hasClass('c6-drag-zone-under-drag1')).toBe(false);
                });

                it('should compute collisions whenever something is refreshed', function() {
                    var $zone1 = $('<div id="zone1" c6-drag-zone style="height: 50px; width: 50px;">Zone 1</div>'),
                        $drag1 = $dragSpace.find('#drag1'),
                        zone1, drag1;

                    $zone1.css({
                        position: 'fixed',
                        top: '100px',
                        left: '0px'
                    });
                    $drag1.css({
                        position: 'fixed',
                        top: '100px',
                        left: '55px'
                    });

                    $dragSpace.prepend($zone1);
                    $scope.$apply(function() {
                        $compile($zone1)($scope);
                    });
                    zone1 = $zone1.data('cDragZone');
                    drag1 = $drag1.data('cDrag');

                    $drag1.css('left', '25px');
                    drag1.refresh();
                    expect($drag1.hasClass('c6-over-zone')).toBe(true);
                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(true);

                    $zone1.css('top', '200px');
                    zone1.refresh();
                    expect($drag1.hasClass('c6-over-zone')).toBe(false);
                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(false);

                    $drag1.css('top', '200px');
                    Controller.refresh();
                    expect($drag1.hasClass('c6-over-zone')).toBe(true);
                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(true);
                });

                describe('methods', function() {
                    describe('refresh()', function() {
                        it('should call the refresh() method on all zones and draggables', function() {
                            var $drag2 = $('<div c6-draggable id="drag2">'),
                                $zone1 = $('<div c6-drag-zone id="zone1">'),
                                $zone2 = $('<div c6-drag-zone id="zone2">'),
                                drag1, drag2, zone1, zone2;

                            $dragSpace.append($drag2);
                            $dragSpace.append($zone1);
                            $dragSpace.append($zone2);
                            $scope.$apply(function() {
                                $compile($drag2)($scope);
                                $compile($zone1)($scope);
                                $compile($zone2)($scope);
                            });
                            drag1 = Controller.draggables.drag1;
                            drag2 = Controller.draggables.drag2;
                            zone1 = Controller.zones.zone1;
                            zone2 = Controller.zones.zone2;

                            spyOn(drag1, 'refresh');
                            spyOn(drag2, 'refresh');
                            spyOn(zone1, 'refresh');
                            spyOn(zone2, 'refresh');

                            Controller.refresh();

                            expect(drag1.refresh).toHaveBeenCalled();
                            expect(drag2.refresh).toHaveBeenCalled();
                            expect(zone1.refresh).toHaveBeenCalled();
                            expect(zone2.refresh).toHaveBeenCalled();
                        });
                    });
                });

                describe('events', function() {
                    describe('draggableAdded', function() {
                        it('should emit the event whenever a draggable is registered with the controller', function() {
                            var draggable = {
                                    on: function() {
                                        return this;
                                    },
                                    emit: function() {},
                                    display: {},
                                    refresh: function() {},
                                    collidesWith: function() {},
                                    currentlyOver: []
                                },
                                spy = jasmine.createSpy('draggableAdded spy');

                            Controller.on('draggableAdded', spy);

                            Controller.addDraggable(draggable);

                            expect(spy).toHaveBeenCalledWith(draggable);
                        });
                    });

                    describe('draggableRemoved', function() {
                        it('should be emitted whenever a draggable is removed', function() {
                            var draggable = {
                                    id: 'foo',
                                    on: function() {
                                        return this;
                                    },
                                    emit: function() {},
                                    display: {},
                                    refresh: function() {},
                                    collidesWith: function() {},
                                    currentlyOver: []
                                },
                                spy = jasmine.createSpy('draggableRemoved spy');

                            Controller.on('draggableRemoved', spy);
                            Controller.addDraggable(draggable);

                            Controller.removeDraggable(draggable);
                            expect(spy).toHaveBeenCalledWith(draggable);
                        });
                    });

                    describe('zoneAdded', function() {
                        it('should emit the event whenever a zone is registered with the controller', function() {
                            var zone = {
                                    on: function() {
                                        return this;
                                    },
                                    emit: function() {},
                                    display: {},
                                    refresh: function() {},
                                    collidesWith: function() {},
                                    currentlyUnder: []
                                },
                                spy = jasmine.createSpy('zoneAdded spy');

                            Controller.on('zoneAdded', spy);

                            Controller.addZone(zone);

                            expect(spy).toHaveBeenCalledWith(zone);
                        });
                    });

                    describe('zoneRemoved', function() {
                        it('should be emitted whenever a zone is removed', function() {
                            var zone = {
                                    id: 'foo',
                                    on: function() {
                                        return this;
                                    },
                                    emit: function() {},
                                    display: {},
                                    refresh: function() {},
                                    collidesWith: function() {},
                                    currentlyUnder: []
                                },
                                spy = jasmine.createSpy('zoneRemoved spy');

                            Controller.on('zoneRemoved', spy);
                            Controller.addZone(zone);

                            Controller.removeZone(zone);
                            expect(spy).toHaveBeenCalledWith(zone);
                        });
                    });
                });

                describe('properties', function() {
                    describe('zones', function() {
                        it('should be an object with each zone\'s state, keyed by its ID', function() {
                            var $zone1 = $('<span id="zone1" c6-drag-zone style="display: inline-block; height: 50px; width: 50px"></span>'),
                                $zone2 = $('<span id="zone2" c6-drag-zone style="display: inline-block; height: 50px; width: 50px"></span>'),
                                zone1, zone2;

                            $dragSpace.prepend($zone2);
                            $dragSpace.prepend($zone1);
                            $scope.$apply(function() {
                                $compile($zone1)($scope);
                                $compile($zone2)($scope);
                            });
                            zone1 = Controller.zones.zone1;
                            zone2 = Controller.zones.zone2;

                            expect(zone1).toEqual(jasmine.any(Object));
                            expect(zone2).toEqual(jasmine.any(Object));

                            expect(zone1.display).toEqual({
                                top: 0,
                                right: 50,
                                bottom: 50,
                                left: 0,
                                width: 50,
                                height: 50,
                                center: {
                                    x: 25,
                                    y: 25
                                }
                            });

                            expect(zone2.display).toEqual({
                                top: 0,
                                right: 100,
                                bottom: 50,
                                left: 50,
                                width: 50,
                                height: 50,
                                center: {
                                    x: 75,
                                    y: 25
                                }
                            });
                        });

                        it('should keep an array of draggables it is "currentlyUnder"', function() {
                            var indexFinger = new Finger(),
                                middleFinger = new Finger(),
                                $drag1 = $dragSpace.find('#drag1'),
                                $drag2 = $('<span id="drag2" c6-draggable style="display: inline-block; width: 50px; height: 50px; vertical-align: top;"></span>'),
                                $zone1 = $('<span id="zone1" c6-drag-zone style="display: inline-block; width: 50px; height: 50px;"></span>'),
                                zone1, drag1, drag2, $watchSpy = jasmine.createSpy('$watch()');

                            $zone1.css({
                                margin: '50px 5px 0 100px'
                            });

                            scope.$watchCollection('Ctrl.zones.zone1.currentlyUnder', $watchSpy);

                            $dragSpace.prepend($zone1);
                            $dragSpace.append($drag2);
                            $scope.$apply(function() {
                                $compile($zone1)($scope);
                                $compile($drag2)($scope);
                            });
                            zone1 = Controller.zones.zone1;
                            drag1 = Controller.draggables.drag1;
                            drag2 = Controller.draggables.drag2;

                            expect($watchSpy.calls.count()).toBe(1);
                            expect(zone1.currentlyUnder).toEqual([]);

                            indexFinger.placeOn($drag1);
                            // Drag 10px to the left and 50px down
                            indexFinger.drag(-10, 50);
                            // Drag another 5px to the left
                            indexFinger.drag(-5, 0);
                            expect($watchSpy.calls.count()).toBe(2);
                            expect(zone1.currentlyUnder).toEqual([drag1]);

                            // Drag 15px to the right and 55px down
                            indexFinger.drag(15, 55);
                            expect($watchSpy.calls.count()).toBe(3);
                            expect(zone1.currentlyUnder).toEqual([]);

                            // Drag 55px to the left and 10px up
                            indexFinger.drag(-55, -10);
                            expect($watchSpy.calls.count()).toBe(4);
                            expect(zone1.currentlyUnder).toEqual([drag1]);

                            // Drag 55px to the left and 45px up
                            indexFinger.drag(-55, -45);
                            expect($watchSpy.calls.count()).toBe(5);
                            expect(zone1.currentlyUnder).toEqual([]);

                            // Drag 10px to the right
                            indexFinger.drag(10, 0);
                            expect($watchSpy.calls.count()).toBe(6);
                            expect(zone1.currentlyUnder).toEqual([drag1]);

                            // Drag 45px to the right and 50px up
                            indexFinger.drag(45, -55);
                            expect($watchSpy.calls.count()).toBe(7);
                            expect(zone1.currentlyUnder).toEqual([]);

                            // Drag 10px down
                            indexFinger.drag(0, 10);
                            expect($watchSpy.calls.count()).toBe(8);
                            expect(zone1.currentlyUnder).toEqual([drag1]);

                            middleFinger.placeOn($drag2);
                            // Drag 5px to the left
                            middleFinger.drag(-5, 0);
                            expect($watchSpy.calls.count()).toBe(9);
                            expect(zone1.currentlyUnder).toEqual([drag1, drag2]);

                            indexFinger.lift();
                            expect($watchSpy.calls.count()).toBe(10);
                            expect(zone1.currentlyUnder).toEqual([drag2]);

                            middleFinger.lift();
                            expect($watchSpy.calls.count()).toBe(11);
                            expect(zone1.currentlyUnder).toEqual([]);
                        });

                        it('should get the latest position of a zone when dragging starts', function() {
                            var finger = new Finger(),
                                $drag1 = $dragSpace.find('#drag1'),
                                $zone1 = $('<div id="zone1" c6-drag-zone style="margin-top: 5px; height: 50px; width: 100%;"></div>'),
                                zone1, drag1;

                            $dragSpace.append($zone1);
                            $scope.$apply(function() {
                                $compile($zone1)($scope);
                            });
                            zone1 = Controller.zones.zone1;
                            drag1 = Controller.draggables.drag1;

                            finger.placeOn($drag1);
                            finger.drag(0, 0);

                            expect(zone1.currentlyUnder).toEqual([drag1]);
                        });

                        it('should remove a zone when it is destroyed', function() {
                            var $zone1 = $('<div id="zone1" c6-drag-zone></div>');

                            $dragSpace.append($zone1);
                            $scope.$apply(function() {
                                $compile($zone1)($scope);
                            });

                            expect(Controller.zones.zone1).toBeDefined();

                            $zone1.remove();

                            expect(Controller.zones.zone1).not.toBeDefined();
                        });

                        it('should clean up draggables if a zone is destroyed', function() {
                            var finger = new Finger(),
                                $drag1 = $dragSpace.find('#drag1'),
                                $zone1 = $('<div id="zone1" c6-drag-zone style="height: 100px;"></div>'),
                                drag1;

                            $dragSpace.prepend($zone1);
                            $scope.$apply(function() {
                                $compile($zone1)($scope);
                            });
                            drag1 = $drag1.data('cDrag');

                            finger.placeOn($drag1);
                            finger.drag(-10, 0);

                            $zone1.remove();

                            expect(drag1.currentlyOver).toEqual([]);
                            expect($drag1.hasClass('c6-over-zone')).toBe(false);
                        });
                    });

                    describe('draggables', function() {
                        function ZoneElement(id) {
                            return $('<span id="' + id + '" c6-drag-zone style="display: inline-block; width: 50px; height: 50px;"></span>');
                        }

                        it('should be an object with each draggable\'s state, keyed by its ID', function() {
                            var drag1 = Controller.draggables.drag1,
                                $drag1 = $dragSpace.find('#drag1'),
                                finger = new Finger();

                            expect(drag1).toEqual(jasmine.any(Object));
                            expect(drag1.display).toEqual({
                                top: 0,
                                left: 0,
                                bottom: 50,
                                right: 50,
                                width: 50,
                                height: 50,
                                center: {
                                    x: 25,
                                    y: 25
                                }
                            });

                            finger.placeOn($drag1);

                            // Drag 5px to the right and 5px down
                            finger.drag(5, 5);
                            expect(drag1.display).toEqual({
                                top: 5,
                                left: 5,
                                bottom: 55,
                                right: 55,
                                width: 50,
                                height: 50,
                                center: {
                                    x: 30,
                                    y: 30
                                }
                            });

                            // Drag 770px to the right
                            finger.drag(770, 0);
                            expect(drag1.display).toEqual({
                                top: 5,
                                left: 775,
                                bottom: jasmine.any(Number),
                                right: 825,
                                width: 50,
                                height: jasmine.any(Number),
                                center: {
                                    x: 800,
                                    y: jasmine.any(Number)
                                }
                            });
                        });

                        it('should keep an array of zones it is "currentlyOver"', function() {
                            var finger = new Finger(),
                                $drag1 = $dragSpace.find('#drag1'),
                                $zone1 = new ZoneElement('zone1'),
                                $zone2 = new ZoneElement('zone2'),
                                $zone3 = new ZoneElement('zone3'),
                                $zone4 = new ZoneElement('zone4'),
                                $zone5 = new ZoneElement('zone5'),
                                drag1 = Controller.draggables.drag1,
                                zone1, zone2, zone3, zone4, zone5;

                            $zone5.css('margin-right', '1px');

                            $dragSpace.prepend($zone5);
                            $dragSpace.prepend($zone4);
                            $dragSpace.prepend($zone3);
                            $dragSpace.prepend($zone2);
                            $dragSpace.prepend($zone1);
                            $scope.$apply(function() {
                                $compile($zone1)($scope);
                                $compile($zone2)($scope);
                                $compile($zone3)($scope);
                                $compile($zone4)($scope);
                                $compile($zone5)($scope);
                            });
                            zone1 = Controller.zones.zone1;
                            zone2 = Controller.zones.zone2;
                            zone3 = Controller.zones.zone3;
                            zone4 = Controller.zones.zone4;
                            zone5 = Controller.zones.zone5;

                            finger.placeOn($drag1);
                            finger.drag(0, 0);
                            expect(drag1.currentlyOver).toEqual([]);

                            // Move 26px to the left
                            finger.drag(-26, 0);
                            expect(drag1.currentlyOver).toEqual([zone5]);

                            // Move 50px to the left
                            finger.drag(-50, 0);
                            expect(drag1.currentlyOver).toEqual([zone5, zone4]);

                            // Move 50px to the left
                            finger.drag(-50, 0);
                            expect(drag1.currentlyOver).toEqual([zone4, zone3]);

                            // Move 50px to the left
                            finger.drag(-50, 0);
                            expect(drag1.currentlyOver).toEqual([zone3, zone2]);

                            // Move 50px to the left
                            finger.drag(-50, 0);
                            expect(drag1.currentlyOver).toEqual([zone2, zone1]);

                            // Move 50px to the left
                            finger.drag(-50, 0);
                            expect(drag1.currentlyOver).toEqual([zone1]);

                            // Move 60px down
                            finger.drag(0, 60);
                            expect(drag1.currentlyOver).toEqual([]);
                        });

                        it('should remove the draggable if it is destroyed', function() {
                            var $drag1 = $dragSpace.find('#drag1');

                            $drag1.scope().$destroy();
                            $drag1.remove();

                            expect(Controller.draggables.drag1).not.toBeDefined();
                        });

                        it('should clean up after a draggable that is destroyed mid-drag', function() {
                            var finger = new Finger(),
                                $drag1 = $dragSpace.find('#drag1'),
                                $zone1 = new ZoneElement('zone1'),
                                $zone2 = new ZoneElement('zone2'),
                                zone1, zone2, drag1;

                            $dragSpace.prepend($zone2);
                            $dragSpace.prepend($zone1);
                            $scope.$apply(function() {
                                $compile($zone1)($scope);
                                $compile($zone2)($scope);
                            });
                            zone1 = $zone1.data('cDragZone');
                            zone2 = $zone2.data('cDragZone');
                            drag1 = $drag1.data('cDrag');

                            finger.placeOn($drag1);

                            // Drag 25px to the left
                            finger.drag(-25, 0);

                            $drag1.remove();

                            expect(Controller.currentDrags).toEqual([]);
                            expect(zone1.currentlyUnder).toEqual([]);
                            expect(zone2.currentlyUnder).toEqual([]);
                            expect($zone1.hasClass('c6-drag-zone-active')).toBe(false);
                            expect($zone2.hasClass('c6-drag-zone-active')).toBe(false);
                        });
                    });

                    describe('currentDrags', function() {
                        it('should exist', function() {
                            expect(Controller.currentDrags).toEqual([]);
                        });

                        it('should contain draggables for all of the items currently being dragged', function() {
                            var $drag1 = $dragSpace.find('#drag1'),
                                $drag2 = $('<span style="display: inline-block; width: 50px; height: 50px;" id="drag2" c6-draggable>Drag 2</span>'),
                                drag1, drag2,
                                $watchSpy = jasmine.createSpy('$watch()');

                            scope.$watchCollection('Ctrl.currentDrags', $watchSpy);

                            var indexFinger = new Finger(),
                                middleFinger = new Finger();

                            $dragSpace.append($drag2);
                            $scope.$apply(function() {
                                $compile($drag2)($scope);
                            });
                            drag1 = Controller.draggables.drag1;
                            drag2 = Controller.draggables.drag2;

                            indexFinger.placeOn($drag1);
                            indexFinger.drag(5, 20);
                            expect(Controller.currentDrags).toEqual([drag1]);
                            expect($watchSpy.calls.count()).toBe(2);

                            middleFinger.placeOn($drag2);
                            middleFinger.drag(-2, 10);
                            expect(Controller.currentDrags).toEqual([drag1, drag2]);
                            expect($watchSpy.calls.count()).toBe(3);

                            indexFinger.lift();
                            expect(Controller.currentDrags).toEqual([drag2]);
                            expect($watchSpy.calls.count()).toBe(4);

                            middleFinger.lift();
                            expect(Controller.currentDrags).toEqual([]);
                            expect($watchSpy.calls.count()).toBe(5);
                        });
                    });
                });
            });

            afterEach(function() {
                testFrame.destroy();
            });
        });
    });
}());
