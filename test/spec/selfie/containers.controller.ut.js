define(['app'], function(appModule) {
    'use strict';

    describe('SelfieContainersController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            SelfieContainersCtrl,
            c6State,
            c6AsyncQueue,
            ConfirmDialogService;

        var container,
            debouncedFns;

        beforeEach(function() {
            debouncedFns = [];

            module(appModule.name, ['$provide', function($provide) {
                $provide.decorator('c6AsyncQueue', function($delegate) {
                    return jasmine.createSpy('c6AsyncQueue()').and.callFake(function() {
                        var queue = $delegate.apply(this, arguments);
                        var debounce = queue.debounce;
                        spyOn(queue, 'debounce').and.callFake(function() {
                            var fn = debounce.apply(queue, arguments);
                            debouncedFns.push(fn);
                            return fn;
                        });
                        return queue;
                    });
                });
            }]);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                ConfirmDialogService = $injector.get('ConfirmDialogService');
            });

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieContainersCtrl = $controller('SelfieContainersController', {
                    $scope: $scope
                });
            });
        });

        it('should exist', function() {
            expect(SelfieContainersCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('delete(container)', function() {
                var eraseDeferred, onAffirm, onCancel, prompt;

                beforeEach(function() {
                    eraseDeferred = $q.defer();

                    container = {
                        erase: jasmine.createSpy('container.erase()').and.returnValue(eraseDeferred.promise)
                    };

                    spyOn(ConfirmDialogService, 'display');
                    spyOn(ConfirmDialogService, 'close');
                    spyOn(c6State, 'goTo');

                    SelfieContainersCtrl.delete(container);

                    onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                    onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                    prompt = ConfirmDialogService.display.calls.mostRecent().args[0].prompt;
                });

                it('should display a dialog', function() {
                    expect(ConfirmDialogService.display).toHaveBeenCalled();
                    expect(prompt).toContain('Are you sure you want to delete');
                });

                describe('onAffirm', function() {
                    beforeEach(function() {
                        onAffirm();
                    });

                    it('should be a debounced function', function() {
                        expect(debouncedFns).toContain(onAffirm);
                    });

                    it('should close the dialog', function() {
                        expect(ConfirmDialogService.close).toHaveBeenCalled();
                    });

                    it('should erase the container', function() {
                        expect(container.erase).toHaveBeenCalled();
                    });

                    describe('when the container is successfully deleted', function() {
                        it('should go to Selfie:Containers state', function() {
                            $scope.$apply(function() {
                                eraseDeferred.resolve();
                            });

                            expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Containers');
                        });
                    });

                    describe('when the delete request fails', function() {
                        it('should show an error modal', function() {
                            $scope.$apply(function() {
                                eraseDeferred.reject('Failed');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toContain('There was a problem');
                        });
                    });
                });

                describe('onCancel', function() {
                    it('should close the dialog', function() {
                        onCancel();

                        expect(ConfirmDialogService.close).toHaveBeenCalled();
                    });
                });
            });

            describe('edit(container)', function() {
                it('should go to the Selfie:Edit:Container state', function() {
                    container = {};
                    spyOn(c6State, 'goTo');

                    SelfieContainersCtrl.edit(container);

                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Edit:Container', [container], null);
                });
            });
        });
    });
});