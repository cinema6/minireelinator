define(['angular', 'minireel/services', 'minireel/mixins/PaginatedListController'], function(angular, servicesModule, PaginatedListController) {
    'use strict';

    var forEach = angular.forEach;

    describe('PaginatedListController mixin', function() {
        var $rootScope,
            $q,
            cinema6,
            paginatedDbList,
            $scope,
            PaginatedListCtrl;

        var state,
            model;

        beforeEach(function() {
            state = {
                filter: null,
                limit: 50,
                page: 1
            };

            module(servicesModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                paginatedDbList = $injector.get('paginatedDbList');

                spyOn(cinema6.db, 'findAll').and.returnValue((function() {
                    var items = [
                        {}, {}, {}, {}, {}, {}, {}
                    ];

                    items.meta = {
                        items: {
                            start: 1,
                            end: 7,
                            total: 7
                        }
                    };

                    return $q.when(items);
                }()));

                $rootScope.$apply(function() {
                    model = paginatedDbList('experience', {}, 50);
                });

                cinema6.db.findAll.calls.reset();

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    PaginatedListCtrl = $injector.instantiate(PaginatedListController, {
                        $scope: $scope,
                        cState: state
                    });
                    PaginatedListCtrl.model = model;
                });
            });
        });

        it('should exist', function() {
            expect(PaginatedListCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('filter', function() {
                it('should be initialized as the state\'s filter', function() {
                    expect(PaginatedListCtrl.filter).toBe(state.filter);
                });
            });

            describe('limit', function() {
                it('should be initialized as the state\'s limit', function() {
                    expect(PaginatedListCtrl.limit).toBe(state.limit);
                });
            });

            describe('page', function() {
                it('should be initialized as the state\'s page', function() {
                    expect(PaginatedListCtrl.page).toBe(state.page);
                });
            });

            describe('limits', function() {
                it('should be an array of the available limits', function() {
                    expect(PaginatedListCtrl.limits).toEqual([20, 50, 100]);
                });
            });

            describe('dropDowns', function() {
                it('should have a drop down object for every drop down on the page', function() {
                    expect(PaginatedListCtrl.dropDowns).toEqual({
                        select: {
                            shown: false
                        }
                    });
                });

                describe('DropDownModel() show() method', function() {
                    it('should set "shown" to true', function() {
                        forEach(PaginatedListCtrl.dropDowns, function(dropDown) {
                            dropDown.show();

                            expect(dropDown.shown).toBe(true);
                        });
                    });
                });

                describe('DropDownModel() hide() method', function() {
                    it('should set "shown" to false', function() {
                        forEach(PaginatedListCtrl.dropDowns, function(dropDown) {
                            dropDown.shown = true;

                            dropDown.hide();

                            expect(dropDown.shown).toBe(false);
                        });
                    });
                });

                describe('DropDownModel() toggle() method', function() {
                    it('should toggle the shown property', function() {
                        forEach(PaginatedListCtrl.dropDowns, function(dropDown) {
                            dropDown.toggle();
                            expect(dropDown.shown).toBe(true);

                            dropDown.toggle();
                            expect(dropDown.shown).toBe(false);
                        });
                    });
                });
            });

            describe('allAreSelected', function() {
                describe('getting', function() {
                    describe('if all are selected', function() {
                        beforeEach(function() {
                            model.selectAll();
                        });

                        it('should be true', function() {
                            expect(PaginatedListCtrl.allAreSelected).toBe(true);
                        });
                    });

                    describe('if all are not selected', function() {
                        beforeEach(function() {
                            model.selectAll();
                            model.items.selected[1] = false;
                        });

                        it('should be false', function() {
                            expect(PaginatedListCtrl.allAreSelected).toBe(false);
                        });
                    });
                });

                describe('setting', function() {
                    describe('to true', function() {
                        beforeEach(function() {
                            model.selectNone();

                            PaginatedListCtrl.allAreSelected = true;
                        });

                        it('should select everything', function() {
                            expect(model.areAllSelected()).toBe(true);
                        });
                    });

                    describe('to false', function() {
                        beforeEach(function() {
                            model.selectAll();

                            PaginatedListCtrl.allAreSelected = false;
                        });

                        it('should select nothing', function() {
                            expect(model.getSelected().length).toBe(0);
                        });
                    });
                });
            });
        });

        describe('$watchers', function() {
            describe('props that will refetch the model', function() {
                beforeEach(function() {
                    expect(cinema6.db.findAll).not.toHaveBeenCalled();

                    $scope.$apply(function() {
                        PaginatedListCtrl.page = 3;
                    });
                    cinema6.db.findAll.calls.reset();

                    spyOn(model, 'goTo').and.callThrough();
                    spyOn(model, 'update').and.callThrough();

                    model = PaginatedListCtrl.model;
                });

                describe('this.limit', function() {
                    beforeEach(function() {
                        model.goTo.calls.reset();

                        $scope.$apply(function() {
                            PaginatedListCtrl.limit = 100;
                        });
                    });

                    it('should update the model', function() {
                        expect(model.update).toHaveBeenCalledWith(model.query, 100);
                    });

                    it('should set the PaginatedListCtrl.page back to 1', function() {
                        expect(PaginatedListCtrl.page).toBe(1);
                    });

                    it('should not call goTo again', function() {
                        expect(cinema6.db.findAll.calls.count()).toBe(1);
                    });

                    describe('if set to undefined', function() {
                        beforeEach(function() {
                            model.update.calls.reset();
                            $scope.$apply(function() {
                                PaginatedListCtrl.limit = undefined;
                            });
                        });

                        it('should not update the model', function() {
                            expect(model.update).not.toHaveBeenCalled();
                        });
                    });
                });

                describe('this.page', function() {
                    var page;

                    beforeEach(function() {
                        $scope.$apply(function() {
                            page = ++PaginatedListCtrl.page;
                        });
                    });

                    it('should go to the new page', function() {
                        expect(model.goTo).toHaveBeenCalledWith(PaginatedListCtrl.page);
                    });

                    describe('if set to undefined', function() {
                        beforeEach(function() {
                            model.goTo.calls.reset();
                            $scope.$apply(function() {
                                PaginatedListCtrl.page = undefined;
                            });
                        });

                        it('should not goTo a new page', function() {
                            expect(model.goTo).not.toHaveBeenCalled();
                        });
                    });
                });
            });
        });
    });
});
