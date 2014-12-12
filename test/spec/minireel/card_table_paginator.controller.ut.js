(function() {
    'use strict';

    define(['minireel/card_table'], function(cardTableModule) {
        ddescribe('CardTablePaginatorController', function() {
            var $rootScope,
                $scope,
                $controller,
                PaginatorCtrl;

            beforeEach(function() {
                module(cardTableModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    $scope = $rootScope.$new();
                    $scope.deck = [{}, {}, {}, {}];
                    $scope.$apply(function() {
                        PaginatorCtrl = $controller('CardTablePaginatorController', { $scope: $scope });
                    });
                });
            });

            it('should exist', function() {
                expect(PaginatorCtrl).toEqual(jasmine.any(Object));
            });

            describe('$scope', function() {
                describe('ready', function() {
                    it('should start as false', function() {
                        expect($scope.ready).toBe(false);
                    });

                    it('should be true when all buttons hasve loaded', function() {
                        $scope.deck.forEach(function() {
                            PaginatorCtrl.itemReady();
                        });

                        expect($scope.ready).toBe(true);
                    });
                });
            });

            describe('methods', function() {
                describe('itemReady', function() {
                    it('should increment the button counter until the quantity matched the deck and then set $scope.ready to true', function() {
                        $scope.deck.forEach(function(el, i, arr) {
                            PaginatorCtrl.itemReady();
                            expect($scope.ready).toBe(i === arr.length - 1);
                        });
                    });
                });
            });
        });
    });
}());