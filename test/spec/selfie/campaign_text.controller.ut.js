define(['app'], function(appModule) {
    'use strict';

    describe('SelfieCampaignTextController', function() {
        var $rootScope,
            $scope,
            $controller,
            SelfieCampaignCtrl,
            SelfieCampaignTextCtrl;

        var card;

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

                card = {
                    links: {},
                    params: {}
                };

                $scope = $rootScope.$new();
                $scope.SelfieCampaignCtrl = {
                    card: card
                };
            });

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieCampaignTextCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('actionLink', function() {
                it('should be the Action link from the card', function() {
                    expect(SelfieCampaignTextCtrl.actionLink).toBe(undefined);

                    card.links.Action = 'http://mywebsite.com';

                    compileCtrl();

                    expect(SelfieCampaignTextCtrl.actionLink).toEqual('http://mywebsite.com');
                });
            });

            describe('actionLabel', function() {
                it('should be the label from the params object or default to "Learn More"', function() {
                    expect(SelfieCampaignTextCtrl.actionLabel).toEqual('Learn More');

                    card.params.action = {
                        label: 'Buy This'
                    };

                    compileCtrl();

                    expect(SelfieCampaignTextCtrl.actionLabel).toEqual('Buy This');
                });
            });

            describe('actionTypeOptions', function() {
                it('should be an array of choices', function() {
                    expect(SelfieCampaignTextCtrl.actionTypeOptions).toEqual([
                        {
                            name: 'None',
                            type: 'none'
                        },
                        {
                            name: 'Button',
                            type: 'button'
                        },
                        {
                            name: 'Link',
                            type: 'text'
                        }
                    ]);
                });
            });

            describe('actionType', function() {
                it('should match the type on the card and default to none', function() {
                    expect(SelfieCampaignTextCtrl.actionType).toEqual({
                        name: 'None', type: 'none'
                    });

                    card.params.action = {
                        type: 'text'
                    };

                    compileCtrl();

                    expect(SelfieCampaignTextCtrl.actionType).toEqual({
                        name: 'Link', type: 'text'
                    });
                });
            });
        });

        describe('$watchers', function() {
            describe('actionType, actionLink, actionLabel', function() {
                describe('when there is an actionLink', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            SelfieCampaignTextCtrl.actionLink = 'http://myshop.com';
                            SelfieCampaignTextCtrl.actionLabel = 'Buy This';
                            SelfieCampaignTextCtrl.actionType.type = 'text';
                        });
                    });

                    it('should add the link and action object to the card', function() {
                        expect(card.params.action).toEqual({
                            type: 'text', label: 'Buy This'
                        });

                        expect(card.links.Action).toEqual('http://myshop.com');
                    });
                });

                describe('when there is no actionLink', function() {
                    it('should not set the link and action object on the card', function() {
                        $scope.$apply(function() {
                            SelfieCampaignTextCtrl.actionLink = '';
                            SelfieCampaignTextCtrl.actionLabel = 'Buy This';
                            SelfieCampaignTextCtrl.actionType.type = 'text';
                        });

                        expect(card.links.Action).toBe(undefined);
                        expect(card.params.action).toBe(null);
                    });
                });

                describe('when the action type is "none"', function() {
                    it('should not set the action object', function() {
                        $scope.$apply(function() {
                            SelfieCampaignTextCtrl.actionLink = 'http://buythis.com';
                            SelfieCampaignTextCtrl.actionLabel = 'Buy This';
                            SelfieCampaignTextCtrl.actionType.type = 'none';
                        });

                        expect(card.params.action).toBe(null);
                    });
                });
            });
        });
    });
});