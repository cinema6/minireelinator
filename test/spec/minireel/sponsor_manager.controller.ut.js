define(['minireel/sponsor','app','minireel/mixins/MiniReelListController'], function(sponsorModule, appModule, MiniReelListController) {
    'use strict';

    describe('SponsorManagerController', function() {
        var $injector,
            $rootScope,
            $controller,
            c6State,
            sponsorManager,
            $scope,
            SponsorManagerCtrl;

        beforeEach(function() {
            module(appModule.name);
            module(sponsorModule.name);

            inject(function(_$injector_) {
                $injector = _$injector_;

                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');

                sponsorManager = c6State.get('MR:Sponsor.Manager');
                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorManagerCtrl = $controller('SponsorManagerController', {
                        $scope: $scope,
                        cState: sponsorManager
                    });
                });
            });
        });

        afterAll(function() {
            $injector = null;
            $rootScope = null;
            $controller = null;
            c6State = null;
            sponsorManager = null;
            $scope = null;
            SponsorManagerCtrl = null;
        });

        it('should exist', function() {
            expect(SponsorManagerCtrl).toEqual(jasmine.any(Object));
        });

        it('should inhert from the MiniReelListController', function() {
            var MiniReelListCtrl = $injector.instantiate(MiniReelListController, {
                $scope: $scope,
                cState: sponsorManager
            });

            Object.keys(MiniReelListCtrl).forEach(function(key, index) {
                expect(key).toEqual(Object.keys(SponsorManagerCtrl)[index]);
            });
        });

        describe('methods', function() {
            describe('brandedCardCountOf', function() {
                it('should return the number of sponsored cards in a deck', function() {
                    var minireel = {
                        data: {
                            deck: [
                                {
                                    id: 'rc-1',
                                },
                                {
                                    id: 'rc-2',
                                },
                                {
                                    id: 'rc-3',
                                },
                                {
                                    id: 'rc-4',
                                },
                                {
                                    id: 'rc-5',
                                },
                                {
                                    id: 'rc-6',
                                }
                            ]
                        }
                    };
                    expect(SponsorManagerCtrl.brandedCardCountOf(minireel)).toBe(0);

                    minireel.data.deck[2].sponsored = true;
                    expect(SponsorManagerCtrl.brandedCardCountOf(minireel)).toBe(1);

                    minireel.data.deck[4].sponsored = true;
                    expect(SponsorManagerCtrl.brandedCardCountOf(minireel)).toBe(2);
                });
            });
        });
    });
});
