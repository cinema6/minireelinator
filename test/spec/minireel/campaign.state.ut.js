define(['app'], function(appModule) {
    'use strict';

    describe('MR:Campaign state', function() {
        var c6State,
            $rootScope,
            $q,
            cinema6,
            campaign;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');

                campaign = c6State.get('MR:Campaign');
            });
        });

        afterAll(function() {
            c6State = null;
            $rootScope = null;
            $q = null;
            cinema6 = null;
            campaign = null;
        });

        it('should exist', function() {
            expect(campaign).toEqual(jasmine.any(Object));
        });

        describe('enter()', function() {
            beforeEach(function() {
                spyOn(c6State, 'goTo');

                campaign.enter();
            });

            it('should go to the MR:Campaign.General state', function() {
                expect(c6State.goTo).toHaveBeenCalledWith('MR:Campaign.General', null, null, true);
            });
        });

        describe('model()', function() {
            var model,
                success, failure;

            beforeEach(function() {
                model = {
                    id: 'cam-c3fd97889f4fb9',
                    name: '$$$',
                    minireels: [],
                    cards: [],
                    targetMiniReels: []
                };

                success = jasmine.createSpy('success()');
                failure = jasmine.createSpy('failure()');

                spyOn(cinema6.db, 'find').and.returnValue($q.when(model));

                $rootScope.$apply(function() {
                    campaign.model({ campaignId: model.id }).then(success, failure);
                });
            });

            it('should return the campaign', function() {
                expect(cinema6.db.find).toHaveBeenCalledWith('campaign', model.id);
                expect(success).toHaveBeenCalledWith(model);
            });
        });
    });
});
