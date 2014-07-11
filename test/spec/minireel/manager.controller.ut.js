(function() {
    'use strict';

    define(['minireel/manager', 'app'], function(managerModule, appModule) {
        describe('ManagerController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                c6State,
                EditorService,
                ConfirmDialogService,
                MiniReelService,
                ManagerCtrl;

            var MiniReelCtrl,
                model;

            beforeEach(function() {
                model = [];

                module(appModule.name);
                module(managerModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $q = $injector.get('$q');
                    EditorService = $injector.get('EditorService');


                    MiniReelService = $injector.get('MiniReelService');
                    ConfirmDialogService = $injector.get('ConfirmDialogService');

                    c6State = $injector.get('c6State');
                    spyOn(c6State, 'goTo');

                    $scope = $rootScope.$new();
                    MiniReelCtrl = $scope.MiniReelCtrl = {
                        model: {
                            data: {
                                /* jshint quotmark:false */
                                "modes": [
                                    {
                                        "modes": [
                                            {
                                                "name": "No Companion Ad",
                                                "value": "lightbox"
                                            },
                                            {
                                                "name": "With Companion Ad",
                                                "value": "lightbox-ads"
                                            }
                                        ]
                                    },
                                    {
                                        "modes": [
                                            {
                                                "name": "Light Text",
                                                "value": "light"
                                            },
                                            {
                                                "name": "Heavy Text",
                                                "value": "full"
                                            }
                                        ]
                                    }
                                ]
                                /* jshint quotmark:single */
                            }
                        }
                    };
                    $scope.$apply(function() {
                        ManagerCtrl = $controller('ManagerController', { $scope: $scope, cModel: model });
                        ManagerCtrl.model = model;
                    });
                });

                spyOn(ConfirmDialogService, 'display');
                spyOn(ConfirmDialogService, 'close');
            });

            it('should exist', function() {
                expect(ManagerCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('filter', function() {
                    it('should be initialized as "all"', function() {
                        expect(ManagerCtrl.filter).toBe('all');
                    });
                });
            });

            describe('methods', function() {
                function assertDialogPresented() {
                    expect(ConfirmDialogService.display).toHaveBeenCalledWith({
                        prompt: jasmine.any(String),
                        affirm: jasmine.any(String),
                        cancel: jasmine.any(String),
                        onAffirm: jasmine.any(Function),
                        onCancel: jasmine.any(Function)
                    });
                }

                function dialog() {
                    return ConfirmDialogService.display.calls.mostRecent().args[0];
                }

                describe('edit(minireel)', function() {
                    var minireel, editorMinireel;

                    beforeEach(function() {
                        minireel = {
                            id: 'e-9efb2ee320038f',
                            data: {
                                deck: []
                            }
                        };

                        editorMinireel = {
                            id: 'e-9efb2ee320038f',
                            data: {}
                        };

                        spyOn(EditorService, 'open').and.returnValue(editorMinireel);

                        ManagerCtrl.edit(minireel);
                    });

                    it('should open the MiniReel for editing', function() {
                        expect(EditorService.open).toHaveBeenCalledWith(minireel);
                    });

                    it('should go to the editor state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('MR:Editor', [editorMinireel], {});
                    });
                });

                describe('copy(minireel)', function() {
                    var minireel,
                        newMiniReel,
                        newMiniReelDeferred,
                        saveDeferred;

                    beforeEach(function() {
                        saveDeferred = $q.defer();
                        minireel = {};
                        newMiniReel = {
                            save: jasmine.createSpy('newMiniReel.save()')
                                .and.callFake(function() {
                                    return saveDeferred.promise;
                                })
                        };
                        newMiniReelDeferred = $q.defer();

                        spyOn(MiniReelService, 'create').and.returnValue(newMiniReelDeferred.promise);

                        $scope.$apply(function() {
                            ManagerCtrl.copy(minireel);
                        });
                    });

                    it('should not create a minireel', function() {
                        expect(MiniReelService.create).not.toHaveBeenCalled();
                    });

                    it('should display a confirmation dialog', assertDialogPresented);

                    describe('if the confirmation is canceled', function() {
                        beforeEach(function() {
                            dialog().onCancel();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });

                    describe('if the confirmation is affirmed', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                dialog().onAffirm();
                            });
                        });

                        it('should create a new minireel, passing in the minireelId', function() {
                            expect(MiniReelService.create).toHaveBeenCalledWith(minireel);
                        });

                        describe('after the minireel is created', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    newMiniReelDeferred.resolve(newMiniReel);
                                });
                            });

                            it('should save the minireel', function() {
                                expect(newMiniReel.save).toHaveBeenCalled();
                            });

                            describe('after the minireel is saved', function() {
                                beforeEach(function() {
                                    newMiniReel.id = 'e-28113695539bd2';
                                    $scope.$apply(function() {
                                        saveDeferred.resolve(newMiniReel);
                                    });
                                });

                                it('should transition to the MR:Editor state, then the MR:Settings.Category state', function() {
                                    expect(c6State.goTo).toHaveBeenCalledWith('MR:Editor', [newMiniReel]);
                                    expect(c6State.goTo).toHaveBeenCalledWith('MR:Settings.Category');
                                });
                            });
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });
                });

                describe('modeNameFor(minireel)', function() {
                    var minireel;

                    beforeEach(function() {
                        minireel = {
                            data: {
                                mode: 'full'
                            }
                        };
                    });

                    it('should return the name of the mode for the given minireel', function() {
                        expect(ManagerCtrl.modeNameFor(minireel)).toBe('Heavy Text');

                        minireel.data.mode = 'light';
                        expect(ManagerCtrl.modeNameFor(minireel)).toBe('Light Text');

                        minireel.data.mode = 'lightbox';
                        expect(ManagerCtrl.modeNameFor(minireel)).toBe('No Companion Ad');

                        minireel.data.mode = 'lightbox-ads';
                        expect(ManagerCtrl.modeNameFor(minireel)).toBe('With Companion Ad');
                    });
                });

                describe('makePublic(minireel)', function() {
                    var minireel;

                    beforeEach(function() {
                        minireel = {
                            id: 'e-a618062c3a1be1',
                            status: 'pending'
                        };

                        spyOn(MiniReelService, 'publish');
                        ManagerCtrl.makePublic(minireel);
                    });

                    it('should not publish the minireel', function() {
                        expect(MiniReelService.publish).not.toHaveBeenCalled();
                    });

                    it('should display a confirmation dialog', assertDialogPresented);

                    describe('if the confirmation is canceled', function() {
                        beforeEach(function() {
                            dialog().onCancel();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });

                    describe('if the confirmation is affirmed', function() {
                        beforeEach(function() {
                            dialog().onAffirm();
                        });

                        it('should publish the minireel', function() {
                            expect(MiniReelService.publish).toHaveBeenCalledWith(minireel);
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });
                });

                describe('makePrivate(minireel)', function() {
                    var minireel;

                    beforeEach(function() {
                        minireel = {
                            id: 'e-a618062c3a1be1',
                            status: 'active'
                        };

                        spyOn(MiniReelService, 'unpublish');
                        ManagerCtrl.makePrivate(minireel);
                    });

                    it('should not unpublish the minireel', function() {
                        expect(MiniReelService.unpublish).not.toHaveBeenCalled();
                    });

                    it('should display a confirmation dialog', assertDialogPresented);

                    describe('if the confirmation is canceled', function() {
                        beforeEach(function() {
                            dialog().onCancel();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });

                    describe('if the confirmation is affirmed', function() {
                        beforeEach(function() {
                            dialog().onAffirm();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });

                        it('should unpublish the minireel', function() {
                            expect(MiniReelService.unpublish).toHaveBeenCalledWith(minireel);
                        });
                    });
                });

                describe('remove(minireel)', function() {
                    var minireel;

                    beforeEach(function() {
                        minireel = {
                            id: 'e-e5c83f0c89ee1a'
                        };

                        ManagerCtrl.remove(minireel);
                    });

                    it('should display a confirmation', assertDialogPresented);

                    describe('if the confirmation is canceled', function() {
                        beforeEach(function() {
                            dialog().onCancel();
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });

                    describe('if the confirmation is affirmed', function() {
                        var eraseDeferred;

                        beforeEach(function() {
                            eraseDeferred = $q.defer();
                            spyOn(MiniReelService, 'erase').and.returnValue(eraseDeferred.promise);

                            ManagerCtrl.model.push(
                                {
                                    id: 'e-9286cac37b4cd1'
                                },
                                {
                                    id: 'e-c7be2af57c3b72'
                                },
                                minireel,
                                {
                                    id: 'e-530de8630e9990'
                                }
                            );

                            dialog().onAffirm();
                        });

                        it('should erase the provided minireel', function() {
                            expect(MiniReelService.erase).toHaveBeenCalledWith(minireel);
                        });

                        it('should close the confirmation', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });

                        it('should remove the minireel from the model array when erasing is finished', function() {
                            expect(ManagerCtrl.model).toContain(minireel);

                            $scope.$apply(function() {
                                eraseDeferred.resolve(null);
                            });

                            expect(ManagerCtrl.model).not.toContain(minireel);
                        });
                    });
                });

                describe('determineInclusionWithFilter(minireel)', function() {
                    var active, pending,
                        fn;

                    beforeEach(function() {
                        active = { status: 'active' };
                        pending = { status: 'pending' };

                        fn = ManagerCtrl.determineInclusionWithFilter;
                    });

                    describe('if the filter is "all"', function() {
                        beforeEach(function() {
                            ManagerCtrl.filter = 'all';
                        });

                        it('should always be true', function() {
                            expect(fn(active)).toBe(true);
                            expect(fn(pending)).toBe(true);
                        });
                    });

                    describe('if the filter is "active"', function() {
                        beforeEach(function() {
                            ManagerCtrl.filter = 'active';
                        });

                        it('should return true only for active minireels', function() {
                            expect(fn(active)).toBe(true);
                            expect(fn(pending)).toBe(false);
                        });
                    });

                    describe('if the filter is "pending"', function() {
                        beforeEach(function() {
                            ManagerCtrl.filter = 'pending';
                        });

                        it('should return true only for pending minireels', function() {
                            expect(fn(active)).toBe(false);
                            expect(fn(pending)).toBe(true);
                        });
                    });
                });
            });
        });
    });
}());
