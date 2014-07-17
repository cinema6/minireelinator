(function() {
    'use strict';

    define(['helpers/drag', 'minireel/editor', 'app', 'templates'], function(helpers, editorModule, appModule) {
        /* global angular:true */
        var copy = angular.copy;

        var TestFrame = helpers.TestFrame,
            Finger = helpers.Finger;

        describe('<video-trimmer>', function() {
            var $rootScope,
                $scope,
                $compile,
                $window,
                $timeout,
                scope;

            var frame,
                $trimmer;

            beforeEach(function() {
                frame = new TestFrame();

                $([
                    '<style type="text/css">',
                    '    .c6-dragging {',
                    '        position: fixed !important;',
                    '    }',
                    '    video-trimmer {',
                    '        display: block;',
                    '    }',
                    '    .video-trimmer__group {',
                    '        width:75%; background:#282b2c; ',
                    '        margin: 20px auto;',
                    '        padding:1.5em 0;',
                    '        position:relative;',
                    '    }',
                    '        .video-trimmer__start-marker,',
                    '        .video-trimmer__end-marker {',
                    '            position: absolute;',
                    '            cursor: pointer;',
                    '            height:1.25em;',
                    '            height:1.25em; width:0.75em;',
                    '            overflow-x: visible;',
                    '            display: inline-block; padding:3px 0 0 0;',
                    '        }',
                    '        .video-trimmer__start-marker {',
                    '            top:0;',
                    '        }',
                    '        .video-trimmer__end-marker {',
                    '            bottom:0;',
                    '            padding:0 0 3px 0;',
                    '            direction: rtl;',
                    '        }',
                    '            .ui__startMarker,',
                    '            .ui__endMarker {',
                    '                background-position:-6.0625em -5.125em;',
                    '                width: 0.75em; height: 1.125em;',
                    '                display: block;',
                    '                position: absolute; bottom:0; left:0;',
                    '            }',
                    '            .ui__endMarker {',
                    '                background-position:-6.875em -5.125em;',
                    '                left:auto; right:0; bottom:auto; top:0;',
                    '            }',
                    '            .video-trimmer__timestamp {',
                    '                font-size:0.75em; color:#ccc; line-height:1;',
                    '                display:block;',
                    '                margin:0 0 0 1.5em;',
                    '            }',
                    '                .video-trimmer__end-marker .video-trimmer__timestamp {',
                    '                    text-align:right; ',
                    '                    margin: 0 1.5em 0.25em 0; padding:7px 0 0 0;',
                    '                }',
                    '        .video-trimmer__seek-bar {',
                    '            height: 0.1875rem; width:100%;',
                    '            margin:0;',
                    '            background: #4a9cd1;',
                    '        }',
                    '            .video-trimmer__playhead {',
                    '                position: relative;',
                    '                height: 100%; width: 10px; margin-left: -5px;',
                    '                background: yellow;',
                    '            }',
                    '</style>'
                ].join('\n'))
                    .appendTo(frame.$document.find('head'));

                module(appModule.name);
                module(editorModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $window = $injector.get('$window');
                    $timeout = $injector.get('$timeout');

                    $scope = $rootScope.$new();
                });

                $scope.currentTime = 0;
                $scope.duration = 60;
                $scope.start = null;
                $scope.end = null;

                $trimmer = $('<video-trimmer start="start" end="end" duration="{{duration}}" current-time="currentTime" on-start-scan="startScan(promise)" on-end-scan="endScan(promise)"></video-trimmer>');
                frame.$body.append($trimmer);
                $scope.$apply(function() {
                    $compile($trimmer)($scope);
                });
                scope = $trimmer.isolateScope();
            });

            afterEach(function() {
                frame.destroy();
            });

            it('should initialize the timestamps', function() {
                expect(scope.startStamp).toBe('0:00');
                expect(scope.endStamp).toBe('1:00');
            });

            it('should set timestamps in response to start/end scope prop changes', function() {
                $scope.$apply(function() {
                    $scope.start = 14;
                });
                expect(scope.startStamp).toBe('0:14');

                $scope.$apply(function() {
                    $scope.end = 42;
                });
                expect(scope.endStamp).toBe('0:42');
            });

            describe('scope.enabled', function() {
                it('should be false if the duration is 0', function() {
                    $scope.$apply(function() {
                        $scope.duration = 0;
                    });
                    expect(scope.enabled).toBe(false);

                    $scope.$apply(function() {
                        $scope.duration = 60;
                    });
                    expect(scope.enabled).toBe(true);
                });

                it('should be false if start or end are undefined', function() {
                    $scope.$apply(function() {
                        $scope.duration = 60;
                        $scope.start = undefined;
                        $scope.end = undefined;
                    });

                    expect(scope.enabled).toBe(false);

                    $scope.$apply(function() {
                        $scope.start = null;
                    });
                    expect(scope.enabled).toBe(false);

                    $scope.$apply(function() {
                        $scope.end = null;
                    });
                    expect(scope.enabled).toBe(true);
                });
            });

            describe('playhead', function() {
                it('should be based on the currentTime', function() {
                    var $playhead = $trimmer.find('.video-trimmer__playhead');

                    expect($playhead.css('left')).toBe('0px');

                    $scope.$apply(function() {
                        $scope.currentTime = 15;
                    });
                    expect($playhead.css('left')).toBe('150px');

                    $scope.$apply(function() {
                        $scope.currentTime = 30;
                    });
                    expect($playhead.css('left')).toBe('300px');

                    $scope.$apply(function() {
                        $scope.currentTime = 45;
                    });
                    expect($playhead.css('left')).toBe('450px');

                    $scope.$apply(function() {
                        $scope.currentTime = 60;
                    });
                    expect($playhead.css('left')).toBe('600px');
                });
            });

            describe('markers: ', function() {
                var $timeline,
                    timeline;

                beforeEach(function() {
                    $timeline = $trimmer.find('#seek-bar');
                    timeline = $timeline.data('cDragZone');
                });

                function absTimelinePx(percent) {
                    return timeline.display.left + (timeline.display.width * percent);
                }

                describe('start marker', function() {
                    var $start,
                        start;

                    function left(px) {
                        return timeline.display.left + px;
                    }

                    beforeEach(function() {
                        $start = $trimmer.find('#start-marker');
                        start = $start.data('cDrag');
                    });

                    describe('without a start time', function() {
                        it('should be placed at the beginning of the timeline', function() {
                            expect(start.display.left).toBe(timeline.display.left);
                        });
                    });

                    describe('with a start time', function() {
                        it('should be positioned on the part of the timeline that corresponds to the start time', function() {
                            expect(start.display.left).toBe(timeline.display.left);

                            $scope.$apply(function() {
                                $scope.start = 15;
                            });
                            start.refresh();
                            expect(start.display.left).toBe(absTimelinePx(0.25));

                            $scope.$apply(function() {
                                $scope.start = 30;
                            });
                            start.refresh();
                            expect(start.display.left).toBe(absTimelinePx(0.5));

                            $scope.$apply(function() {
                                $scope.start = 45;
                            });
                            start.refresh();
                            expect(start.display.left).toBe(absTimelinePx(0.75));
                        });

                        it('should not be able to move past the end marker', function() {
                            $scope.$apply(function() {
                                $scope.end = 80;
                                $scope.start = 70;
                            });
                            start.refresh();

                            expect(start.display.left).toBe(absTimelinePx(1));
                        });
                    });

                    it('should only be draggable along the x axis', function() {
                        var finger = new Finger(),
                            top;


                        start.refresh();
                        top = start.display.top;

                        finger.placeOn($start);
                        finger.drag(10, 10);
                        $scope.$apply();
                        start.refresh();
                        expect(start.display.left).toBe(left(10));

                        finger.drag(10, 10);
                        $scope.$apply();
                        start.refresh();
                        expect(start.display.left).toBe(left(20));
                        expect(start.display.top).toBe(top);
                    });

                    it('should not be draggable past the left side of the timeline', function() {
                        var finger = new Finger();

                        finger.placeOn($start);
                        finger.drag(-30, 0);
                        expect(start.display.left).toBe(left(0));

                        finger.drag(40, 0);
                        expect(start.display.left).toBe(left(10));
                    });

                    it('should not be draggable past the end marker', function() {
                        var indexFinger = new Finger(),
                            middleFinger = new Finger(),
                            $end = $trimmer.find('#end-marker'),
                            end = $end.data('cDrag');

                        middleFinger.placeOn($end);
                        middleFinger.drag(-100, 0);

                        indexFinger.placeOn($start);
                        indexFinger.drag(600, 0);
                        expect(start.display.left).toBe(end.display.left);
                    });

                    it('should set the start property when dropped', function() {
                        var finger = new Finger();

                        finger.placeOn($start);
                        finger.drag(150, 0);
                        finger.lift();
                        expect($scope.start).toBe(15);
                        expect(start.display.top).toBe(20);

                        finger.placeOn($start);
                        finger.drag(150, 0);
                        finger.lift();
                        expect($scope.start).toBe(30);
                        expect(start.display.top).toBe(20);

                        finger.placeOn($start);
                        finger.drag(150, 0);
                        finger.lift();
                        expect($scope.start).toBe(45);
                        expect(start.display.top).toBe(20);
                    });

                    it('should notify of the scan progress as the scan occurs and update the startStamp', function() {
                        var notify = jasmine.createSpy('notify'),
                            finish = jasmine.createSpy('finish'),
                            finger = new Finger(),
                            scope = $trimmer.isolateScope();

                        $scope.startScan = jasmine.createSpy('$scope.startScan()')
                            .and.callFake(function(promise) {
                                promise.then(finish, null, notify);
                            });

                        finger.placeOn($start);
                        finger.drag(0, 0);
                        $timeout.flush();
                        expect($scope.startScan).toHaveBeenCalled();
                        expect(scope.startStamp).toBe('0:00');


                        finger.drag(75, 0);
                        finger.drag(75, 0);
                        $timeout.flush();
                        expect(notify).toHaveBeenCalledWith(15);
                        expect(scope.startStamp).toBe('0:15');

                        finger.drag(150, 0);
                        $timeout.flush();
                        expect(notify).toHaveBeenCalledWith(30);
                        expect(scope.startStamp).toBe('0:30');

                        finger.drag(150, 0);
                        $timeout.flush();
                        expect(notify).toHaveBeenCalledWith(45);
                        expect(scope.startStamp).toBe('0:45');

                        finger.lift();
                        expect(finish).toHaveBeenCalledWith(45);
                    });

                    it('should not notify times less than 0', function() {
                        var notify = jasmine.createSpy('notify'),
                            finger = new Finger(),
                            scope = $trimmer.isolateScope();

                        $scope.startScan = jasmine.createSpy('$scope.startScan()')
                            .and.callFake(function(promise) {
                                promise.then(null, null, notify);
                            });

                        finger.placeOn($start);
                        finger.drag(-150, 0);
                        $timeout.flush();

                        expect(notify.calls.mostRecent().args[0]).not.toBeLessThan(0);
                        expect(scope.startStamp).toBe('0:00');
                    });

                    it('should not jump if dropped after not moving', function() {
                        var finger = new Finger(),
                            startPosition;

                        start.refresh();
                        startPosition = copy(start.display);

                        finger.placeOn($start);
                        finger.drag(0, 0);
                        finger.lift();

                        expect(copy(start.display)).toEqual(startPosition);
                    });
                });

                describe('end marker', function() {
                    var $end,
                        end;

                    function right(px) {
                        return timeline.display.right - px;
                    }

                    beforeEach(function() {
                        $end = $trimmer.find('#end-marker');
                        end = $end.data('cDrag');
                    });

                    describe('without an end time', function() {
                        it('should be placed at the end of the timeline', function() {
                            end.refresh();

                            expect(end.display.right).toBe(timeline.display.right);
                        });
                    });

                    describe('with an end time', function() {
                        beforeEach(function() {
                            end.refresh();
                        });

                        it('should be positioned on the part of the timeline that corresponds to the end time', function() {
                            expect(end.display.right).toBe(timeline.display.right);

                            $scope.$apply(function() {
                                $scope.end = 45;
                            });
                            end.refresh();
                            expect(end.display.right).toBe(absTimelinePx(0.75));

                            $scope.$apply(function() {
                                $scope.end = 30;
                            });
                            end.refresh();
                            expect(end.display.right).toBe(absTimelinePx(0.5));

                            $scope.$apply(function() {
                                $scope.end = 15;
                            });
                            end.refresh();
                            expect(end.display.right).toBe(absTimelinePx(0.25));
                        });

                        it('should not be able to be set past the duration', function() {
                            $scope.$apply(function() {
                                $scope.end = 75;
                            });
                            end.refresh();
                            expect(end.display.right).toBe(absTimelinePx(1));
                        });
                    });

                    it('should only be draggable along the x axis', function() {
                        var finger = new Finger(),
                            top;

                        end.refresh();
                        top = end.display.top;

                        finger.placeOn($end);
                        finger.drag(-10, 10);
                        $timeout.flush();
                        end.refresh();
                        expect(end.display.right).toBe(right(10));

                        finger.drag(-10, 10);
                        end.refresh();
                        expect(end.display.right).toBe(right(20));
                        expect(end.display.top).toBe(top);
                    });

                    it('should not be draggable past the right side of the timeline', function() {
                        var finger = new Finger();

                        finger.placeOn($end);
                        finger.drag(30, 0);
                        expect(end.display.right).toBe(right(0));

                        finger.drag(-40, 0);
                        expect(end.display.right).toBe(right(10));
                    });

                    it('should not be draggable past the start marker', function() {
                        var indexFinger = new Finger(),
                            middleFinger = new Finger(),
                            $start = $trimmer.find('#start-marker'),
                            start = $start.data('cDrag');

                        middleFinger.placeOn($start);
                        middleFinger.drag(200, 0);

                        indexFinger.placeOn($end);
                        indexFinger.drag(-600, 0);
                        expect(end.display.left).toBe(start.display.left);
                    });

                    it('should set the end property when dropped', function() {
                        var finger = new Finger();

                        finger.placeOn($end);
                        finger.drag(-150, 0);
                        finger.lift();
                        expect($scope.end).toBe(45);
                        expect(end.display.top).toBe(48);

                        finger.placeOn($end);
                        finger.drag(-150, 0);
                        finger.lift();
                        expect($scope.end).toBe(30);
                        expect(end.display.top).toBe(48);

                        finger.placeOn($end);
                        finger.drag(-150, 0);
                        finger.lift();
                        expect($scope.end).toBe(15);
                        expect(end.display.top).toBe(48);
                    });

                    it('should notify of the scan progress as the scan occurs and update the endStamp', function() {
                        var notify = jasmine.createSpy('notify'),
                            finish = jasmine.createSpy('finish'),
                            finger = new Finger(),
                            scope = $trimmer.isolateScope();

                        $scope.endScan = jasmine.createSpy('$scope.endScan()')
                            .and.callFake(function(promise) {
                                promise.then(finish, null, notify);
                            });

                        finger.placeOn($end);
                        finger.drag(0, 0);
                        $timeout.flush();
                        expect($scope.endScan).toHaveBeenCalled();
                        expect(scope.endStamp).toBe('1:00');

                        finger.drag(-75, 0);
                        finger.drag(-75, 0);
                        $timeout.flush();
                        expect(notify).toHaveBeenCalledWith(45);
                        expect(scope.endStamp).toBe('0:45');

                        finger.drag(-150, 0);
                        $timeout.flush();
                        expect(notify).toHaveBeenCalledWith(30);
                        expect(scope.endStamp).toBe('0:30');

                        finger.drag(-150, 0);
                        $timeout.flush();
                        expect(notify).toHaveBeenCalledWith(15);
                        expect(scope.endStamp).toBe('0:15');

                        finger.lift();
                        expect(finish).toHaveBeenCalledWith(15);
                    });

                    it('should not notify times greater than the duration', function() {
                        var notify = jasmine.createSpy('notify'),
                            finger = new Finger(),
                            scope = $trimmer.isolateScope();

                        $scope.endScan = jasmine.createSpy('$scope.endScan()')
                            .and.callFake(function(promise) {
                                promise.then(null, null, notify);
                            });

                        finger.placeOn($end);
                        finger.drag(150, 0);
                        $timeout.flush();

                        expect(notify.calls.mostRecent().args[0]).not.toBeGreaterThan(60);
                        expect(scope.endStamp).toBe('1:00');
                    });

                    it('should not jump if dropped after not moving', function() {
                        var finger = new Finger(),
                            startPosition;

                        end.refresh();
                        startPosition = copy(end.display);

                        finger.placeOn($end);
                        finger.drag(0, 0);
                        finger.lift();

                        expect(copy(end.display)).toEqual(startPosition);
                    });
                });
            });
        });
    });
}());
