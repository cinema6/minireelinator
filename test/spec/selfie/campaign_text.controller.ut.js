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
                $scope.AppCtrl = {
                    validUrl: /^(http:\/\/|https:\/\/|\/\/)/
                };
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
                        type: 'button'
                    };

                    compileCtrl();

                    expect(SelfieCampaignTextCtrl.actionType).toEqual({
                        name: 'Button', type: 'button'
                    });
                });
            });
        });

        describe('$watchers', function() {
            describe('actionType', function() {
                describe('when set to "Button"', function() {
                    describe('and there is an Website link on the card', function() {
                        it('should set it on the Ctrl and default the label', function() {
                            card.links.Website = 'http://myshop.com';

                            $scope.$apply(function() {
                                SelfieCampaignTextCtrl.actionType.type = 'button';
                            });

                            expect(card.params.action).toEqual({
                                type: 'button', label: 'Learn More'
                            });

                            expect(SelfieCampaignTextCtrl.actionLink).toBe('http://myshop.com');
                            expect(card.links.Action).toEqual('http://myshop.com');
                        });
                    });

                    describe('and there is no Website link on the card', function() {
                        it('should default it to http:// but should not set it on the card', function() {
                            $scope.$apply(function() {
                                SelfieCampaignTextCtrl.actionType.type = 'button';
                            });

                            expect(card.params.action).toEqual(null);
                            expect(SelfieCampaignTextCtrl.actionLink).toBe('http://');
                            expect(card.links.Action).toBe(undefined);
                        });
                    });
                });
            });

            describe('actionLink', function() {
                describe('when the type is "none"', function() {
                    it('should not be set on the card', function() {
                        $scope.$apply(function() {
                            SelfieCampaignTextCtrl.actionLink = 'http://myshop.com';
                        });

                        expect(card.params.action).toBe(null);
                        expect(card.links.Action).toBe(undefined);
                    });
                });

                describe('when the type is "button"', function() {
                    it('should update the link on the card', function() {
                        $scope.$apply(function() {
                            SelfieCampaignTextCtrl.actionType.type = 'button';
                        });

                        $scope.$apply(function() {
                            SelfieCampaignTextCtrl.actionLink = 'http://myshop.com';
                        });

                        expect(card.params.action).toEqual({
                            type: 'button', label: 'Learn More'
                        });
                        expect(card.links.Action).toEqual('http://myshop.com');
                    });
                });

                it('should not be reset if label or type change', function() {
                    SelfieCampaignTextCtrl.actionLink = 'http://myshop.com';

                    $scope.$apply(function() {
                        SelfieCampaignTextCtrl.actionType.type = 'button';
                    });

                    expect(SelfieCampaignTextCtrl.actionLink).toEqual('http://myshop.com');

                    $scope.$apply(function() {
                        SelfieCampaignTextCtrl.actionType.type = 'none';
                    });

                    expect(SelfieCampaignTextCtrl.actionLink).toEqual('http://myshop.com');

                    $scope.$apply(function() {
                        SelfieCampaignTextCtrl.actionLabel = 'Buy This!';
                    });

                    expect(SelfieCampaignTextCtrl.actionLink).toEqual('http://myshop.com');
                });
            });

            describe('actionLabel', function() {
                describe('when the type is "none"', function() {
                    it('should not be set on the card', function() {
                        $scope.$apply(function() {
                            SelfieCampaignTextCtrl.actionLabel = 'Buy This Here!';
                        });

                        expect(card.params.action).toBe(null);
                        expect(card.links.Action).toBe(undefined);
                    });
                });

                describe('when the type is "button"', function() {
                    describe('when there is a valid action link', function() {
                        it('should update the label on the card', function() {
                            $scope.$apply(function() {
                                SelfieCampaignTextCtrl.actionType.type = 'button';
                            });

                            $scope.$apply(function() {
                                SelfieCampaignTextCtrl.actionLink = 'http://myshop.com';
                                SelfieCampaignTextCtrl.actionLabel = 'Buy This Here!';
                            });

                            expect(card.params.action).toEqual({
                                type: 'button', label: 'Buy This Here!'
                            });
                            expect(card.links.Action).toEqual('http://myshop.com');
                        });
                    });

                    describe('when there is no valid action link', function() {
                        it('should not update the label on the card', function() {
                            $scope.$apply(function() {
                                SelfieCampaignTextCtrl.actionType.type = 'button';
                            });

                            $scope.$apply(function() {
                                SelfieCampaignTextCtrl.actionLabel = 'Buy This Here!';
                            });

                            expect(card.params.action).toBe(null);
                            expect(card.links.Action).toBe(undefined);
                        });
                    });
                });
            });
        });
    });
});