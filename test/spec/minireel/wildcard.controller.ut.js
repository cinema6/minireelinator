define(['minireel/campaign', 'minireel/mixins/WizardController'], function(campaignModule, WizardController) {
    'use strict';

    describe('WildcardController', function() {
        var $rootScope,
            $controller,
            $scope,
            WildcardCtrl;

        beforeEach(function() {
            module(campaignModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    WildcardCtrl = $scope.WildcardCtrl = $controller('WildcardController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(WildcardCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the WizardController', inject(function($injector) {
            expect(Object.keys(WildcardCtrl)).toEqual(Object.keys($injector.instantiate(WizardController, {
                $scope: $scope
            })));
        }));

        describe('properties', function() {
            describe('tabs', function() {
                it('should be a list of tabs', function() {
                    expect(WildcardCtrl.tabs).toEqual([
                        {
                            name: 'Editorial Content',
                            sref: 'MR:Wildcard.Copy',
                            required: true
                        },
                        {
                            name: 'Video Content',
                            sref: 'MR:Wildcard.Video',
                            required: true
                        },
                        {
                            name: 'Survey',
                            sref: 'MR:Wildcard.Survey'
                        },
                        {
                            name: 'Advertising',
                            sref: 'MR:Wildcard.Advertising'
                        }
                    ]);
                });
            });
        });
    });
});
