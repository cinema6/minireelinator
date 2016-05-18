define(['app','angular'], function(appModule, angular) {
    'use strict';

    describe('hidden-input-focus="inputID" directive', function() {
        var $rootScope,
            $compile,
            $scope,
            $document,
            $span,
            $;

        var hiddenInput,
            hiddenFocusSpy;

        beforeEach(function() {
            module(appModule.name);

            $ = angular.element;
            hiddenFocusSpy = jasmine.createSpy('clickSpy()');

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $document = $injector.get('$document');
                $scope = $rootScope.$new();
            });

            spyOn($document[0], 'getElementById').and.callFake(function() {
                hiddenInput = document.createElement('input');
                hiddenInput.type = 'text';
                hiddenInput.class = 'hidden';

                $(hiddenInput).on('focus', hiddenFocusSpy);
                $('body').append(hiddenInput);

                return hiddenInput;
            });

            $span = $compile('<span hidden-input-focus="input_1">Click Here</span>')($scope);
        });

        afterEach(function() {
            $span.remove();
        });

        afterAll(function() {
            $rootScope = null;
            $compile = null;
            $scope = null;
            $document = null;
            $span = null;
            $ = null;
            hiddenInput = null;
            hiddenFocusSpy = null;
        });

        describe('when element is clicked on', function() {
            beforeEach(function() {
                $span.trigger('click');
            });

            it('should find the hidden input', function() {
                expect($document[0].getElementById).toHaveBeenCalledWith('input_1');
            });

            it('should trigger a click on the hidden input', function() {
                expect(hiddenFocusSpy).toHaveBeenCalled();
            });
        });
    });
});
