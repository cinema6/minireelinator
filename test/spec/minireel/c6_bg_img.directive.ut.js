(function() {
    'use strict';

    define(['minireel/app'], function(minireelModule) {
        describe('c6-bg-img=""', function() {
            var $rootScope,
                $scope,
                $compile;

            function toAbs(url) {
                return window.location.origin + '/' + url;
            }

            beforeEach(function() {
                module(minireelModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');

                    $scope = $rootScope.$new();
                });
            });

            describe('if a truthy value is passed in', function() {
                var $div;

                beforeEach(function() {
                    $scope.bg = 'foo.jpg';

                    $scope.$apply(function() {
                        $div = $compile('<div c6-bg-img="{{bg}}"></div>')($scope);
                    });
                });

                it('should set the background image', function() {
                    expect($div.css('background-image')).toBe('url(' + toAbs('foo.jpg') + ')');
                });

                it('should update the background image as bindings change', function() {
                    $scope.$apply(function() {
                        $scope.bg = 'test.jpg';
                    });

                    expect($div.css('background-image')).toBe('url(' + toAbs('test.jpg') + ')');
                });
            });

            describe('if a falsy value is passed in', function() {
                var $span;

                beforeEach(function() {
                    $scope.bg = null;

                    $scope.$apply(function() {
                        $span = $compile('<span c6-bg-img="{{bg}}"></span>')($scope);
                    });
                });

                it('should not give the element a background image', function() {
                    expect($span.css('background-image')).toBe('');
                });
            });
        });
    });
}());
