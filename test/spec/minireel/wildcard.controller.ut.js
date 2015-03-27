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
            expect(Object.keys(WildcardCtrl)).toEqual(jasmine.objectContaining(Object.keys($injector.instantiate(WizardController, {
                $scope: $scope
            }))));
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

                    expect(WildcardCtrl.model.params.sponsor).toBe('Custom')
                });
            });

            describe('campaignData', function() {
                it('should be its state\'s metaData', function() {
                    expect(WildcardCtrl.campaignData).toBe(WildcardState.metaData);
                });
            });

            describe('tabs', function() {
                it('should be a list of tabs', function() {
                    expect(WildcardCtrl.tabs).toEqual([
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
        });

        describe('methods', function() {
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
