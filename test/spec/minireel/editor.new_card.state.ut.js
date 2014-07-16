(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('NewCardState', function() {
            var $injector,
                c6State,
                MiniReelService,
                NewCardState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    MiniReelService = $injector.get('MiniReelService');
                });

                NewCardState = c6State.get('MR:Editor.NewCard');
            });

            it('should exist', function() {
                expect(NewCardState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
