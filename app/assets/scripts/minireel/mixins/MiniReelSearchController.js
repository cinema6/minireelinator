define(function() {
    'use strict';

    MiniReelSearchController.$inject = ['$scope','scopePromise','cinema6'];
    function MiniReelSearchController  ( $scope , scopePromise , cinema6 ) {
        var PortalCtrl = $scope.PortalCtrl;

        this.result = null;
        this.query = '';

        this.search = function() {
            return (this.result = scopePromise(cinema6.db.findAll('experience', {
                org: PortalCtrl.model.org.id,
                text: this.query
            }))).promise;
        };
    }

    return MiniReelSearchController;
});
