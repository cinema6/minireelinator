(function() {
    'use strict';

    define(['minireel/manager', 'app'], function(managerModule, appModule) {
        ddescribe('ManagerController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                c6State,
                scopePromise,
                EditorService,
                ConfirmDialogService,
                MiniReelService,
                ManagerCtrl,
                manager;

            var MiniReelCtrl,
                model;

            beforeEach(function() {
                module(appModule.name);
                module(managerModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    $q = $injector.get('$q');
                    scopePromise = $injector.get('scopePromise');
                    EditorService = $injector.get('EditorService');


                    MiniReelService = $injector.get('MiniReelService');
                    ConfirmDialogService = $injector.get('ConfirmDialogService');

                    c6State = $injector.get('c6State');
                    spyOn(c6State, 'goTo');

                    manager = c6State.get('MR:Manager');
                    manager.filter = 'foo';

                    model = scopePromise($q.defer().promise, [
                        {
                            status: 'active'
                        },
                        {
                            status: 'pending'
                        },
                        {
                            status: 'active'
                        },
                        {
                            status: 'pending'
                        }
                    ]);
                    model.selected = model.value.map(function() {
                        return false;
                    });

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

                    spyOn(manager, 'modelWithFilter');
                    $scope.$apply(function() {
                        ManagerCtrl = $controller('ManagerController', { $scope: $scope, cState: manager });
                        ManagerCtrl.model = model;
                    });
                    expect(ManagerCtrl.model).toBe(model);
                });

                spyOn(ConfirmDialogService, 'display');
                spyOn(ConfirmDialogService, 'close');
            });

            it('should exist', function() {
                expect(ManagerCtrl).toEqual(jasmine.any(Object));
            });

            describe('$events', function() {
                describe('$destroy', function() {
                    beforeEach(function() {
                        ManagerCtrl.filter = 'active';

                        $scope.$destroy();
                    });

                    it('should set the filter on the state', function() {
                        expect(manager.filter).toBe(ManagerCtrl.filter);
                    });
                });
            });

            describe('$watchers', function() {
                ['all', 'active', 'pending'].forEach(function(status) {
                    describe('when changed to ' + status, function() {
                        var scopedPromise;

                        beforeEach(function() {
                            scopedPromise = scopePromise($q.defer().promise);
                            manager.modelWithFilter.and.returnValue(scopedPromise);

                            $scope.$apply(function() {
                                ManagerCtrl.filter = status;
                            });
                        });

                        it('should get a new model', function() {
                            expect(manager.modelWithFilter).toHaveBeenCalledWith(status);
                            expect(ManagerCtrl.model).toBe(scopedPromise);
                        });
                    });
                });
            });

            describe('properties', function() {
                describe('filter', function() {
                    it('should be initialized as the state\'s filter', function() {
                        expect(ManagerCtrl.filter).toBe(manager.filter);
                    });
                });

                describe('allAreSelected', function() {
                    describe('getting', function() {
                        describe('if all are selected', function() {
                            beforeEach(function() {
                                model.selected = model.value.map(function() {
                                    return true;
                                });
                            });

                            it('should be true', function() {
                                expect(ManagerCtrl.allAreSelected).toBe(true);
                            });
                        });

                        describe('if all are not selected', function() {
                            beforeEach(function() {
                                model.selected = [true, true, true, false];
                            });

                            it('should be false', function() {
                                expect(ManagerCtrl.allAreSelected).toBe(false);
                            });
                        });
                    });

                    describe('setting', function() {
                        describe('to true', function() {
                            beforeEach(function() {
                                model.selected = model.value.map(function() {
                                    return false;
                                });

                                ManagerCtrl.allAreSelected = true;
                            });

                            it('should select everything', function() {
                                expect(model.selected).toEqual(model.value.map(function() {
                                    return true;
                                }));
                            });
                        });

                        describe('to false', function() {
                            beforeEach(function() {
                                model.selected = model.value.map(function() {
                                    return true;
                                });

                                ManagerCtrl.allAreSelected = false;
                            });

                            it('should select everything', function() {
                                expect(model.selected).toEqual(model.value.map(function() {
                                    return false;
                                }));
                            });
                        });
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
                                var editorMinireel;

                                beforeEach(function() {
                                    newMiniReel.id = 'e-28113695539bd2';
                                    editorMinireel = {
                                        id: 'e-aeb7b161e6b5d9'
                                    };

                                    spyOn(EditorService, 'open').and.returnValue(editorMinireel);

                                    $scope.$apply(function() {
                                        saveDeferred.resolve(newMiniReel);
                                    });
                                });

                                it('should transition to the MR:Editor state, then the MR:Settings.Mode state', function() {
                                    expect(EditorService.open).toHaveBeenCalledWith(newMiniReel);
                                    expect(c6State.goTo).toHaveBeenCalledWith('MR:Editor', [editorMinireel]);
                                    expect(c6State.goTo).toHaveBeenCalledWith('MR:Settings.Mode');
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

                            ManagerCtrl.model.value.push(
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
                            expect(ManagerCtrl.model.value).toContain(minireel);

                            $scope.$apply(function() {
                                eraseDeferred.resolve(null);
                            });

                            expect(ManagerCtrl.model.value).not.toContain(minireel);
                        });
                    });
                });

                describe('selectAll()', function() {
                    beforeEach(function() {
                        ManagerCtrl.selectAll();
                    });

                    it('should make the selected array all true', function() {
                        expect(model.selected).toEqual(model.value.map(function() {
                            return true;
                        }));
                    });
                });

                describe('selectNone()', function() {
                    beforeEach(function() {
                        model.selected = model.value.map(function() {
                            return true;
                        });

                        ManagerCtrl.selectNone();
                    });

                    it('should make the selected array all false', function() {
                        expect(model.selected).toEqual(model.value.map(function() {
                            return false;
                        }));
                    });
                });

                describe('selectAllWithStatus(status)', function() {
                    ['active', 'pending'].forEach(function(status) {
                        describe('when called with "' + status + '"', function() {
                            beforeEach(function() {
                                ManagerCtrl.selectAllWithStatus(status);
                            });

                            it('should set the selected array to an array of true/falses that correspond to the minireel statuses', function() {
                                expect(model.selected).toEqual(model.value.map(function(minireel) {
                                    return minireel.status === status;
                                }));
                            });
                        });
                    });
                });

                describe('getSelected()', function() {
                    var result;

                    beforeEach(function() {
                        model.selected = [true, true, false, true];

                        result = ManagerCtrl.getSelected();
                    });

                    it('should return an array of only the selected MiniReels', function() {
                        var minireels = model.value;

                        expect(result).toEqual([minireels[0], minireels[1], minireels[3]]);
                    });
                });

                describe('areAllSelected(status)', function() {
                    describe('if no status is provided', function() {
                        it('should return a bool indicating if all minireels are selected', function() {
                            model.selected = [true, true, false, true];
                            expect(ManagerCtrl.areAllSelected()).toBe(false);

                            model.selected = model.value.map(function() {
                                return true;
                            });
                            expect(ManagerCtrl.areAllSelected()).toBe(true);
                        });
                    });

                    describe('if a status is provided', function() {
                        beforeEach(function() {
                            model.value = [
                                {
                                    status: 'active'
                                },
                                {
                                    status: 'pending'
                                },
                                {
                                    status: 'active'
                                },
                                {
                                    status: 'pending'
                                }
                            ];
                        });

                        it('should return a bool indicating if all minireels of that type are selected', function() {
                            model.selected = [true, true, false, true];
                            expect(ManagerCtrl.areAllSelected('active')).toBe(false);

                            model.selected = [true, false, true, true];
                            expect(ManagerCtrl.areAllSelected('active')).toBe(true);
                        });
                    });
                });
            });
        });
    });
}());
