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
            beforeEach(function() {
                spyOn(cinema6.db, 'create');

                selfieContainer.model();
            });

            it('should create a new container', function() {
                expect(cinema6.db.create).toHaveBeenCalledWith('container', {
                    name: null,
                    label: null,
                    defaultTagParams: {
                        mraid: {},
                        vpaid: {}
                    }
                });
            });
        });

        describe('afterModel()', function() {
            it('should set the heading', function() {
                selfieContainer.afterModel();

                expect(selfieContainer.heading).toEqual('Add New DSP');
            });
        });
    });
});