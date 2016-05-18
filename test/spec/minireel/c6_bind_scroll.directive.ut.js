(function() {
    'use strict';

    define(['minireel/card_table'], function(cardTableModule) {
        describe('c6-bind-scroll=""', function() {
            var $rootScope,
                $scope,
                $compile,
                $timeout;

            var $scroller;

            beforeEach(function() {
                module(cardTableModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $timeout = $injector.get('$timeout');

                    $scope = $rootScope.$new();
                });

                $scope.scroll = {
                    x: 0,
                    y: 0
                };

                $scope.$apply(function() {
                    $scroller = $compile([
                        '<div id="scroller" style="width: 25px; height: 25px; overflow: scroll;" c6-bind-scroll="scroll">',
                        '    <div style="width: 100px; height: 100px;">&nbsp;</div>',
                        '</div>'
                    ].join('\n'))($scope);
                });
                $('body').append($scroller);
            });

            afterEach(function() {
                $scroller.remove();
            });

            afterAll(function() {
                $rootScope = null;
                $scope = null;
                $compile = null;
                $timeout = null;
                $scroller = null;
            });

            it('should bind from the data to the element', function() {
                expect($scroller.scrollLeft()).toBe(0);
                expect($scroller.scrollTop()).toBe(0);

                $scope.$apply(function() {
                    $scope.scroll.x = 10;
                    $scope.scroll.y = 25;
                });

                expect($scroller.scrollLeft()).toBe(10);
                expect($scroller.scrollTop()).toBe(25);

                $scope.$apply(function() {
                    $scope.scroll.x = 37;
                    $scope.scroll.y = 64;
                });

                expect($scroller.scrollLeft()).toBe(37);
                expect($scroller.scrollTop()).toBe(64);
            });

            it('should bind from the element to the data', function() {
                $scroller.scrollLeft(25);
                $scroller.trigger('scroll');
                $timeout.flush();
                expect($scope.scroll.x).toBe(25);

                $scroller.scrollTop(50);
                $scroller.trigger('scroll');
                $timeout.flush();
                expect($scope.scroll.y).toBe(50);

                $scroller.scrollLeft(44);
                $scroller.trigger('scroll');
                $timeout.flush();
                expect($scope.scroll.x).toBe(44);

                $scroller.scrollTop(63);
                $scroller.trigger('scroll');
                $timeout.flush();
                expect($scope.scroll.y).toBe(63);
            });

            it('should not allow the data to move further than the scroll position', function() {
                $scope.$apply(function() {
                    $scope.scroll.x = -10;
                });
                expect($scope.scroll.x).toBe($scroller.scrollLeft());

                $scope.$apply(function() {
                    $scope.scroll.x = 100;
                });
                expect($scope.scroll.x).toBe($scroller.scrollLeft());

                $scope.$apply(function() {
                    $scope.scroll.y = -25;
                });
                expect($scope.scroll.y).toBe($scroller.scrollTop());

                $scope.$apply(function() {
                    $scope.scroll.y = 200;
                });
                expect($scope.scroll.y).toBe($scroller.scrollTop());
            });

            it('should emit a scroll event on the $scope', function() {
                spyOn($scope, '$emit');

                $scroller.scrollLeft(20);
                $scroller.scrollTop(10);
                $scroller.trigger('scroll');

                expect($scope.$emit).toHaveBeenCalledWith('c6-bind-scroll(scroller):scroll', 20, 10);

                $scroller.scrollLeft(34);
                $scroller.scrollTop(22);
                $scroller.trigger('scroll');

                expect($scope.$emit).toHaveBeenCalledWith('c6-bind-scroll(scroller):scroll', 34, 22);
            });

            afterEach(function() {
                $scroller.remove();
            });
        });
    });
}());
