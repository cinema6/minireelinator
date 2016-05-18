define(['app'], function(appModule) {
    'use strict';

    describe('statusFilter()', function() {
        var statusFilter;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                statusFilter = $injector.get('statusFilter');
            });
        });

        afterAll(function() {
            statusFilter = null;
        });

        it('should exist', function() {
            expect(statusFilter).toEqual(jasmine.any(Function));
        });

        describe('when passed a supported status', function() {
            it('should return the UI value', function() {
                expect(statusFilter('draft')).toBe('Draft');
                expect(statusFilter('pending')).toBe('Pending');
                expect(statusFilter('active')).toBe('Active');
                expect(statusFilter('paused')).toBe('Paused');
                expect(statusFilter('canceled')).toBe('Canceled');
                expect(statusFilter('outOfBudget')).toBe('Out of Budget');
                expect(statusFilter('expired')).toBe('Expired');
            });
        });

        describe('when passed an unsupported status', function() {
            it('should return it with first letter capitalized', function() {
                expect(statusFilter('deleted')).toBe('Deleted');
                expect(statusFilter('bad')).toBe('Bad');
                expect(statusFilter('someNewStatus')).toBe('SomeNewStatus');
            });
        });
    });
});
