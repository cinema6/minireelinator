define(['app'], function(appModule) {
    'use strict';

    describe('SelfieWebsiteScrapingDialogController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            SelfieWebsiteScrapingDialogService,
            WebsiteCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                SelfieWebsiteScrapingDialogService = $injector.get('SelfieWebsiteScrapingDialogService');

                spyOn(SelfieWebsiteScrapingDialogService, 'success');
                spyOn(SelfieWebsiteScrapingDialogService, 'failure');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    WebsiteCtrl = $controller('SelfieWebsiteScrapingDialogController', { $scope: $scope });
                });
            });
        });

        it('should exist', function() {
            expect(WebsiteCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('save()', function() {
                describe('when there are no links or logos', function() {
                    it('should pass an empty data object', function() {
                        WebsiteCtrl.save();

                        expect(SelfieWebsiteScrapingDialogService.success).toHaveBeenCalledWith({
                            links: {},
                            images: {
                                profile: undefined
                            }
                        });
                    });
                });

                describe('when there are links and logos', function() {
                    it('should not send links/logo that are not selected', function() {
                        $scope.model = {
                            links: [
                                {
                                    name: 'facebook',
                                    href: 'http://facebook.com',
                                    selected: false
                                },
                                {
                                    name: 'twitter',
                                    href: 'http://twitter.com',
                                    selected: true
                                },
                                {
                                    name: 'instagram',
                                    href: 'http://instagram.com',
                                    selected: false
                                },
                                {
                                    name: 'pinterest',
                                    href: 'http://pinterest.com',
                                    selected: true
                                }
                            ],
                            logo: {
                                href: 'http://logo.com',
                                selected: false
                            }
                        };

                        WebsiteCtrl.save();

                        expect(SelfieWebsiteScrapingDialogService.success).toHaveBeenCalledWith({
                            links: {
                                twitter: 'http://twitter.com',
                                pinterest: 'http://pinterest.com'
                            },
                            images: {
                                profile: false
                            }
                        });

                        $scope.model.links[0].selected = true;
                        $scope.model.links[2].selected = true;
                        $scope.model.logo.selected = true;

                        WebsiteCtrl.save();

                        expect(SelfieWebsiteScrapingDialogService.success).toHaveBeenCalledWith({
                            links: {
                                facebook: 'http://facebook.com',
                                twitter: 'http://twitter.com',
                                instagram: 'http://instagram.com',
                                pinterest: 'http://pinterest.com',
                            },
                            images: {
                                profile: 'http://logo.com'
                            }
                        });
                    });
                });
            });

            describe('cancel()', function() {
                it('should call failure on the service', function() {
                    WebsiteCtrl.cancel();

                    expect(SelfieWebsiteScrapingDialogService.failure).toHaveBeenCalled();
                });
            });
        });
    });
});
