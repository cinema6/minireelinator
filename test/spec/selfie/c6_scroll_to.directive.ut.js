define(['app','angular'], function(appModule, angular) {
    'use strict';

    describe('c6-scroll-to directive', function() {
        var $rootScope,
            $compile,
            $scope,
            $link,
            $;

        beforeEach(function() {
            module(appModule.name);

            $ = angular.element;
            spyOn($.fn, 'animate');
            spyOn($.fn, 'offset');

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');

                $scope = $rootScope.$new();
            });
        });

        describe('clicking the link', function() {
            it('should animate a scroll', function() {
                $scope.$apply(function() {
                    $link = $compile('<a c6-scroll-to href="#section_1">1</a>')($scope);
                });

                $link.offset.and.returnValue({ top: 300 });

                $link.trigger('click');

                expect($link.offset).toHaveBeenCalled();
                expect($link.animate).toHaveBeenCalledWith({ scrollTop: 300 - 80 + 'px'});
            });
        });
    });
});