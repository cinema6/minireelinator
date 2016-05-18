define(['app'], function(appModule) {
    'use strict';

    describe('SelfieCampaignWebsiteController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            c6State,
            cState,
            CollateralService,
            WebsiteCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                CollateralService = $injector.get('CollateralService');

                spyOn(CollateralService, 'websiteData');
                spyOn(c6State, 'goTo');

                cState = {
                    cParent: {
                        cName: 'Selfie:New:Campaign'
                    }
                };

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    WebsiteCtrl = $controller('SelfieCampaignWebsiteController', { $scope: $scope, cState: cState });
                });
            });
        });

        afterAll(function() {
            $rootScope = null;
            $scope = null;
            $controller = null;
            $q = null;
            c6State = null;
            cState = null;
            CollateralService = null;
            WebsiteCtrl = null;
        });

        it('should exist', function() {
            expect(WebsiteCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('data', function() {
                beforeEach(function() {
                    WebsiteCtrl.links = [
                        {
                            name: 'facebook',
                            href: 'http://facebook.com',
                            cssClass: 'facebook-square',
                            selected: true
                        },
                        {
                            name: 'twitter',
                            href: 'http://twitter.com',
                            cssClass: 'twitter-square',
                            selected: true
                        },
                        {
                            name: 'instagram',
                            href: 'http://instagram.com',
                            cssClass: 'instagram',
                            selected: true
                        },
                        {
                            name: 'pinterest',
                            href: null,
                            cssClass: 'pinterest-square',
                            selected: true
                        },
                        {
                            name: 'google',
                            href: 'http://google.com',
                            cssClass: 'google',
                            selected: true
                        }
                    ];

                    WebsiteCtrl.logo = {
                        href: 'http://logo.com',
                        selected: true
                    }
                });

                describe('when a link is empty and selected', function() {
                    it('should be set to null so it will overwrite existing value when saved', function() {
                        expect(WebsiteCtrl.data).toEqual({
                            links: {
                                facebook: 'http://facebook.com',
                                twitter: 'http://twitter.com',
                                instagram: 'http://instagram.com',
                                pinterest: null,
                                google: 'http://google.com'
                            },
                            images: {
                                profile: 'http://logo.com'
                            }
                        });
                    });
                });

                describe('when there is no logo or it is unselected', function() {
                    it('the property should be falsy', function() {
                        WebsiteCtrl.logo.href = undefined;

                        expect(WebsiteCtrl.data.images.profile).toBeFalsy();

                        WebsiteCtrl.logo.href = 'http://mylogo.com';

                        expect(WebsiteCtrl.data.images.profile).toBe('http://mylogo.com');

                        WebsiteCtrl.logo.selected = false;

                        expect(WebsiteCtrl.data.images.profile).toBeFalsy();
                    });
                });

                describe('when links are unselected', function() {
                    it('they should not be included', function() {
                        WebsiteCtrl.links[0].selected = false;
                        WebsiteCtrl.links[2].selected = false;
                        WebsiteCtrl.links[3].selected = false;

                        expect(WebsiteCtrl.data).toEqual({
                            links: {
                                // facebook: 'http://facebook.com',
                                twitter: 'http://twitter.com',
                                // instagram: 'http://instagram.com',
                                // pinterest: null,
                                google: 'http://google.com'
                            },
                            images: {
                                profile: 'http://logo.com'
                            }
                        });
                    });
                });
            });
        });

        describe('methods', function() {
            describe('close()', function() {
                it('should go to parent state', function() {
                    WebsiteCtrl.close();

                    expect(c6State.goTo).toHaveBeenCalledWith(cState.cParent.cName);
                });
            });

            describe('initWithModel(model)', function() {
                var model, data, deferred;

                beforeEach(function() {
                    deferred = $q.defer();

                    model = {
                        website: 'http://website.com'
                    };

                    data = {
                        links: {
                            facebook: 'http://facebook.com',
                            twitter: 'http://twitter.com',
                            instagram: 'http://instagram.com',
                            pinterest: null,
                            google: 'http://google.com'
                        },
                        images: {
                            profile: 'http://logo.com'
                        }
                    };

                    CollateralService.websiteData.and.returnValue(deferred.promise);

                    WebsiteCtrl.initWithModel(model);
                });

                it('should set loading flag', function() {
                    expect(WebsiteCtrl.loading).toBe(true);
                });

                it('should request website data', function() {
                    expect(CollateralService.websiteData).toHaveBeenCalledWith(model.website);
                });

                describe('when website data is returned', function() {
                    it('should add data to the Ctrl and set loading flag to false', function() {
                        $scope.$apply(function() {
                            deferred.resolve(data);
                        });

                        expect(WebsiteCtrl.links).toEqual([
                            {
                                name: 'facebook',
                                href: 'http://facebook.com',
                                cssClass: 'facebook-square',
                                selected: true
                            },
                            {
                                name: 'twitter',
                                href: 'http://twitter.com',
                                cssClass: 'twitter-square',
                                selected: true
                            },
                            {
                                name: 'instagram',
                                href: 'http://instagram.com',
                                cssClass: 'instagram',
                                selected: true
                            },
                            {
                                name: 'pinterest',
                                href: null,
                                cssClass: 'pinterest-square',
                                selected: true
                            },
                            {
                                name: 'google',
                                href: 'http://google.com',
                                cssClass: 'google',
                                selected: true
                            }
                        ]);

                        expect(WebsiteCtrl.logo).toEqual({
                            href: 'http://logo.com',
                            selected: true
                        });

                        expect(WebsiteCtrl.loading).toBe(false);
                    });
                });

                describe('when website data is not found', function() {
                    it('should set loading flag to false and error to true', function() {
                        $scope.$apply(function() {
                            deferred.reject('not found');
                        });

                        expect(WebsiteCtrl.loading).toBe(false);
                        expect(WebsiteCtrl.error).toBe(true);
                    });
                });
            });
        });
    });
});
