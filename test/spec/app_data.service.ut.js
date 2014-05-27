(function() {
    'use strict';

    define(['app'], function() {
        describe('appData', function() {
            var appData,
                $q,
                $rootScope;

            var data,
                dataDeferred;

            beforeEach(function() {
                data = {
                    experience: {
                        id: 'e-fd2974c107e8bc',
                        data: {
                            modes: [
                                {
                                    value: 'lightbox',
                                    modes: []
                                },
                                {
                                    value: 'inline',
                                    modes: []
                                }
                            ]
                        }
                    },
                    user: {
                        id: 'u-49cb2e5c7ed4e2',
                        org: {
                            id: 'o-988d0bfd139539'
                        }
                    }
                };

                module('c6.ui', function($provide) {
                    $provide.decorator('cinema6', function($delegate) {
                        spyOn($delegate, 'getAppData')
                            .and.callFake(function() {
                                return dataDeferred.promise;
                            });

                        return $delegate;
                    });
                });

                module('c6.mrmaker');

                inject(function($injector) {
                    $q = $injector.get('$q');
                    dataDeferred = $q.defer();
                    $rootScope = $injector.get('$rootScope');

                    appData = $injector.get('appData');
                });
            });

            it('should exist', function() {
                expect(appData).toEqual(jasmine.any(Object));
            });

            it('should get the app data and extend itself with that data', function() {
                $rootScope.$apply(function() {
                    dataDeferred.resolve(data);
                });

                expect(appData).toEqual(jasmine.objectContaining(data));
                expect(appData.ensureFulfillment).toEqual(jasmine.any(Function));
            });

            describe('methods', function() {
                describe('ensureFulfillment()', function() {
                    var success;

                    beforeEach(function() {
                        success = jasmine.createSpy('ensureFulfillment() success');

                        appData.ensureFulfillment().then(success);

                        $rootScope.$apply(function() {
                            dataDeferred.resolve(data);
                        });
                    });

                    it('should resolve to itself when the appData is fetched', function() {
                        expect(success).toHaveBeenCalledWith(appData);
                        expect(appData).toEqual(jasmine.objectContaining(data));
                        expect(appData.ensureFulfillment).toEqual(jasmine.any(Function));
                    });

                    it('should return the same promise every time', function() {
                        expect(appData.ensureFulfillment()).toBe(appData.ensureFulfillment());
                    });
                });
            });
        });
    });
}());
