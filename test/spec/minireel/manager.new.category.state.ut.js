(function() {
    'use strict';

    define(['minireel/manager', 'minireel/app'], function(managerModule, minireelModule) {
        describe('NewCategoryState', function() {
            var $injector,
                c6State,
                NewCategoryState;

            beforeEach(function() {
                module(minireelModule.name);
                module(managerModule.name);

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
