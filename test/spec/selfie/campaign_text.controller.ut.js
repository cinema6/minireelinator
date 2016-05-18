define(['app'], function(appModule) {
    'use strict';

    describe('SelfieCampaignTextController', function() {
        var $rootScope,
            $scope,
            $controller,
            SelfieCampaignTextCtrl,
            c6State;

        var card,
            selfieApp;

        function compileCtrl() {
            $scope.$apply(function() {
                SelfieCampaignTextCtrl = $controller('SelfieCampaignTextController', { $scope: $scope });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');

                selfieApp = c6State.get('Selfie:App');
                selfieApp.cModel = {
                    data: {
                        callToActionOptions: {
                            groupLabels: {
                                website: 'Website',
                                phone: 'Click-to-Call'
                            },
                            options: [
                                { label: 'Learn More', group: 'website' },
                                { label: 'Contact Us', group: 'website' },
                                { label: 'Custom', group: 'website' },
                                { label: 'Call Now', group: 'phone' },
                                { label: 'Custom', group: 'phone' }
                            ]
                        }
                    }
                };

                $scope = $rootScope.$new();
            });

            compileCtrl();
        });

        afterAll(function() {
            $rootScope = null;
            $scope = null;
            $controller = null;
            SelfieCampaignTextCtrl = null;
            c6State = null;
            card = null;
            selfieApp = null;
        });

        it('should exist', function() {
            expect(SelfieCampaignTextCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('ctaOptions', function() {
                it('should come form the selfieApp experience', function() {
                    expect(SelfieCampaignTextCtrl.ctaOptions).toEqual(selfieApp.cModel.data.callToActionOptions);
                });
            });
        });
    });
});
