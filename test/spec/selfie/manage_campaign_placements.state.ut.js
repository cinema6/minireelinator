define(['app'], function(appModule) {
    'use strict';

    ['Selfie:All:Manage:Campaign:Placements','Selfie:Pending:Manage:Campaign:Placements'].forEach(function(stateName) {
        describe('Selfie:Manage:Campaign:Placements State', function() {
            var $rootScope,
                $q,
                c6State,
                selfieContainer,
                selfieState,
                cinema6;

            var campaign,
                containers,
                placements,
                newPlacement;

            var containersDeferred,
                placementsDeferred,
                success, failure;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    cinema6 = $injector.get('cinema6');
                });

                containersDeferred = $q.defer();
                placementsDeferred = $q.defer();
                newPlacement = {
                    label: null,
                    tagType: null,
                    budget: {},
                    externalCost: {},
                    tagParams: {}
                };
                campaign = {
                    id: 'cam-123'
                };
                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                spyOn(cinema6.db, 'create').and.returnValue(newPlacement);
                spyOn(cinema6.db, 'findAll').and.callFake(function(type, query) {
                    if (type === 'container') {
                        return containersDeferred.promise;
                    }
                    if (type === 'placement') {
                        return placementsDeferred.promise;
                    }
                });

                selfieContainer = c6State.get(stateName);
                selfieContainer.cParent = {
                    campaign: campaign
                };
            });

            it('should exist', function() {
                expect(selfieContainer).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                beforeEach(function() {
                    selfieContainer.model().then(success, failure);
                });

                it('should find all containers', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('container');
                });

                it('should find all placements for the campaign', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('placement', {
                        'tagParams.campaign': campaign.id
                    });
                });

                describe('when containers and placements are found', function() {
                    beforeEach(function() {
                        containers = [
                            {
                                id: 'con-111'
                            },
                            {
                                id: 'con-222'
                            },
                            {
                                id: 'con-333'
                            }
                        ];

                        $rootScope.$apply(function() {
                            containersDeferred.resolve(containers);
                        });
                    });

                    describe('when there are no placements for this campaign', function() {
                        beforeEach(function() {
                            placements = [];

                            $rootScope.$apply(function() {
                                placementsDeferred.resolve(placements);
                            });
                        });

                        it('should create a new placement', function() {
                            expect(cinema6.db.create).toHaveBeenCalledWith('placement', {
                                label: null,
                                tagType: null,
                                budget: {},
                                externalCost: {},
                                tagParams: {}
                            });
                        });

                        it('should resolve with campaign, containers and placements', function() {
                            expect(success).toHaveBeenCalledWith({
                                campaign: campaign,
                                containers: containers,
                                placements: [newPlacement]
                            });

                            expect(failure).not.toHaveBeenCalled();
                        });
                    });

                    describe('when there are placements for this campaigns', function() {
                        beforeEach(function() {
                            placements = [
                                {
                                    id: 'pl-111'
                                },
                                {
                                    id: 'pl-222'
                                },
                                {
                                    id: 'pl-333'
                                }
                            ];

                            $rootScope.$apply(function() {
                                placementsDeferred.resolve(placements);
                            });
                        });

                        it('should not create a new placement', function() {
                            expect(cinema6.db.create).not.toHaveBeenCalledWith('placement', {
                                label: null,
                                tagType: null,
                                budget: {},
                                externalCost: {},
                                tagParams: {}
                            });
                        });

                        it('should resolve with campaign, containers and placements', function() {
                            expect(success).toHaveBeenCalledWith({
                                campaign: campaign,
                                containers: containers,
                                placements: placements
                            });

                            expect(failure).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
});