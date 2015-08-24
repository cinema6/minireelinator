define(['app'], function(appModule) {
    'use strict';

    describe('SelfieLogoService', function() {
        var $q,
            $rootScope,
            cinema6,
            SelfieLogoService;

        var campaigns,
            campaignsDeferred,
            success, failure;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                SelfieLogoService = $injector.get('SelfieLogoService');
            });

            campaigns = [
                {
                    id: 'cam-1',
                    status: 'active',
                    name: 'Summer Campaign',
                    cards: [
                        {
                            item: {
                                id: 'rc-1',
                                collateral: {
                                    logo: 'mylogo.jpg'
                                },
                                params: {
                                    sponsor: 'Volvo'
                                }
                            }
                        }
                    ]
                },
                {
                    id: 'cam-2',
                    status: 'paused',
                    name: 'Summer Campaign',
                    cards: [
                        {
                            item: {
                                id: 'rc-2',
                                collateral: {
                                    logo: 'volvo.jpg'
                                },
                                params: {
                                    sponsor: 'Volvo'
                                }
                            }
                        }
                    ]
                },
                {
                    id: 'cam-3',
                    status: 'pending',
                    name: 'Fall Campaign',
                    cards: [
                        {
                            item: {
                                id: 'rc-3',
                                collateral: {
                                    logo: 'pending-campaign.jpg'
                                },
                                params: {
                                    sponsor: 'Diageo'
                                }
                            }
                        }
                    ]
                },
                {
                    id: 'cam-4',
                    status: 'expired',
                    name: 'Ketel One Q4 Campaign',
                    cards: [
                        {
                            item: {
                                id: 'rc-4',
                                collateral: {
                                    logo: 'mylogo.jpg'
                                },
                                params: {
                                    sponsor: 'Ketel One'
                                }
                            }
                        }
                    ]
                },
                {
                    id: 'cam-4',
                    status: 'expired',
                    name: 'Ketel One Q4 Campaign',
                    cards: [
                        {
                            item: {
                                id: 'rc-4',
                                collateral: {
                                    logo: 'ketel-one.jpg'
                                },
                                params: {
                                    sponsor: 'Ketel One'
                                }
                            }
                        }
                    ]
                }
            ];

            campaignsDeferred = $q.defer();
            spyOn(cinema6.db, 'findAll').and.returnValue(campaignsDeferred.promise);
        });

        it('should exist', function() {
            expect(SelfieLogoService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('getLogos(query)', function() {
                var query, success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    query = {
                        sort: 'lastUpdated,-1',
                        org: 'o-123',
                        application: 'selfie',
                        limit: 50,
                        skip: 0
                    };

                    SelfieLogoService.getLogos(query).then(success, failure);
                });

                it('should query cinema6.db for selfie campaigns', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('selfieCampaign', query);
                });

                describe('when campaigns are found', function() {
                    var logos;

                    beforeEach(function() {
                        $rootScope.$apply(function() {
                            campaignsDeferred.resolve(campaigns);
                        });

                        logos = success.calls.mostRecent().args[0];
                    });

                    describe('generated data', function() {
                        it('should only inlcude active, paused or expired campaign data', function() {
                            expect(campaigns.length).not.toEqual(logos.length);

                            logos.forEach(function(logo) {
                                expect(logo.src).not.toEqual('pending-campaign.jpg');
                            });
                        });

                        it('should ensure that each logo name is unique', function() {
                            expect(logos[0].name).not.toEqual(logos[1].name);

                            expect(logos[0].name).toEqual('Volvo from Summer Campaign');
                            expect(logos[1].name).toEqual('Volvo from Summer Campaign (1)');
                        });

                        it('should ensure every src is unique', function() {
                            function instances(value, array) {
                                return array.filter(function(item) {
                                    return item === value;
                                }).length;
                            }

                            logos.forEach(function(logo) {
                                expect(instances(logo, logos)).toBe(1);
                            });
                        });
                    });
                });

                describe('if query is rejected', function() {
                    it('should reject the promise', function() {
                        $rootScope.$apply(function() {
                            campaignsDeferred.reject();
                        });

                        expect(failure).toHaveBeenCalled();
                    });
                });
            });
        });
    });
});