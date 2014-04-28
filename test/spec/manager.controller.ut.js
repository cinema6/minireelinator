(function() {
    'use strict';

    define(['manager'], function() {
        describe('ManagerController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                ConfirmDialogService,
                MiniReelService,
                ManagerCtrl;

            var model,
                c6State;

            beforeEach(function() {
                model = [];

                module('c6.state', function($provide) {
                    $provide.provider('c6State', function() {
                        this.$get = function() {
                            return {
                                goTo: jasmine.createSpy('c6State.transitionTo()')
                            };
                        };

                        this.state = function() { return this; };
                        this.index = function() { return this; };
                    });
                });

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    MiniReelService = $injector.get('MiniReelService');
                    ConfirmDialogService = $injector.get('ConfirmDialogService');
                    $q = $injector.get('$q');

                    c6State = $injector.get('c6State');

                    $scope = $rootScope.$new();
                    ManagerCtrl = $controller('ManagerController', { $scope: $scope, cModel: model });
                    ManagerCtrl.model = model;
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

                describe('copy(minireelId)', function() {
                    var minireel,
                        newMiniReel,
                        newMiniReelDeferred;

                    beforeEach(function() {
                        minireel = {};
                        newMiniReel = {
                            id: 'e-a48e32a8c1a87f'
                        };
                        newMiniReelDeferred = $q.defer();

                        spyOn(MiniReelService, 'open').and.returnValue($q.when(newMiniReel));
                        spyOn(MiniReelService, 'create').and.returnValue(newMiniReelDeferred.promise);

                        $scope.$apply(function() {
                            ManagerCtrl.copy('e-abc');
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
                            expect(MiniReelService.create).toHaveBeenCalledWith('e-abc');
                        });

                        describe('after the minireel is created', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    newMiniReelDeferred.resolve(newMiniReel);
                                });
                            });

                            it('should open the new minireel for editing', function() {
                                expect(MiniReelService.open).toHaveBeenCalledWith('e-a48e32a8c1a87f');
                            });

                            it('should transition to the editor.setMode.category state', function() {
                                expect(c6State.goTo).toHaveBeenCalledWith('editor.setMode.category', { minireelId: newMiniReel.id });
                            });
                        });

                        it('should close the dialog', function() {
                            expect(ConfirmDialogService.close).toHaveBeenCalled();
                        });
                    });

                });

                describe('edit(minireel)', function() {
                    beforeEach(function() {
                        ManagerCtrl.edit({ id: 'e-59c8519cc4c54f' });
                    });

                    it('should transition to the "editor" state and provide the id of the minireel', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('editor', { minireelId: 'e-59c8519cc4c54f' });
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
                            expect(MiniReelService.publish).toHaveBeenCalledWith(minireel.id);
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
                            expect(MiniReelService.unpublish).toHaveBeenCalledWith(minireel.id);
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
                            expect(MiniReelService.erase).toHaveBeenCalledWith(minireel.id);
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
