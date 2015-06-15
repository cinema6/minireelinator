define( ['angular','c6_state','./campaign'],
function( angular , c6State  , campaign   ) {
    /* jshint -W106 */
    'use strict';

    return angular.module('c6.app.selfie.app', [c6State.name, campaign.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.map('Selfie:App', function() {
                this.route('/campaigns', 'Selfie:CampaignDashboard', function() {
                    this.state('Selfie:Campaigns');

                    this.route('/new', 'Selfie:NewCampaign', function() {
                        this.state('Selfie:Campaign', 'Selfie:New:Campaign');
                    });
                    this.route('/:campaignId', 'Selfie:EditCampaign', function() {
                        this.state('Selfie:Campaign', 'Selfie:Edit:Campaign');
                    });
                });
            });
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:App', ['c6State',
            function                            ( c6State ) {
                this.templateUrl = 'views/selfie/app.html';
                this.controller = 'SelfieAppController';
                this.controllerAs = 'SelfieAppCtrl';

                this.model = function() {
                    return this.cParent.cModel.selfie;
                };
                this.afterModel = function() {
                    // var user = c6State.get('Selfie').cModel;
                };
                this.enter = function() {
                    c6State.goTo('Selfie:Campaigns', null, null, true);
                };
            }]);
        }])

        .controller('SelfieAppController', [function() {}]);
});
