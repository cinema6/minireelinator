define(['app','minireel/sponsor'], function(appModule, sponsorModule) {
    'use strict';

    describe('SponsorMiniReelController', function() {
        var $rootScope,
            $controller,
            SettingsService,
            EditorService,
            c6State,
            $timeout,
            $q,
            sponsorMiniReel,
            $scope,
            SponsorMiniReelCtrl;

        var minireel, proxy;

        beforeEach(function() {
            minireel = {
                id: 'e-e7f70ab22ae358',
                data: {
                    sponsored: false,
                    deck: [],
                    collateral: {},
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
                c6State = $injector.get('c6State');
                $timeout = $injector.get('$timeout');
                $q = $injector.get('$q');

                spyOn(c6State, 'goTo');
                sponsorMiniReel = c6State.get('MR:SponsorMiniReel');

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
                SettingsService.register('MR::org', {
                    minireelDefaults: {
                        mode: 'lightbox-ads',
                        autoplay: true
                    }
                }, {
                    localSync: false
                });

                $rootScope.$apply(function() {
                    EditorService.open(minireel).then(function(_proxy_) {
                        proxy = _proxy_;
                    });
                });

                $scope = $rootScope.$new();
                $scope.AppCtrl = $controller('AppController', { cState: {} });
                $scope.$apply(function() {
                    SponsorMiniReelCtrl = $scope.SponsorMiniReelCtrl = $controller('SponsorMiniReelController', {
                        $scope: $scope,
                        cState: sponsorMiniReel
                    });
                    SponsorMiniReelCtrl.initWithModel(minireel);
                });
                $timeout.flush();
            });
        });

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            SettingsService = null;
            EditorService = null;
            c6State = null;
            $timeout = null;
            $q = null;
            sponsorMiniReel = null;
            $scope = null;
            SponsorMiniReelCtrl = null;
            minireel = null;
            proxy = null;
        });

        it('should exist', function() {
            expect(SponsorMiniReelCtrl).toEqual(jasmine.any(Object));
        });

        it('should set its model property to the EditorService\'s minireel', function() {
            expect(SponsorMiniReelCtrl.model).toBe(proxy);
        });

        it('should go to its first tab', function() {
            expect(c6State.goTo).toHaveBeenCalledWith(SponsorMiniReelCtrl.tabs[0].sref, null, null, true);
        });

        describe('properties', function() {
            describe('tabs', function() {
                describe('if the minireel is sponsored', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            proxy.data.sponsored = true;
                        });
                    });

                    it('should be an array of tabs for editing sponsorship settings', function() {
                        expect(SponsorMiniReelCtrl.tabs).toEqual([
                            {
                                name: 'Branding',
                                sref: 'MR:SponsorMiniReel.Branding',
                                required: true
                            },
                            {
                                name: 'Links',
                                sref: 'MR:SponsorMiniReel.Links',
                                required: true
                            },
                            {
                                name: 'Advertising',
                                sref: 'MR:SponsorMiniReel.Ads',
                                required: true
                            },
                            {
                                name: 'Tracking',
                                sref: 'MR:SponsorMiniReel.Tracking',
                                required: true
                            },
                            {
                                name: 'Cards',
                                sref: 'MR:SponsorMiniReel.Cards',
                                required: false
                            },
                            {
                                name: 'Display Ad Card',
                                sref: 'MR:SponsorMiniReel.DisplayAd',
                                required: false
                            }
                        ]);
                    });
                });

                describe('if the minireel is not sponsored', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            proxy.data.sponsored = false;
                        });
                    });

                    it('should be a single tab for sponsored cards', function() {
                        expect(SponsorMiniReelCtrl.tabs).toEqual([
                            {
                                name: 'Cards',
                                sref: 'MR:SponsorMiniReel.Cards',
                                required: false
                            }
                        ]);
                    });
                });
            });

            describe('currentTab', function() {
                function setCurrentState(state) {
                    Object.defineProperty(c6State, 'current', {
                        value: state
                    });
                }

                describe('if the reference is to a tabbed state', function() {
                    it('should be a reference to that tab', function() {
                        SponsorMiniReelCtrl.tabs.forEach(function(tab) {
                            setCurrentState(tab.sref);
                            expect(SponsorMiniReelCtrl.currentTab).toBe(tab, tab.sref);
                        });
                    });
                });

                describe('if the reference is to an untabbed state', function() {
                    it('should be null', function() {
                        ['MR:Editor', 'MR:Manager', 'Portal'].forEach(function(state) {
                            setCurrentState(state);
                            expect(SponsorMiniReelCtrl.currentTab).toBeNull(state);
                        });
                    });
                });
            });

            describe('validLogo', function() {
                describe('if logo url is undefined', function() {
                    it('should be true', function() {
                        delete SponsorMiniReelCtrl.model.data.collateral.logo;
                        expect(SponsorMiniReelCtrl.validLogo).toBe(true);
                    });
                });

                describe('if the url is valid', function() {
                    it('should be true', function() {
                        SponsorMiniReelCtrl.model.data.collateral.logo = 'http://example.com/image.png';
                        expect(SponsorMiniReelCtrl.validLogo).toBe(true);
                    });
                });

                describe('if the url is not valid', function() {
                    it('should be false', function() {
                        SponsorMiniReelCtrl.model.data.collateral.logo = 'example.com/image.png';
                        expect(SponsorMiniReelCtrl.validLogo).toBe(false);
                    });
                });
            });
        });

        describe('methods', function() {
            describe('save()', function() {
                var beforeSave;

                beforeEach(function() {
                    beforeSave = jasmine.createSpy('beforeSave()')
                        .and.callFake(function() {
                            expect(EditorService.sync).not.toHaveBeenCalled();
                        });

                    spyOn(EditorService, 'sync').and.returnValue($q.when(proxy));
                    $scope.$new().$on('SponsorMiniReelCtrl:beforeSave', beforeSave);

                    $scope.$apply(function() {
                        SponsorMiniReelCtrl.save();
                    });
                });

                it('should $emit an event', function() {
                    expect(beforeSave).toHaveBeenCalled();
                });

                it('should sync the MiniReel', function() {
                    expect(EditorService.sync).toHaveBeenCalled();
                });

                it('should go back a state', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith(sponsorMiniReel.cParent.cName);
                });
            });

            describe('enableSponsorship()', function() {
                beforeEach(function() {
                    c6State.goTo.calls.reset();

                    proxy.data.sponsored = false;
                    proxy.data.deck = [
                        {
                            sponsored: false,
                            disabled: false
                        },
                        {
                            sponsored: true,
                            disabled: false
                        },
                        {
                            sponsored: true,
                            disabled: false
                        },
                        {
                            sponsored: false,
                            disabled: false
                        }
                    ];

                    $scope.$apply(function() {
                        SponsorMiniReelCtrl.enableSponsorship();
                    });
                    $timeout.flush();
                });

                it('should set the sponsored flag to true', function() {
                    expect(proxy.data.sponsored).toBe(true);
                });

                it('should go to the first tab', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith(SponsorMiniReelCtrl.tabs[0].sref, null, null, true);
                });
            });

            describe('disableSponsorship()', function() {
                beforeEach(function() {
                    c6State.goTo.calls.reset();

                    proxy.data.sponsored = true;
                    proxy.data.deck = [
                        {
                            sponsored: false,
                            disabled: false
                        },
                        {
                            sponsored: true,
                            disabled: true
                        },
                        {
                            sponsored: true,
                            disabled: true
                        },
                        {
                            sponsored: false,
                            disabled: false
                        },
                        {
                            sponsored: false,
                            disabled: true
                        }
                    ];

                    $scope.$apply(function() {
                        SponsorMiniReelCtrl.disableSponsorship();
                    });
                    $timeout.flush();
                });

                it('should set the sponsored flag to false', function() {
                    expect(proxy.data.sponsored).toBe(false);
                });

                it('should go to the first tab', function() {
                    expect(c6State.goTo).toHaveBeenCalledWith(SponsorMiniReelCtrl.tabs[0].sref, null, null, true);
                });
            });
        });

        describe('$events', function() {
            describe('$destroy', function() {
                beforeEach(function() {
                    $scope.$broadcast('$destroy');
                });
            });
        });
    });
});
