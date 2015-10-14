define(['app','c6uilib'], function(appModule, c6uilib) {
    'use strict';

    describe('SelfieLogoService', function() {
        var $q,
            $rootScope,
            $httpBackend,
            c6UrlMaker,
            c6State,
            SelfieLogoService;

        var campaigns,
            cards,
            success, failure;

        beforeEach(function() {
            module(c6uilib.name, ['$provide', function($provide) {
                $provide.provider('c6UrlMaker', function(){
                    this.location = jasmine.createSpy('urlMaker.location');
                    this.makeUrl  = jasmine.createSpy('urlMaker.makeUrl');
                    this.$get     = function(){
                        return jasmine.createSpy('urlMaker.get');
                    };
                });
            }]);

            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                $httpBackend = $injector.get('$httpBackend');
                c6State = $injector.get('c6State');
                c6UrlMaker = $injector.get('c6UrlMaker');
                SelfieLogoService = $injector.get('SelfieLogoService');
            });

            c6UrlMaker.and.callFake(function(path) {
                return '/api/' + path;
            });

            campaigns = [
                {
                    id: 'cam-1',
                    status: 'active',
                    name: 'Summer Campaign',
                    cards: [
                        {
                            id: 'rc-1'
                        }
                    ]
                },
                {
                    id: 'cam-2',
                    status: 'paused',
                    name: 'Summer Campaign',
                    cards: [
                        {
                            id: 'rc-2'
                        }
                    ]
                },
                {
                    id: 'cam-3',
                    status: 'error',
                    name: 'Fall Campaign',
                    cards: [
                        {
                            id: 'rc-3'
                        }
                    ]
                },
                {
                    id: 'cam-4',
                    status: 'expired',
                    name: 'Ketel One Q4 Campaign',
                    cards: [
                        {
                            id: 'rc-4'
                        }
                    ]
                },
                {
                    id: 'cam-4',
                    status: 'expired',
                    name: 'Ketel One Q4 Campaign',
                    cards: [
                        {
                            id: 'rc-4'
                        }
                    ]
                }
            ];

            cards = [
                {
                    id: 'rc-1',
                    collateral: {
                        logo: 'mylogo.jpg'
                    },
                    params: {
                        sponsor: 'Volvo'
                    }
                },
                {
                    id: 'rc-2',
                    collateral: {
                        logo: 'volvo.jpg'
                    },
                    params: {
                        sponsor: 'Volvo'
                    }
                },
                {
                    id: 'rc-3',
                    collateral: {
                        logo: 'pending-campaign.jpg'
                    },
                    params: {
                        sponsor: 'Diageo'
                    }
                },
                {
                    id: 'rc-4',
                    collateral: {
                        logo: 'ketel-one.jpg'
                    },
                    params: {
                        sponsor: 'Ketel One'
                    }
                },
                {
                    id: 'rc-4',
                    collateral: {
                        logo: 'mylogo.jpg'
                    },
                    params: {
                        sponsor: 'Ketel One'
                    }
                }
            ];

            c6State.get('Selfie').cModel = { org: { id: 'o-123' } };
        });

        it('should exist', function() {
            expect(SelfieLogoService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('getLogos()', function() {
                var success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    $httpBackend.expectGET('/api/campaigns?application=selfie&fields=cards&limit=50&org=o-123&skip=0&sort=lastUpdated,-1&statuses=active,paused,error')
                        .respond(200, campaigns);

                    $httpBackend.expectGET('/api/content/cards?ids=rc-1,rc-2,rc-3,rc-4')
                        .respond(200, cards);

                    SelfieLogoService.getLogos().then(success, failure);

                    $httpBackend.flush();
                });

                describe('when campaigns are found', function() {
                    var logos;

                    beforeEach(function() {
                        logos = success.calls.mostRecent().args[0];
                    });

                    describe('generated data', function() {
                        it('should ensure that each logo name is unique', function() {
                            expect(logos[0].name).not.toEqual(logos[1].name);

                            expect(logos[0].name).toEqual('Volvo');
                            expect(logos[1].name).toEqual('Volvo (1)');
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

                describe('if any $http request fails', function() {
                    var success, failure;

                    beforeEach(function() {
                        success = jasmine.createSpy('success()');
                        failure = jasmine.createSpy('failure()');
                    });

                    it('should reject the promise if campaigns request fails', function() {
                        $httpBackend.expectGET('/api/campaigns?application=selfie&fields=cards&limit=50&org=o-123&skip=0&sort=lastUpdated,-1&statuses=active,paused,error')
                            .respond(404, 'NOT FOUND');

                        SelfieLogoService.getLogos().then(success, failure);

                        $httpBackend.flush();

                        expect(failure).toHaveBeenCalled();
                    });

                    it('should reject the promise if cards request fails', function() {
                        $httpBackend.expectGET('/api/campaigns?application=selfie&fields=cards&limit=50&org=o-123&skip=0&sort=lastUpdated,-1&statuses=active,paused,error')
                            .respond(200, campaigns);

                        $httpBackend.expectGET('/api/content/cards?ids=rc-1,rc-2,rc-3,rc-4')
                            .respond(404, 'NOT FOUND');

                        SelfieLogoService.getLogos().then(success, failure);

                        $httpBackend.flush();

                        expect(failure).toHaveBeenCalled();
                    });
                });
            });
        });
    });
});