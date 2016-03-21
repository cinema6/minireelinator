define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Containers State', function() {
        var $rootScope,
            c6State,
            selfieContainers,
            selfieState,
            cinema6;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
            });

            selfieContainers = c6State.get('Selfie:Containers');
        });

        it('should exist', function() {
            expect(selfieContainers).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            beforeEach(function() {
                spyOn(cinema6.db, 'findAll');

                selfieContainers.model();
            });

            it('should find all containers', function() {
                expect(cinema6.db.findAll).toHaveBeenCalledWith('container');
            });
        });

        describe('enter()', function() {
            it('should go to the "Selfie:Containers:List" state', function() {
                spyOn(c6State, 'goTo');

                selfieContainers.enter();

                expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Containers:List');
            });
        });
    });
});