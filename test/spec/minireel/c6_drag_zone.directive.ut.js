(function() {
    'use strict';

    define(['helpers/drag', 'minireel/c6_drag'], function(helpers, c6DragModule) {
        var Finger = helpers.Finger,
            TestFrame = helpers.TestFrame;

        describe('<c6-drag-zone>', function() {
            var $rootScope,
                $scope,
                $compile,
                $animate;

            var testFrame;

            beforeEach(function() {
                testFrame = new TestFrame();

                module('ngAnimateMock');
                module(c6DragModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $animate = $injector.get('$animate');

                    $scope = $rootScope.$new();
                });
            });

            it('should make its data available via jqLite .data()', function() {
                var $dragSpace, $zone, scope, Ctrl;

                $scope.$apply(function() {
                    $dragSpace = $compile('<c6-drag-space controller-as="Ctrl"><div id="zone" c6-drag-zone>Zone</div></c6-drag-space>')($scope);
                });
                $zone = $dragSpace.find('#zone');
                scope = $zone.scope();
                Ctrl = scope.Ctrl;

                expect($zone.data('cDragZone')).toBe(Ctrl.zones.zone);
            });

            it('should refresh its position after adding or removing a class', function() {
                var $dragSpace, zone;

                $scope.$apply(function() {
                    $dragSpace = $compile('<c6-drag-space controller-as="Ctrl"><div id="zone" c6-drag-zone>Zone</div></c6-drag-space>')($scope);
                });
                zone = $dragSpace.find('#zone').data('cDragZone');
                spyOn(zone, 'refresh');

                zone.addClass('foo');
                expect(zone.refresh).not.toHaveBeenCalled();

                $animate.triggerCallbacks();
                expect(zone.refresh).toHaveBeenCalled();

                zone.removeClass('foo');
                expect(zone.refresh.calls.count()).toBe(1);

                $animate.triggerCallbacks();
                expect(zone.refresh.calls.count()).toBe(2);
            });

            it('should be disable-able by passing in "false" to c6-drag-zone', function() {
                var finger = new Finger(),
                    $dragSpace = $([
                        '<c6-drag-space>',
                        '    <span c6-draggable style="display: inline-block; position: fixed; top: 0; left: 0; width: 50px; height: 150px;"></span>',
                        '    <div id="zone1" c6-drag-zone="enabled" style="height: 50px;"></div>',
                        '    <div id="zone2" c6-drag-zone style="height: 50px;"></div>',
                        '    <div id="zone3" c6-drag-zone="enabled" style="height: 50px;"></div>',
                        '</c6-drag-space>'
                    ].join('\n')),
                    $draggable,
                    draggable,
                    $zone1, $zone2, $zone3,
                    zone1, zone2, zone3;

                function assertEnabled() {
                    expect(zone1.currentlyUnder).toEqual([draggable]);
                    expect(zone2.currentlyUnder).toEqual([draggable]);
                    expect(zone3.currentlyUnder).toEqual([draggable]);
                    expect(draggable.currentlyOver).toContain(zone1, zone2, zone3);
                }

                function assertDisabled() {
                    expect(zone1.currentlyUnder).toEqual([]);
                    expect(zone2.currentlyUnder).toEqual([draggable]);
                    expect(zone3.currentlyUnder).toEqual([]);
                    expect(draggable.currentlyOver).toEqual([zone2]);
                }

                testFrame.$body.append($dragSpace);

                $scope.enabled = true;
                $scope.$apply(function() {
                    $compile($dragSpace)($scope);
                });
                $draggable = $dragSpace.find('span');
                draggable = $draggable.data('cDrag');
                $zone1 = $dragSpace.find('#zone1');
                $zone2 = $dragSpace.find('#zone2');
                $zone3 = $dragSpace.find('#zone3');
                zone1 = $zone1.data('cDragZone');
                zone2 = $zone2.data('cDragZone');
                zone3 = $zone3.data('cDragZone');

                finger.placeOn($draggable);
                finger.drag(0, 0);
                assertEnabled();

                $scope.$apply(function() {
                    $scope.enabled = false;
                });
                assertDisabled();

                finger.drag(10, 0);
                assertDisabled();

                $scope.$apply(function() {
                    $scope.enabled = undefined;
                });
                assertEnabled();
            });

            describe('when a draggable is above', function() {
                var $dragSpace;

                beforeEach(function() {
                    $dragSpace = $('<c6-drag-space controller-as="Ctrl"><div id="zone1" c6-drag-zone style="height: 50px; margin-bottom: 5px">Zone 1</div><span id="drag1" c6-draggable style="display: inline-block; width: 50px; height: 50px; vertical-align: top;">Drag 1</span></c6-drag-space>');
                    testFrame.$body.append($dragSpace);

                    $scope.$apply(function() {
                        $compile($dragSpace)($scope);
                    });
                });

                it('should $emit a $scope event when any draggable is dropped on it', function() {
                    var finger = new Finger(),
                        $zone1 = $dragSpace.find('#zone1'),
                        $zone2 = $('<div id="zone2" c6-drag-zone style="height: 50px; margin-bottom: 5px;"></div>'),
                        $drag1 = $dragSpace.find('#drag1'),
                        zone1, zone2, drag1,
                        dropSpy = jasmine.createSpy('c6-drag-zone:drop');

                    $scope.$on('c6-drag-zone:drop', dropSpy);

                    $zone2.insertAfter($zone1);
                    $scope.$apply(function() {
                        $compile($zone2)($scope);
                    });
                    zone1 = $zone1.data('cDragZone');
                    zone2 = $zone2.data('cDragZone');
                    drag1 = $drag1.data('cDrag');

                    finger.placeOn($drag1);
                    // Move 30px up
                    finger.drag(0, -30);
                    finger.lift();

                    expect(dropSpy).toHaveBeenCalledWith(jasmine.any(Object), 'zone2', zone2, drag1);
                    dropSpy.calls.reset();

                    finger.placeOn($drag1);
                    // Move 75px up
                    finger.drag(0, -75);
                    finger.lift();

                    expect(dropSpy).toHaveBeenCalledWith(jasmine.any(Object), 'zone1', zone1, drag1);
                    expect(dropSpy).toHaveBeenCalledWith(jasmine.any(Object), 'zone2', zone2, drag1);
                    dropSpy.calls.reset();

                    finger.placeOn($drag1);
                    // Move 90px up
                    finger.drag(0, -90);
                    finger.lift();

                    expect(dropSpy).toHaveBeenCalledWith(jasmine.any(Object), 'zone1', zone1, drag1);
                    expect(dropSpy).toHaveBeenCalledWith(jasmine.any(Object), 'zone2', zone2, drag1);
                    dropSpy.calls.reset();

                    finger.placeOn($drag1);
                    // Move 135px up
                    finger.drag(0, -135);
                    finger.lift();

                    expect(dropSpy).toHaveBeenCalledWith(jasmine.any(Object), 'zone1', zone1, drag1);
                    dropSpy.calls.reset();
                });

                it('should add the "c6-drag-zone-active" class when there is a draggable on top of it', function() {
                    var indexFinger = new Finger(),
                        middleFinger = new Finger(),
                        $zone1 = $dragSpace.find('#zone1'),
                        $drag1 = $dragSpace.find('#drag1'),
                        $drag2 = $('<span id="drag2" c6-draggable style="display: inline-block; width: 50px; height: 50px;">Drag 2</span>');

                    $dragSpace.append($drag2);
                    $scope.$apply(function() {
                        $compile($drag2)($scope);
                    });

                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(false);

                    indexFinger.placeOn($drag1);
                    // Drag 10px up
                    indexFinger.drag(0, -10);
                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(true);

                    middleFinger.placeOn($drag2);
                    // Drag 10px up
                    middleFinger.drag(0, -10);
                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(true);

                    // Drag 10px down
                    middleFinger.drag(0, 10);
                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(true);

                    // Drag 10px down
                    indexFinger.drag(0, 10);
                    expect($zone1.hasClass('c6-drag-zone-active')).toBe(false);
                });

                it('should add a "c6-drag-zone-under-draggableId" class for every draggable it is covered by', function() {
                    var indexFinger = new Finger(),
                        middleFinger = new Finger(),
                        $zone1 = $dragSpace.find('#zone1'),
                        $drag1 = $dragSpace.find('#drag1'),
                        $drag2 = $('<span id="drag2" c6-draggable style="display: inline-block; width: 50px; height: 50px;">Drag 2</span>');

                    $dragSpace.append($drag2);
                    $scope.$apply(function() {
                        $compile($drag2)($scope);
                    });

                    expect($zone1.hasClass('c6-drag-zone-under-drag1')).toBe(false);
                    expect($zone1.hasClass('c6-drag-zone-under-drag2')).toBe(false);

                    indexFinger.placeOn($drag1);
                    //Drag 10px up
                    indexFinger.drag(0, -10);
                    expect($zone1.hasClass('c6-drag-zone-under-drag1')).toBe(true);
                    expect($zone1.hasClass('c6-drag-zone-under-drag2')).toBe(false);

                    middleFinger.placeOn($drag2);
                    // Drag 10px up
                    middleFinger.drag(0, -10);
                    expect($zone1.hasClass('c6-drag-zone-under-drag1')).toBe(true);
                    expect($zone1.hasClass('c6-drag-zone-under-drag2')).toBe(true);

                    // Drag 10px down
                    middleFinger.drag(0, 10);
                    expect($zone1.hasClass('c6-drag-zone-under-drag1')).toBe(true);
                    expect($zone1.hasClass('c6-drag-zone-under-drag2')).toBe(false);

                    // Drag 10px down
                    indexFinger.drag(0, 10);
                    expect($zone1.hasClass('c6-drag-zone-under-drag1')).toBe(false);
                    expect($zone1.hasClass('c6-drag-zone-under-drag2')).toBe(false);
                });
            });

            afterEach(function() {
                testFrame.destroy();
            });
        });
    });
}());
