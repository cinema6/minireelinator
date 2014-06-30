(function() {
    'use strict';

    define(['app'], function() {
        describe('Application State', function() {
            var c6State,
                appData,
                $q,
                cinema6,
                application;

            var promise;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function($injector) {
                    c6State = $injector.get('c6State');
                    appData = $injector.get('appData');
                    cinema6 = $injector.get('cinema6');
                    $q = $injector.get('$q');
                });

                promise = $q.defer().promise;
                spyOn(appData, 'ensureFulfillment').and.returnValue(promise);
                spyOn(cinema6, 'init');

                application = c6State.get('Application');
            });

            describe('beforeModel()', function() {
                var result;

                beforeEach(function() {
                    result = application.beforeModel();
                });

                it('should call cinema6.init()', function() {
                    expect(cinema6.init).toHaveBeenCalled();
                });

                it('should return the promise that will ensure appData fulfillment', function() {
                    expect(result).toBe(promise);
                });
            });
        });
    });
}());
