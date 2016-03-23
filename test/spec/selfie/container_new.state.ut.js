define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:New:Container State', function() {
        var $rootScope,
            c6State,
            selfieContainer,
            selfieState,
            cinema6;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
            });

            selfieContainer = c6State.get('Selfie:New:Container');
        });

        it('should exist', function() {
            expect(selfieContainer).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            it('should create a new container', function() {
                spyOn(cinema6.db, 'create');

                selfieContainer.model();

                expect(cinema6.db.create).toHaveBeenCalledWith('container', {
                    name: null,
                    label: null,
                    defaultTagParams: {}
                });
            });
        });
    });
});