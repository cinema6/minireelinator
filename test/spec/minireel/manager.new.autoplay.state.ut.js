(function() {
    'use strict';

    define(['minireel/manager', 'minireel/app'], function(managerModule, minireelModule) {
        describe('NewAutoplayState', function() {
            var $injector,
                c6State,
                NewAutoplayState;

            beforeEach(function() {
                module(minireelModule.name);
                module(managerModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    NewAutoplayState = c6State.get('MR:New.Autoplay');
                });
            });

            it('should exist', function() {
                expect(NewAutoplayState).toEqual(jasmine.any(Object));
            });
        });
    });
}());
