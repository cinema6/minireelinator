define(['app'], function(appModule) {
    'use strict';

    describe('MR:Sponsor.Manager state', function() {
        var $injector,
            c6State,
            $location,
            $q,
            scopePromise,
            EditorService,
            miniReel,
            sponsorManager;

        beforeEach(function() {
            module(appModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;

                c6State = $injector.get('c6State');
                $location = $injector.get('$location');
                $q = $injector.get('$q');
                scopePromise = $injector.get('scopePromise');
                EditorService = $injector.get('EditorService');
            });

            spyOn($location, 'search').and.returnValue({});

            miniReel = c6State.get('MiniReel');
            sponsorManager = c6State.get('MR:Sponsor.Manager');
        });

        afterAll(function() {
            $injector = null;
            c6State = null;
            $location = null;
            $q = null;
            scopePromise = null;
            EditorService = null;
            miniReel = null;
            sponsorManager = null;
        });

        it('should exist', function() {
            expect(sponsorManager).toEqual(jasmine.any(Object));
        });

        describe('filter', function() {
            it('should be null', function() {
                expect(sponsorManager.filter).toBeNull();
            });
        });

        describe('page', function() {
            it('should be 1', function() {
                expect(sponsorManager.page).toBe(1);
            });
        });

        describe('limit', function() {
            it('should be 50', function() {
                expect(sponsorManager.limit).toBe(50);
            });
        });

        describe('if there are query params', function() {
            beforeEach(function() {
                $location.search.and.returnValue({
                    page: '5',
                    limit: '25'
                });

                sponsorManager = $injector.instantiate(sponsorManager.constructor);
            });

            describe('page', function() {
                it('should be the value in the params', function() {
                    expect(sponsorManager.page).toBe(5);
                });
            });

            describe('limit', function() {
                it('should be the value in the params', function() {
                    expect(sponsorManager.limit).toBe(25);
                });
            });
        });

        describe('model()', function() {
            var scopedPromise,
                result;

            beforeEach(function() {
                scopedPromise = scopePromise($q.defer().promise);
                spyOn(miniReel, 'getMiniReelList').and.returnValue(scopedPromise);

                result = sponsorManager.model();
            });

            it('should call getMiniReelList() with its filter, page and limit', function() {
                expect(miniReel.getMiniReelList).toHaveBeenCalledWith(sponsorManager.filter, sponsorManager.limit, sponsorManager.page);
            });

            it('should return the fulfillment promise for a list of minireels', function() {
                expect(result).toBe(scopedPromise.ensureResolution());
            });
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(EditorService, 'close').and.callThrough();

                sponsorManager.enter();
            });

            it('should close the MiniReel', function() {
                expect(EditorService.close).toHaveBeenCalled();
            });
        });
    });
});
