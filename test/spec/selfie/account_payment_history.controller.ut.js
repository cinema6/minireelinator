define(['app','minireel/mixins/PaginatedListController'], function(appModule, PaginatedListController) {
    'use strict';

    describe('SelfieAccountPaymentHistoryController', function() {
        var $rootScope,
            $injector,
            $scope,
            $controller,
            cState,
            AccountPaymentHistoryCtrl;

        var model;

        beforeEach(function() {
            module(appModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;
                spyOn($injector, 'invoke').and.callThrough();
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
            });

            model = {
                items: {
                    value: []
                }
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
        });
    });
});