define(['app'], function(appModule) {
    'use strict';

    describe('<textarea> directive', function() {
        var $rootScope,
            $scope,
            $compile,
            $textarea,
            $;

        beforeEach(function() {
            module(appModule.name);

            $ = angular.element;

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');

                $scope = $rootScope.$new();
                $scope.text = '';
            });
        });

        describe('when there is no maxlength attribute', function() {
            it('should not limit the value', function() {
                var $$textarea;

                $scope.$apply(function() {
                    $textarea = $compile('<textarea ng-model="text"></textarea>')($scope);
                    $$textarea = $($textarea[0]);
                });

                $scope.$apply(function() {
                    $$textarea.val('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
                    $$textarea.trigger('change');
                });

                expect($$textarea.val()).toEqual('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
            });
        });

        describe('when there is a maxlength attribute', function() {
            it('should limit the value', function() {
                var $$textarea;

                $scope.$apply(function() {
                    $textarea = $compile('<textarea maxlength="5" ng-model="text"></textarea>')($scope);
                    $$textarea = $($textarea[0]);
                });

                $scope.$apply(function() {
                    $$textarea.val('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
                    $$textarea.trigger('change');
                });

                expect($$textarea.val()).toEqual('Lorem');
            });
        });
    });
});