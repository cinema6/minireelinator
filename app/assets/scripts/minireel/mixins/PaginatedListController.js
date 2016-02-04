define(['angular'],
function(angular ) {
    'use strict';

    var isUndefined = angular.isUndefined;

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
        copyProps(['filter','filterBy','limit','page','sort','search','excludeOrgs'], cState, this);

        $scope.$watch(ctrlProp('page'), nonInitializingWatchFn(function(page) {
            var model = PaginatedListCtrl.model;

            if (page === model.page || isUndefined(page)) { return; }

            model.goTo(page);
        }));

        $scope.$watch(ctrlProp('limit'), nonInitializingWatchFn(function(limit) {
            var model = PaginatedListCtrl.model;

            if (isUndefined(limit)) { return; }

            model.update(model.query, limit);
            PaginatedListCtrl.page = 1;
        }));

        $scope.$watch(ctrlProp('filter'), nonInitializingWatchFn(function(filter) {
            var model = PaginatedListCtrl.model;

            if (filter === model.query.filter || isUndefined(filter)) { return; }

            model.query[PaginatedListCtrl.filterBy] = filter;

            model.update(model.query, model.limit);
            PaginatedListCtrl.page = 1;
        }));

        $scope.$watch(ctrlProp('filterBy'), nonInitializingWatchFn(function(filterBy, oldFilterBy) {
            var model = PaginatedListCtrl.model;

            if (filterBy === model.query.filterBy || isUndefined(filterBy)) { return; }

            model.query[filterBy] = PaginatedListCtrl.filter;
            delete model.query[oldFilterBy];

            model.update(model.query, model.limit);
            PaginatedListCtrl.page = 1;
        }));

        $scope.$watch(ctrlProp('sort'), nonInitializingWatchFn(function(sort) {
            var model = PaginatedListCtrl.model;

            if (sort === model.query.sort || isUndefined(sort)) { return; }

            model.query.sort = sort;

            model.update(model.query, model.limit);
            PaginatedListCtrl.page = 1;
        }));

        $scope.$watch(ctrlProp('search'), nonInitializingWatchFn(function(search) {
            var model = PaginatedListCtrl.model;

            if (search === model.query.text) { return; }

            if (!search) {
                delete model.query.text;
            } else {
                model.query.text = search;
            }

            model.update(model.query, model.limit);
            PaginatedListCtrl.page = 1;
        }));

        $scope.$watch(ctrlProp('excludeOrgs'), nonInitializingWatchFn(function(exclusion) {
            var model = PaginatedListCtrl.model;

            if (exclusion === model.query.excludeOrgs) { return; }

            model.query.excludeOrgs = exclusion || null;

            model.update(model.query, model.limit);
            PaginatedListCtrl.page = 1;
        }));
    }

    return PaginatedListController;
});
