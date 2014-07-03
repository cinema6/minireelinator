(function() {
    'use strict';

    define(['minireel/editor', 'minireel/app'], function(editorModule, minireelModule) {
        describe('EditCardCopyState', function() {
            var $injector,
                c6State,
                EditCardState,
                EditCardCopyState;

            beforeEach(function() {
                module(minireelModule.name);
                module(editorModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    EditCardState = c6State.get('MR:EditCard');
                    EditCardCopyState = c6State.get('MR:EditCard.Copy');
                });
            });

            it('should exist', function() {
                expect(EditCardCopyState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
