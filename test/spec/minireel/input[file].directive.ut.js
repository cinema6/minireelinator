(function() {
    'use strict';

    define(['minireel/app'], function(minireelModule) {
        describe('<input type="file">', function() {
            var $rootScope,
                $scope,
                $compile,
                $input;

            beforeEach(function() {
                module(minireelModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');

                    $scope = $rootScope.$new();
                    $scope.file = null;
                });

                $scope.$apply(function() {
                    $input = $compile('<input type="file" ng-model="file" />')($scope);
                });
            });

            afterEach(function() {
                $input.remove();
            });

            afterAll(function() {
                $rootScope = null;
                $scope = null;
                $compile = null;
                $input = null;
            });

            describe('ng-model', function() {
                it('should one-way data bind to the file', function() {
                    var file = {};

                    $input[0].files[0] = file;
                    $input.trigger('change');
                    expect($scope.file).toBe(file);

                    file = {};
                    $input[0].files[0] = file;
                    $input.trigger('change');
                    expect($scope.file).toBe(file);
                });

                it('should not allow binding from the scope model to the input', function() {
                    expect(function() {
                        $scope.$apply(function() {
                            $scope.file = {};
                        });
                    }).toThrow();

                    $input[0].files[0] = {};
                    $input.trigger('change');

                    expect(function() {
                        $scope.$apply(function() {
                            $scope.file = null;
                        });
                    }).toThrow();
                });
            });
        });
    });
}());
