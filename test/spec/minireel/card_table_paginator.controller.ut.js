(function() {
    'use strict';

    define(['minireel/card_table'], function(cardTableModule) {
        describe('CardTablePaginatorController', function() {
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
                    it('should increment the button counter until the quantity matches the deck (minus recap card which was already loaded) and then set $scope.ready to true', function() {
                        $scope.deck.forEach(function(el, i, arr) {
                            var allCardsIncludingRecapAreLoaded = i >= arr.length - 1;
                            PaginatorCtrl.itemReady();
                            expect($scope.ready).toBe(allCardsIncludingRecapAreLoaded);
                        });
                    });
                });
            });
        });
    });
}());