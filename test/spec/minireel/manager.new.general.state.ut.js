(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('NewGeneralState', function() {
            var $injector,
                c6State,
                NewGeneralState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    NewGeneralState = c6State.get('MR:New.General');
                });
            });

            afterAll(function() {
                $injector = null;
                c6State = null;
                NewGeneralState = null;
            });

            it('should exist', function() {
                expect(NewGeneralState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
