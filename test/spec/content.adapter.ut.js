(function() {
    'use strict';

    define(['app', 'angular'], function(appModule, angular) {
        var copy = angular.copy,
            extend = angular.extend;

        describe('ContentAdapter', function() {
            var ContentAdapter,
                adapter,
                $q,
                $rootScope,
                cinema6;

            var $httpBackend;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    cinema6 = $injector.get('cinema6');

                    ContentAdapter = $injector.get('ContentAdapter');
                    ContentAdapter.config = {
                        apiBase: '/api'
                    };

                    adapter = $injector.instantiate(ContentAdapter, {
                        config: ContentAdapter.config
                    });

                    $httpBackend = $injector.get('$httpBackend');
                });
            });

            it('should exist', function() {
                expect(adapter).toEqual(jasmine.any(Object));
            });

            describe('decorateWithUser(experience)', function() {
                var experience, user,
                    success, failure;

                beforeEach(function() {
                    experience = {
                        user: 'u-8da73bf276bb97'
                    };
                    user = {
                        id: 'u-8da73bf276bb97'
                    };

                    success = jasmine.createSpy('success()'); failure = jasmine.createSpy('failure()');

                    spyOn(cinema6.db, 'find').and.returnValue($q.when(user));

                    $rootScope.$apply(function() {
                        adapter.decorateWithUser(experience).then(success, failure);
                    });
                });

                it('should fetch the user', function() {
                    expect(cinema6.db.find).toHaveBeenCalledWith('user', 'u-8da73bf276bb97');
                });

                it('should put the user on the experience', function() {
                    expect(experience.user).toBe(user);
                });

                it('should be fulfilled with the experience', function() {
                    expect(success).toHaveBeenCalledWith(experience);
                });

                describe('if the service fails to get the user', function() {
                    beforeEach(function() {
                        [success, failure].forEach(function(spy) {
                            spy.calls.reset();
                        });

                        cinema6.db.find.and.returnValue($q.reject('NOT AUTHORIZED'));

                        $rootScope.$apply(function() {
                            adapter.decorateWithUser(experience).then(success, failure);
                        });
                    });

                    it('should still succeed', function() {
                        expect(success).toHaveBeenCalledWith(experience);
                    });

                    it('should set the user to null', function() {
                        expect(experience.user).toBeNull();
                    });
                });
            });

            describe('findAll(type)', function() {
                var experiences,
                    success;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    spyOn(adapter, 'decorateWithUser')
                        .and.callFake(function(experience) {
                            return $q.when(experience);
                        });

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
                    ];
                    /* jshint quotmark:single */

                    $httpBackend.expectGET('/api/content/experiences')
                        .respond(200, experiences);

                    adapter.findAll('experience').then(success);

                    $httpBackend.flush();
                });

                it('should resolve to all the experiences', function() {
                    expect(success).toHaveBeenCalledWith(experiences);
                });

                it('should decorate all the experiences with their user', function() {
                    experiences.forEach(function(experience, index, array) {
                        expect(adapter.decorateWithUser).toHaveBeenCalledWith(experience, index, array);
                    });
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

                    spyOn(adapter, 'decorateWithUser').and.returnValue($q.when(experience));

                    $httpBackend.expectGET('/api/content/experience/e2e-getid1')
                        .respond(200, experience);

                    adapter.find('experience', 'e2e-getid1').then(success);

                    $httpBackend.flush();
                });

                it('should return the experience in an array', function() {
                    expect(success).toHaveBeenCalledWith([experience]);
                });

                it('should decorate the experience with its user', function() {
                    expect(adapter.decorateWithUser).toHaveBeenCalledWith(experience);
                });
            });

            describe('findQuery(type, query)', function() {
                var success, failure,
                    experiences;

                beforeEach(function() {
                    spyOn(adapter, 'decorateWithUser')
                        .and.callFake(function(experience) {
                            return $q.when(experience);
                        });

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

                    it('should decorate all the experiences with their users', function() {
                        experiences.forEach(function(experience, index, array) {
                            expect(adapter.decorateWithUser).toHaveBeenCalledWith(experience, index, array);
                        });
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
                        org: "784hf785",
                        created: "Blah Blah"
                    };
                    /* jshint quotmark:single */

                    response = extend(copy(experience), { id: 'e-8bf47900eb6fd6' });

                    spyOn(adapter, 'decorateWithUser').and.returnValue($q.when(response));

                    $httpBackend.expectPOST('/api/content/experience', {
                        title: 'test experience',
                        access: 'public',
                        status: 'inactive'
                    }).respond(201, response);

                    adapter.create('experience', copy(experience)).then(success);

                    $httpBackend.flush();
                });

                it('should respond with the response in an array', function() {
                    expect(success).toHaveBeenCalledWith([response]);
                });

                it('should decorate the experience with its user', function() {
                    expect(adapter.decorateWithUser).toHaveBeenCalledWith(response);
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
                        user: {
                            id: "e2e-user"
                        }
                    };
                    /* jshint quotmark:single */

                    response = extend(copy(model), {
                        lastUpdated: 'YASSS'
                    });

                    spyOn(adapter, 'decorateWithUser').and.returnValue($q.when(response));

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

                it('should decorate the experience with its user', function() {
                    expect(adapter.decorateWithUser).toHaveBeenCalledWith(response);
                });
            });
        });
    });
}());
