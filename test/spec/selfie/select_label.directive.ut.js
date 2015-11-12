define(['app','angular'], function(appModule, angular) {
    'use strict';

    describe('select-label directive', function() {
        var $rootScope,
            $compile,
            $scope,
            $document,
            $label,
            $;

        var select,
            select2Spy;

        beforeEach(function() {
            module(appModule.name);

            select2Spy = jasmine.createSpy('select2Spy()');
            $ = angular.element;
            $.fn.select2 = select2Spy;

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $document = $injector.get('$document');
                $scope = $rootScope.$new();
            });

            select = document.createElement('select');

            spyOn($document[0], 'getElementById').and.callFake(function() {
                $('body').append(select);
                return select;
            });

            $label = $compile('<label select-label for="my_select"> My Label </label>')($scope);
        });

        describe('when label is clicked on', function() {
            it('should find the select input', function() {
                $label.trigger('click');

                expect($document[0].getElementById).toHaveBeenCalledWith('my_select');
            });

            describe('when the field is active', function() {
                it('should close the select2 dropdown', function() {
                    $(select).addClass('ui--active');

                    $label.trigger('click');

                    expect(select2Spy).toHaveBeenCalledWith('close');
                });
            });

            describe('when the field is not active', function() {
                it('should open the select2 dropdown', function() {
                    $(select).removeClass('ui--active');

                    $label.trigger('click');

                    expect(select2Spy).toHaveBeenCalledWith('open');
                });
            });
        });
    });
});