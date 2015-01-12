define(['app', 'c6uilib'], function(appModule, c6uilib) {
    'use strict';

    describe('MR:Campaigns.New', function() {
        var $rootScope,
            $q,
            c6State,
            cinema6,
            campaignsNew;

        var dbModel;

        beforeEach(function() {
            module(c6uilib.name, function($provide) {
                $provide.decorator('cinema6', function($delegate) {
                    var create = $delegate.db.create;

                    spyOn($delegate.db, 'create').and.callFake(function() {
                        return (dbModel = create.apply($delegate.db, arguments));
                    });

                    return $delegate;
                });
            });

            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');

                campaignsNew = c6State.get('MR:Campaigns.New');
            });
        });

        it('should exist', function() {
            expect(campaignsNew).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var customers,
                success, failure;

            beforeEach(function() {
                customers = [
                    {
                        id: 'cus-a057764cb53d45',
                        name: 'vehicles',
                        label: 'Autos & Vehicles'
                    },
                    {
                        id: 'cus-50480bdd7b3f55',
                        name: 'education',
                        label: 'Education'
                    },
                    {
                        id: 'cus-676edfc8aee43c',
                        name: 'howto',
                        label: 'Howto & DIY'
                    }
                ];

                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                spyOn(cinema6.db, 'findAll').and.returnValue($q.when(customers));

                $rootScope.$apply(function() {
                    campaignsNew.model().then(success, failure);
                });
            });

            it('should create a new campaign', function() {
                expect(cinema6.db.create).toHaveBeenCalledWith('campaign', {
                    name: null,
                    categories: [],
                    minViewTime: -1,
                    advertiser: null,
                    customer: null,
                    logos: {
                        square: null
                    },
                    links: {},
                    miniReels: [],
                    cards: [],
                    targetMiniReels: [],
                    staticCardMap: []
                });
            });

            it('should find all the customers', function() {
                expect(cinema6.db.findAll).toHaveBeenCalledWith('customer');
            });

            it('should resolve to an object with the new campaign and categories', function() {
                expect(success).toHaveBeenCalledWith({
                    campaign: dbModel,
                    customers: customers
                });
            });
        });
    });
});
