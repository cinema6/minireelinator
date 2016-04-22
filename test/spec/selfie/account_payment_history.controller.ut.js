define(['app','minireel/mixins/PaginatedListController'], function(appModule, PaginatedListController) {
    'use strict';

    describe('SelfieAccountPaymentHistoryController', function() {
        var $rootScope,
            $injector,
            $scope,
            $controller,
            $q,
            cState,
            AddFundsModalService,
            NotificationService,
            AccountPaymentHistoryCtrl;

        var model;

        beforeEach(function() {
            module(appModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;
                spyOn($injector, 'invoke').and.callThrough();
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                AddFundsModalService = $injector.get('AddFundsModalService');
                NotificationService = $injector.get('NotificationService');
            });

            model = {
                items: {
                    value: []
                },
                refresh: jasmine.createSpy('model.refresh()')
            };

            cState = {
                accounting: {
                    balance: 1000,
                    availableFunds: 500,
                    totalSpend: 300
                }
            };

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                AccountPaymentHistoryCtrl = $controller('SelfieAccountPaymentHistoryController', {
                    $scope: $scope,
                    cState: cState
                });
            });
        });

        it('should exist', function() {
            expect(AccountPaymentHistoryCtrl).toEqual(jasmine.any(Object));
        });

        it('should apply the PaginatedListState mixin', function() {
            expect($injector.invoke).toHaveBeenCalledWith(PaginatedListController, AccountPaymentHistoryCtrl, {
                $scope: $scope,
                cState: cState
            });
        });

        describe('methods', function() {
            describe('initWithModel(model)', function() {
                it('should put the model and account info on the Ctrl', function() {
                    AccountPaymentHistoryCtrl.initWithModel(model);

                    expect(AccountPaymentHistoryCtrl.model).toBe(model);
                    expect(AccountPaymentHistoryCtrl.accounting).toBe(cState.accounting);
                });
            });

            describe('addFunds()', function() {
                var addFundsDeferred;

                beforeEach(function() {
                    addFundsDeferred = $q.defer();

                    spyOn(AddFundsModalService, 'display').and.returnValue(addFundsDeferred.promise);
                    spyOn(NotificationService, 'display');

                    AccountPaymentHistoryCtrl.initWithModel(model);
                    AccountPaymentHistoryCtrl.addFunds();
                });

                it('should show the add funds modal', function() {
                    expect(AddFundsModalService.display).toHaveBeenCalled();
                });

                describe('when funds are added', function() {
                    it('should refresh the model and notify the user', function() {
                        $rootScope.$apply(function() {
                            addFundsDeferred.resolve();
                        });

                        expect(NotificationService.display).toHaveBeenCalledWith(jasmine.any(String));
                        expect(AccountPaymentHistoryCtrl.model.refresh).toHaveBeenCalled();
                    });
                });
            });
        });
    });
});