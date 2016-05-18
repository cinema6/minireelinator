define(['minireel/app', 'jquery'], function(appModule, $) {
    'use strict';

    describe('c6-autoselect=""', function() {
        var $rootScope,
            $compile,
            $scope,
            $input;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');

                $scope = $rootScope.$new();
            });

            $scope.$apply(function() {
                $input = $compile('<input type="text" value="Hello!" c6-autoselect/>')($scope);
            });
            $('body').append($input);
        });

        afterEach(function() {
            $input.remove();
        });

        afterAll(function() {
            $rootScope = null;
            $compile = null;
            $scope = null;
            $input = null;
        });

        describe('when the input is not focused', function() {
            var event;

            beforeEach(function() {
                $input.on('mouseup', function($event) {
                    event = $event;
                });

                $input.trigger('mouseup');
            });

            it('should not preventDefault() when the mouse goes up', function() {
                expect(event.isDefaultPrevented()).toBe(false);
            });
        });

        describe('when the input is focused', function() {
            beforeEach(function() {
                $input.trigger('focus');
            });

            it('should select all the text', function() {
                expect($input.prop('selectionStart')).toBe(0);
                expect($input.prop('selectionEnd')).toBe($input.val().length);
            });

            describe('when the mouse goes up', function() {
                var event;

                beforeEach(function() {
                    $input.on('mouseup', function($event) {
                        event = $event;
                    });

                    $input.trigger('mouseup');
                });

                it('should preventDefault()', function() {
                    expect(event.isDefaultPrevented()).toBe(true);
                });
            });
        });
    });
});
