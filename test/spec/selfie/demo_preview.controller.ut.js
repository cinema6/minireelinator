define(['app'], function(appModule) {
    'use strict';

    describe('SelfieDemoPreviewController', function() {
        var ctrl, $controller, $scope, CollateralService, $q, c6State, SpinnerService, $location;

        beforeEach(function() {
            module(appModule.name);
            var $rootScope;
            inject(function($injector) {
                $controller = $injector.get('$controller');
                $rootScope = $injector.get('$rootScope');
                CollateralService = $injector.get('CollateralService');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                SpinnerService = $injector.get('SpinnerService');
                $location = $injector.get('$location');
            });
            $scope = $rootScope.$new();
            spyOn(CollateralService, 'websiteData');
            spyOn(c6State, 'goTo');
            spyOn(SpinnerService, 'display');
            spyOn(SpinnerService, 'close');
            spyOn($location, 'search').and.returnValue({ });
            ctrl = $controller('SelfieDemoPreviewController', {
                $scope: $scope
            });
            spyOn(ctrl._private, 'generateLink');
            spyOn(ctrl._private, 'getWebsiteData');
            spyOn(ctrl, 'updateActionLink');
        });

        it('should exist', function() {
            expect(ctrl).toBeDefined();
        });

        it('should initialize properties', function() {
            expect(ctrl.card).toBeNull();
            expect(ctrl.maxHeadlineLength).toBe(40);
            expect(ctrl.maxDescriptionLength).toBe(400);
            expect(ctrl.actionLabelOptions).toEqual([
                'Apply Now',
                'Book Now',
                'Buy Now',
                'Contact Us',
                'Donate Now',
                'Learn More',
                'Shop Now',
                'Sign Up',
                'Watch More'
            ]);
            expect(ctrl.actionLabelOptions).not.toContain('Custom');
            expect(ctrl.actionLink).toBe('');
        });

        describe('initializing the signup button title', function() {
            it('should work if there is a promotion', function() {
                $location.search.and.returnValue({ promotion: 'cats' });
                ctrl = $controller('SelfieDemoPreviewController', {
                    $scope: $scope
                });
                expect(ctrl.signUpTitle).toBe('Get My $50 Credit');
            });

            it('should work if there is not a promotion', function() {
                expect(ctrl.signUpTitle).toBe('Get Started Now');
            });
        });

        describe('generateLink', function() {
            beforeEach(function() {
                ctrl._private.generateLink.and.callThrough();
            });

            it('should return the link if it has a protocol', function() {
                expect(ctrl._private.generateLink('https://google.com')).toBe('https://google.com');
            });

            it('should add the protocol if it is missing', function() {
                expect(ctrl._private.generateLink('google.com')).toBe('http://google.com');
            });

            it('should add the protocol if it is missing but has the slashes', function() {
                expect(ctrl._private.generateLink('//google.com')).toBe('http://google.com');
            });
        });

        describe('initWithModel', function() {
            beforeEach(function() {
                ctrl._private.getWebsiteData.and.returnValue($q.when());
            });

            it('should display the spinner', function() {
                var model = {
                    card: {
                        data: {
                            videoid: 'videoid'
                        }
                    }
                };
                ctrl.initWithModel(model);
                expect(SpinnerService.display).toHaveBeenCalledWith();
            });

            it('should set the model and card', function() {
                var model = {
                    card: {
                        data: {
                            videoid: 'videoid'
                        }
                    }
                };
                ctrl.initWithModel(model);
                expect(ctrl.model).toBe(model);
                expect(ctrl.card).toBe(model.card);
            });

            it('should get website data', function() {
                var model = {
                    card: {
                        data: {
                            videoid: 'videoid'
                        }
                    },
                    website: 'website'
                };
                ctrl.initWithModel(model);
                expect(ctrl._private.getWebsiteData).toHaveBeenCalledWith('website');
            });

            it('should initialize the CTA url with a provided website', function() {
                var model = {
                    card: {
                        data: {
                            videoid: 'videoid'
                        }
                    },
                    website: 'website'
                };
                ctrl.initWithModel(model);
                expect(ctrl.actionLink).toBe('website');
                expect(ctrl.updateActionLink).toHaveBeenCalledWith();
            });

            it('should close the spinner if getting website data succeeds', function() {
                var model = {
                    card: {
                        data: {
                            videoid: 'videoid'
                        }
                    }
                };
                ctrl.initWithModel(model);
                $scope.$digest();
                expect(SpinnerService.close).toHaveBeenCalledWith();
            });

            it('should close the spinner if getting website data fails', function() {
                var model = {
                    card: {
                        data: {
                            videoid: 'videoid'
                        }
                    },
                    website: 'website'
                };
                ctrl._private.getWebsiteData.and.returnValue($q.reject('fail whale'));
                ctrl.initWithModel(model);
                $scope.$digest();
                expect(SpinnerService.close).toHaveBeenCalledWith();
            });

            it('should redirect to the demo input form if there is no card data', function() {
                var model = {
                    card: {
                        data: {
                            videoid: null
                        }
                    },
                    website: 'website'
                };
                ctrl.initWithModel(model);
                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Demo:Input:Full');
            });
        });

        describe('updateActionLink', function() {
            beforeEach(function() {
                ctrl.updateActionLink.and.callThrough();
            });

            it('should format the link and update it on the model and controller', function() {
                ctrl.card = { links: { } };
                ctrl.actionLink = 'link';
                ctrl._private.generateLink.and.returnValue('formatted link');
                ctrl.updateActionLink();
                expect(ctrl._private.generateLink).toHaveBeenCalledWith('link');
                expect(ctrl.card.links.Action.uri).toBe('formatted link');
                expect(ctrl.actionLink).toBe('formatted link');
            });
        });

        describe('getWebsiteData', function() {
            beforeEach(function() {
                ctrl._private.getWebsiteData.and.callThrough();
                ctrl.card = { links: { } };
            });

            it('should use the collateral service', function() {
                CollateralService.websiteData.and.returnValue($q.when());
                ctrl._private.getWebsiteData('website');
                expect(CollateralService.websiteData).toHaveBeenCalledWith('website', { publicEndpoint: true });
            });

            describe('when it succeeds', function() {
                beforeEach(function() {
                    CollateralService.websiteData.and.returnValue($q.when({
                        images: {
                            profile: 'profile'
                        },
                        links: {
                            facebook: 'facebook link',
                            instagram: 'instagram link'
                        }
                    }));
                });

                it('should return a resolved promise', function(done) {
                    ctrl._private.getWebsiteData('website').then(done, done.fail);
                    $scope.$digest();
                });

                it('should be able to set a logo on the card', function() {
                    ctrl._private.getWebsiteData('website');
                    $scope.$digest();
                    expect(ctrl.card.collateral).toEqual({
                        logo: 'profile',
                        logoType: 'website'
                    });
                });

                it('should be able to set links on the card', function() {
                    ctrl._private.getWebsiteData('website');
                    $scope.$digest();
                    expect(ctrl.card.links.Facebook).toEqual({
                        uri: 'facebook link'
                    });
                    expect(ctrl.card.links.Instagram).toEqual({
                        uri: 'instagram link'
                    });
                });
            });

            describe('when it fails', function() {
                beforeEach(function() {
                    CollateralService.websiteData.and.returnValue($q.reject('fail whale'));
                });

                it('should default logo and social links', function(done) {
                    ctrl._private.getWebsiteData('website').then(function() {
                        expect(ctrl.card.collateral.logo).toContain('reelcontent');
                        expect(ctrl.card.collateral.logoType).toBe('website');
                        expect(ctrl.card.links.Facebook).toContain('facebook');
                        expect(ctrl.card.links.Twitter).toContain('twitter');
                        expect(ctrl.card.links.YouTube).toContain('youtube');
                    }).then(done, done.fail);
                    $scope.$digest();
                });
            });
        });

        describe('signUp', function() {
            it('should go to the signup form for desktop', function() {
                ctrl.signUp('desktop');
                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:SignUp:Full', null, { promotion: null });
            });

            it('should go to the signup form for mobile', function() {
                ctrl.signUp('mobile');
                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:SignUp:Form', null, { promotion: null });
            });

            it('should change any passed promotion to be the one for $50', function() {
                $location.search.and.returnValue({ promotion: 'cats' });
                ctrl = $controller('SelfieDemoPreviewController', {
                    $scope: $scope
                });
                ctrl.signUp('desktop');
                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:SignUp:Full', null, { promotion: 'pro-0gW6Qt03q32WqsC-' });
            });
        });
    });
});
