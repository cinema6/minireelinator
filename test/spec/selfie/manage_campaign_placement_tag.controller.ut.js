define(['app','c6_defines'], function(appModule, c6Defines) {
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

            c6Defines.kPlatformHome = 'https://platform-staging.reelcontent.com/';

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
                            },
                            showInTag: {}
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

                    it('should include params that should be shown in the embed', function() {
                        SelfieManageCampaignPlacementTagCtrl.initWithModel({
                            id: 'pl-111',
                            tagType: 'mraid',
                            tagParams: {
                                container: 'beeswax',
                                clickUrls: ['${click}', '{{CLICK}}'],
                                countdown: 30,
                                branding: 'mybrand',
                                prebuffer: true,
                                forceOrientation: 'portrait',
                                network: '${network}',
                                uuid: 'user'
                            },
                            showInTag: {
                                clickUrls: true,
                                countdown: true,
                                prebuffer: true,
                                network: true,
                                uuid: false
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
                                '                    placement: "pl-111",',
                                '                    clickUrls: ["${click}","{{CLICK}}"],',
                                '                    countdown: 30,',
                                '                    prebuffer: true,',
                                '                    network: "${network}"',
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
                            },
                            showInTag: {}
                        });

                        expect(SelfieManageCampaignPlacementTagCtrl.placement).toEqual({
                            name: 'beeswax',
                            tag: c6Defines.kPlatformHome + 'api/public/vast/2.0/tag?placement=pl-111'
                        });
                    });

                    it('should include query params for params that are set to show', function() {
                        SelfieManageCampaignPlacementTagCtrl.initWithModel({
                            id: 'pl-111',
                            tagType: 'vpaid',
                            tagParams: {
                                container: 'beeswax',
                                clickUrls: ['${click}', '{{CLICK}}'],
                                countdown: 30,
                                branding: 'mybrand',
                                prebuffer: true,
                                forceOrientation: 'portrait',
                                network: '${network}',
                                uuid: 'user'
                            },
                            showInTag: {
                                clickUrls: true,
                                countdown: true,
                                prebuffer: true,
                                network: true,
                                uuid: false
                            }
                        });

                        expect(SelfieManageCampaignPlacementTagCtrl.placement).toEqual({
                            name: 'beeswax',
                            tag: c6Defines.kPlatformHome + 'api/public/vast/2.0/tag?placement=pl-111&clickUrls=${click},{{CLICK}}&countdown=30&prebuffer=true&network=${network}'
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