define(['app', 'minireel/mixins/WizardController'], function(appModule, WizardController) {
    'use strict';

    describe('WildcardController', function() {
        var $rootScope,
            $controller,
            $q,
            c6State,
            MiniReelService,
            cinema6,
            $scope,
            WildcardState,
            CampaignCtrl,
            CampaignCardsCtrl,
            WildcardCtrl;

        var campaign, card;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                MiniReelService = $injector.get('MiniReelService');
                cinema6 = $injector.get('cinema6');

                WildcardState = c6State.get('MR:New:Wildcard');
                card = WildcardState.card = cinema6.db.create('card', MiniReelService.createCard('videoBallot'));
                delete card.id;
                WildcardState.cModel = card.pojoify();
                WildcardState.metaData = {};

                $scope = $rootScope.$new();
                $scope.AppCtrl = $controller('AppController', { cState:{} });
                $scope.$apply(function() {
                    CampaignCtrl = $scope.CampaignCtrl = $controller('CampaignController', {
                        $scope: $scope
                    });
                    CampaignCtrl.initWithModel((campaign = cinema6.db.create('campaign', {
                        id: 'cam-af23821dc75e2f',
                        links: {},
                        logos: {},
                        cards: [],
                        miniReels: [],
                        brand: 'Diageo',
                        name: 'My Campaign'
                    })));

                    CampaignCardsCtrl = $scope.CampaignCardsCtrl = $controller('CampaignCardsController', {
                        $scope: $scope
                    });

                    WildcardCtrl = $scope.WildcardCtrl = $controller('WildcardController', {
                        $scope: $scope,
                        cState: WildcardState
                    });
                    WildcardCtrl.initWithModel(WildcardState.cModel);
                });
            });
        });

        it('should exist', function() {
            expect(WildcardCtrl).toEqual(jasmine.any(Object));
        });

        it('should inherit from the WizardController', inject(function($injector) {
            var wildKeys = Object.keys(WildcardCtrl);
            var wizardKeys = Object.keys($injector.instantiate(WizardController, {
                $scope: $scope
            }));
            wizardKeys.forEach(function(key) {
                expect(wildKeys).toContain(key);
            });
        }));

        describe('properties', function() {
            describe('model', function() {
                it('should be the state\'s model', function() {
                    expect(WildcardCtrl.model).toBe(WildcardState.cModel);
                });

                it('should only use Campaign brand if not set on card', function() {
                    expect(WildcardCtrl.model.params.sponsor).toBe(CampaignCtrl.model.brand);

                    WildcardState.cModel.params.sponsor = 'Custom';
                    WildcardCtrl.initWithModel(WildcardState.cModel);

                    expect(WildcardCtrl.model.params.sponsor).toBe('Custom');
                });

                it('should default params.ad', function() {
                    expect(WildcardCtrl.model.params.ad).toBe(true);

                    WildcardState.cModel.params.ad = false;
                    WildcardCtrl.initWithModel(WildcardState.cModel);

                    expect(WildcardCtrl.model.params.ad).toBe(false);

                    WildcardState.cModel.params.ad = true;
                    WildcardCtrl.initWithModel(WildcardState.cModel);

                    expect(WildcardCtrl.model.params.ad).toBe(true);

                    delete WildcardState.cModel.params.ad;
                    WildcardCtrl.initWithModel(WildcardState.cModel);

                    expect(WildcardCtrl.model.params.ad).toBe(true);
                });

                it('should initialize arrays for campaign.countUrls and campaign.clickUrls if not defined', function() {
                    delete WildcardState.cModel.campaign.countUrls;
                    delete WildcardState.cModel.campaign.clickUrls;

                    expect(WildcardCtrl.model.campaign.countUrls).toBeUndefined();
                    expect(WildcardCtrl.model.campaign.clickUrls).toBeUndefined();

                    WildcardCtrl.initWithModel(WildcardState.cModel);

                    expect(WildcardCtrl.model.campaign.countUrls).toEqual([]);
                    expect(WildcardCtrl.model.campaign.clickUrls).toEqual([]);

                    WildcardState.cModel.campaign.countUrls = ['http://countpixel.com/pixel'];
                    WildcardState.cModel.campaign.clickUrls = ['http://clickpixel.com/pixel'];

                    WildcardCtrl.initWithModel(WildcardState.cModel);

                    expect(WildcardCtrl.model.campaign.countUrls).toEqual(['http://countpixel.com/pixel']);
                    expect(WildcardCtrl.model.campaign.clickUrls).toEqual(['http://clickpixel.com/pixel']);
                });
            });

            describe('campaignData', function() {
                it('should be its state\'s metaData', function() {
                    expect(WildcardCtrl.campaignData).toBe(WildcardState.metaData);
                });
            });

            describe('validArticleModel', function() {
                it('should be false if there is no data property', function() {
                    WildcardCtrl.model = {
                        title: 'Title'
                    };
                    expect(WildcardCtrl.validArticleModel).toBe(false);
                });

                it('should be true if src and title are not empty strings', function() {
                    WildcardCtrl.model = {
                        title: 'Title',
                        data: {
                            src: 'http://www.cinema6.com'
                        }
                    };
                    expect(WildcardCtrl.validArticleModel).toBe(true);
                });

                it('should be false if either the src or title are an empty string', function() {
                    WildcardCtrl.model = {
                        title: 'Title',
                        data: {
                            src: ''
                        }
                    };
                    expect(WildcardCtrl.validArticleModel).toBe(false);
                    WildcardCtrl.model = {
                        title: '',
                        data: {
                            src: 'http://www.cinema6.com'
                        }
                    };
                    expect(WildcardCtrl.validArticleModel).toBe(false);
                });

                it('should be false if either the src or title are null', function() {
                    WildcardCtrl.model = {
                        title: 'Title',
                        data: {
                            src: null
                        }
                    };
                    expect(WildcardCtrl.validArticleModel).toBe(false);
                    WildcardCtrl.model = {
                        title: null,
                        data: {
                            src: 'http://www.cinema6.com'
                        }
                    };
                    expect(WildcardCtrl.validArticleModel).toBe(false);
                });

                it('should be false if either the src or title are undefined', function() {
                    WildcardCtrl.model = {
                        title: 'Title',
                        data: {
                            src: undefined
                        }
                    };
                    expect(WildcardCtrl.validArticleModel).toBe(false);
                    WildcardCtrl.model = {
                        title: undefined,
                        data: {
                            src: 'http://www.cinema6.com'
                        }
                    };
                    expect(WildcardCtrl.validArticleModel).toBe(false);
                });
            });

            describe('canSave', function() {

                describe('for an article card', function() {
                    it('should return true if there is a valid article model', function() {
                        WildcardCtrl.model = {
                            title: 'Cinema6',
                            type: 'article',
                            data: {
                                src: 'http://www.cinema6.com',
                                thumbUrl: 'http://www.cinema6.com/logo'
                            }
                        };
                        expect(WildcardCtrl.canSave).toBe(true);
                    });

                    it('should return false if there is not a valid article model', function() {
                        WildcardCtrl.model = {
                            type: 'article'
                        };
                        expect(WildcardCtrl.canSave).toBe(false);
                    });
                });

                describe('for a video card', function() {

                    beforeEach(function() {
                        var validDate, validReportingId, validImageSrcs;
                        Object.defineProperties(WildcardCtrl, {
                            validDate: {
                                get: function() {
                                    return validDate;
                                },
                                set: function(val) {
                                    validDate = val;
                                }
                            },
                            validReportingId: {
                                get: function() {
                                    return validReportingId;
                                },
                                set: function(val) {
                                    validReportingId = val;
                                }
                            },
                            validImageSrcs: {
                                get: function() {
                                    return validImageSrcs;
                                },
                                set: function(val) {
                                    validImageSrcs = val;
                                }
                            }
                        });
                        WildcardCtrl.model.type = 'video';
                        WildcardCtrl.placements = ['placement'];
                        WildcardCtrl.minireel = {};
                        WildcardCtrl.validDate = true;
                        WildcardCtrl.validReportingId = true;
                        WildcardCtrl.validImageSrcs = true;
                    });

                    it('should return true if there are placements but no minireel', function() {
                        delete WildcardCtrl.minireel;
                        expect(WildcardCtrl.canSave).toBe(true);
                    });

                    it('should return true if there is a minireel but no placements', function() {
                        WildcardCtrl.placements = [];
                        expect(WildcardCtrl.canSave).toBe(true);
                    });

                    it('should return true if everything is valid', function() {
                        expect(WildcardCtrl.canSave).toBe(true);
                    });

                    it('should return false if there is an invalid date', function() {
                        WildcardCtrl.validDate = false;
                        expect(WildcardCtrl.canSave).toBe(false);
                    });

                    it('should return false if there is an invalid reporting id', function() {
                        WildcardCtrl.validReportingId = false;
                        expect(WildcardCtrl.canSave).toBe(false);
                    });

                    it('should return false if there are invalid image srcs', function() {
                        WildcardCtrl.validImageSrcs = false;
                        expect(WildcardCtrl.canSave).toBe(false);
                    });
                });
            });

            describe('validDate', function() {
                it('should be true if endDate is null', function() {
                    WildcardCtrl.campaignData.endDate = null;
                    expect(WildcardCtrl.validDate).toBe(true);
                });

                it('should false if endDate is undefined', function() {
                    WildcardCtrl.campaignData.endDate = void 0;
                    expect(WildcardCtrl.validDate).toBeFalsy();
                });

                it('should be true if the endDate is in the future', function() {
                    var now = new Date(),
                        tomorrow = new Date(now.getTime() + 24 * 60 *60 * 1000);

                    WildcardCtrl.campaignData.endDate = tomorrow;
                    expect(WildcardCtrl.validDate).toBe(true);
                });

                it('should be false if the endDate is in the past', function() {
                    var now = new Date(),
                        yesterday = new Date(now.getTime() - 24 * 60 *60 * 1000);

                    WildcardCtrl.campaignData.endDate = yesterday;
                    expect(WildcardCtrl.validDate).toBeFalsy();
                });
            });

            describe('validReportingId', function() {
                describe('when MOAT is not enabled', function() {
                    it('should be true', function() {
                        WildcardCtrl.enableMoat = false;
                        expect(WildcardCtrl.validReportingId).toBe(true);
                    });
                });

                describe('when MOAT is enabled', function() {
                    describe('when reportingId is not set', function() {
                        it('should be false', function() {
                            WildcardCtrl.enableMoat = true;
                            expect(WildcardCtrl.validReportingId).toBe(false);
                        });
                    });

                    describe('when reportingId is set', function() {
                        it('should be true', function() {
                            WildcardCtrl.enableMoat = true;
                            WildcardCtrl.campaignData.reportingId = 'some_id';
                            expect(WildcardCtrl.validReportingId).toBe(true);
                        });
                    });
                });
            });

            describe('validLogo', function() {
                describe('if logo url is undefined', function() {
                    it('should be true', function() {
                        delete WildcardCtrl.model.collateral.logo;
                        expect(WildcardCtrl.validLogo).toBe(true);
                    });
                });

                describe('if the url is valid', function() {
                    it('should be true', function() {
                        WildcardCtrl.model.collateral.logo = 'http://example.com/image.png';
                        expect(WildcardCtrl.validLogo).toBe(true);
                    });
                });

                describe('if the url is not valid', function() {
                    it('should be false', function() {
                        WildcardCtrl.model.collateral.logo = 'example.com/image.png';
                        expect(WildcardCtrl.validLogo).toBe(false);
                    });
                });
            });

            describe('validThumb', function() {
                describe('if thumb url is undefined', function() {
                    it('should be true', function() {
                        delete WildcardCtrl.model.thumb;
                        expect(WildcardCtrl.validThumb).toBe(true);
                    });
                });

                describe('if the thumb is valid', function() {
                    it('should be true', function() {
                        WildcardCtrl.model.thumb = 'http://example.com/image.png';
                        expect(WildcardCtrl.validThumb).toBe(true);
                    });
                });

                describe('if the thumb is not valid', function() {
                    it('should be false', function() {
                        WildcardCtrl.model.thumb = 'example.com/image.png';
                        expect(WildcardCtrl.validThumb).toBe(false);
                    });
                });
            });

            describe('validImageSrcs', function() {
                describe('if all image urls are undefined', function() {
                    it('should be true', function() {
                        delete WildcardCtrl.model.thumb;
                        delete WildcardCtrl.model.collateral.logo;
                        expect(WildcardCtrl.validImageSrcs).toBe(true);
                    });
                });

                describe('if all image urls are valid', function() {
                    it('should be true', function() {
                        WildcardCtrl.model.thumb = 'http://example.com/image.png';
                        WildcardCtrl.model.collateral.logo = 'http://example.com/image.png';
                        expect(WildcardCtrl.validImageSrcs).toBe(true);
                    });
                });

                describe('if any of the image urls are not valid', function() {
                    it('should be false', function() {
                        WildcardCtrl.model.thumb = 'example.com/image.png';
                        WildcardCtrl.model.collateral.logo = 'http://example.com/image.png';
                        expect(WildcardCtrl.validImageSrcs).toBe(false);

                        WildcardCtrl.model.thumb = 'http://example.com/image.png';
                        WildcardCtrl.model.collateral.logo = 'example.com/image.png';
                        expect(WildcardCtrl.validImageSrcs).toBe(false);
                    });
                });
            });
        });

        describe('methods', function() {
            describe('private', function() {
                describe('tabsForCardType(type)', function() {
                    it('should return tabs for an article card', function() {
                        var result = WildcardCtrl._private.tabsForCardType('article');
                        expect(result).toEqual([
                            {
                                name: 'Webpage Content',
                                sref: 'MR:Wildcard.Article',
                                required: true
                            },
                            {
                                name: 'Thumbnail Content',
                                sref: 'MR:Wildcard.Thumbs',
                                required: false
                            }
                        ]);
                    });

                    it('should return tabs for a video card', function() {
                        var result = WildcardCtrl._private.tabsForCardType('video');
                        expect(result).toEqual([
                            {
                                name: 'Editorial Content',
                                sref: 'MR:Wildcard.Copy',
                                required: true
                            },
                            {
                                name: 'Video Content',
                                sref: 'MR:Wildcard.Video',
                                required: true
                            },
                            {
                                name: 'Survey',
                                sref: 'MR:Wildcard.Survey'
                            },
                            {
                                name: 'Branding',
                                sref: 'MR:Wildcard.Branding'
                            },
                            {
                                name: 'Links',
                                sref: 'MR:Wildcard.Links'
                            },
                            {
                                name: 'Advertising',
                                sref: 'MR:Wildcard.Advertising'
                            }
                        ]);
                    });
                });
            });

            describe('save()', function() {
                var success, failure,
                    updateCardDeferred;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    updateCardDeferred = $q.defer();

                    spyOn(CampaignCardsCtrl, 'add').and.callThrough();
                    spyOn(WildcardState, 'updateCard').and.returnValue(updateCardDeferred.promise);

                    WildcardCtrl.campaignData = {
                        endDate: new Date()
                    };

                    $scope.$apply(function() {
                        WildcardCtrl.save().then(success, failure);
                    });
                });

                it('should update the card', function() {
                    expect(WildcardState.updateCard).toHaveBeenCalled();
                });

                describe('when the update is completed', function() {
                    var goToDeferred;

                    beforeEach(function() {
                        goToDeferred = $q.defer();

                        spyOn(c6State, 'goTo').and.returnValue(goToDeferred.promise);

                        card.id = 'rc-e832762cc5e126';
                        $scope.$apply(function() {
                            updateCardDeferred.resolve(card);
                        });
                    });

                    it('should add the card to the campaign', function() {
                        expect(CampaignCardsCtrl.add).toHaveBeenCalledWith(card, WildcardCtrl.campaignData);
                    });

                    it('should go to the "MR:Campaign.Cards" state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('MR:Campaign.Cards');
                    });

                    describe('after the state transition', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                goToDeferred.resolve(c6State.get('MR:Campaign.Cards'));
                            });
                        });

                        it('should resolve to the card', function() {
                            expect(success).toHaveBeenCalledWith(card);
                        });
                    });
                });

                describe('when MOAT is enabled', function() {
                    it('should add a MOAT object to the data property of the card', function() {
                        spyOn(card, '_update').and.returnValue({save:function(){return $q.defer().promise;}});
                        WildcardState.updateCard.and.callThrough();

                        WildcardCtrl.enableMoat = true;

                        WildcardCtrl.campaignData = {
                            reportingId: 'some_id'
                        };

                        $scope.$apply(function() {
                            WildcardCtrl.save();
                        });

                        expect(WildcardCtrl.model.data.moat).toEqual({
                            campaign: CampaignCtrl.model.name,
                            advertiser: CampaignCtrl.model.brand,
                            creative: 'some_id'
                        });

                        expect(card._update.calls.mostRecent().args[0].data.moat).toEqual({
                            campaign: CampaignCtrl.model.name,
                            advertiser: CampaignCtrl.model.brand,
                            creative: 'some_id'
                        });
                    });
                });
            });
        });
    });
});
