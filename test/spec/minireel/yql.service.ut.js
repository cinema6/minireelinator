define(['minireel/services'], function(servicesModule) {
    'use strict';

    /* From Angular Source. What is wrong with just using encodeURIComponent()? */
    function encodeUriQuery(val, pctEncodeSpaces) {
        return encodeURIComponent(val).
            replace(/%40/gi, '@').
            replace(/%3A/gi, ':').
            replace(/%24/g, '$').
            replace(/%2C/gi, ',').
            replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
    }

    describe('YQLService', function() {
        var $rootScope,
            $httpBackend,
            YQLService;

        beforeEach(function() {
            module(servicesModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $httpBackend = $injector.get('$httpBackend');
                YQLService = $injector.get('YQLService');
            });
        });

        afterAll(function() {
            $rootScope = null;
            $httpBackend = null;
            YQLService = null;
        });

        it('should exist', function() {
            expect(YQLService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('query(query)', function() {
                var success, failure,
                    query, result;


                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');
                });

                describe('if the query succeeds', function() {
                    beforeEach(function() {
                        query = 'select * from html where url="http://en.wikipedia.org/wiki/Yahoo" and xpath="//table/*[contains(.,\'Founder\')]//a"';

                        /* jshint quotmark:false */
                        result = {
                            "query": {
                                "count": 2,
                                "created": "2014-10-30T12:51:31Z",
                                "lang": "en-US",
                                "results": {
                                    "a": [
                                        {
                                            "href": "/wiki/Jerry_Yang_(entrepreneur)",
                                            "title": "Jerry Yang (entrepreneur)",
                                            "content": "Jerry Yang"
                                        },
                                        {
                                            "href": "/wiki/David_Filo",
                                            "title": "David Filo",
                                            "content": "David Filo"
                                        }
                                    ]
                                }
                            }
                        };
                        /* jshint quotmark:single */

                        $httpBackend.expectGET('https://query.yahooapis.com/v1/public/yql?format=json&q=' + encodeUriQuery(query))
                            .respond(200, result);

                        $rootScope.$apply(function() {
                            YQLService.query(query)
                                .then(success, failure);
                        });

                        $httpBackend.flush();
                    });

                    it('should resolve to the results', function() {
                        expect(success).toHaveBeenCalledWith(result.query.results);
                    });
                });

                describe('if the query fails', function() {
                    beforeEach(function() {
                        query = 'select * from html where url="http://en.wikipedia.org/wiki/Yahoo" and xpath="//table/*[contains(.,\'Founder)]//a"';

                        /* jshint quotmark:false */
                        result = {
                            "error": {
                                "lang": "en-US",
                                "description": "Invalid xpath expression //table/*[contains(.,\"Founder)]//a"
                            }
                        };
                        /* jshint quotmark:single */

                        $httpBackend.expectGET('https://query.yahooapis.com/v1/public/yql?format=json&q=' + encodeUriQuery(query))
                            .respond(400, result);

                        $rootScope.$apply(function() {
                            YQLService.query(query)
                                .then(success, failure);
                        });

                        $httpBackend.flush();
                    });

                    it('should be rejected with the error description', function() {
                        expect(failure).toHaveBeenCalledWith(result.error.description);
                    });
                });
            });
        });
    });
});
