define(['app'], function(appModule) {
    'use strict';

    describe('CampaignPlacementsController', function() {
        var $rootScope,
            $controller,
            $q,
            cinema6,
            scopePromise,
            ScopedPromise,
            $scope,
            PortalCtrl,
            CampaignCtrl,
            CampaignPlacementsCtrl;

        var campaign;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                scopePromise = $injector.get('scopePromise');

                campaign = cinema6.db.create('campaign', {
                    logos: {},
                    links: {},
                    targetMiniReels: [
                        cinema6.db.create('experience', {
                            id: 'e-cb7197757d91f7',
                            data: {}
                        }),
                        cinema6.db.create('experience', {
                            id: 'e-95076b2d8a1657',
                            data: {}
                        })
                    ]
                });

                ScopedPromise = scopePromise($q.defer().promise).constructor;

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    $scope.PortalCtrl = PortalCtrl = $controller('PortalController', {
                        $scope: $scope
                    });
                    PortalCtrl.model = {
                        org: {
                            id: 'o-af832d9d946478'
                        }
                    };

                    $scope.CampaignCtrl = CampaignCtrl = $controller('CampaignController', {
                        $scope: $scope
                    });
                    CampaignCtrl.initWithModel(campaign);

                    $scope.CampaignPlacementsCtrl = CampaignPlacementsCtrl = $controller('CampaignPlacementsController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(CampaignPlacementsCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('result', function() {
                it('should be null', function() {
                    expect(CampaignPlacementsCtrl.result).toBeNull();
                });
            });

            describe('query', function() {
                it('should be an empty string', function() {
                    expect(CampaignPlacementsCtrl.query).toBe('');
                });
            });
        });

        describe('methods', function() {
            describe('search()', function() {
                var findAllDeferred,
                    result;

                beforeEach(function() {
                    findAllDeferred = $q.defer();

                    spyOn(cinema6.db, 'findAll').and.returnValue(findAllDeferred.promise);

                    CampaignPlacementsCtrl.query = 'Foo Bar';

                    $scope.$apply(function() {
                        result = CampaignPlacementsCtrl.search();
                    });
                });

                it('should query for experiences', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('experience', {
                        org: PortalCtrl.model.org.id,
                        text: CampaignPlacementsCtrl.query
                    });
                });

                it('should return the query\'s promise', function() {
                    expect(result).toBe(findAllDeferred.promise);
                });

                it('should set the result to a scoped promise for the request', function() {
                    expect(CampaignPlacementsCtrl.result).toEqual(jasmine.any(ScopedPromise));
                    expect(CampaignPlacementsCtrl.result.promise).toBe(findAllDeferred.promise);
                });
            });

            describe('add(minireel)', function() {
                var minireel;

                beforeEach(function() {
                    minireel = cinema6.db.create('expeience', {
                        id: 'e-2af4cc821a6b04'
                    });

                    CampaignPlacementsCtrl.add(minireel);
                });

                it('should add the minireel to the targetMiniReels', function() {
                    expect(campaign.targetMiniReels.length).not.toBe(1);
                    expect(campaign.targetMiniReels).toContain(minireel);
                });
            });

            describe('remove(minireel)', function() {
                var minireel;

                beforeEach(function() {
                    minireel = campaign.targetMiniReels[1];

                    CampaignPlacementsCtrl.remove(minireel);
                });

                it('should remove the minrieel from the targetMiniReels', function() {
                    expect(campaign.targetMiniReels.length).not.toBe(0);
                    expect(campaign.targetMiniReels).not.toContain(minireel);
                });
            });

            describe('isNotAlreadyTargeted(minireel)', function() {
                var notTargeted;

                beforeEach(function() {
                    notTargeted = ['e-e9581182c1a22c', 'e-31cc21b9470ad7', 'e-1c9a3807418b45'].map(function(id) {
                        return cinema6.db.create('experience', {
                            id: id,
                            data: {
                                deck: []
                            }
                        });
                    });

                    campaign.targetMiniReels.push.apply(campaign.targetMiniReels, ['e-b9f84d3f9ee970', 'e-c59097d3a2bb06'].map(function(id) {
                        return cinema6.db.create('experience', {
                            id: id,
                            data: {
                                deck: []
                            }
                        });
                    }));
                });

                describe('if the minireel is not being targeted', function() {
                    it('should return true', function() {
                        notTargeted.forEach(function(minireel) {
                            expect(CampaignPlacementsCtrl.isNotAlreadyTargeted(minireel)).toBe(true);
                        });
                    });
                });

                describe('if the minireel is being targeted', function() {
                    it('should return false', function() {
                        campaign.targetMiniReels.forEach(function(minireel) {
                            expect(CampaignPlacementsCtrl.isNotAlreadyTargeted(minireel)).toBe(false);
                        });
                    });
                });
            });
        });
    });
});
