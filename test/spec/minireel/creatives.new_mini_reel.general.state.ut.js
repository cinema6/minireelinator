define(['app'], function(appModule) {
    'use strict';

    describe('MR:Creatives.NewMiniReel.General state', function() {
        var $rootScope,
            $q,
            cinema6,
            c6State,
            creativesNewMiniReelGeneral;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                c6State = $injector.get('c6State');

                creativesNewMiniReelGeneral = c6State.get('MR:Creatives.NewMiniReel.General');
            });
        });

        it('should exist', function() {
            expect(creativesNewMiniReelGeneral).toEqual(jasmine.any(Object));
        });

        describe('model', function() {
            var categories,
                success, failure;

            beforeEach(function() {
                categories = [
                    {
                        id: 'cat-279d79e6a79677',
                        name: 'Food & Drink'
                    },
                    {
                        id: 'cat-2b3c9c50a9c0c4',
                        name: 'Vehicles'
                    },
                    {
                        id: 'cat-03ebc3fa338d9e',
                        name: 'Gaming'
                    }
                ];

                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                spyOn(cinema6.db, 'findAll').and.returnValue($q.when(categories));

                $rootScope.$apply(function() {
                    creativesNewMiniReelGeneral.model().then(success, failure);
                });
            });

            it('should get all the categories', function() {
                expect(cinema6.db.findAll).toHaveBeenCalledWith('category');
            });

            it('should resolve to a model object with the categories', function() {
                expect(success).toHaveBeenCalledWith({
                    categories: categories
                });
            });
        });
    });
});
