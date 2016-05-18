define(['app'], function(appModule) {
    'use strict';

    describe('Selfie:Containers:List State', function() {
        var $rootScope,
            $q,
            c6State,
            selfieContainers,
            selfieState,
            cinema6,
            SpinnerService;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                SpinnerService = $injector.get('SpinnerService');
            });

            selfieContainers = c6State.get('Selfie:Containers:List');
        });

        afterAll(function() {
            $rootScope = null;
            $q = null;
            c6State = null;
            selfieContainers = null;
            selfieState = null;
            cinema6 = null;
            SpinnerService = null;
        });

        it('should exist', function() {
            expect(selfieContainers).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var findDeferred;

            beforeEach(function() {
                findDeferred = $q.defer();

                spyOn(cinema6.db, 'findAll').and.returnValue(findDeferred.promise);
                spyOn(SpinnerService, 'display');
                spyOn(SpinnerService, 'close');

                selfieContainers.model();
            });

            it('should display the spinner', function() {
                expect(SpinnerService.display).toHaveBeenCalled();
            });

            it('should find all containers', function() {
                expect(cinema6.db.findAll).toHaveBeenCalledWith('container');
            });

            describe('when the containers are returned', function() {
                it('should close the spinner', function() {
                    $rootScope.$apply(function() {
                        findDeferred.resolve([]);
                    });

                    expect(SpinnerService.close).toHaveBeenCalled();
                });
            });

            describe('when the containers are not found', function() {
                it('should close the spinner', function() {
                    $rootScope.$apply(function() {
                        findDeferred.reject('BAD');
                    });

                    expect(SpinnerService.close).toHaveBeenCalled();
                });
            });
        });
    });
});
