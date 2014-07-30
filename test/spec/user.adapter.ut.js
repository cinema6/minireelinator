(function() {
    'use strict';

    define(['app'], function(appModule) {
        /* global angular:true */
        var copy = angular.copy,
            extend = angular.extend;

        describe('UserAdapter', function() {
            var UserAdapter,
                cinema6,
                $q,
                $rootScope,
                adapter;

            var $httpBackend;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    cinema6 = $injector.get('cinema6');
                    UserAdapter = $injector.get('UserAdapter');
                    UserAdapter.config = {
                        apiBase: '/api'
                    };

                    adapter = $injector.instantiate(UserAdapter, {
                        config: UserAdapter.config
                    });

                    $httpBackend = $injector.get('$httpBackend');
                });
            });

            it('should exist', function() {
                expect(adapter).toEqual(jasmine.any(Object));
            });

            describe('decorateWithOrg(user)', function() {
                var org, user,
                    success;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');

                    org = {
                        id: 'o-308f5e8428c48e',
                        config: {}
                    };

                    user = {
                        id: 'u-6310e2801c230c',
                        org: org.id,
                        config: {}
                    };

                    spyOn(cinema6.db, 'find').and.returnValue($q.when(org));
                    $rootScope.$apply(function() {
                        adapter.decorateWithOrg(user).then(success);
                    });
                });

                it('should place the user\'s org on the user model', function() {
                    expect(cinema6.db.find).toHaveBeenCalledWith('org', org.id);
                    expect(success).toHaveBeenCalledWith(user);
                    expect(user.org).toBe(org);
                });
            });

            describe('findAll(type)', function() {
                var failure;

                beforeEach(function() {
                    failure = jasmine.createSpy('failure()');

                    $rootScope.$apply(function() {
                        adapter.findAll('user').catch(failure);
                    });
                });

                it('should reject the promise', function() {
                    expect(failure).toHaveBeenCalledWith('UserAdapter.findAll() method is not implemented.');
                });
            });

            xdescribe('findAll(type)', function() {
                var users,
                    success;

                beforeEach(function() {
                    success = jasmine.createSpy('success');
                    spyOn(adapter, 'decorateWithOrg').and.callFake(function(user) {
                        return $q.when(user);
                    });

                    /* jshint quotmark:false */
                    users = [
                        { id: 'u-1234', name: 'e2e-getOrg3' },
                        { id: 'u-4567', name: 'e2e-getOrg2' },
                        { id: 'u-7890', name: 'e2e-getOrg1' }
                    ];
                    /* jshint quotmark:single */

                    $httpBackend.expectGET('/api/account/users')
                        .respond(200, users);

                    adapter.findAll('user').then(success);

                    $httpBackend.flush();
                });

                it('should decorate all of the users with their org', function() {
                    users.forEach(function(user, index) {
                        expect(adapter.decorateWithOrg).toHaveBeenCalledWith(user, index, users);
                    });
                });

                it('should resolve to all the users', function() {
                    expect(success).toHaveBeenCalledWith(users);
                });
            });

            describe('find(type, id)', function() {
                var failure;

                beforeEach(function() {
                    failure = jasmine.createSpy('failure()');

                    $rootScope.$apply(function() {
                        adapter.find('user', 'o-1234').catch(failure);
                    });
                });

                it('should reject the promise', function() {
                    expect(failure).toHaveBeenCalledWith('UserAdapter.find() method is not implemented.');
                });
            });

            xdescribe('find(type, id)', function() {
                var user,
                    success;

                beforeEach(function() {
                    success = jasmine.createSpy('success');
                    spyOn(adapter, 'decorateWithOrg').and.returnValue($q.when(user));

                    /* jshint quotmark:false */
                    user = {
                        id: 'u-1234',
                        name: 'e2e-getOrg3'
                    };
                    /* jshint quotmark:single */

                    $httpBackend.expectGET('/api/account/user/o-1234')
                        .respond(200, user);

                    adapter.find('user', 'o-1234').then(success);

                    $httpBackend.flush();
                });

                it('should decorate the user with its org', function() {
                    expect(adapter.decorateWithOrg).toHaveBeenCalledWith(user);
                });

                it('should return the user in an array', function() {
                    expect(success).toHaveBeenCalledWith([user]);
                });
            });

            describe('findQuery(type, query)', function() {
                var failure;

                beforeEach(function() {
                    failure = jasmine.createSpy('failure()');

                    $rootScope.$apply(function() {
                        adapter.findQuery('user', {
                            user: 'e2e-user',
                            sort: 'id,1'
                        }).catch(failure);
                    });
                });

                it('should reject the promise', function() {
                    expect(failure).toHaveBeenCalledWith('UserAdapter.findQuery() method is not implemented.');
                });
            });

            xdescribe('findQuery(type, query)', function() {
                var success, failure,
                    users;

                beforeEach(function() {
                    spyOn(adapter, 'decorateWithOrg').and.callFake(function(user) {
                        return $q.when(user);
                    });

                    /* jshint quotmark:false */
                    users = [
                        { id: 'o-1234', name: 'e2e-getOrg3' },
                        { id: 'o-4567', name: 'e2e-getOrg2' },
                        { id: 'o-7890', name: 'e2e-getOrg1' }
                    ];
                    /* jshint quotmark:single */

                    success = jasmine.createSpy('success');
                    failure = jasmine.createSpy('failure');
                });

                describe('when there are results', function() {
                    beforeEach(function() {
                        $httpBackend.expectGET('/api/account/users?sort=id,1&user=e2e-user')
                            .respond(200, users);

                        adapter.findQuery('user', {
                            user: 'e2e-user',
                            sort: 'id,1'
                        }).then(success);

                        $httpBackend.flush();
                    });

                    it('should decorate all of the users with their org', function() {
                        users.forEach(function(user, index) {
                            expect(adapter.decorateWithOrg).toHaveBeenCalledWith(user, index, users);
                        });
                    });

                    it('should resolve to the users', function() {
                        expect(success).toHaveBeenCalledWith(users);
                    });
                });

                describe('when there are no results found', function() {
                    beforeEach(function() {
                        $httpBackend.expectGET('/api/account/users?user=boring-user')
                            .respond(404, 'Nothing found. User is boring');

                        adapter.findQuery('user', {
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
                        $httpBackend.expectGET('/api/account/users?user=chaos-monkey')
                            .respond(500, 'INTERNAL SERVER ERROR');

                        adapter.findQuery('user', {
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
                var failure,
                    user;

                beforeEach(function() {
                    failure = jasmine.createSpy('failure()');

                    /* jshint quotmark:false */
                    user = {
                        name: 'e2e-getOrg3'
                    };
                    /* jshint quotmark:single */

                    $rootScope.$apply(function() {
                        adapter.create('user', copy(user)).catch(failure);
                    });
                });

                it('should reject the promise', function() {
                    expect(failure).toHaveBeenCalledWith('UserAdapter.create() method is not implemented.');
                });
            });

            xdescribe('create(type, data)', function() {
                var success,
                    user,
                    response;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    /* jshint quotmark:false */
                    user = {
                        name: 'e2e-getOrg3'
                    };
                    /* jshint quotmark:single */

                    response = extend(copy(user), { id: 'e-8bf47900eb6fd6' });

                    spyOn(adapter, 'decorateWithOrg').and.returnValue($q.when(response));

                    $httpBackend.expectPOST('/api/account/user', {
                        name: 'e2e-getOrg3'
                    }).respond(201, response);

                    adapter.create('user', copy(user)).then(success);

                    $httpBackend.flush();
                });

                it('should decorate the user with its org', function() {
                    expect(adapter.decorateWithOrg).toHaveBeenCalledWith(response);
                });

                it('should respond with the response in an array', function() {
                    expect(success).toHaveBeenCalledWith([response]);
                });
            });

            describe('erase(type, model)', function() {
                var failure,
                    user;

                beforeEach(function() {
                    failure = jasmine.createSpy('failure()');

                    /* jshint quotmark:false */
                    user = {
                        name: 'e2e-getOrg3'
                    };
                    /* jshint quotmark:single */

                    $rootScope.$apply(function() {
                        adapter.erase('user', user).catch(failure);
                    });
                });

                it('should reject the promise', function() {
                    expect(failure).toHaveBeenCalledWith('UserAdapter.erase() method is not implemented.');
                });
            });

            xdescribe('erase(type, model)', function() {
                var success,
                    user;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    user = {
                        id: 'o-8bf47900eb6fd6'
                    };

                    $httpBackend.expectDELETE('/api/account/user/o-8bf47900eb6fd6')
                        .respond(204, '');

                    adapter.erase('user', user).then(success);

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
                        org: {
                            id: 'o-ec16f3ee949c80'
                        },
                        email: "josh@cinema6.com",
                        status: "active",
                        access: "public",
                        created: "fkdslf",
                        lastUpdated: "fkdsjfkd",
                        user: "e2e-user"
                    };
                    /* jshint quotmark:single */

                    response = extend(copy(model), {
                        lastUpdated: 'YASSS'
                    });

                    spyOn(adapter, 'decorateWithOrg').and.returnValue($q.when(response));

                    $httpBackend.expectPUT('/api/account/user/e2e-put1', {
                        title: 'origTitle',
                        status: 'active',
                        access: 'public',
                        lastUpdated: 'fkdsjfkd',
                        user: 'e2e-user'
                    }).respond(response);

                    adapter.update('user', copy(model)).then(success);

                    $httpBackend.flush();
                });

                it('should decorate the user with its org', function() {
                    expect(adapter.decorateWithOrg).toHaveBeenCalledWith(response);
                });

                it('should resolve to the response in an array', function() {
                    expect(success).toHaveBeenCalledWith([response]);
                });
            });
        });
    });
}());
