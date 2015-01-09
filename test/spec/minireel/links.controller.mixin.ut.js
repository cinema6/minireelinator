define(['angular','minireel/mixins/LinksController'], function(angular, LinksController) {
    'use strict';

    var copy = angular.copy;

    describe('LinksController mixin', function() {
        var $rootScope,
            $scope,
            LinksCtrl;

        var parent, links;

        beforeEach(function() {
            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    LinksCtrl = $injector.instantiate(LinksController, {
                        $scope: $scope
                    });
                    LinksCtrl.initWithModel(links = {
                        'Action': 'buynow.html',
                        'Facebook': 'fb.html'
                    });
                    parent = {
                        links: links
                    };
                });
            });
        });

        it('should exist', function() {
            expect(LinksCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('newLink', function() {
                it('should be a virgin link object', function() {
                    expect(LinksCtrl.newLink).toEqual(jasmine.objectContaining({
                        name: 'Untitled',
                        href: null
                    }));
                });
            });

            describe('model', function() {
                it('should be the links', function() {
                    expect(LinksCtrl.model).toBe(links);
                });
            });

            describe('links', function() {
                beforeEach(function() {
                    LinksCtrl.initWithModel(links = {
                        'Action': 'action.html',
                        'Website': 'website.html',
                        'My Custom Thang': 'blegh.html',
                        'Instagram': 'intergrem.html',
                        'Facebook': 'fb.html',
                        'Pinterest': '/share/pinterest.htm'
                    });
                });

                it('should be an array of links', function() {
                    expect(LinksCtrl.links).toEqual([
                        {
                            name: 'Action',
                            href: 'action.html'
                        },
                        {
                            name: 'Website',
                            href: 'website.html'
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
                            href: '/share/pinterest.htm'
                        },
                        {
                            name: 'YouTube',
                            href: null
                        },
                        {
                            name: 'My Custom Thang',
                            href: 'blegh.html'
                        },
                        {
                            name: 'Instagram',
                            href: 'intergrem.html'
                        }
                    ]);
                });

                describe('if there are no links', function() {
                    beforeEach(function() {
                        LinksCtrl.initWithModel({});
                    });

                    it('should be the defaults', function() {
                        expect(LinksCtrl.links).toEqual(['Action', 'Website', 'Facebook', 'Twitter', 'Pinterest', 'YouTube'].map(function(name) {
                            return {
                                name: name,
                                href: null
                            };
                        }));
                    });
                });
            });
        });

        describe('methods', function() {
            describe('save()', function() {
                var links;

                beforeEach(function() {
                    copy({}, parent.links);
                    links = LinksCtrl.save();
                });

                it('should return the links from the minireel', function() {
                    expect(links).toBe(parent.links);
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
                    origLinks = LinksCtrl.links.slice();
                    newLink = LinksCtrl.newLink;

                    LinksCtrl.newLink.name = 'Foo';
                    LinksCtrl.newLink.href = 'foo.com';

                    LinksCtrl.push();
                });

                it('should add the newLink to the model', function() {
                    expect(origLinks.length).toBeGreaterThan(0);

                    origLinks.forEach(function(link) {
                        expect(LinksCtrl.links).toContain(link);
                    });
                    expect(LinksCtrl.links).toContain(newLink);
                });

                it('should create a new newLink', function() {
                    expect(LinksCtrl.newLink).not.toBe(newLink);
                    expect(LinksCtrl.newLink).toEqual(jasmine.objectContaining({
                        name: 'Untitled',
                        href: null
                    }));
                });
            });

            describe('remove(link)', function() {
                var link;

                beforeEach(function() {
                    link = LinksCtrl.links[1];

                    LinksCtrl.remove(link);
                });

                it('should remove the link from the model', function() {
                    expect(LinksCtrl.links).not.toContain(link);
                    expect(LinksCtrl.links).toEqual(LinksCtrl.links.filter(function(listLink) {
                        return link !== listLink;
                    }));
                });
            });
        });

        describe('$events', function() {
            describe('$destroy', function() {
                beforeEach(function() {
                    spyOn(LinksCtrl, 'save').and.callThrough();

                    $scope.$broadcast('$destroy');
                });

                it('should save the links', function() {
                    expect(LinksCtrl.save).toHaveBeenCalled();
                });
            });
        });
    });
});
