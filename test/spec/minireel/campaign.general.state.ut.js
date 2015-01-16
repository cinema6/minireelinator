define(['app'], function(appModule) {
    'use strict';

    describe('MR:Campaign.General state', function() {
        var c6State,
            $rootScope,
            $q,
            cinema6,
            campaignGeneral;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');

                campaignGeneral = c6State.get('MR:Campaign.General');
            });
        });

        it('should exist', function() {
            expect(campaignGeneral).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var categories,
                success, failure;

            beforeEach(function() {
                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                categories = [
                    { id: 'cat-f76587804b7274' },
                    { id: 'cat-b5ee282b44a5b6' },
                    { id: 'cat-92875c565e3c9b' }
                ];

                spyOn(cinema6.db, 'findAll').and.returnValue($q.when(categories));

                $rootScope.$apply(function() {
                    campaignGeneral.model().then(success, failure);
                });
            });

            it('should return the categories', function() {
                expect(cinema6.db.findAll).toHaveBeenCalledWith('category');
                expect(success).toHaveBeenCalledWith(categories);
            });
        });
    });
});
