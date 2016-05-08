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

            spyOn(SelfieCampaignTextCtrl, 'updateActionLink');
            spyOn(SelfieCampaignTextCtrl._private, 'generateWebsiteLink');
            spyOn(SelfieCampaignTextCtrl._private, 'generatePhoneLink');
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

                it('should set the card.links.Action if the selection is click-to-call', function() {
                    expect(card.links.Action).toBe(undefined);

                    card.links.Website = 'http://something.com';
                    card.params.action.label = 'Call Now';
                    card.params.action.group = 'phone';

                    compileCtrl();

                    expect(card.links.Action).toBe(undefined);
                });

                it('should set the action type', function() {
                    expect(card.params.action.type).toBe('button');
                });

                it('should default a label', function() {
                    expect(card.params.action.label).toEqual('Learn More');
                });

                it('should default a group', function() {
                    expect(card.params.action.group).toBe('website');
                });
            });
        });

        describe('properties', function() {
            describe('bindLinkToWebsite', function() {
                it('should be true card has no link, false if it does', function() {
                    expect(SelfieCampaignTextCtrl.bindLinkToWebsite).toBe(true);

                    card.links.Action = 'http://mysite.com';

                    compileCtrl();

                    expect(SelfieCampaignTextCtrl.bindLinkToWebsite).toBe(false);
                });
            });

            describe('actionWebsite', function() {
                it('should determine the website input from the card', function() {
                    card.params.action.group = 'website';
                    card.links.Action = 'http://www.site.com';

                    compileCtrl();

                    expect(SelfieCampaignTextCtrl.actionWebsite).toBe('http://www.site.com');
                });
            });

            describe('actionPhone', function() {
                it('should determine click-to-call input from the card', function() {
                    card.params.action.group = 'phone';
                    card.links.Action = 'tel:1234567890';

                    compileCtrl();

                    expect(SelfieCampaignTextCtrl.actionPhone).toBe('+1 (123) 456-7890');
                });
            });

            describe('groupLabels', function() {
                it('should come form the selfieApp experience', function() {
                    expect(SelfieCampaignTextCtrl.groupLabels).toEqual(selfieApp.cModel.data.callToActionOptions.groupLabels);
                });
            });

            describe('actionLabelOptions', function() {
                it('should come form the selfieApp experience', function() {
                    expect(SelfieCampaignTextCtrl.actionLabelOptions).toEqual(selfieApp.cModel.data.callToActionOptions.options);
                });
            });

            describe('actionLabel', function() {
                it('should determine which of the presets to use from the card', function() {
                    card.params.action.label = 'Call Now';
                    card.params.action.group = 'phone';

                    compileCtrl();

                    expect(SelfieCampaignTextCtrl.actionLabel).toBe(selfieApp.cModel.data.callToActionOptions.options[3]);
                });
            });
        });

        describe('methods', function() {
            describe('generateWebsiteLink', function() {
                beforeEach(function() {
                    SelfieCampaignTextCtrl._private.generateWebsiteLink.and.callThrough();
                });

                it('should ensure a protocol on the link and set the Action link on the card and Ctrl', function() {
                    var link;

                    link = SelfieCampaignTextCtrl._private.generateWebsiteLink('cinema6.com');
                    expect(link).toEqual('http://cinema6.com');

                    link = SelfieCampaignTextCtrl._private.generateWebsiteLink('//cinema6.com');
                    expect(link).toEqual('http://cinema6.com');

                    link = SelfieCampaignTextCtrl._private.generateWebsiteLink('https://cinema6.com');
                    expect(link).toEqual('https://cinema6.com');

                    link = SelfieCampaignTextCtrl._private.generateWebsiteLink('');
                    expect(link).toEqual('');
                });
            });

            describe('generatePhoneLink', function() {
                beforeEach(function() {
                    SelfieCampaignTextCtrl._private.generatePhoneLink.and.callThrough();
                });

                it('should generate a click-to-call link from user input', function() {
                    var fn = SelfieCampaignTextCtrl._private.generatePhoneLink;
                    expect(fn('')).toBe('');
                    expect(fn(false)).toBe('');
                    expect(fn('1234567890')).toBe('tel:1234567890');
                    expect(fn('(123) 456-7890')).toBe('tel:1234567890');
                });
            });

            describe('getActionLabel', function() {
                it('should find the option corresponding to the given card', function() {
                    var fn = SelfieCampaignTextCtrl._private.getActionLabel;
                    var options = selfieApp.cModel.data.callToActionOptions.options;

                    card.params.action.label = 'Contact Us';
                    card.params.action.group = 'website';
                    expect(fn(card)).toBe(options[1]);

                    card.params.action.label = 'Call Now';
                    card.params.action.group = 'phone';
                    expect(fn(card)).toBe(options[3]);
                });

                it('should default to custom if no option is found', function() {
                    var fn = SelfieCampaignTextCtrl._private.getActionLabel;
                    var options = selfieApp.cModel.data.callToActionOptions.options;

                    card.params.action.label = 'fake label';
                    card.params.action.group = 'website';
                    expect(fn(card)).toBe(options[2]);

                    card.params.action.label = 'fake label';
                    card.params.action.group = 'phone';
                    expect(fn(card)).toBe(options[4]);
                });
            });

            describe('getActionWebsite', function() {
                it('should be able to get what website input should be from a card', function() {
                    var fn = SelfieCampaignTextCtrl._private.getActionWebsite;

                    card.links.Action = 'https://www.site.com';
                    card.params.action.group = 'website';
                    expect(fn(card)).toBe('https://www.site.com');

                    card.links.Action = 'https://www.site.com';
                    card.params.action.group = 'phone';
                    expect(fn(card)).toBe('');

                    card.links.Action = null;
                    card.params.action.group = 'website';
                    expect(fn(card)).toBe('');
                });

                it('should default to the website link from the card', function() {
                    var fn = SelfieCampaignTextCtrl._private.getActionWebsite;

                    card.links.Action = null;
                    card.params.action.group = 'website';
                    card.links.Website = 'website link';
                    expect(fn(card)).toBe('website link');

                    card.links.Action = null;
                    card.params.action.group = 'website';
                    card.links.Website = null;
                    expect(fn(card)).toBe('');
                });
            });

            describe('getActionPhone', function() {
                it('should be able to get what click-to-call input should be from a card', function() {
                    var fn = SelfieCampaignTextCtrl._private.getActionPhone;

                    card.links.Action = 'tel:1234567890';
                    card.params.action.group = 'phone';
                    expect(fn(card)).toBe('+1 (123) 456-7890');

                    card.links.Action = 'tel:1234567890';
                    card.params.action.group = 'website';
                    expect(fn(card)).toBe('');

                    card.links.Action = null;
                    card.params.action.group = 'phone';
                    expect(fn(card)).toBe('');
                });
            });

            describe('updateActionLink(link)', function() {
                beforeEach(function() {
                    SelfieCampaignTextCtrl.updateActionLink.and.callThrough();
                });

                describe('when given website input', function() {
                    beforeEach(function() {
                        SelfieCampaignTextCtrl._private.generateWebsiteLink.and.returnValue('http://input');
                        SelfieCampaignTextCtrl.updateActionLink('input', 'website');
                    });

                    it('should update the action link', function() {
                        expect(SelfieCampaignTextCtrl._private.generateWebsiteLink).toHaveBeenCalledWith('input');
                        expect(card.links.Action).toBe('http://input');
                    });

                    it('should change the website input field if neccessary', function() {
                        expect(SelfieCampaignTextCtrl.actionWebsite).toBe('http://input');
                    });
                });

                describe('when given click-to-call input', function() {
                    beforeEach(function() {
                        SelfieCampaignTextCtrl._private.generatePhoneLink.and.returnValue('tel:123');
                        SelfieCampaignTextCtrl.updateActionLink('input', 'phone');
                    });

                    it('should update the action link', function() {
                        expect(SelfieCampaignTextCtrl._private.generatePhoneLink).toHaveBeenCalledWith('input');
                        expect(card.links.Action).toBe('tel:123');
                    });
                });
            });

            describe('updateActionLabel()', function() {
                describe('when actionLabel is not Custom', function() {
                    it('should add the actionLabel to the card', function() {
                        SelfieCampaignTextCtrl.actionLabel = { label: 'Contact Us', group: 'website' };

                        expect(card.params.action.label).toBe('Learn More');
                        expect(card.params.action.group).toBe('website');

                        SelfieCampaignTextCtrl.updateActionLabel();

                        expect(card.params.action.label).toEqual('Contact Us');
                        expect(card.params.action.group).toBe('website');
                    });
                });

                describe('when actionLabel is Custom', function() {
                    it('should not add the actionLabel to the card', function() {
                        SelfieCampaignTextCtrl.actionLabel = { label: 'Custom', group: 'website' };

                        expect(card.params.action.label).toEqual('Learn More');
                        expect(card.params.action.group).toBe('website');

                        SelfieCampaignTextCtrl.updateActionLabel();

                        expect(card.params.action.label).toEqual('Learn More');
                        expect(card.params.action.group).toBe('website');
                    });
                });

                it('should update the action group on the card', function() {
                    SelfieCampaignTextCtrl.actionLabel = { label: 'Custom', group: 'phone' };

                    expect(card.params.action.label).toEqual('Learn More');
                    expect(card.params.action.group).toBe('website');

                    SelfieCampaignTextCtrl.updateActionLabel();

                    expect(card.params.action.label).toEqual('Learn More');
                    expect(card.params.action.group).toBe('phone');
                });

                it('should update the action link on the card', function() {
                    SelfieCampaignTextCtrl.actionWebsite = 'website input';
                    SelfieCampaignTextCtrl.actionPhone = 'click-to-call input';
                    SelfieCampaignTextCtrl.updateActionLabel();

                    expect(SelfieCampaignTextCtrl.updateActionLink).toHaveBeenCalledWith('website input', 'website');

                    SelfieCampaignTextCtrl.actionLabel = { label: 'Custom', group: 'phone' };
                    SelfieCampaignTextCtrl.updateActionLabel();

                    expect(SelfieCampaignTextCtrl.updateActionLink).toHaveBeenCalledWith('click-to-call input', 'phone');
                });
            });
        });

        describe('$watchers', function() {
            describe('card.links.Website', function() {
                describe('when it should bind to Action', function() {
                    it('should set the Action link', function() {
                        SelfieCampaignTextCtrl.bindLinkToWebsite = true;
                        SelfieCampaignTextCtrl.actionLabel.group = 'website';
                        card.links.Website = 'http://cinema6.com';

                        $scope.$digest();

                        expect(SelfieCampaignTextCtrl.updateActionLink).toHaveBeenCalledWith('http://cinema6.com', 'website');
                    });
                });

                describe('when it should not bind to Action', function() {
                    it('should not set the Action link', function() {
                        SelfieCampaignTextCtrl.bindLinkToWebsite = false;
                        SelfieCampaignTextCtrl.actionLabel.group = 'website';
                        card.links.Website = 'http://cinema6.com';

                        $scope.$digest();

                        expect(SelfieCampaignTextCtrl.updateActionLink).not.toHaveBeenCalled();
                    });
                });

                describe('when the Action link is click-to-call', function() {
                    it('should not set the Action link', function() {
                        SelfieCampaignTextCtrl.bindLinkToWebsite = true;
                        SelfieCampaignTextCtrl.actionLabel.group = 'phone';
                        card.links.Website = 'http://cinema6.com';

                        $scope.$digest();

                        expect(SelfieCampaignTextCtrl.updateActionLink).not.toHaveBeenCalled();
                    });
                });
            });
        });
    });
});
