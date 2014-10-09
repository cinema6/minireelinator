define(['app','minireel/sponsor'], function(appModule, sponsorModule) {
    'use strict';

    describe('SponsorMiniReelLinksController', function() {
        var $rootScope,
            $controller,
            c6State,
            sponsorMiniReel,
            $scope,
            SponsorMiniReelCtrl,
            SponsorMiniReelLinksCtrl;

        var links;

        beforeEach(function() {
            links = [
                {
                    name: 'Action',
                    href: 'buynow.html'
                },
                {
                    name: 'Website',
                    href: null
                },
                {
                    name: 'Facebook',
                    href: 'fb.html'
                },
                {
                    name: 'Twitter',
                    href: null
                },
                {
                    name: 'Pinterest',
                    href: null
                }
            ];

            module(appModule.name);
            module(sponsorModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');

                sponsorMiniReel = c6State.get('MR:SponsorMiniReel');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorMiniReelCtrl = $scope.SponsorMiniReelCtrl = $controller('SponsorMiniReelController', {
                        $scope: $scope,
                        cState: sponsorMiniReel

                    });
                    SponsorMiniReelCtrl.model = {
                        data: {
                            links: {}
                        }
                    };

                    SponsorMiniReelLinksCtrl = $controller('SponsorMiniReelLinksController', {
                        $scope: $scope
                    });
                    SponsorMiniReelLinksCtrl.model = links;
                });
            });
        });

        it('should exist', function() {
            expect(SponsorMiniReelLinksCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('newLink', function() {
                it('should be a virgin link object', function() {
                    expect(SponsorMiniReelLinksCtrl.newLink).toEqual(jasmine.objectContaining({
                        name: 'Untitled',
                        href: null
                    }));
                });
            });
        });

        describe('methods', function() {
            describe('save()', function() {
                var links;

                beforeEach(function() {
                    links = SponsorMiniReelLinksCtrl.save();
                });

                it('should return the links from the minireel', function() {
                    expect(links).toBe(SponsorMiniReelCtrl.model.data.links);
                });

                it('should convert its model to a hash of links', function() {
                    expect(links).toEqual({
                        'Action': 'buynow.html',
                        'Facebook': 'fb.html'
                    });
                });
            });

            describe('push()', function() {
                var origLinks, newLink;

                beforeEach(function() {
                    origLinks = links.slice();
                    newLink = SponsorMiniReelLinksCtrl.newLink;

                    SponsorMiniReelLinksCtrl.newLink.name = 'Foo';
                    SponsorMiniReelLinksCtrl.newLink.href = 'foo.com';

                    SponsorMiniReelLinksCtrl.push();
                });

                it('should add the newLink to the model', function() {
                    expect(origLinks.length).toBeGreaterThan(0);

                    origLinks.forEach(function(link) {
                        expect(SponsorMiniReelLinksCtrl.model).toContain(link);
                    });
                    expect(SponsorMiniReelLinksCtrl.model).toContain(newLink);
                });

                it('should create a new newLink', function() {
                    expect(SponsorMiniReelLinksCtrl.newLink).not.toBe(newLink);
                    expect(SponsorMiniReelLinksCtrl.newLink).toEqual(jasmine.objectContaining({
                        name: 'Untitled',
                        href: null
                    }));
                });
            });

            describe('remove(link)', function() {
                var link;

                beforeEach(function() {
                    link = links[1];

                    SponsorMiniReelLinksCtrl.remove(link);
                });

                it('should remove the link from the model', function() {
                    expect(SponsorMiniReelLinksCtrl.model).not.toContain(link);
                    expect(SponsorMiniReelLinksCtrl.model).toEqual(links.filter(function(listLink) {
                        return link !== listLink;
                    }));
                });
            });
        });

        describe('$events', function() {
            describe('$destroy', function() {
                beforeEach(function() {
                    spyOn(SponsorMiniReelLinksCtrl, 'save').and.callThrough();

                    $scope.$broadcast('$destroy');
                });

                it('should save the links', function() {
                    expect(SponsorMiniReelLinksCtrl.save).toHaveBeenCalled();
                });
            });

            describe('SponsorMiniReelCtrl:beforeSave', function() {
                beforeEach(function() {
                    spyOn(SponsorMiniReelLinksCtrl, 'save').and.callThrough();

                    $scope.$broadcast('SponsorMiniReelCtrl:beforeSave');
                });

                it('should save the links', function() {
                    expect(SponsorMiniReelLinksCtrl.save).toHaveBeenCalled();
                });
            });
        });
    });
});
