define(['app'], function(appModule) {
    'use strict';

    describe('SelfieCampaignSponsorController', function() {
        var $rootScope,
            $controller,
            $scope,
            $q,
            CollateralService,
            SelfieCampaignSponsorCtrl;

        var advertiser,
            card,
            logos;

        function compileCtrl() {
            $scope.$apply(function() {
                SelfieCampaignSponsorCtrl = $controller('SelfieCampaignSponsorController', { $scope: $scope });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                CollateralService = $injector.get('CollateralService');

                advertiser = {};
                logos = [];
                card = {
                    collateral: {
                        logo: undefined
                    },
                    links: {},
                    shareLinks: {}
                };

                $scope = $rootScope.$new();
                $scope.AppCtrl = {
                    validUrl: /^(http:\/\/|https:\/\/|\/\/)/
                };
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
                        expect(SelfieCampaignSponsorCtrl.logoType).toEqual(SelfieCampaignSponsorCtrl.logoOptions[1]);
                    });
                });

                describe('when a logo has been set and has a valid logoType', function() {
                    it('should choose that option', function() {
                        card.collateral.logo = 'logo.jpg';
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

                        card.collateral.logo = undefined;

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
                    card.collateral.logo = undefined;

                    compileCtrl();

                    expect(SelfieCampaignSponsorCtrl.logo).toEqual(undefined);
                });

                it('should be the card logo', function() {
                    card.collateral.logo = 'logo.jpg';
                    card.collateral.logoType = 'file';

                    compileCtrl();

                    expect(SelfieCampaignSponsorCtrl.logo).toEqual('logo.jpg');
                });
            });

            describe('previouslyUploadedLogo', function() {
                it('should be null', function() {
                    expect(SelfieCampaignSponsorCtrl.previouslyUploadedLogo).toBe(undefined);
                });
            });

            describe('links', function() {
                it('should be an array of objects containing the hrefs stored on the card', function() {
                    card.links = {
                        Facebook: 'http://facebook.com/my-brand',
                        YouTube: 'http://youtube.com/my-brand',
                        Website: 'http://mybrand.com'
                    };

                    compileCtrl();

                    expect(SelfieCampaignSponsorCtrl.links).toContain({
                        cssClass: 'link',
                        name: 'Website',
                        href: 'http://mybrand.com',
                        required: true
                    });

                    ['YouTube','Facebook'].forEach(function(link) {
                        expect(SelfieCampaignSponsorCtrl.links).toContain({
                            cssClass: link.toLowerCase(),
                            name: link,
                            href: card.links[link],
                            required: false
                        });
                    });

                    ['Twitter','Pinterest','Instagram'].forEach(function(link) {
                        expect(SelfieCampaignSponsorCtrl.links).toContain({
                            cssClass: link.toLowerCase(),
                            name: link,
                            href: null,
                            required: false
                        });
                    });
                });
            });

            describe('sharing link', function() {
                it('should be the shareLinks.facebook url or undefined', function() {
                    expect(SelfieCampaignSponsorCtrl.sharing).toBe(undefined);

                    card.shareLinks = {
                        facebook: 'http://facebook.com'
                    };

                    compileCtrl();

                    expect(SelfieCampaignSponsorCtrl.sharing).toBe('http://facebook.com');
                });
            });
        });

        describe('methods', function() {
            describe('updateLinks()', function() {
                it('should add http:// to links that have no protocol', function() {
                    SelfieCampaignSponsorCtrl.links[0].href = 'cinema6.com';

                    SelfieCampaignSponsorCtrl.updateLinks();

                    expect(card.links.Website).toEqual('http://cinema6.com');
                });

                it('should add and remove links on the actual card', function() {
                    SelfieCampaignSponsorCtrl.links[0].href = 'http://mywebsite.com';

                    SelfieCampaignSponsorCtrl.updateLinks();

                    expect(card.links.Website).toEqual('http://mywebsite.com');

                    SelfieCampaignSponsorCtrl.links[0].href = '';

                    SelfieCampaignSponsorCtrl.updateLinks();

                    expect(card.links.Website).toBeUndefined();
                });

                describe('shareLinks', function() {
                    it('should add the same url for Facebook, Twitter and Pinterest if defined', function() {
                        SelfieCampaignSponsorCtrl.sharing = 'mywebsite.com';

                        SelfieCampaignSponsorCtrl.updateLinks();

                        expect(card.shareLinks).toEqual({
                            facebook: 'http://mywebsite.com',
                            twitter: 'http://mywebsite.com',
                            pinterest: 'http://mywebsite.com'
                        });
                    });

                    it('should remove all shareLinks if unset', function() {
                        SelfieCampaignSponsorCtrl.sharing = 'mywebsite.com';

                        SelfieCampaignSponsorCtrl.updateLinks();

                        expect(card.shareLinks).toEqual({
                            facebook: 'http://mywebsite.com',
                            twitter: 'http://mywebsite.com',
                            pinterest: 'http://mywebsite.com'
                        });

                        SelfieCampaignSponsorCtrl.sharing = '';

                        SelfieCampaignSponsorCtrl.updateLinks();

                        expect(card.shareLinks).toEqual({
                            facebook: undefined,
                            twitter: undefined,
                            pinterest: undefined
                        });
                    });
                });
            });

            describe('uploadFromUri(uri)', function() {
                var deferred;

                beforeEach(function() {
                    deferred = $q.defer();

                    spyOn(CollateralService, 'uploadFromUri').and.returnValue(deferred.promise);

                    SelfieCampaignSponsorCtrl.uploadFromUri('http://someimage.com/image.jpg');
                });

                it('should upload via Collateral Service', function() {
                    expect(CollateralService.uploadFromUri).toHaveBeenCalledWith('http://someimage.com/image.jpg');
                });

                describe('when promise resolves', function() {
                    it('should set the path on the controller', function() {
                        $scope.$apply(function() {
                            deferred.resolve('collateral/userFiles/iuyewriujksdfhjh.jpg');
                        });

                        expect(SelfieCampaignSponsorCtrl.logo).toEqual('/collateral/userFiles/iuyewriujksdfhjh.jpg');
                        expect(SelfieCampaignSponsorCtrl.previouslyUploadedLogo).toEqual('/collateral/userFiles/iuyewriujksdfhjh.jpg');
                    });
                });

                describe('when promise is rejected', function() {
                    it('should show error', function() {
                        $scope.$apply(function() {
                            deferred.reject();
                        });

                        expect(SelfieCampaignSponsorCtrl.uploadError).toBe(true);
                    });
                });
            });
        });

        describe('$watchers', function() {
            describe('logo', function() {
                it('should update the logo and logoType properties on the card', function() {
                    expect(card.collateral.logo).toBe(undefined);
                    expect(card.collateral.logoType).toBeUndefined();

                    $scope.$apply(function() {
                        SelfieCampaignSponsorCtrl.logoType.type = 'file';
                    });

                    $scope.$apply(function() {
                        SelfieCampaignSponsorCtrl.logo = '/newlogo.jpg';
                    });

                    expect(card.collateral.logo).toBe('/newlogo.jpg');
                    expect(card.collateral.logoType).toBe('file');

                    $scope.$apply(function() {
                        SelfieCampaignSponsorCtrl.logoType.type = 'custom';
                    });

                    $scope.$apply(function() {
                        SelfieCampaignSponsorCtrl.logo = '/differentlogo.jpg';
                    });

                    expect(card.collateral.logo).toBe('/differentlogo.jpg');
                    expect(card.collateral.logoType).toBe(undefined);
                });
            });

            describe('logoType', function() {
                it('should reset uploadError property', function() {
                    SelfieCampaignSponsorCtrl.uploadError = true;

                    $scope.$apply(function() {
                        SelfieCampaignSponsorCtrl.logoType.type = 'file';
                    });

                    expect(SelfieCampaignSponsorCtrl.uploadError).toBe(false);
                });

                describe('when File or URL are chosen', function() {
                    it('should show previously uploaded logo if defined', function() {
                        SelfieCampaignSponsorCtrl.previouslyUploadedLogo = '/previous.jpg';

                        $scope.$apply(function() {
                            SelfieCampaignSponsorCtrl.logoType.type = 'file';
                        });

                        expect(SelfieCampaignSponsorCtrl.logo).toEqual('/previous.jpg');
                    });

                    it('should do nothing if no previously uploaded files exist', function() {
                        $scope.$apply(function() {
                            SelfieCampaignSponsorCtrl.logoType.type = 'file';
                        });

                        expect(SelfieCampaignSponsorCtrl.logo).toEqual(undefined);
                    });
                });

                describe('when custom is chosen', function() {
                    it('should show the custom image', function() {
                        logos.push({name: 'Diageo from Summer Campaign', src: 'diageo.jpg'});
                        logos.push({name: 'Volvo from JCVD Campaign', src: 'volvo.jpg'});

                        compileCtrl();

                        $scope.$apply(function() {
                            SelfieCampaignSponsorCtrl.logoType = SelfieCampaignSponsorCtrl.logoOptions[4];
                        });

                        expect(SelfieCampaignSponsorCtrl.logo).toEqual('volvo.jpg');
                    });
                });

                describe('when default account logo is chosen', function() {
                    it('should show the account default logo', function() {
                        advertiser.defaultLogos = {
                            square: 'square.jpg'
                        };

                        compileCtrl();

                        $scope.$apply(function() {
                            SelfieCampaignSponsorCtrl.logoType = SelfieCampaignSponsorCtrl.logoOptions[0];
                        });

                        expect(SelfieCampaignSponsorCtrl.logo).toEqual('square.jpg');
                    });
                });

                describe('when "none" is selected', function() {
                    it('should remove any logo', function() {
                        advertiser.defaultLogos = {
                            square: 'square.jpg'
                        };

                        compileCtrl();

                        $scope.$apply(function() {
                            SelfieCampaignSponsorCtrl.logoType = SelfieCampaignSponsorCtrl.logoOptions[0];
                        });

                        expect(SelfieCampaignSponsorCtrl.logo).toEqual('square.jpg');

                        $scope.$apply(function() {
                            SelfieCampaignSponsorCtrl.logoType = SelfieCampaignSponsorCtrl.logoOptions[1];
                        });

                        expect(SelfieCampaignSponsorCtrl.logo).toEqual(undefined);
                        expect(SelfieCampaignSponsorCtrl.logoType.type).toEqual('none');
                    });
                });
            });

            describe('logoFile', function() {
                var deferred;

                beforeEach(function() {
                    deferred = $q.defer();

                    spyOn(CollateralService, 'uploadFromFile').and.returnValue(deferred.promise);

                    $scope.$apply(function() {
                        SelfieCampaignSponsorCtrl.logoFile = {filename: 'file'};
                    });
                });

                it('should upload via Collateral Service', function() {
                    expect(CollateralService.uploadFromFile).toHaveBeenCalledWith({filename: 'file'});
                });

                describe('when promise resolves', function() {
                    it('should set the path on the controller', function() {
                        $scope.$apply(function() {
                            deferred.resolve('collateral/userFiles/iuyewriujksdfhjh.jpg');
                        });

                        expect(SelfieCampaignSponsorCtrl.logo).toEqual('/collateral/userFiles/iuyewriujksdfhjh.jpg');
                        expect(SelfieCampaignSponsorCtrl.previouslyUploadedLogo).toEqual('/collateral/userFiles/iuyewriujksdfhjh.jpg');
                    });
                });

                describe('when promise is rejected', function() {
                    it('should show error', function() {
                        $scope.$apply(function() {
                            deferred.reject();
                        });

                        expect(SelfieCampaignSponsorCtrl.uploadError).toBe(true);
                    });
                });
            });
        });
    });
});