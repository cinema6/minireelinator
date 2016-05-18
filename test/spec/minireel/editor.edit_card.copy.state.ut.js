(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('EditCardCopyState', function() {
            var $injector,
                c6State,
                EditCardState,
                EditCardCopyState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    EditCardState = c6State.get('MR:EditCard');
                    EditCardCopyState = c6State.get('MR:EditCard.Copy');
                });
            });

            afterAll(function() {
                $injector = null;
                c6State = null;
                EditCardState = null;
                EditCardCopyState = null;
            });

            it('should exist', function() {
                expect(EditCardCopyState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
