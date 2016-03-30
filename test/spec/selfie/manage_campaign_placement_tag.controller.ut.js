define(['app'], function(appModule) {
    'use strict';

    describe('SelfieManageCampaignPlacementTagController', function() {
        var $rootScope,
            $scope,
            $controller,
            c6State,
            SelfieManageCampaignPlacementTagCtrl;

        var placement;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');
            });

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieManageCampaignPlacementTagCtrl = $controller('SelfieManageCampaignPlacementTagController', {
                    $scope: $scope
                });
            });
        });

        it('should exist', function() {
            expect(SelfieManageCampaignPlacementTagCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('initWithModel(model)', function() {
                describe('when placement type is MRAID', function() {
                    it('should set up the placement tag model', function() {
                        SelfieManageCampaignPlacementTagCtrl.initWithModel({
                            id: 'pl-111',
                            tagType: 'mraid',
                            tagParams: {
                                container: 'beeswax'
                            }
                        });

                        expect(SelfieManageCampaignPlacementTagCtrl.placement).toEqual({
                            name: 'beeswax',
                            tag: [
                                '<div>',
                                '    <script>',
                                '        (function() {',
                                '            var script = document.createElement("script");',
                                '            script.src = "https://lib.reelcontent.com/c6embed/v1/c6mraid.min.js";',
                                '            script.onload = function onload() {',
                                '                window.c6mraid({',
                                '                    placement: "pl-111"',
                                '                }).done();',
                                '            };',
                                '            document.head.appendChild(script);',
                                '        }());',
                                '    </script>',
                                '</div>'
                            ].join('\n')
                        });
                    });
                });

                describe('when placement type is VPAID', function() {
                    it('should set up the placement tag model', function() {
                        SelfieManageCampaignPlacementTagCtrl.initWithModel({
                            id: 'pl-111',
                            tagType: 'vpaid',
                            tagParams: {
                                container: 'beeswax'
                            }
                        });

                        expect(SelfieManageCampaignPlacementTagCtrl.placement).toEqual({
                            name: 'beeswax',
                            tag: 'https://platform.reelcontent.com/api/public/vast/2.0/tag?placement=pl-111'
                        });
                    });
                });
            });

            describe('close()', function() {
                it('should go to Selfie:Manage:Campaign:Placements state', function() {
                    spyOn(c6State, 'goTo');

                    SelfieManageCampaignPlacementTagCtrl.close();

                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Manage:Campaign:Placements');
                });
            });
        });
    });
});