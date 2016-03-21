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

        it('should exist', function() {
            expect(selfieContainer).toEqual(jasmine.any(Object));
        });

        describe('model(params)', function() {
            beforeEach(function() {
                spyOn(cinema6.db, 'find');

                selfieContainer.model({
                    id: 'con-111'
                });
            });

            it('should create a new container', function() {
                expect(cinema6.db.find).toHaveBeenCalledWith('container', 'con-111');
            });
        });

        describe('afterModel(model)', function() {
            it('should set the heading', function() {
                selfieContainer.afterModel({
                    label: 'My Ad Server'
                });

                expect(selfieContainer.heading).toEqual('My Ad Server');
            });
        });
    });
});