define (['angular','c6_state','./mixins/PaginatedListState','./mixins/PaginatedListController'],
function( angular , c6State  , PaginatedListState          , PaginatedListController          ) {
    'use strict';

    return angular.module('c6.app.minireel.campaign', [c6State.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('MR:Campaigns', ['$injector','paginatedDbList',
            function                              ( $injector , paginatedDbList ) {
                $injector.invoke(PaginatedListState, this);

                this.templateUrl = 'views/minireel/campaigns.html';
                this.controller = 'CampaignsController';
                this.controllerAs = 'CampaignsCtrl';

                this.title = function() {
                    return 'Cinema6 Campaign Manager';
                };
                this.model = function() {
                    return paginatedDbList('campaign', {
                        sort: 'lastUpdated,-1'
                    }, this.limit, this.page).ensureResolution();
                };
            }]);
        }])

        .controller('CampaignsController', ['$injector','$scope','cState','$q',
                                            'ConfirmDialogService',
        function                           ( $injector , $scope , cState , $q ,
                                             ConfirmDialogService ) {
            var CampaignsCtrl = this;

            $injector.invoke(PaginatedListController, this, {
                cState: cState,
                $scope: $scope
            });

            this.remove = function(campaigns) {
                ConfirmDialogService.display({
                    prompt: 'Are you sure you want to delete ' + campaigns.length + ' campaign(s)?',
                    affirm: 'Delete',
                    cancel: 'Keep',

                    onCancel: function() {
                        return ConfirmDialogService.close();
                    },
                    onAffirm: function() {
                        ConfirmDialogService.close();


                        return $q.all(campaigns.map(function(campaign) {
                            return campaign.erase();
                        })).then(function() {
                            return CampaignsCtrl.model.refresh();
                        });
                    }
                });
            };
        }]);
});
