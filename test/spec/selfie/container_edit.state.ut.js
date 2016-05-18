define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Edit:Container State', function() {
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

            selfieContainer = c6State.get('Selfie:Edit:Container');
        });

        afterAll(function() {
            $rootScope = null;
            c6State = null;
            selfieContainer = null;
            selfieState = null;
            cinema6 = null;
        });

        it('should exist', function() {
            expect(selfieContainer).toEqual(jasmine.any(Object));
        });

        describe('model(params)', function() {
            it('should create a new container', function() {
                spyOn(cinema6.db, 'find');

                selfieContainer.model({
                    id: 'con-111'
                });

                expect(cinema6.db.find).toHaveBeenCalledWith('container', 'con-111');
            });
        });
    });
});
