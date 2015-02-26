define(['minireel/campaign'], function(campaignModule) {
    'use strict';

    describe('CampaignController', function() {
        var $rootScope,
            $controller,
            $q,
            cinema6,
            $scope,
            CampaignCtrl;

        var campaign;

        beforeEach(function() {
            module(campaignModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');

                campaign = cinema6.db.create('campaign', {
                    id: 'e-48eec2c6b81060',
                    links: {
                        'Action': 'buynow.html',
                        'Facebook': 'fb.html'
                    },
                    logos: {
                        square: 'logo.jpg'
                    },
                    miniReels: [],
                    cards: [],
                    staticCardMap: [
                        {
                            cards: [
                                {
                                    placeholder: {},
                                    wildcard: {}
                                },
                                {
                                    placeholder: {},
                                    wildcard: {}
                                }
                            ],
                            minireel: {}
                        }
                    ]
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

            describe('cleanModel', function() {
                it('should be a pojo copy of the model', function() {
                    expect(CampaignCtrl.cleanModel).toEqual(campaign.pojoify());
                });
            });

            describe('isClean', function() {
                describe('if the model has not been changed', function() {
                    it('should be true', function() {
                        expect(CampaignCtrl.isClean).toBe(true);
                    });
                });

                describe('if there is an item in the staticCardMap without a wildcard', function() {
                    beforeEach(function() {
                        campaign.staticCardMap[0].cards.push({ placeholder: {}, wildcard: null });
                    });

                    it('should be true', function() {
                        expect(CampaignCtrl.isClean).toBe(true);
                    });
                });

                describe('if the model is changed', function() {
                    beforeEach(function() {
                        campaign.miniReels.push({});
                    });

                    it('should be false', function() {
                        expect(CampaignCtrl.isClean).toBe(false);
                    });

                    describe('if the links are changed', function() {
                        beforeEach(function() {
                            CampaignCtrl.cleanModel = campaign.pojoify();

                            CampaignCtrl.links[0].href = 'http://new.href/';
                        });

                        it('should be false', function() {
                            expect(CampaignCtrl.isClean).toBe(false);
                        });
                    });
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

            describe('save()', function() {
                var success, failure,
                    emptyPlaceholder,
                    saveDeferred;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    saveDeferred = $q.defer();

                    CampaignCtrl.links = [
                        {
                            name: 'Action',
                            href: null
                        },
                        {
                            name: 'Website',
                            href: 'mysite.com'
                        },
                        {
                            name: 'Facebook',
                            href: ''
                        },
                        {
                            name: 'Twitter',
                            href: null
                        },
                        {
                            name: 'YouTube',
                            href: 'yt.com'
                        },
                        {
                            name: 'Pinterest',
                            href: null
                        }
                    ];

                    emptyPlaceholder = {
                        wildcard: null,
                        placeholder: {}
                    };

                    campaign.cards.push({}, {});
                    campaign.staticCardMap[0].cards.push(emptyPlaceholder);

                    spyOn(campaign, 'save').and.returnValue(saveDeferred.promise);

                    $scope.$apply(function() {
                        CampaignCtrl.save().then(success, failure);
                    });
                });

                it('should update the campaign\'s links', function() {
                    expect(campaign.links).toEqual({
                        'Website': 'mysite.com',
                        'YouTube': 'yt.com'
                    });
                });

                it('should remove any unfilled placeholders from the static card map', function() {
                    expect(campaign.staticCardMap[0].cards).not.toContain(emptyPlaceholder);
                    expect(campaign.staticCardMap[0].cards.length).not.toBe(0);
                });

                it('should save the campaign', function() {
                    expect(campaign.save).toHaveBeenCalled();
                });

                describe('when the campaign is done saving', function() {
                    beforeEach(function() {
                        spyOn($scope, '$broadcast').and.callThrough();

                        $scope.$apply(function() {
                            saveDeferred.resolve(campaign);
                        });
                    });

                    it('should update the cleanModel', function() {
                        expect(CampaignCtrl.cleanModel).toEqual(campaign.pojoify());
                    });



                    it('should resolve to the campaign', function() {
                        expect(success).toHaveBeenCalledWith(campaign);
                    });

                    it('should $broadcast the "CampaignCtrl:campaignDidSave" event', function() {
                        expect($scope.$broadcast).toHaveBeenCalledWith('CampaignCtrl:campaignDidSave');
                    });
                });
            });
        });
    });
});
