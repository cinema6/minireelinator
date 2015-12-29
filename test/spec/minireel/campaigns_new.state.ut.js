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
            var advertisers,
                success, failure;

            beforeEach(function() {
                advertisers: [
                    {
                        id: 'a-a057764cb53d45'
                    },
                    {
                        id: 'a-50480bdd7b3f55'
                    },
                    {
                        id: 'a-676edfc8aee43c'
                    }
                ]

                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                spyOn(cinema6.db, 'findAll').and.returnValue($q.when(advertisers));

                $rootScope.$apply(function() {
                    campaignsNew.model().then(success, failure);
                });
            });

            it('should create a new campaign', function() {
                expect(cinema6.db.create).toHaveBeenCalledWith('campaign', {
                    name: null,
                    application: 'studio',
                    categories: [],
                    minViewTime: -1,
                    advertiser: null,
                    brand: null,
                    logos: {
                        square: null
                    },
                    links: {},
                    miniReels: [],
                    cards: [],
                    staticCardMap: [],
                    miniReelGroups: [],
                    pricing: {},
                    status: 'active'
                });
            });

            it('should resolve to an object with the new campaign and categories', function() {
                expect(success).toHaveBeenCalledWith({
                    campaign: dbModel,
                    advertisers: advertisers
                });
            });
        });
    });
});
