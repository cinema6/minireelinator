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