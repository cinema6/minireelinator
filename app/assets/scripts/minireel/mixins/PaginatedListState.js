define([], function() {
    'use strict';

    PaginatedListState.$inject = ['$location'];
    function PaginatedListState  ( $location ) {
        var query = $location.search();

        this.limit = parseInt(query.limit) || 50;
        this.page = parseInt(query.page) || 1;
        this.filter = null;

        this.queryParams = {
            limit: '=',
            page: '=',
            filter: '='
        };
    }

    return PaginatedListState;
});
