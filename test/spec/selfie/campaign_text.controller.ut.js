define(['app'], function(appModule) {
    'use strict';

    describe('SelfieCampaignTextController', function() {
        var $rootScope,
            $scope,
            $controller,
            SelfieCampaignCtrl,
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
                        callToActionOptions: [
                            'Learn More',
                            'Contact Us',
                            'Custom'
                        ]
                    }
                };

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

        describe('initialization', function() {
            describe('setting props on the card', function() {
                it('should set the card.links.Action to the website link if defined', function() {
                    expect(card.links.Action).toBe(undefined);

                    card.links.Action = 'http://mysite.com';

                    compileCtrl();

                    expect(card.links.Action).toBe('http://mysite.com');

                    card.links.Action = undefined;
                    card.links.Website = 'http://something.com';

                    compileCtrl();

                    expect(card.links.Action).toBe('http://something.com');
                });

                it('should set the action type', function() {
                    expect(card.params.action.type).toBe('button');
                });

                it('should default a label', function() {
                    expect(card.params.action.label).toEqual('Learn More');
                });
            });
        });

        describe('properties', function() {
            describe('bindLinkToWebsite', function() {
                it('should be true card has no link, false if it does', function() {
                    expect(SelfieCampaignTextCtrl.bindLinkToWebsite).toBe(true);

                    card.links.Action = 'http://mysite.com'

                    compileCtrl();

                    expect(SelfieCampaignTextCtrl.bindLinkToWebsite).toBe(false);
                });
            });

            describe('actionLabelOptions', function() {
                it('should come form the selfieApp experience', function() {
                    expect(SelfieCampaignTextCtrl.actionLabelOptions).toEqual(selfieApp.cModel.data.callToActionOptions);
                });
            });

            describe('actionLabel', function() {
                describe('when label matches one of the presets', function() {
                    it('should be that preset', function() {
                        card.params.action.label = 'Learn More';

                        compileCtrl();

                        expect(SelfieCampaignTextCtrl.actionLabel).toEqual(card.params.action.label);
                    });
                });

                describe('when label does not match one of the presets', function() {
                    it('should be that preset', function() {
                        card.params.action.label = 'Something Else';

                        compileCtrl();

                        expect(SelfieCampaignTextCtrl.actionLabel).toEqual('Custom');
                    });
                });
            });
        });

        describe('methods', function() {
            describe('updateActionLink(link)', function() {
                it('should ensure a protocol on the link and set the Action link on the card and Ctrl', function() {
                    expect(card.links.Action).toEqual(undefined);

                    SelfieCampaignTextCtrl.updateActionLink('cinema6.com');
                    expect(card.links.Action).toEqual('http://cinema6.com');
                    expect(SelfieCampaignTextCtrl.actionLink).toEqual('http://cinema6.com');

                    SelfieCampaignTextCtrl.updateActionLink('//cinema6.com');
                    expect(card.links.Action).toEqual('http://cinema6.com');
                    expect(SelfieCampaignTextCtrl.actionLink).toEqual('http://cinema6.com');

                    SelfieCampaignTextCtrl.updateActionLink('https://cinema6.com');
                    expect(card.links.Action).toEqual('https://cinema6.com');
                    expect(SelfieCampaignTextCtrl.actionLink).toEqual('https://cinema6.com');

                    SelfieCampaignTextCtrl.updateActionLink('');
                    expect(card.links.Action).toEqual('');
                    expect(SelfieCampaignTextCtrl.actionLink).toEqual('');
                });
            });

            describe('updateActionLabel()', function() {
                describe('when actionLabel is not Custom', function() {
                    it('should add the actionLabel to the card', function() {
                        SelfieCampaignTextCtrl.actionLabel = 'Contact Us';

                        expect(card.params.action.label).toEqual('Learn More');

                        SelfieCampaignTextCtrl.updateActionLabel();

                        expect(card.params.action.label).toEqual('Contact Us');
                    });
                });

                describe('when actionLabel is Custom', function() {
                    it('should not add the actionLabel to the card', function() {
                        SelfieCampaignTextCtrl.actionLabel = 'Custom';

                        expect(card.params.action.label).toEqual('Learn More');

                        SelfieCampaignTextCtrl.updateActionLabel();

                        expect(card.params.action.label).toEqual('Learn More');
                    });
                });
            });
        });

        describe('$watchers', function() {
            describe('card.links.Website', function() {
                describe('when it should bind to Action', function() {
                    it('should set the Action link', function() {
                        SelfieCampaignTextCtrl.bindLinkToWebsite = true;
                        card.links.Website = 'http://cinema6.com';

                        $scope.$digest();

                        expect(card.links.Action).toEqual('http://cinema6.com');
                    });
                });

                describe('when it should not bind to Action', function() {
                    it('should set the Action link', function() {
                        SelfieCampaignTextCtrl.bindLinkToWebsite = false;
                        card.links.Website = 'http://cinema6.com';

                        $scope.$digest();

                        expect(card.links.Action).toEqual(undefined);
                    });
                });
            });
        });
    });
});