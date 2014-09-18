define(['hammer'], function(hammer) {
    'use strict';

    function eventify(event) {
        event.preventDefault = jasmine.createSpy('event.preventDefault()');

        return event;
    }

    function Finger() {
        this.touching = null;
        this.$touching = null;

        this.isDragging = false;
        this.dragStart = {
            x: NaN,
            y: NaN
        };

        this.x = NaN;
        this.y = NaN;
    }
    Finger.prototype = {
        placeOn: function($element) {
            var rect = $element[0].getBoundingClientRect();

            this.$touching = $element;
            this.touching = hammer($element[0]);
            this.x = rect.left + (rect.width / 2);
            this.y = rect.top + (rect.height / 2);

            this.touching.trigger('touch', eventify({
                target: this.touching.element,
                deltaX: 0,
                delatY: 0,
                center: {
                    clientX: this.x,
                    clientY: this.y
                }
            }));
            this.$touching.trigger('mousedown');
        },
        lift: function() {
            if (this.isDragging) {
                this.touching.trigger('dragend', eventify({
                    target: this.touching.element,
                    deltaX: this.x - this.dragStart.x,
                    deltaY: this.y - this.dragStart.y,
                    center: {
                        clientX: this.x,
                        clientY: this.y
                    }
                }));

                this.dragStart.x = NaN;
                this.dragStart.y = NaN;
                this.isDragging = false;
            }

            this.touching.trigger('release', {
                target: this.touching.element
            });
            this.$touching.trigger('mouseup');
            this.$touching.trigger('click');

            this.touching = null;
            this.$touching = null;
        },
        drag: function(x, y) {
            if (!this.isDragging) {
                this.isDragging = true;
                this.dragStart.x = this.x;
                this.dragStart.y = this.y;

                this.touching.trigger('dragstart', eventify({
                    target: this.touching.element,
                    deltaX: 0,
                    deltaY: 0,
                    center: {
                        clientX: this.x,
                        clientY: this.y
                    }
                }));
            }

            this.x += x;
            this.y += y;

            this.touching.trigger('drag', eventify({
                target: this.touching.element,
                deltaX: this.x - this.dragStart.x,
                deltaY: this.y - this.dragStart.y,
                center: {
                    clientX: this.x,
                    clientY: this.y
                }
            }));
        }
    };

    function TestFrame() {
        this.$testFrame = $('<iframe src="about:blank" width="800" height="600"></iframe>');
        $('body').append(this.$testFrame);

        this.$document = $(this.$testFrame[0].contentWindow.document);
        this.$document[0].write([
            '<style type="text/css">',
            '    .c6-dragging {',
            '        position: fixed;',
            '    }',
            '</style>'
        ].join('\n'));
        this.$document[0].close();
        this.$body = this.$document.find('body');

        this.$body.css({
            padding: 0,
            margin: 0
        });
    }
    TestFrame.prototype = {
        destroy: function() {
            this.$testFrame.remove();
        }
    };

    return {
        Finger: Finger,
        TestFrame: TestFrame
    };
});
