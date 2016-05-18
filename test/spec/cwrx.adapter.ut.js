(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('CWRXAdapter', function() {
            var CWRXAdapter,
                adapter,
                $q;

            var VoteAdapter,
                ContentAdapter,
                voteAdapter,
                contentAdapter,
                findResult,
                findAllResult,
                findQueryResult,
                createResult,
                eraseResult,
                updateResult;

            beforeEach(function() {
                ContentAdapter = function() {
                    contentAdapter = this;
                };
                VoteAdapter = function() {
                    voteAdapter = this;
                };

                module(appModule.name);

                inject(function($injector) {
                    CWRXAdapter = $injector.get('CWRXAdapter');
                    CWRXAdapter.config = {
                        experience: ContentAdapter,
                        election: VoteAdapter
                    };
                    adapter = $injector.instantiate(CWRXAdapter, {
                        config: CWRXAdapter.config
                    });
                    $q = $injector.get('$q');
                });

                findResult = $q.defer().promise;
                findAllResult = $q.defer().promise;
                findQueryResult = $q.defer().promise;
                createResult = $q.defer().promise;
                eraseResult = $q.defer().promise;
                updateResult = $q.defer().promise;

                [voteAdapter, contentAdapter].forEach(function(delegateAdapter) {
                    delegateAdapter.find = jasmine.createSpy('delegate.find()')
                        .and.returnValue(findResult);
                    delegateAdapter.findAll = jasmine.createSpy('delegate.findAll()')
                        .and.returnValue(findAllResult);
                    delegateAdapter.findQuery = jasmine.createSpy('delegate.findQuery()')
                        .and.returnValue(findQueryResult);
                    delegateAdapter.create = jasmine.createSpy('delegate.create()')
                        .and.returnValue(createResult);
                    delegateAdapter.erase = jasmine.createSpy('delegate.erase()')
                        .and.returnValue(eraseResult);
                    delegateAdapter.update = jasmine.createSpy('delegate.update()')
                        .and.returnValue(updateResult);
                });
            });

            afterAll(function() {
                CWRXAdapter = null;
                adapter = null;
                $q = null;
                VoteAdapter = null;
                ContentAdapter = null;
                voteAdapter = null;
                contentAdapter = null;
                findResult = null;
                findAllResult = null;
                findQueryResult = null;
                createResult = null;
                eraseResult = null;
                updateResult = null;
            });

            it('should exist', function() {
                expect(adapter).toEqual(jasmine.any(Object));
            });

            it('the api methods', function() {
                [
                    {
                        type: 'election',
                        adapter: voteAdapter
                    },
                    {
                        type: 'experience',
                        adapter: contentAdapter
                    }
                ].forEach(function(config) {
                    var type = config.type,
                        delegate = config.adapter,
                        query = { name: 'foo', hey: 'bar' },
                        model = { name: 'josh', age: 22 };

                    expect(adapter.find(type, '1234')).toBe(findResult);
                    expect(delegate.find).toHaveBeenCalledWith(type, '1234');

                    expect(adapter.findAll(type)).toBe(findAllResult);
                    expect(delegate.findAll).toHaveBeenCalledWith(type);

                    expect(adapter.findQuery(type, query)).toBe(findQueryResult);
                    expect(delegate.findQuery).toHaveBeenCalledWith(type, query);

                    expect(adapter.create(type, model)).toBe(createResult);
                    expect(delegate.create).toHaveBeenCalledWith(type, model);

                    expect(adapter.erase(type, model)).toBe(eraseResult);
                    expect(delegate.erase).toHaveBeenCalledWith(type, model);

                    expect(adapter.update(type, model)).toBe(updateResult);
                    expect(delegate.update).toHaveBeenCalledWith(type, model);
                });
            });
        });
    });
}());
