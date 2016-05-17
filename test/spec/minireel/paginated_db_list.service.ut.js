define(['minireel/services'], function(servicesModule) {
    'use strict';

    describe('paginatedDbList(type, query, limit, page)', function() {
        var cinema6,
            $rootScope,
            scopePromise,
            $q,
            paginatedDbList;

        var ScopedPromise;

        beforeEach(function() {
            module(servicesModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                cinema6 = $injector.get('cinema6');
                scopePromise = $injector.get('scopePromise');
                $q = $injector.get('$q');

                paginatedDbList = $injector.get('paginatedDbList');
            });

            ScopedPromise = scopePromise($q.defer().promise).constructor;
        });

        afterAll(function() {
            cinema6 = null;
            $rootScope = null;
            scopePromise = null;
            $q = null;
            paginatedDbList = null;
            ScopedPromise = null;
        });

        it('should exist', function() {
            expect(paginatedDbList).toEqual(jasmine.any(Function));
        });

        describe('calling the function', function() {
            var result,
                dbDeferred;

            beforeEach(function() {
                dbDeferred = $q.defer();

                spyOn(cinema6.db, 'findAll').and.returnValue(dbDeferred.promise);

                result = paginatedDbList('experience', {
                    type: 'minireel',
                    filter: 'all'
                }, 10);
            });

            it('should make a database query', function() {
                expect(cinema6.db.findAll).toHaveBeenCalledWith('experience', {
                    type: 'minireel',
                    filter: 'all',
                    limit: 10,
                    skip: 0
                });
            });

            describe('calling with a page', function() {
                beforeEach(function() {
                    cinema6.db.findAll.calls.reset();

                    result = paginatedDbList('campaign', {
                        org: 'o-5013988a2d7b6f'
                    }, 50, 3);

                    expect(cinema6.db.findAll.calls.count()).toBe(1);
                });

                it('should make a database query for that page', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('campaign', {
                        org: 'o-5013988a2d7b6f',
                        limit: 50,
                        skip: 100
                    });
                });
            });

            describe('the returned object', function() {
                describe('properties', function() {
                    describe('type', function() {
                        it('should be the type specified', function() {
                            expect(result.type).toBe('experience');
                        });
                    });

                    describe('query', function() {
                        it('should be the query specified', function() {
                            expect(result.query).toEqual({
                                type: 'minireel',
                                filter: 'all'
                            });
                        });
                    });

                    describe('limit', function() {
                        it('should be the limit specified', function() {
                            expect(result.limit).toBe(10);
                        });
                    });

                    describe('page', function() {
                        it('should be 1', function() {
                            expect(result.page).toBe(1);
                        });
                    });

                    describe('items', function() {
                        it('should be a scoped promise for the db call', function() {
                            expect(result.items).toEqual(jasmine.any(ScopedPromise));
                            expect(result.items.promise).toBe(dbDeferred.promise);
                        });

                        it('should be decorated with page and selected props', function() {
                            expect(result.items.page).toEqual({});
                            expect(result.items.selected).toEqual([]);
                        });

                        it('should have an inital value of an empty array', function() {
                            expect(result.items.value).toEqual([]);
                        });
                    });
                });

                describe('methods', function() {
                    describe('ensureResolution()', function() {
                        var spy;

                        beforeEach(function() {
                            spy = jasmine.createSpy('spy()');

                            $rootScope.$apply(function() {
                                result.ensureResolution().then(spy);
                            });
                        });

                        it('should not resolve', function() {
                            expect(spy).not.toHaveBeenCalled();
                        });

                        describe('when the results come in', function() {
                            beforeEach(function() {
                                var items = [];
                                items.meta = {
                                    items: {}
                                };

                                $rootScope.$apply(function() {
                                    dbDeferred.resolve(items);
                                });
                            });

                            it('should resolve to itself', function() {
                                expect(spy).toHaveBeenCalledWith(result);
                            });
                        });
                    });

                    describe('update(query, limit)', function() {
                        var initialItems,
                            updateResult;

                        beforeEach(function() {
                            initialItems = result.items;

                            spyOn(result, 'emit');

                            dbDeferred = $q.defer();
                            cinema6.db.findAll.calls.reset();
                            cinema6.db.findAll.and.returnValue(dbDeferred.promise);

                            updateResult = result.update({
                                type: 'minireel',
                                filter: 'active'
                            }, 20);
                        });

                        it('should return itself', function() {
                            expect(updateResult).toBe(result);
                        });

                        it('should emit an event', function() {
                            expect(result.emit).toHaveBeenCalledWith('PaginatedListWillUpdate');
                        });

                        it('should remake a db request', function() {
                            expect(cinema6.db.findAll).toHaveBeenCalledWith('experience', {
                                type: 'minireel',
                                filter: 'active',
                                limit: 20,
                                skip: 0
                            });
                        });

                        it('should set items to a new scoped promise', function() {
                            expect(result.items).not.toBe(initialItems);
                            expect(result.items).toEqual(jasmine.any(ScopedPromise));
                            expect(result.items.promise).toBe(dbDeferred.promise);
                        });

                        it('should copy the previous page and selected objects to the new items', function() {
                            expect(result.items.page).toBe(initialItems.page);
                            expect(result.items.selected).toBe(initialItems.selected);
                        });

                        describe('when the results come back', function() {
                            var items;

                            beforeEach(function() {
                                items = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                                items.meta = {
                                    items: {
                                        start: 1,
                                        end: 20,
                                        total: 173
                                    }
                                };

                                $rootScope.$apply(function() {
                                    dbDeferred.resolve(items);
                                });
                            });

                            it('should update the page object', function() {
                                expect(result.items.page).toEqual({
                                    current: 1,
                                    total: 9
                                });
                            });

                            it('should update the selected array', function() {
                                expect(result.items.selected).toEqual([false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]);
                            });
                        });

                        describe('when call request fails', function() {
                            it('should broadcast an event', function() {
                                $rootScope.$apply(function() {
                                    dbDeferred.reject('ERROR');
                                });

                                expect(result.emit).toHaveBeenCalledWith('PaginatedListHasUpdated');
                            });
                        });
                    });

                    describe('goTo(page)', function() {
                        var initialItems,
                            goToResult;

                        beforeEach(function() {
                            initialItems = result.items;

                            spyOn(result, 'emit');

                            cinema6.db.findAll.calls.reset();
                            dbDeferred = $q.defer();
                            cinema6.db.findAll.and.returnValue(dbDeferred.promise);

                            goToResult = result.goTo(2);
                        });

                        it('should return itself', function() {
                            expect(goToResult).toBe(result);
                        });

                        it('should emit an event', function() {
                            expect(result.emit).toHaveBeenCalledWith('PaginatedListWillUpdate');
                        });

                        it('should make a db request', function() {
                            expect(cinema6.db.findAll).toHaveBeenCalledWith('experience', {
                                type: 'minireel',
                                filter: 'all',
                                limit: 10,
                                skip: 10
                            });
                        });

                        it('should update the page property', function() {
                            expect(result.page).toBe(2);
                        });

                        it('should set items to a new scoped promise', function() {
                            expect(result.items).not.toBe(initialItems);
                            expect(result.items).toEqual(jasmine.any(ScopedPromise));
                            expect(result.items.promise).toBe(dbDeferred.promise);
                        });

                        it('should copy the previous page and selected objects to the new scoped promise', function() {
                            expect(result.items.page).toBe(initialItems.page);
                            expect(result.items.selected).toBe(initialItems.selected);
                        });

                        describe('when the results come back', function() {
                            beforeEach(function() {
                                var items = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                                items.meta = {
                                    items: {
                                        start: 11,
                                        end: 20,
                                        total: 527
                                    }
                                };

                                $rootScope.$apply(function() {
                                    dbDeferred.resolve(items);
                                });
                            });

                            it('should update the page object', function() {
                                expect(result.items.page).toEqual({
                                    current: 2,
                                    total: 53
                                });
                            });

                            it('should update the selected array', function() {
                                expect(result.items.selected).toEqual([false, false, false, false, false, false, false, false, false, false]);
                            });

                            it('should broadcast an event', function() {
                                expect(result.emit).toHaveBeenCalledWith('PaginatedListHasUpdated');
                            });
                        });

                        describe('when call request fails', function() {
                            it('should broadcast an event', function() {
                                $rootScope.$apply(function() {
                                    dbDeferred.reject('ERROR');
                                });

                                expect(result.emit).toHaveBeenCalledWith('PaginatedListHasUpdated');
                            });
                        });
                    });

                    describe('next()', function() {
                        var nextResult;

                        beforeEach(function() {
                            spyOn(result, 'goTo').and.callThrough();

                            nextResult = result.next();
                        });

                        it('should go to the next page', function() {
                            expect(result.goTo).toHaveBeenCalledWith(2);
                        });

                        it('should return itself', function() {
                            expect(nextResult).toBe(result);
                        });
                    });

                    describe('prev()', function() {
                        var prevResult;

                        beforeEach(function() {
                            result.goTo(4);

                            spyOn(result, 'goTo').and.callThrough();

                            prevResult = result.prev();
                        });

                        it('should go to the previous page', function() {
                            expect(result.goTo).toHaveBeenCalledWith(3);
                        });

                        it('should return itself', function() {
                            expect(prevResult).toBe(result);
                        });

                        describe('if on the first page', function() {
                            beforeEach(function() {
                                result.goTo(1);

                                result.goTo.calls.reset();

                                prevResult = result.prev();
                            });

                            it('should not go below the first page', function() {
                                expect(result.goTo).toHaveBeenCalledWith(1);
                            });

                            it('should return itself', function() {
                                expect(prevResult).toBe(result);
                            });
                        });
                    });

                    describe('refresh()', function() {
                        var refreshResult;

                        beforeEach(function() {
                            result.goTo(3);

                            spyOn(result, 'goTo').and.callThrough();

                            refreshResult = result.refresh();
                        });

                        it('should goTo() the current page', function() {
                            expect(result.goTo).toHaveBeenCalledWith(3);
                        });

                        it('should return itself', function() {
                            expect(refreshResult).toBe(result);
                        });
                    });

                    describe('selection methods', function() {
                        var items;

                        beforeEach(function() {
                            items = [
                                {
                                    color: 'red'
                                },
                                {
                                    color: 'green'
                                },
                                {
                                    color: 'red'
                                },
                                {
                                    color: 'blue'
                                },
                                {
                                    color: 'blue'
                                },
                                {
                                    color: 'green'
                                }
                            ];
                            items.meta = {
                                items: {}
                            };

                            $rootScope.$apply(function() {
                                dbDeferred.resolve(items);
                            });
                        });

                        describe('selectAll(predicate)', function() {
                            var selectAllResult;

                            describe('if called with no predicate', function() {
                                beforeEach(function() {
                                    selectAllResult = result.selectAll();
                                });

                                it('should select every item', function() {
                                    expect(result.items.selected).toEqual([true, true, true, true, true, true]);
                                });

                                it('should return the selected array', function() {
                                    expect(selectAllResult).toBe(result.items.selected);
                                });
                            });

                            describe('if called with a predicate', function() {
                                beforeEach(function() {
                                    selectAllResult = result.selectAll(function(item) {
                                        return item.color === 'blue' ? 'true' : null;
                                    });
                                });

                                it('should select every element when the predicate returned truthy', function() {
                                    expect(result.items.selected).toEqual([false, false, false, true, true, false]);
                                });

                                it('should return the selected array', function() {
                                    expect(selectAllResult).toBe(result.items.selected);
                                });
                            });
                        });

                        describe('selectNone()', function() {
                            var selectNoneResult;

                            beforeEach(function() {
                                result.selectAll();

                                selectNoneResult = result.selectNone();
                            });

                            it('should deselect every item', function() {
                                expect(result.items.selected).toEqual([false, false, false, false, false, false]);
                            });

                            it('should return the selected array', function() {
                                expect(selectNoneResult).toBe(result.items.selected);
                            });
                        });

                        describe('getSelected()', function() {
                            var getSelectedResult;

                            beforeEach(function() {
                                result.selectAll(function(item) {
                                    return item.color === 'green';
                                });

                                getSelectedResult = result.getSelected();
                            });

                            it('should return an array of the selected items', function() {
                                expect(getSelectedResult).toEqual([items[1], items[5]]);
                            });
                        });

                        describe('areAllSelected(predicate)', function() {
                            describe('if called without a predicate', function() {
                                it('should return true if every item is selected', function() {
                                    result.selectAll();
                                    expect(result.areAllSelected()).toBe(true);

                                    result.items.selected[2] = false;
                                    expect(result.areAllSelected()).toBe(false);
                                });
                            });

                            describe('if called with a predicate', function() {
                                it('should return true if every item matching the predicate is selected', function() {
                                    var predicate = function(item) { return item.color === 'red'; };

                                    result.selectAll(predicate);
                                    expect(result.areAllSelected(predicate)).toBe(true);

                                    result.items.selected[2] = false;
                                    expect(result.areAllSelected(predicate)).toBe(false);
                                });
                            });
                        });
                    });
                });

                describe('when the results come back', function() {
                    var items;

                    beforeEach(function() {
                        items = [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
                        items.meta = {
                            items: {
                                start: 1,
                                end: 10,
                                total: 527
                            }
                        };

                        $rootScope.$apply(function() {
                            dbDeferred.resolve(items);
                        });
                    });

                    it('should setup the page object', function() {
                        expect(result.items.page).toEqual({
                            current: 1,
                            total: 53
                        });
                    });

                    it('should setup the selected array', function() {
                        expect(result.items.selected).toEqual([false, false, false, false, false, false, false, false, false, false]);
                    });

                    describe('if the user goes to another page', function() {
                        beforeEach(function() {
                            result.goTo(2);
                        });

                        it('should give the new scoped promise an initial value of the old results', function() {
                            expect(result.items.value).toBe(items);
                        });
                    });
                });
            });
        });
    });
});
