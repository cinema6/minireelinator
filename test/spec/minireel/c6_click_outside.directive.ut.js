(function() {
    'use strict';

    define(['minireel/app'], function(minireelModule) {
        describe('c6-click-outside=""', function() {
            var $rootScope,
                $scope,
                $compile,
                $timeout,
                $clickOutside;

            var $testBox,
                $test1, $test2, $test3;

            beforeEach(function() {
                $testBox = $('<div>');

                module(minireelModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $timeout = $injector.get('$timeout');

                    $scope = $rootScope.$new();
                });

                $test1 = $('<span>');
                $test2 = $('<div>');
                $test3 = $('<article>');

                $scope.spy = jasmine.createSpy('spy()')
                    .and.callFake(function() {
                        expect(function() {
                            $rootScope.$digest();
                        }).toThrow();
                    });

                $scope.$apply(function() {
                    $clickOutside = $compile('<button c6-click-outside="spy()"><p><span>Click Aything But Me</span><p></button>')($scope);
                });
                $testBox.append($clickOutside);
                $testBox.append($test1);
                $testBox.append($test2);
                $testBox.append($test3);

                $('body').append($testBox);

                $timeout.flush();
            });

            afterEach(function() {
                $clickOutside.remove();
            });

            afterAll(function() {
                $rootScope = null;
                $scope = null;
                $compile = null;
                $timeout = null;
                $clickOutside = null;
                $testBox = null;
                $test1 = null;
                $test2 = null;
                $test3 = null;
            });

            it('should only evaluate the expression when an element other than itself is clicked', function() {
                $clickOutside.click();
                expect($scope.spy).not.toHaveBeenCalled();

                $test1.click();
                expect($scope.spy.calls.count()).toBe(1);

                $clickOutside.click();
                expect($scope.spy.calls.count()).toBe(1);

                $test2.click();
                expect($scope.spy.calls.count()).toBe(2);

                $test3.click();
                expect($scope.spy.calls.count()).toBe(3);
            });

            it('should not evaluate the expression when a child of the click-outside element is clicked', function() {
                var $p = $clickOutside.find('p'),
                    $span = $clickOutside.find('span');

                $span.click();
                expect($scope.spy).not.toHaveBeenCalled();

                $p.click();
                expect($scope.spy).not.toHaveBeenCalled();
            });

            it('should unbind the click handler when the element is removed', function() {
                $clickOutside.remove();

                $test1.click();
                expect($scope.spy).not.toHaveBeenCalled();
            });

            afterEach(function() {
                $testBox.remove();
            });
        });
    });
}());
