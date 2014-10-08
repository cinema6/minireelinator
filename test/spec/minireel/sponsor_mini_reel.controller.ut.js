define(['app','minireel/sponsor'], function(appModule, sponsorModule) {
    'use strict';

    describe('SponsorMiniReelController', function() {
        var $rootScope,
            $controller,
            SettingsService,
            EditorService,
            $scope,
            SponsorMiniReelCtrl;

        var minireel, proxy;

        beforeEach(function() {
            minireel = {
                id: 'e-e7f70ab22ae358',
                data: {
                    deck: [],
                    splash: {
                        ratio: '3-2',
                        theme: 'vertical-stack',
                        source: 'generated'
                    }
                }
            };

            module(appModule.name);
            module(sponsorModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                SettingsService = $injector.get('SettingsService');
                EditorService = $injector.get('EditorService');

                SettingsService.register('MR::user', {
                    minireelDefaults: {
                        splash: {
                            ratio: '3-2',
                            theme: 'vertical-stack',
                            source: 'generated'
                        }
                    }
                }, {
                    localSync: false
                });

                proxy = EditorService.open(minireel);

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorMiniReelCtrl = $controller('SponsorMiniReelController', {
                        $scope: $scope
                    });
                    SponsorMiniReelCtrl.initWithModel(minireel);
                });
            });
        });

        it('should exist', function() {
            expect(SponsorMiniReelCtrl).toEqual(jasmine.any(Object));
        });

        it('should set its model property to the EditorService\'s minireel', function() {
            expect(SponsorMiniReelCtrl.model).toBe(proxy);
        });
    });
});
