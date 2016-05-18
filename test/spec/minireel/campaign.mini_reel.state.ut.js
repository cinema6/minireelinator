define(['app'], function(appModule) {
    'use strict';

    ['MR:New:Campaign.MiniReel', 'MR:Edit:Campaign.MiniReel'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var $rootScope,
                $q,
                c6State,
                cinema6,
                MiniReelService,
                campaignMiniReel;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    cinema6 = $injector.get('cinema6');
                    MiniReelService = $injector.get('MiniReelService');

                    campaignMiniReel = c6State.get(stateName);
                });
            });

            afterAll(function() {
                $rootScope = null;
                $q = null;
                c6State = null;
                cinema6 = null;
                MiniReelService = null;
                campaignMiniReel = null;
            });

            it('should exist', function() {
                expect(campaignMiniReel).toEqual(jasmine.any(Object));
            });

            describe('minireel', function() {
                it('should be null', function() {
                    expect(campaignMiniReel.minireel).toBeNull();
                });
            });

            describe('beforeModel()', function() {
                var minireel;

                beforeEach(function() {
                    minireel = campaignMiniReel.cParent.cModel = cinema6.db.create('experience', {
                        data: {
                            links: {},
                            collateral: {
                                splash: null
                            },
                            params: {},
                            deck: []
                        }
                    });

                    campaignMiniReel.beforeModel();
                });

                it('should set its minireel property to its parent\'s model', function() {
                    expect(campaignMiniReel.minireel).toBe(minireel);
                });
            });

            describe('model()', function() {
                var minireel, result;

                beforeEach(function() {
                    minireel = campaignMiniReel.cParent.cModel = cinema6.db.create('experience', {
                        data: {
                            links: {},
                            collateral: {
                                splash: null
                            },
                            params: {},
                            deck: []
                        }
                    });
                    campaignMiniReel.beforeModel();

                    result = campaignMiniReel.model();
                });

                it('should return a pojo of its parent\'s model', function() {
                    expect(result).toEqual(minireel.pojoify());
                });
            });

            describe('afterModel()', function() {
                beforeEach(function() {
                    campaignMiniReel.cParent.metaData = {};

                    campaignMiniReel.afterModel();
                });

                it('should copy its parent\'s metaData', function() {
                    expect(campaignMiniReel.metaData).toBe(campaignMiniReel.cParent.metaData);
                });
            });

            describe('updateMiniReel()', function() {
                describe('when editing an existing minireel', function() {
                    var saveDeferred,
                        success, failure;

                    beforeEach(function() {
                        saveDeferred = $q.defer();

                        success = jasmine.createSpy('success()');
                        failure = jasmine.createSpy('failure()');

                        campaignMiniReel.minireel = cinema6.db.create('experience', {
                            id: '12345',
                            data: {
                                links: {},
                                collateral: {
                                    splash: null
                                },
                                params: {},
                                deck: []
                            }
                        });
                        campaignMiniReel.cModel = campaignMiniReel.minireel.pojoify();
                        spyOn(campaignMiniReel.minireel, '_update').and.returnValue(campaignMiniReel.minireel);
                        spyOn(campaignMiniReel.minireel, 'save').and.returnValue(saveDeferred.promise);

                        $rootScope.$apply(function() {
                            campaignMiniReel.updateMiniReel().then(success, failure);
                        });
                    });

                    it('should update the minireel with the data from the model', function() {
                        expect(campaignMiniReel.minireel._update).toHaveBeenCalledWith(campaignMiniReel.cModel);
                    });

                    it('should save the minireel', function() {
                        expect(campaignMiniReel.minireel.save).toHaveBeenCalled();
                    });

                    describe('when the save completes', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                saveDeferred.resolve(campaignMiniReel.minireel);
                            });
                        });

                        it('should resolve to the minireel', function() {
                            expect(success).toHaveBeenCalledWith(campaignMiniReel.minireel);
                        });
                    });
                });

                describe('when creating a new minireel', function() {
                    var publishDeferred,
                        success, failure;

                    beforeEach(function() {
                        publishDeferred = $q.defer();

                        success = jasmine.createSpy('success()');
                        failure = jasmine.createSpy('failure()');

                        campaignMiniReel.minireel = cinema6.db.create('experience', {
                            data: {
                                links: {},
                                collateral: {
                                    splash: null
                                },
                                params: {},
                                deck: []
                            }
                        });
                        campaignMiniReel.cModel = campaignMiniReel.minireel.pojoify();
                        spyOn(campaignMiniReel.minireel, '_update').and.returnValue(campaignMiniReel.minireel);
                        spyOn(MiniReelService, 'publish').and.returnValue(publishDeferred.promise);

                        $rootScope.$apply(function() {
                            campaignMiniReel.updateMiniReel().then(success, failure);
                        });
                    });

                    it('should update the minireel with the data from the model', function() {
                        expect(campaignMiniReel.minireel._update).toHaveBeenCalledWith(campaignMiniReel.cModel);
                    });

                    it('should publish the minireel', function() {
                        expect(MiniReelService.publish).toHaveBeenCalled();
                    });

                    describe('when the save completes', function() {
                        beforeEach(function() {
                            $rootScope.$apply(function() {
                                publishDeferred.resolve(campaignMiniReel.minireel);
                            });
                        });

                        it('should resolve to the minireel', function() {
                            expect(success).toHaveBeenCalledWith(campaignMiniReel.minireel);
                        });
                    });
                });
            });
        });
    });
});
