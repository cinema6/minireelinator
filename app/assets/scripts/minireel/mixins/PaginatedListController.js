define([], function() {
    'use strict';

    function nonInitializingWatchFn(fn) {
        return function(value, prevValue) {
            if (value === prevValue) { return; }

            fn.apply(null, arguments);
        };
    }

    function copyProps(props, from, to) {
        props.forEach(function(prop) {
            to[prop] = from[prop];
        });
    }

    function DropDownModel() {
        this.shown = false;
    }
    DropDownModel.prototype = {
        show: function() {
            this.shown = true;
        },
        hide: function() {
            this.shown = false;
        },
        toggle: function() {
            this.shown = !this.shown;
        }
    };

    PaginatedListController.$inject = ['$scope','cState'];
    function PaginatedListController  ( $scope , cState ) {
        var PaginatedListCtrl = this;

        function ctrlProp(prop) {
            return function() {
                return PaginatedListCtrl[prop];
            };
        }

        this.limits = [20, 50, 100];
        this.dropDowns = {
            select: new DropDownModel()
        };
        Object.defineProperties(this, {
            allAreSelected: {
                get: function() {
                    return this.model.areAllSelected();
                },
                set: function(bool) {
                    return bool ? this.model.selectAll() : this.model.selectNone();
                }
            }
        });
        copyProps(['filter', 'limit', 'page'], cState, this);

        $scope.$watch(ctrlProp('page'), nonInitializingWatchFn(function(page) {
            var model = PaginatedListCtrl.model;

            if (page === model.page) { return; }

            model.goTo(page);
        }));

        $scope.$watch(ctrlProp('limit'), nonInitializingWatchFn(function(limit) {
            var model = PaginatedListCtrl.model;

            model.update(model.query, limit);
            PaginatedListCtrl.page = 1;
        }));
    }

    return PaginatedListController;
});
