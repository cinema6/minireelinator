(function() {
    'use strict';

    define(['app'], function(appModule) {
        /* global angular:true */
        var copy = angular.copy,
            extend = angular.extend;

        describe('OrgAdapter', function() {
            var OrgAdapter,
                adapter;

            var $httpBackend;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    OrgAdapter = $injector.get('OrgAdapter');
                    OrgAdapter.config = {
                        apiBase: '/api'
                    };

                    adapter = $injector.instantiate(OrgAdapter, {
                        config: OrgAdapter.config
                    });

                    $httpBackend = $injector.get('$httpBackend');
                });
            });

            it('should exist', function() {
                expect(adapter).toEqual(jasmine.any(Object));
            });

            describe('findAll(type)', function() {
                var orgs,
                    success;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    /* jshint quotmark:false */
                    orgs = [
                        { id: 'o-1234', name: 'e2e-getOrg3' },
                        { id: 'o-4567', name: 'e2e-getOrg2' },
                        { id: 'o-7890', name: 'e2e-getOrg1' }
                    ];
                    /* jshint quotmark:single */

                    $httpBackend.expectGET('/api/account/orgs')
                        .respond(200, orgs);

                    adapter.findAll('org').then(success);

                    $httpBackend.flush();
                });

                it('should resolve to all the orgs', function() {
                    expect(success).toHaveBeenCalledWith(orgs);
                });
            });

            describe('find(type, id)', function() {
                var org,
                    success;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    /* jshint quotmark:false */
                    org = {
                        id: 'o-1234',
                        name: 'e2e-getOrg3'
                    };
                    /* jshint quotmark:single */

                    $httpBackend.expectGET('/api/account/org/o-1234')
                        .respond(200, org);

                    adapter.find('org', 'o-1234').then(success);

                    $httpBackend.flush();
                });

                it('should return the org in an array', function() {
                    expect(success).toHaveBeenCalledWith([org]);
                });
            });

            describe('findQuery(type, query)', function() {
                var success, failure,
                    orgs;

                beforeEach(function() {
                    /* jshint quotmark:false */
                    orgs = [
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
                        $httpBackend.expectGET('/api/account/orgs?sort=id,1&user=e2e-user')
                            .respond(200, orgs);

                        adapter.findQuery('org', {
                            user: 'e2e-user',
                            sort: 'id,1'
                        }).then(success);

                        $httpBackend.flush();
                    });

                    it('should resolve to the orgs', function() {
                        expect(success).toHaveBeenCalledWith(orgs);
                    });
                });

                describe('when there are no results found', function() {
                    beforeEach(function() {
                        $httpBackend.expectGET('/api/account/orgs?user=boring-user')
                            .respond(404, 'Nothing found. User is boring');

                        adapter.findQuery('org', {
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
                        $httpBackend.expectGET('/api/account/orgs?user=chaos-monkey')
                            .respond(500, 'INTERNAL SERVER ERROR');

                        adapter.findQuery('org', {
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
                    org,
                    response;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    /* jshint quotmark:false */
                    org = {
                        id: 'o-1234',
                        name: 'e2e-getOrg3'
                    };
                    /* jshint quotmark:single */

                    response = extend(copy(org), { id: 'e-8bf47900eb6fd6' });

                    $httpBackend.expectPOST('/api/account/org', {
                        name: 'e2e-getOrg3'
                    }).respond(201, response);

                    adapter.create('org', copy(org)).then(success);

                    $httpBackend.flush();
                });

                it('should respond with the response in an array', function() {
                    expect(success).toHaveBeenCalledWith([response]);
                });
            });

            describe('erase(type, model)', function() {
                var success,
                    org;

                beforeEach(function() {
                    success = jasmine.createSpy('success');

                    org = {
                        id: 'o-8bf47900eb6fd6'
                    };

                    $httpBackend.expectDELETE('/api/account/org/o-8bf47900eb6fd6')
                        .respond(204, '');

                    adapter.erase('org', org).then(success);

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

                    $httpBackend.expectPUT('/api/account/org/e2e-put1', {
                        title: 'origTitle',
                        status: 'active',
                        access: 'public',
                        lastUpdated: 'fkdsjfkd',
                        user: 'e2e-user'
                    }).respond(response);

                    adapter.update('org', copy(model)).then(success);

                    $httpBackend.flush();
                });

                it('should resolve to the response in an array', function() {
                    expect(success).toHaveBeenCalledWith([response]);
                });
            });
        });
    });
}());
