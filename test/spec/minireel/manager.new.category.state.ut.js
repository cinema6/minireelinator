(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('NewCategoryState', function() {
            var $injector,
                c6State,
                NewCategoryState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    NewCategoryState = c6State.get('MR:New.Category');
                });
            });

            it('should exist', function() {
                expect(NewCategoryState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
