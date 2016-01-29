define(['app','angular'], function(appModule, angular) {
    'use strict';

    describe('stop-propagate directive', function() {
        var $rootScope,
            $compile,
            $scope,
            $link,
            $;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');

                $ = angular.element;

                $scope = $rootScope.$new();
            });
        });

        describe('without stop-propagate attribute', function() {
            it('parent element should get event', function() {
                var spy = jasmine.createSpy(),
                    $div = $('<div></div>');

                $scope.$apply(function() {
                    $link = $compile('<a href="#">Link</a>')($scope);
                });

                $div.append($link);

                $div.on('click', spy);

                $link.trigger('click');

                expect(spy).toHaveBeenCalled();
            });
        });

        describe('with stop-propagate attribute', function() {
            it('parent element should not get event', function() {
                var spy = jasmine.createSpy(),
                    $div = $('<div></div>');

                $scope.$apply(function() {
                    $link = $compile('<a stop-propagate href="#">Link</a>')($scope);
                });

                $div.append($link);

                $div.on('click', spy);

                $link.trigger('click');

                expect(spy).not.toHaveBeenCalled();
            });
        });
    });
});