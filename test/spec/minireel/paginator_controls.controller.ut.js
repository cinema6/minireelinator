define(['minireel/app'], function(appModule) {
    'use strict';

    describe('PaginatorControlsController', function() {
        var $rootScope,
            $scope,
            $controller,
            PaginatorControlsCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                $scope = $rootScope.$new(true);
                $scope.$apply(function() {
                    $scope.page = 2;
                    $scope.total = 5;

                    PaginatorControlsCtrl = $controller('PaginatorControlsController', { $scope: $scope });
                });
            });
        });

        it('should exist', function() {
            expect(PaginatorControlsCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('showDropDown', function() {
                it('should be false', function() {
                    expect(PaginatorControlsCtrl.showDropDown).toBe(false);
                });
            });

            describe('page', function() {
                it('should be initialized with the provided page property', function() {
                    expect(PaginatorControlsCtrl.page).toBe($scope.page);
                });

                it('should not be changeable to anything other than a number', function() {
                    PaginatorControlsCtrl.page = '8';
                    expect(PaginatorControlsCtrl.page).toBe('8');

                    PaginatorControlsCtrl.page = '8f';
                    expect(PaginatorControlsCtrl.page).toBe('8');

                    PaginatorControlsCtrl.page = '40';
                    expect(PaginatorControlsCtrl.page).toBe('40');

                    PaginatorControlsCtrl.page = '';
                    expect(PaginatorControlsCtrl.page).toBe('');
                });
            });

            describe('limitsObject', function() {
                it('should be the limits array in object form', function() {
                    $scope.$apply(function() {
                        $scope.limits = null;
                    });
                    expect(PaginatorControlsCtrl.limitsObject).toEqual({});

                    $scope.$apply(function() {
                        $scope.limits = [20, 50, 100];
                    });
                    expect(PaginatorControlsCtrl.limitsObject).toEqual({
                        '20 per page': 20,
                        '50 per page': 50,
                        '100 per page': 100
                    });
                });
            });
        });

        describe('methods', function() {
            describe('goTo(page)', function() {
                it('should set $scope.page', function() {
                    expect(PaginatorControlsCtrl.goTo(4)).toBe(4);
                    expect($scope.page).toBe(4);

                    expect(PaginatorControlsCtrl.goTo(2)).toBe(2);
                    expect($scope.page).toBe(2);
                });

                it('should never set $scope.page higher than the total or lower than 1', function() {
                    expect(PaginatorControlsCtrl.goTo(5)).toBe(5);
                    expect($scope.page).toBe(5);

                    expect(PaginatorControlsCtrl.goTo(6)).toBe(5);
                    expect($scope.page).toBe(5);

                    expect(PaginatorControlsCtrl.goTo(1)).toBe(1);
                    expect($scope.page).toBe(1);

                    expect(PaginatorControlsCtrl.goTo(0)).toBe(1);
                    expect($scope.page).toBe(1);
                });
            });

            describe('setLimit(limit)', function() {
                it('should set the $scope.limit property', function() {
                    expect(PaginatorControlsCtrl.setLimit(20)).toBe(20);
                    expect($scope.limit).toBe(20);

                    expect(PaginatorControlsCtrl.setLimit(100)).toBe(100);
                    expect($scope.limit).toBe(100);
                });
            });
        });

        describe('$watchers', function() {
            describe('page', function() {
                it('should should update the Ctrl\'s page property', function() {
                    $scope.$apply('page = 4');
                    expect(PaginatorControlsCtrl.page).toBe(4);

                    $scope.$apply('page = 1');
                    expect(PaginatorControlsCtrl.page).toBe(1);
                });
            });
        });
    });
});
