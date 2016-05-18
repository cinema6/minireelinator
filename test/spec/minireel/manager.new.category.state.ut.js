(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('NewCategoryState', function() {
            var $injector,
                $rootScope,
                $q,
                cinema6,
                c6State,
                NewCategoryState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    cinema6 = $injector.get('cinema6');
                    c6State = $injector.get('c6State');
                    NewCategoryState = c6State.get('MR:New.Category');
                });
            });

            afterAll(function() {
                $injector = null;
                $rootScope = null;
                $q = null;
                cinema6 = null;
                c6State = null;
                NewCategoryState = null;
            });

            it('should exist', function() {
                expect(NewCategoryState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var categories;
                var success, failure;

                beforeEach(function() {
                    categories = [
                        { label: 'Food' },
                        { label: 'Video Games' }
                    ];

                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    spyOn(cinema6.db, 'findAll').and.returnValue($q.when(categories));

                    $rootScope.$apply(function() {
                        NewCategoryState.model().then(success, failure);
                    });
                });

                it('should resolve to the categories', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('category');
                    expect(success).toHaveBeenCalledWith(categories);
                });
            });
        });
    });
}());
