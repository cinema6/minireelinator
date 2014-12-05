define([], function() {
    'use strict';

    PaginatedListState.$inject = ['$location'];
    function PaginatedListState  ( $location ) {
        var query = $location.search();

        this.limit = parseInt(query.limit) || 50;
        this.page = parseInt(query.page) || 1;

        this.queryParams = {
            limit: '=',
            page: '='
        };
    }

    return PaginatedListState;
});
