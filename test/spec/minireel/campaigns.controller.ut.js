define(['app','minireel/mixins/PaginatedListController'], function(appModule, PaginatedListController) {
    'use strict';

    describe('CampaignsController', function() {
        var $rootScope,
            $controller,
            $q,
            cinema6,
            c6State,
            ConfirmDialogService,
            paginatedDbList,
            $scope,
            CampaignsCtrl;

        var campaigns,
            model,
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
                cinema6 = $injector.get('cinema6');
                c6State = $injector.get('c6State');
                ConfirmDialogService = $injector.get('ConfirmDialogService');
                paginatedDbList = $injector.get('paginatedDbList');

                campaigns = c6State.get('MR:Campaigns');

                spyOn(cinema6.db, 'findAll').and.returnValue((function() {
                    var items = [];
                    items.meta = {
                        items: {
                            start: 1,
                            end: 0,
                            total: 0
                        }
                    };

                    return $q.when(items);
                }()));

                $rootScope.$apply(function() {
                    model = paginatedDbList('campaign', {}, 50);
                });

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    CampaignsCtrl = $controller('CampaignsController', {
                        $scope: $scope,
                        cState: campaigns
                    });
                    CampaignsCtrl.model = model;
                });
            });
        });

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            $q = null;
            cinema6 = null;
            c6State = null;
            ConfirmDialogService = null;
            paginatedDbList = null;
            $scope = null;
            CampaignsCtrl = null;
            campaigns = null;
            model = null;
            debouncedFns = null;
        });

        it('should exist', function() {
            expect(CampaignsCtrl).toEqual(jasmine.any(Object));
        });

        it('should apply the PaginatedListController mixin', inject(function($injector) {
            expect(CampaignsCtrl).toEqual(jasmine.objectContaining($injector.instantiate(PaginatedListController, {
                $scope: $scope,
                cState: campaigns
            })));
        }));

        describe('methods', function() {
            describe('targetMiniReelsOf(campaign)', function() {
                var minireels,
                    result;

                beforeEach(function() {
                    var campaign;

                    minireels = ['e-9771886e47feb6', 'e-3db5141b52d952', 'e-90b814c1768205', 'e-f821c1eadfce57']
                        .map(function(id) {
                            return cinema6.db.create('experience', {
                                id: id,
                                data: {
                                    deck: []
                                }
                            });
                        });

                    campaign = cinema6.db.create('campaign', {
                        miniReelGroups: [
                            {
                                cards: [],
                                miniReels: minireels.slice(0, 3)
                            },
                            {
                                cards: [],
                                miniReels: minireels.slice(-3)
                            }
                        ]
                    });

                    result = CampaignsCtrl.targetMiniReelsOf(campaign);
                });

                it('should return an array of all the minireels the campaign\'s groups include, but without duplicates', function() {
                    expect(result.length).toBe(minireels.length);
                    minireels.forEach(function(minireel) {
                        expect(result).toContain(minireel);
                    });
                });
            });

            describe('remove(campaigns)', function() {
                var campaigns,
                    campaign1EraseDeferred, campaign2EraseDeferred,
                    config;

                beforeEach(function() {
                    campaign1EraseDeferred = $q.defer();
                    campaign2EraseDeferred = $q.defer();

                    campaigns = [
                        {
                            erase: jasmine.createSpy('erase()').and.returnValue(campaign1EraseDeferred.promise)
                        },
                        {
                            erase: jasmine.createSpy('erase()').and.returnValue(campaign2EraseDeferred.promise)
                        }
                    ];

                    spyOn(ConfirmDialogService, 'display');

                    $scope.$apply(function() {
                        CampaignsCtrl.remove(campaigns);
                    });

                    config = ConfirmDialogService.display.calls.mostRecent().args[0];
                });

                it('should open a confirmation dialog', function() {
                    expect(ConfirmDialogService.display).toHaveBeenCalledWith({
                        prompt: jasmine.any(String),
                        affirm: jasmine.any(String),
                        cancel: jasmine.any(String),
                        onCancel: jasmine.any(Function),
                        onAffirm: jasmine.any(Function)
                    });
                });

                it('should debounce the deletion', function() {
                    expect(debouncedFns).toContain(config.onAffirm);
                });

                describe('if the dialog is canceled', function() {
                    beforeEach(function() {
                        spyOn(ConfirmDialogService, 'close');

                        config.onCancel();
                    });

                    it('should close the dialog', function() {
                        expect(ConfirmDialogService.close).toHaveBeenCalled();
                    });
                });

                describe('if the dialog is affirmed', function() {
                    beforeEach(function() {
                        spyOn(ConfirmDialogService, 'close');

                        $scope.$apply(function() {
                            config.onAffirm();
                        });
                    });

                    it('should close the dialog', function() {
                        expect(ConfirmDialogService.close).toHaveBeenCalled();
                    });

                    it('should erase all the campaigns', function() {
                        campaigns.forEach(function(campaign) {
                            expect(campaign.erase).toHaveBeenCalled();
                        });
                    });

                    describe('when the erases are done', function() {
                        var refreshDeferred;

                        beforeEach(function() {
                            refreshDeferred = $q.defer();

                            spyOn(model, 'refresh').and.returnValue(refreshDeferred.promise);

                            [campaign1EraseDeferred, campaign2EraseDeferred].forEach(function(deferred) {
                                $scope.$apply(function() {
                                    deferred.resolve(null);
                                });
                            });
                        });

                        it('should refresh the list', function() {
                            expect(model.refresh).toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
});
