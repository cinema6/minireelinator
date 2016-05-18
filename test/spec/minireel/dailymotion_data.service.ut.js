define(['minireel/services'], function(servicesModule) {
    'use strict';

    describe('DailymotionDataService', function() {
        var $rootScope,
            $httpBackend,
            DailymotionDataService;

        beforeEach(function() {
            module(servicesModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $httpBackend = $injector.get('$httpBackend');

                DailymotionDataService = $injector.get('DailymotionDataService');
            });
        });

        afterAll(function() {
            $rootScope = null;
            $httpBackend = null;
            DailymotionDataService = null;
        });

        it('should exist', function() {
            expect(DailymotionDataService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('video(id)', function() {
                var result;

                beforeEach(function() {
                    $rootScope.$apply(function() {
                        result = DailymotionDataService.video('x24lb1b');
                    });
                });

                describe('get(query)', function() {
                    var response,
                        success, failure;

                    beforeEach(function() {
                        success = jasmine.createSpy('success()');
                        failure = jasmine.createSpy('failure()');

                        response = {
                            /* jshint quotmark:false */
                            "available_formats": [
                                "l1",
                                "l2",
                                "ld",
                                "sd",
                                "hq",
                                "hd720"
                            ],
                            "allow_embed": true,
                            "channel": "lifestyle",
                            "comments_total": 0,
                            "country": "NL",
                            "created_time": 1409046599,
                            "description": "\"Modern Family\" and \"Breaking Bad\" triumphed at Monday's Emmy Awards, proving that established broadcast and cable fare retains the power to fend off challenges from upstart online series such as \"Orange Is the New Black.\"",
                            "duration": 180,
                            "explicit": false,
                            "views_total": 604
                            /* jshint quotmark:single */
                        };

                        $httpBackend.expectGET('https://api.dailymotion.com/video/x24lb1b?fields=available_formats,allow_embed,channel,comments_total,country,created_time,description,duration,explicit,views_total')
                            .respond(200, response);

                        $rootScope.$apply(function() {
                            DailymotionDataService.video('x24lb1b').get({
                                fields: [
                                    'availableFormats',
                                    'allowEmbed',
                                    'channel',
                                    'commentsTotal',
                                    'country',
                                    'createdTime',
                                    'description',
                                    'duration',
                                    'explicit',
                                    'viewsTotal'
                                ]
                            }).then(success, failure);
                        });

                        $httpBackend.flush();
                    });

                    it('should resolve to a camelCased object', function() {
                        expect(success).toHaveBeenCalledWith({
                            availableFormats: ['l1', 'l2', 'ld', 'sd', 'hq', 'hd720'],
                            allowEmbed: true,
                            channel: 'lifestyle',
                            commentsTotal: 0,
                            country: 'NL',
                            createdTime: new Date(1409046599000),
                            description: '"Modern Family" and "Breaking Bad" triumphed at Monday\'s Emmy Awards, proving that established broadcast and cable fare retains the power to fend off challenges from upstart online series such as "Orange Is the New Black."',
                            duration: 180,
                            explicit: false,
                            viewsTotal: 604
                        });
                    });
                });
            });
        });
    });
});
