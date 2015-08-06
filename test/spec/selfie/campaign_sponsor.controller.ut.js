define(['app'], function(appModule) {
    'use strict';

    fdescribe('SelfieCampaignSponsorController', function() {
        var $rootScope,
            $controller,
            $scope,
            CollateralService,
            FileService,
            SelfieCampaignSponsorCtrl;

        var advertiser,
            card,
            logos;

        function compileCtrl() {
            SelfieCampaignSponsorCtrl = $controller('SelfieCampaignSponsorController', { $scope: $scope });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                CollateralService = $injector.get('CollateralService');
                FileService = $injector.get('FileService');

                advertiser = {};
                logos = [];
                card = {
                    collateral: {
                        logo: null
                    },
                    links: {}
                };

                $scope = $rootScope.$new();
                $scope.SelfieCampaignCtrl = {
                    advertiser: advertiser,
                    logos: logos,
                    card: card
                };
            });

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieCampaignSponsorCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('logoOptions', function() {
                describe('when there is no advertiser default logo', function() {
                    it('should have three options', function() {
                        var options = [
                            {type: 'none', label: 'None'},
                            {type: 'url', label: 'Upload from URL'},
                            {type: 'file', label: 'Upload from File'}
                        ];

                        expect(SelfieCampaignSponsorCtrl.logoOptions).toEqual(options)
                    });
                });

                describe('when the advertiser account has a default logo', function() {
                    it('should include it in the first position', function() {
                        advertiser.defaultLogos = {
                            square: 'square.jpg'
                        };

                        compileCtrl();

                        expect(SelfieCampaignSponsorCtrl.logoOptions[0]).toEqual({
                            type: 'account',
                            label: 'Account Default',
                            src: 'square.jpg'
                        });
                    });
                });

                describe('when there are logos from other active campaigns', function() {
                    it('should add custom logo options to the end of the list', function() {
                        logos.push({name: 'Diageo from Summer Campaign', src: 'diageo.jpg'});
                        logos.push({name: 'Volvo from JCVD Campaign', src: 'volvo.jpg'});

                        compileCtrl();

                        expect(SelfieCampaignSponsorCtrl.logoOptions[3]).toEqual({
                            type: 'custom',
                            label: logos[0].name,
                            src: logos[0].src
                        });

                        expect(SelfieCampaignSponsorCtrl.logoOptions[4]).toEqual({
                            type: 'custom',
                            label: logos[1].name,
                            src: logos[1].src
                        });
                    });
                });
            });

            describe('logoType', function() {
                describe('when no logo has been selected yet, aka brand new campaign', function() {
                    it('should default to the first option', function() {
                        expect(SelfieCampaignSponsorCtrl.logoType).toEqual(SelfieCampaignSponsorCtrl.logoOptions[0]);
                    });
                });

                describe('when a logo has been set and has a valid logoType', function() {
                    it('should choose that option', function() {
                        card.collateral.logoType = 'url';

                        compileCtrl();

                        expect(SelfieCampaignSponsorCtrl.logoType).toEqual({
                            type: 'url',
                            label: 'Upload from URL',
                        });
                    });
                });

                describe('when logo matches a an existing src', function() {
                    it('should choose that option', function() {
                        card.collateral.logo = 'logo.jpg';
                        logos.push({name: 'Diageo Campaign', src: 'logo.jpg'});

                        compileCtrl();

                        expect(SelfieCampaignSponsorCtrl.logoType).toEqual({
                            type: 'custom',
                            label: 'Diageo Campaign',
                            src: 'logo.jpg'
                        });
                    });
                });

                describe('if there is no logo set but there is a default advertiser logo', function() {
                    it('should set the choice to "none"', function() {
                        advertiser.defaultLogos = {
                            square: 'square.jpg'
                        };

                        card.collateral.logo = null;

                        compileCtrl();

                        expect(SelfieCampaignSponsorCtrl.logoType).toEqual({
                            type: 'none',
                            label: 'None'
                        });
                    });
                });
            });

            describe('logo', function() {
                it('should be the card logo', function() {
                    card.collateral.logo = null;

                    compileCtrl();

                    expect(SelfieCampaignSponsorCtrl.logo).toEqual(null);

                    card.collateral.logo = 'logo.jpg';

                    compileCtrl();

                    expect(SelfieCampaignSponsorCtrl.logo).toEqual('logo.jpg');
                });
            });

            describe('previouslyUploadedLogo', function() {
                it('should be null', function() {
                    expect(SelfieCampaignSponsorCtrl.previouslyUploadedLogo).toBe(null);
                });
            });
        });
    });
});