define(['minireel/campaign'], function(campaignModule) {
    'use strict';

    describe('CampaignController', function() {
        var $rootScope,
            $controller,
            cinema6,
            $scope,
            CampaignCtrl;

        var campaign;

        beforeEach(function() {
            module(campaignModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                cinema6 = $injector.get('cinema6');

                campaign = cinema6.db.create('campaign', {
                    id: '',
                    links: {
                        'Action': 'buynow.html',
                        'Facebook': 'fb.html'
                    },
                    logos: {
                        square: 'logo.jpg'
                    }
                });

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    CampaignCtrl = $controller('CampaignController', {
                        $scope: $scope
                    });
                    CampaignCtrl.initWithModel(campaign);
                });
            });
        });

        it('should exist', function() {
            expect(CampaignCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('model', function() {
                it('should be the campaign', function() {
                    expect(CampaignCtrl.model).toBe(campaign);
                });
            });

            describe('links', function() {
                beforeEach(function() {
                    campaign.links = {
                        'Action': 'action.html',
                        'Website': 'website.html',
                        'My Custom Thang': 'blegh.html',
                        'Instagram': 'intergrem.html',
                        'Facebook': 'fb.html',
                        'Pinterest': '/share/pinterest.htm'
                    };

                    CampaignCtrl.initWithModel(campaign);
                });

                it('should be an array of links', function() {
                    expect(CampaignCtrl.links).toEqual([
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
                            name: 'YouTube',
                            href: null
                        },
                        {
                            name: 'Pinterest',
                            href: '/share/pinterest.htm'
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
                        campaign.links = {};

                        CampaignCtrl.initWithModel(campaign);
                    });

                    it('should be the defaults', function() {
                        expect(CampaignCtrl.links).toEqual(['Action', 'Website', 'Facebook', 'Twitter', 'YouTube', 'Pinterest'].map(function(name) {
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
            describe('removeLink(link)', function() {
                var link;

                beforeEach(function() {
                    link = CampaignCtrl.links[1];

                    CampaignCtrl.removeLink(link);
                });

                it('should remove the link from the model', function() {
                    expect(CampaignCtrl.links).not.toContain(link);
                    expect(CampaignCtrl.links).toEqual(CampaignCtrl.links.filter(function(listLink) {
                        return link !== listLink;
                    }));
                });
            });

            describe('addLink(link)', function() {
                var origLinks, newLink;

                beforeEach(function() {
                    origLinks = CampaignCtrl.links.slice();
                    newLink = {
                        name: 'Foo',
                        href: 'foo.com'
                    };

                    CampaignCtrl.addLink(newLink);
                });

                it('should add the newLink to the model', function() {
                    expect(origLinks.length).toBeGreaterThan(0);

                    origLinks.forEach(function(link) {
                        expect(CampaignCtrl.links).toContain(link);
                    });
                    expect(CampaignCtrl.links).toContain(newLink);
                });
            });
        });
    });
});
