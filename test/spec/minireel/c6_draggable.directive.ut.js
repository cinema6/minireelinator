(function() {
    'use strict';

    define(['helpers/drag', 'minireel/c6_drag'], function(helpers, c6DragModule) {
        describe('c6-draggable=""', function() {
            var $rootScope,
                $scope,
                $compile,
                $animate;

            var testFrame,
                domEvents;

            var Finger = helpers.Finger,
                TestFrame = helpers.TestFrame;

            beforeEach(function() {
                var createEvent = document.createEvent;

                testFrame = new TestFrame();

                domEvents = [];
                domEvents.mostRecent = null;

                module('ngAnimateMock');
                module(c6DragModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $animate = $injector.get('$animate');

                    $scope = $rootScope.$new();
                });

                spyOn(document, 'createEvent')
                    .and.callFake(function() {
                        var event = createEvent.apply(document, arguments);

                        spyOn(event, 'preventDefault').and.callThrough();

                        domEvents.push(event);
                        domEvents.mostRecent = event;

                        return event;
                    });
            });

            it('should make the element draggable', function() {
                var finger = new Finger(),
                    $div;

                testFrame.$body.append('<div style="width: 100%; height: 100px;"></div>');
                $div = $('<div c6-draggable style="width: 50px; height: 50px;"></div>');
                testFrame.$body.append($div);
                $scope.$apply(function() {
                    $compile($div)($scope);
                });

                finger.placeOn($div);
                // Drag 10px to the right
                finger.drag(10, 0);
                expect($div.css('position')).toBe('fixed');
                expect($div.css('top')).toBe('100px');
                expect($div.css('left')).toBe('10px');

                // Drag 5px up
                finger.drag(0, -5);
                expect($div.css('top')).toBe('95px');

                // Drag 5px to the left and 20px down
                finger.drag(-5, 20);
                expect($div.css('top')).toBe('115px');
                expect($div.css('left')).toBe('5px');

                finger.lift();
                expect($div.css('position')).toBe('static');

                domEvents.forEach(function(event) {
                    if (event.type.search(/^(drag)$/) > -1) {
                        expect(event.gesture.preventDefault).toHaveBeenCalled();
                    }
                });
            });

            it('should not allow clicks to propagate on an element after it is dragged', function() {
                var finger = new Finger(),
                    $draggable = $('<span c6-draggable ng-click="spy()"></span>');

                $scope.spy = jasmine.createSpy('click spy');
                testFrame.$body.append($draggable);
                $scope.$apply(function() {
                    $compile($draggable)($scope);
                });

                finger.placeOn($draggable);
                finger.lift($draggable);
                expect($scope.spy).toHaveBeenCalled();

                $scope.spy.calls.reset();

                finger.placeOn($draggable);
                finger.drag(0, 0);
                finger.lift();

                expect($scope.spy).not.toHaveBeenCalled();

                finger.placeOn($draggable);
                finger.lift();
                expect($scope.spy).toHaveBeenCalled();
            });

            it('should support disabling the draggability of an item if "false" is passed into the c6-draggable attribute', function() {
                var finger = new Finger(),
                    $draggable = $('<span c6-draggable="enabled" style="display: inline-block; width: 50px; height: 50px;"></span>'),
                    draggable;

                function assertHasntMoved() {
                    expect($draggable.css('top')).toBe('auto');
                    expect($draggable.css('left')).toBe('auto');
                }

                testFrame.$body.append($draggable);
                $scope.enabled = false;
                $scope.$apply(function() {
                    $compile($draggable)($scope);
                });
                draggable = $draggable.data('cDrag');
                spyOn(draggable, 'emit');
                spyOn(draggable, 'refresh');

                finger.placeOn($draggable);
                finger.drag(0, 0);
                expect($draggable.hasClass('c6-dragging')).toBe(false);
                assertHasntMoved();

                finger.drag(10, 10);
                assertHasntMoved();

                finger.drag(100, 10);
                assertHasntMoved();

                finger.drag(-37, -2);
                assertHasntMoved();

                finger.lift();

                expect(draggable.emit).not.toHaveBeenCalled();
                expect(draggable.refresh).not.toHaveBeenCalled();
            });

            it('should support preventing the moving of the draggable item', function() {
                var finger = new Finger(),
                    $draggable = $('<span c6-draggable style="display: inline-block; width: 50px; height: 50px;"></span>'),
                    draggable;

                testFrame.$body.append($draggable);
                $scope.$apply(function() {
                    $compile($draggable)($scope);
                });
                draggable = $draggable.data('cDrag');

                draggable.on('beforeMove', function(draggable, event) {
                    var desired = event.desired;

                    if (desired.bottom > 100 || desired.right > 100) {
                        event.preventDefault();
                    }
                });

                finger.placeOn($draggable);

                // Drag 10px to the right
                finger.drag(10, 0);
                expect($draggable.css('left')).toBe('10px');

                // Drag 39px to the right
                finger.drag(39, 0);
                expect($draggable.css('left')).toBe('49px');

                // Drag 2px to the right
                finger.drag(2, 0);
                expect($draggable.css('left')).toBe('49px');

                // Drag 2px to the left and 10px down
                finger.drag(-2, 10);
                expect($draggable.css('top')).toBe('10px');

                // Drag 39px down
                finger.drag(0, 39);
                expect($draggable.css('top')).toBe('49px');

                // Drag 2px down
                finger.drag(0, 2);
                expect($draggable.css('top')).toBe('49px');
            });

            it('should support multiple drags/drops', function() {
                var finger = new Finger(),
                    $div = $('<div c6-draggable style="width: 50px; height: 50px;"></div>');

                testFrame.$body.append($div);
                $scope.$apply(function() {
                    $compile($div)($scope);
                });

                finger.placeOn($div);
                finger.drag(0, 0);
                expect($div.css('top')).toBe('0px');
                expect($div.css('left')).toBe('0px');

                finger.drag(10, 10);
                expect($div.css('top')).toBe('10px');
                expect($div.css('left')).toBe('10px');

                finger.lift();

                finger.placeOn($div);
                finger.drag(0, 0);
                expect($div.css('top')).toBe('0px');
                expect($div.css('left')).toBe('0px');

                finger.drag(10, 10);
                expect($div.css('top')).toBe('10px');
                expect($div.css('left')).toBe('10px');
            });

            it('should emit a $scope event when it is dropped', function() {
                var finger = new Finger(),
                    eventSpy = jasmine.createSpy('event: c6-draggable:drop')
                        .and.callFake(function() {
                            expect(draggable.display.top).toBe(50);
                            expect(draggable.display.left).toBe(50);
                        }),
                    $draggable = $compile('<span c6-draggable style="display: inline-block; width: 50px; height: 50px;">Drag Me</span>')($scope),
                    draggable = $draggable.data('cDrag');

                testFrame.$body.append($draggable);

                $scope.$on('c6-draggable:drop', eventSpy);

                finger.placeOn($draggable);
                finger.drag(50, 50);
                finger.lift();

                expect(eventSpy).toHaveBeenCalledWith(jasmine.any(Object), draggable);
            });

            it('should add the "c6-dragging" class to the element while it is being dragged', function() {
                var finger = new Finger(),
                    $div;

                $scope.$apply(function() {
                    $div = $compile('<div c6-draggable>')($scope);
                });
                testFrame.$body.append($div);
                expect($div.hasClass('c6-dragging')).toBe(false);

                finger.placeOn($div);
                finger.drag(0, 0);
                expect($div.hasClass('c6-dragging')).toBe(true);

                finger.drag(5, 10);
                expect($div.hasClass('c6-dragging')).toBe(true);

                finger.lift();
                expect($div.hasClass('c6-dragging')).toBe(false);
            });

            it('should make its state available via jqLite data()', function() {
                var $dragSpace, $draggable, scope, Ctrl;

                $scope.$apply(function() {
                    $dragSpace = $compile([
                        '<c6-drag-space controller-as="Ctrl">',
                        '    <div id="drag" c6-draggable>Drag</div>',
                        '</c6-drag-space>'
                    ].join('\n'))($scope);
                });
                $draggable = $dragSpace.find('#drag');
                scope = $draggable.scope();
                Ctrl = scope.Ctrl;

                expect($draggable.data('cDrag')).toBe(Ctrl.draggables.drag);
            });

            it('should refresh its position after adding or removing a class', function() {
                var $draggable,
                    draggable;

                $scope.$apply(function() {
                    $draggable = $compile('<span c6-draggable></span>')($scope);
                });
                draggable = $draggable.data('cDrag');
                spyOn(draggable, 'refresh');

                draggable.addClass('foo');
                expect(draggable.refresh).not.toHaveBeenCalled();

                $animate.triggerCallbacks();
                expect(draggable.refresh).toHaveBeenCalled();

                draggable.removeClass('foo');
                expect(draggable.refresh.calls.count()).toBe(1);

                $animate.triggerCallbacks();
                expect(draggable.refresh.calls.count()).toBe(2);
            });

            describe('zone interaction', function() {
                var $dragSpace;

                beforeEach(function() {
                    $dragSpace = $([
                        '<c6-drag-space>',
                        '    <span id="zone1" c6-drag-zone style="display: inline-block; width: 50px; height: 50px;">Zone 1</span>',
                        '    <span id="zone2" c6-drag-zone style="display: inline-block; width: 50px; height: 50px; margin-right: 1px;">Zone 2</span>',
                        '    <span id="drag1" c6-draggable style="display: inline-block; width: 50px; height: 50px;">Drag 1</span>',
                        '</c6-drag-space>'
                    ].join('\n'));

                    testFrame.$body.append($dragSpace);
                    $scope.$apply(function() {
                        $compile($dragSpace)($scope);
                    });
                });

                it('should add the "c6-over-zone" class when it is over a zone', function() {
                    var finger = new Finger(),
                        $draggable = $dragSpace.find('#drag1');

                    finger.placeOn($draggable);
                    finger.drag(0, 0);
                    expect($draggable.hasClass('c6-over-zone')).toBe(false);

                    // Drag 26px to the left
                    finger.drag(-26, 0);
                    expect($draggable.hasClass('c6-over-zone')).toBe(true);

                    // Drag 50px to the left
                    finger.drag(-50, 0);
                    expect($draggable.hasClass('c6-over-zone')).toBe(true);

                    // Drag 50px to the left
                    finger.drag(-50, 0);
                    expect($draggable.hasClass('c6-over-zone')).toBe(true);

                    // Drag 60px down
                    finger.drag(0, 60);
                    expect($draggable.hasClass('c6-over-zone')).toBe(false);
                });

                it('should add a "c6-over-zoneId" class for every zone it is over', function() {
                    var finger = new Finger(),
                        $draggable = $dragSpace.find('#drag1');

                    finger.placeOn($draggable);
                    finger.drag(0, 0);
                    expect($draggable.hasClass('c6-over-zone1')).toBe(false);
                    expect($draggable.hasClass('c6-over-zone2')).toBe(false);

                    // Drag 26px to the left
                    finger.drag(-26, 0);
                    expect($draggable.hasClass('c6-over-zone1')).toBe(false);
                    expect($draggable.hasClass('c6-over-zone2')).toBe(true);

                    // Drag 50px to the left
                    finger.drag(-50, 0);
                    expect($draggable.hasClass('c6-over-zone1')).toBe(true);
                    expect($draggable.hasClass('c6-over-zone2')).toBe(true);

                    // Drag 50px to the left
                    finger.drag(-50, 0);
                    expect($draggable.hasClass('c6-over-zone1')).toBe(true);
                    expect($draggable.hasClass('c6-over-zone2')).toBe(false);

                    // Drag 60px down
                    finger.drag(0, 60);
                    expect($draggable.hasClass('c6-over-zone1')).toBe(false);
                    expect($draggable.hasClass('c6-over-zone2')).toBe(false);
                });
            });

            afterEach(function() {
                testFrame.destroy();
            });
        });
    });
}());
