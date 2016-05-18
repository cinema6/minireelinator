define(['app', 'minireel/mixins/WizardController', 'angular'], function(appModule, WizardController, angular) {
    'use strict';

    var copy = angular.copy;

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

        var campaign, card,
            debouncedFns;

        beforeEach(function() {
            debouncedFns = [];

            module(appModule.name);
            module(function($provide) {
                $provide.decorator('c6AsyncQueue', function($delegate) {
                    return jasmine.createSpy('c6AsyncQueue()').and.callFake(function() {
                        var queue = $delegate.apply(this, arguments);
                        var debounce = queue.debounce;
                        spyOn(queue, 'debounce').and.callFake(function() {
                            var fn = debounce.apply(queue, arguments);
                            debouncedFns.push(fn);
                            return fn;
                        });
                        return queue;
                    });
                });
            });

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                MiniReelService = $injector.get('MiniReelService');
                cinema6 = $injector.get('cinema6');

                WildcardState = c6State.get('MR:New:Wildcard');
                card = WildcardState.card = MiniReelService.createCard('videoBallot');
                delete card.id;
                WildcardState.cModel = copy(card);

                $scope = $rootScope.$new();
                $scope.AppCtrl = $controller('AppController', { cState:{} });
                $scope.MiniReelCtrl = {
                    model: {
                        data: {
                            campaigns: {
                                pricing: {
                                    dailyLimit: {},
                                    budget: {},
                                    cost: {}
                                }
                            }
                        }
                    }
                };
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

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            $q = null;
            c6State = null;
            MiniReelService = null;
            cinema6 = null;
            $scope = null;
            WildcardState = null;
            CampaignCtrl = null;
            CampaignCardsCtrl = null;
            WildcardCtrl = null;
            campaign = null;
            card = null;
            debouncedFns = null;
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

                it('should initialize arrays for campaign.countUrls and campaign.playUrls if not defined', function() {
                    delete WildcardState.cModel.campaign.countUrls;
                    delete WildcardState.cModel.campaign.playUrls;

                    expect(WildcardCtrl.model.campaign.countUrls).toBeUndefined();
                    expect(WildcardCtrl.model.campaign.playUrls).toBeUndefined();

                    WildcardCtrl.initWithModel(WildcardState.cModel);

                    expect(WildcardCtrl.model.campaign.countUrls).toEqual([]);
                    expect(WildcardCtrl.model.campaign.playUrls).toEqual([]);

                    WildcardState.cModel.campaign.countUrls = ['http://countpixel.com/pixel'];
                    WildcardState.cModel.campaign.playUrls = ['http://clickpixel.com/pixel'];

                    WildcardCtrl.initWithModel(WildcardState.cModel);

                    expect(WildcardCtrl.model.campaign.countUrls).toEqual(['http://countpixel.com/pixel']);
                    expect(WildcardCtrl.model.campaign.playUrls).toEqual(['http://clickpixel.com/pixel']);
                });

                it('should set some fields to be hidden for Instagram cards', function() {
                    WildcardState.cModel.type = 'instagram';
                    WildcardCtrl.initWithModel(WildcardState.cModel);
                    expect(WildcardCtrl.hideTemplate).toBe(true);
                    expect(WildcardCtrl.hideBrand).toBe(true);
                    expect(WildcardCtrl.hideLogoUrl).toBe(true);
                });
            });

            describe('canSave', function() {
                var validVideo, validSurvey, validBranding;
                beforeEach(function() {
                    WildcardCtrl.tabs = [
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
                    ];
                    spyOn(WildcardCtrl._private, 'validTabModel').and.callFake(function(sref) {
                        switch(sref) {
                        case 'MR:Wildcard.Video':
                            return validVideo;
                        case 'MR:Wildcard.Survey':
                            return validSurvey;
                        case 'MR:Wildcard.Branding':
                            return validBranding;
                        }
                    });
                });

                it('should return true if every tab is valid', function() {
                    validVideo = true;
                    validSurvey = true;
                    validBranding = true;
                    expect(WildcardCtrl.canSave).toBe(true);
                });

                it('should return false if any tab is not valid', function() {
                    validVideo = true;
                    validSurvey = false;
                    validBranding = true;
                    expect(WildcardCtrl.canSave).toBe(false);
                });
            });

            describe('validDate', function() {
                it('should be true if endDate is null', function() {
                    WildcardCtrl.model.campaign.endDate = null;
                    expect(WildcardCtrl.validDate).toBe(true);
                });

                it('should false if endDate is undefined', function() {
                    WildcardCtrl.model.campaign.endDate = void 0;
                    expect(WildcardCtrl.validDate).toBeFalsy();
                });

                it('should be true if the endDate is in the future', function() {
                    var now = new Date(),
                        tomorrow = new Date(now.getTime() + 24 * 60 *60 * 1000);

                    WildcardCtrl.model.campaign.endDate = tomorrow;
                    expect(WildcardCtrl.validDate).toBe(true);
                });

                it('should be false if the endDate is in the past', function() {
                    var now = new Date(),
                        yesterday = new Date(now.getTime() - 24 * 60 *60 * 1000);

                    WildcardCtrl.model.campaign.endDate = yesterday;
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
                            WildcardCtrl.model.campaign.reportingId = 'some_id';
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
                describe('validTabModel(sref)', function() {
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
                    });

                    describe('instagram tab', function() {
                        function validInstagramModel() {
                            return WildcardCtrl._private.validTabModel('MR:Wildcard.Instagram');
                        }

                        it('should be true if an id exists on the model', function() {
                            WildcardCtrl.model.data.id = 'abc123';
                            expect(validInstagramModel()).toBe(true);
                        });

                        it('should be false if an id doesn\'t exist on the model', function() {
                            WildcardCtrl.model.data.id = null;
                            expect(validInstagramModel()).toBe(false);
                        });
                    });

                    describe('branding tab', function() {
                        function validBrandingModel() {
                            return WildcardCtrl._private.validTabModel('MR:Wildcard.Branding');
                        }

                        it('should be true if it has the required fields', function() {
                            WildcardCtrl.model = {
                                data: { },
                                params: {
                                    sponsor: 'Cinema6'
                                }
                            };
                            WildcardCtrl.validImageSrcs = true;
                            expect(validBrandingModel()).toBe(true);
                        });

                        it('should be true even if there is no branding but the branding field is hidden', function() {
                            WildcardCtrl.model = { data: { } };
                            WildcardCtrl.validImageSrcs = true;
                            WildcardCtrl.hideBrand = true;
                            expect(validBrandingModel()).toBe(true);
                        });

                        it('should be false if there is no branding', function() {
                            WildcardCtrl.model = {
                                data: { },
                                params: { }
                            };
                            WildcardCtrl.validImageSrcs = true;
                            WildcardCtrl.hideBrand = false;
                            expect(validBrandingModel()).toBe(false);
                        });

                        it('should be false if the image sources are invalid', function() {
                            WildcardCtrl.model = {
                                data: { },
                                params: {
                                    sponsor: 'Cinema6'
                                }
                            };
                            WildcardCtrl.validImageSrcs = false;
                            expect(validBrandingModel()).toBe(false);
                        });
                    });

                    describe('advertising tab', function() {
                        function validAdvertisingModel() {
                            return WildcardCtrl._private.validTabModel('MR:Wildcard.Advertising');
                        }

                        it('should return true if there is a valid date', function() {
                            WildcardCtrl.validDate = true;
                            expect(validAdvertisingModel()).toBe(true);
                        });

                        it('should return false if there is an invalid date', function() {
                            WildcardCtrl.validDate = false;
                            expect(validAdvertisingModel()).toBe(false);
                        });
                    });

                    describe('video tab', function() {
                        function validVideoModel() {
                            return WildcardCtrl._private.validTabModel('MR:Wildcard.Video');
                        }

                        it('should return true if there is a valid reporting id', function() {
                            WildcardCtrl.validReportingId = true;
                            expect(validVideoModel()).toBe(true);
                        });

                        it('should return false if there is an invalid reporting id', function() {
                            WildcardCtrl.validReportingId = false;
                            expect(validVideoModel()).toBe(false);
                        });
                    });
                });

                describe('tabsForCardType(type)', function() {
                    it('should return tabs for an instagram card', function() {
                        var result = WildcardCtrl._private.tabsForCardType('instagram');
                        expect(result).toEqual([
                            {
                                name: 'Instagram Content',
                                required: true,
                                sref: 'MR:Wildcard.Instagram'
                            },
                            {
                                name: 'Branding',
                                sref: 'MR:Wildcard.Branding'
                            },
                            {
                                name: 'Links',
                                sref: 'MR:Wildcard.Links'
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
                                name: 'Social Sharing',
                                sref: 'MR:Wildcard.Sharing',
                                required: false
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
                    spyOn($scope, '$broadcast').and.callThrough();

                    WildcardCtrl.campaignData = {
                        endDate: new Date()
                    };

                    $scope.$apply(function() {
                        WildcardCtrl.save().then(success, failure);
                    });
                });

                it('should braodcast the campaignWillSave event', function() {
                    expect($scope.$broadcast).toHaveBeenCalledWith('CampaignCtrl:campaignWillSave');
                });

                it('should be debounced', function() {
                    expect(debouncedFns).toContain(WildcardCtrl.save);
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
                        expect(CampaignCardsCtrl.add).toHaveBeenCalledWith(card);
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
                    beforeEach(function() {
                        WildcardCtrl = $scope.WildcardCtrl = $controller('WildcardController', {
                            $scope: $scope,
                            cState: WildcardState
                        });
                        WildcardCtrl.initWithModel(WildcardState.cModel);
                        spyOn(c6State, 'goTo').and.returnValue($q.when());
                    });

                    it('should add a MOAT object to the data property of the card', function() {
                        WildcardState.updateCard.and.callThrough();

                        WildcardCtrl.enableMoat = true;

                        WildcardCtrl.model.campaign = {
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
                    });
                });
            });
        });
    });
});
