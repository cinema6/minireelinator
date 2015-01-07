(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('NewCardController', function() {
            var $rootScope,
                $scope,
                $log,
                $q,
                $controller,
                VideoService,
                c6State,
                SettingsService,
                MiniReelService,
                EditorService,
                PortalState,
                MiniReelCtrl,
                EditorCtrl,
                NewCardCtrl;

            var model, minireel;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $log = $injector.get('$log');
                    $q = $injector.get('$q');
                    $controller = $injector.get('$controller');
                    VideoService = $injector.get('VideoService');
                    c6State = $injector.get('c6State');
                    SettingsService = $injector.get('SettingsService');
                    MiniReelService = $injector.get('MiniReelService');
                    EditorService = $injector.get('EditorService');

                    model = MiniReelService.createCard('videoBallot');

                    PortalState = c6State.get('Portal');
                    PortalState.cModel = {
                        org: {
                            id: 'o-8e8b72b9fe19d4'
                        }
                    };

                    SettingsService
                        .register('MR::org', {
                            embedTypes: ['script'],
                            minireelDefaults: {
                                mode: 'light',
                                autoplay: true,
                                splash: {
                                    ratio: '3-2',
                                    theme: 'img-text-overlay'
                                }
                            },
                            embedDefaults: {
                                size: null
                            }
                        }, { localSync: false })
                        .register('MR::user', {
                            minireelDefaults: {
                                splash: {
                                    ratio: SettingsService.getReadOnly('MR::org')
                                        .minireelDefaults.splash.ratio,
                                    theme: SettingsService.getReadOnly('MR::org')
                                        .minireelDefaults.splash.theme
                                }
                            }
                        }, { localSync: false });

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        MiniReelService.create().then(function(minireel) {
                            EditorService.open(minireel);
                        });
                    });
                    minireel = EditorService.state.minireel;

                    minireel.data.deck.unshift.apply(minireel.data.deck, ['text', 'videoBallot', 'videoBallot', 'video'].map(function(type) {
                        return MiniReelService.createCard(type);
                    }));

                    $scope.$apply(function() {
                        MiniReelCtrl = $scope.MiniReelCtrl = $controller('MiniReelController', {
                            $scope: $scope
                        });

                        EditorCtrl = $scope.EditorCtrl = $controller('EditorController', {
                            $scope: $scope,
                            $log: {
                                context: function() {
                                    return $log;
                                }
                            }
                        });
                        EditorCtrl.initWithModel({});

                        NewCardCtrl = $controller('NewCardController', { $scope: $scope, cModel: model });
                        NewCardCtrl.model = model;
                    });
                });
            });

            it('should exist', function() {
                expect(NewCardCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('type', function() {
                    describe('getting', function() {
                        it('should be whatever the model\'s type is', function() {
                            expect(NewCardCtrl.type).toBe(model.type);

                            MiniReelService.setCardType(model, 'video');
                            expect(NewCardCtrl.type).toBe(model.type);
                        });
                    });

                    describe('setting', function() {
                        beforeEach(function() {
                            spyOn(MiniReelService, 'setCardType').and.callThrough();
                        });

                        it('should set the card type', function() {
                            NewCardCtrl.type = 'text';
                            expect(MiniReelService.setCardType).toHaveBeenCalledWith(model, 'text');

                            NewCardCtrl.type = 'wildcard';
                            expect(MiniReelService.setCardType).toHaveBeenCalledWith(model, 'wildcard');
                        });
                    });
                });
            });

            describe('methods', function() {
                describe('edit()', function() {
                    var goToDeferred,
                        success, failure;

                    beforeEach(function() {
                        goToDeferred = $q.defer();

                        success = jasmine.createSpy('success()');
                        failure = jasmine.createSpy('failure()');

                        spyOn(c6State, 'goTo').and.returnValue(goToDeferred.promise);

                        NewCardCtrl.insertionIndex = 3;

                        $scope.$apply(function() {
                            NewCardCtrl.edit().then(success, failure);
                        });
                    });

                    it('should goTo the card editing state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('MR:EditCard', [model], {
                            insertAt: NewCardCtrl.insertionIndex
                        }, true);
                    });

                    describe('if the transition fails', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                goToDeferred.reject('Cannot edit this card.');
                            });
                        });

                        it('should add the card to the deck', function() {
                            expect(minireel.data.deck[3]).toBe(model);
                        });

                        it('should resolve to the card', function() {
                            expect(success).toHaveBeenCalledWith(model);
                        });
                    });

                    describe('if the transition succeeds', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                goToDeferred.resolve(c6State.get('MR:EditCard'));
                            });
                        });

                        it('should resolve to the card', function() {
                            expect(success).toHaveBeenCalledWith(model);
                        });
                    });
                });
            });
        });
    });
}());
