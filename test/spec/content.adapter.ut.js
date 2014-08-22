(function() {
    'use strict';

    define(['app'], function(appModule) {
        /* global angular:true */
        var copy = angular.copy,
            extend = angular.extend;

        describe('ContentAdapter', function() {
            var ContentAdapter,
                adapter,
                cinema6,
                $q;

            var $httpBackend;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    ContentAdapter = $injector.get('ContentAdapter');
                    ContentAdapter.config = {
                        apiBase: '/api'
                    };

                    adapter = $injector.instantiate(ContentAdapter, {
                        config: ContentAdapter.config
                    });

                    cinema6 = $injector.get('cinema6');
                    $q = $injector.get('$q');

                    $httpBackend = $injector.get('$httpBackend');
                });
            });

            it('should exist', function() {
                expect(adapter).toEqual(jasmine.any(Object));
            });

            describe('findAll(type)', function() {
                var experiences,
                    users,
                    success;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    /* jshint quotmark:false */
                    experiences = [
                        {
                            id: "e2e-getquery1",
                            status: "active",
                            access: "public",
                            user: "e2e-user",
                            org: "e2e-org",
                            type: "foo"
                        },
                        {
                            id: "e2e-getquery2",
                            status: "inactive",
                            access: "private",
                            user: "e2e-user",
                            org: "not-e2e-org",
                            type: "foo"
                        },
                        {
                            id: "e2e-getquery3",
                            status: "active",
                            access: "public",
                            user: "not-e2e-user",
                            org: "e2e-org",
                            type: "bar"
                        },
                        {
                            id: "e2e-getquery4",
                            status: "inactive",
                            access: "private",
                            user: "not-e2e-user",
                            org: "not-e2e-org",
                        }
                    ],
                    users = [
                        {
                            id: "e2e-user",
                            org: "e2e-org",
                            status: "active"
                        },
                        {
                            id: "not-e2e-user",
                            org: "not-e2e-org",
                            status: "active"
                        }
                    ];
                    /* jshint quotmark:single */

                    $httpBackend.expectGET('/api/content/experiences')
                        .respond(200, experiences);

                    spyOn(cinema6.db, 'find').and.callFake(function(type, user) {
                        switch (user) {
                        case 'e2e-user':
                            return $q.when(users[0]);
                            break;
                        case 'not-e2e-user':
                            return $q.when(users[1]);
                            break;
                        }
                    });

                    adapter.findAll('experience').then(success);

                    $httpBackend.flush();
                });

                it('should resolve to all the experiences', function() {
                    var decoratedExperiences = copy(experiences);
                    decoratedExperiences.forEach(function(exp) {
                        switch (exp.user) {
                        case 'e2e-user':
                            exp.user = users[0];
                            break;
                        case 'not-e2e-user':
                            exp.user = users[1];
                            break;
                        }
                    });
                    expect(success).toHaveBeenCalledWith(decoratedExperiences);
                });
            });

            describe('find(type, id)', function() {
                var experience,
                    success;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    /* jshint quotmark:false */
                    experience = {
                        id: "e2e-getid1",
                        title: "test experience",
                        access: "public",
                        status: "inactive",
                        user: "e2e-user"
                    };
                    /* jshint quotmark:single */

                    $httpBackend.expectGET('/api/content/experience/e2e-getid1')
                        .respond(200, experience);

                    adapter.find('experience', 'e2e-getid1').then(success);

                    $httpBackend.flush();
                });

                it('should return the experience in an array', function() {
                    expect(success).toHaveBeenCalledWith([experience]);
                });
            });

            describe('findQuery(type, query)', function() {
                var success, failure,
                    experiences;

                beforeEach(function() {
                    /* jshint quotmark:false */
                    experiences = [
                        {
                            id: "e2e-getid1",
                            title: "test experience",
                            access: "public",
                            status: "inactive",
                            user: "e2e-user"
                        },
                        {
                            id: "e2e-getid2",
                            title: "test experience",
                            access: "private",
                            status: "active",
                            user: "not-e2e-user"
                        },
                        {
                            id: "e2e-getid3",
                            title: "test experience",
                            access: "public",
                            status: "inactive",
                            user: "not-e2e-user"
                        }
                    ];
                    /* jshint quotmark:single */

                    success = jasmine.createSpy('success');
                    failure = jasmine.createSpy('failure');
                });

                describe('when there are results', function() {
                    beforeEach(function() {
                        $httpBackend.expectGET('/api/content/experiences?sort=id,1&user=e2e-user')
                            .respond(200, experiences);

                        adapter.findQuery('experience', {
                            user: 'e2e-user',
                            sort: 'id,1'
                        }).then(success);

                        $httpBackend.flush();
                    });

                    it('should resolve to the experiences', function() {
                        expect(success).toHaveBeenCalledWith(experiences);
                    });
                });

                describe('when there are no results found', function() {
                    beforeEach(function() {
                        $httpBackend.expectGET('/api/content/experiences?user=boring-user')
                            .respond(404, 'Nothing found. User is boring');

                        adapter.findQuery('experience', {
                            user: 'boring-user'
                        }).then(success);

                        $httpBackend.flush();
                    });

                    it('should resolve to an empty array', function() {
                        expect(success).toHaveBeenCalledWith([]);
                    });
                });

                describe('when there is a failure', function() {
                    beforeEach(function() {
                        $httpBackend.expectGET('/api/content/experiences?user=chaos-monkey')
                            .respond(500, 'INTERNAL SERVER ERROR');

                        adapter.findQuery('experience', {
                            user: 'chaos-monkey'
                        }).catch(failure);

                        $httpBackend.flush();
                    });

                    it('should propagate failure', function() {
                        expect(failure).toHaveBeenCalledWith(jasmine.objectContaining({
                            data: 'INTERNAL SERVER ERROR'
                        }));
                    });
                });
            });

            describe('create(type, data)', function() {
                var success,
                    experience,
                    response;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    /* jshint quotmark:false */
                    experience = {
                        title: "test experience",
                        access: "public",
                        status: "inactive",
                        user: "e2e-user",
                        org: "784hf785",
                        created: "Blah Blah"
                    };
                    /* jshint quotmark:single */

                    response = extend(copy(experience), { id: 'e-8bf47900eb6fd6' });

                    $httpBackend.expectPOST('/api/content/experience', {
                        title: 'test experience',
                        access: 'public',
                        status: 'inactive',
                        user: 'e2e-user'
                    }).respond(201, response);

                    adapter.create('experience', copy(experience)).then(success);

                    $httpBackend.flush();
                });

                it('should respond with the response in an array', function() {
                    expect(success).toHaveBeenCalledWith([response]);
                });
            });

            describe('erase(type, model)', function() {
                var success,
                    experience;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    experience = {
                        id: 'e-8bf47900eb6fd6'
                    };

                    $httpBackend.expectDELETE('/api/content/experience/e-8bf47900eb6fd6')
                        .respond(204, '');

                    adapter.erase('experience', experience).then(success);

                    $httpBackend.flush();
                });

                it('should succeed', function() {
                    expect(success).toHaveBeenCalledWith(null);
                });
            });

            describe('update(type, model)', function() {
                var success,
                    model,
                    response;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    /* jshint quotmark:false */
                    model = {
                        id: "e2e-put1",
                        title: "origTitle",
                        status: "active",
                        access: "public",
                        created: "fkdslf",
                        lastUpdated: "fkdsjfkd",
                        org: "483fh38",
                        user: "e2e-user"
                    };
                    /* jshint quotmark:single */

                    response = extend(copy(model), {
                        lastUpdated: 'YASSS'
                    });

                    $httpBackend.expectPUT('/api/content/experience/e2e-put1', {
                        title: 'origTitle',
                        status: 'active',
                        access: 'public',
                        lastUpdated: 'fkdsjfkd',
                        user: 'e2e-user'
                    }).respond(response);

                    adapter.update('experience', copy(model)).then(success);

                    $httpBackend.flush();
                });

                it('should resolve to the response in an array', function() {
                    expect(success).toHaveBeenCalledWith([response]);
                });
            });
        });
    });
}());
