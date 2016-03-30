define(['app'], function(appModule) {
    'use strict';

    describe('SelfieContainerController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            c6State,
            cinema6,
            ConfirmDialogService,
            PlacementService,
            SelfieContainerCtrl;

        var container,
            saveDeferred,
            debouncedFns;

        function compileCtrl() {
            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieContainerCtrl = $controller('SelfieContainerController', {
                    $scope: $scope
                });
            });
        }

        beforeEach(function() {
            debouncedFns = [];

            module(appModule.name, ['$provide', function($provide) {
                $provide.decorator('c6AsyncQueue', function($delegate) {
                    return jasmine.createSpy('c6AsyncQueue()').and.callFake(function() {
                        var queue = $delegate.apply(this, arguments);
                        var debounce = queue.debounce;
                        spyOn(queue, 'debounce').and.callFake(function() {
                            var fn = debounce.apply(queue, arguments);
                            debouncedFns.push(fn);
                            return fn;
                        });
                        return queue;
                    });
                });
            }]);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                ConfirmDialogService = $injector.get('ConfirmDialogService');
                PlacementService = $injector.get('PlacementService');
            });

            container = cinema6.db.create('container', {
                name: null,
                label: null,
                defaultTagParams: {}
            });

            saveDeferred = $q.defer();

            spyOn(container, 'pojoify').and.callThrough();
            spyOn(container, 'save').and.returnValue(saveDeferred.promise);
            spyOn(c6State, 'goTo');
            spyOn(ConfirmDialogService, 'display');
            spyOn(ConfirmDialogService, 'close');
            spyOn(PlacementService, 'generateParamsModel').and.returnValue({
                params: {}
            });
            spyOn(PlacementService, 'convertForSave').and.returnValue({});

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieContainerCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('initWithModel(model)', function() {
                beforeEach(function() {
                    SelfieContainerCtrl.initWithModel(container);
                });

                it('should set the _container prop to be the DB model', function() {
                    expect(SelfieContainerCtrl._container).toBe(container);
                });

                it('should set the hasName flag if the container has a name', function() {
                    expect(SelfieContainerCtrl.hasName).toBe(false);

                    container.name = 'beeswax';

                    SelfieContainerCtrl.initWithModel(container);

                    expect(SelfieContainerCtrl.hasName).toBe(true);
                });

                it('should set validName flag to true', function() {
                  expect(SelfieContainerCtrl.validName).toBe(true);
                });

                describe('when the container has default params', function() {
                    beforeEach(function() {
                        container.label = 'Beeswax';
                        container.name = 'beeswax';
                        container.defaultTagParams.mraid = {
                            network: '{{NETWORK_ID}}',
                            hostApp: '{{APP_ID}}',
                            prebuffer: true,
                            playUrls: ['{play}','{{ON_PLAY}}'],
                            orientationLock: 'portrait'
                        };
                        container.defaultTagParams.vpaid = {
                            network: '{{NETWORK_ID}}',
                            clickUrls: ['{CLICK}','{{click_url}}'],
                            branding: 'reelcontent'
                        };

                        SelfieContainerCtrl.initWithModel(container);
                    });

                    it('should generate params model via PlacementService', function() {
                        expect(PlacementService.generateParamsModel).toHaveBeenCalledWith(
                            container.defaultTagParams.mraid,
                            ['network','uuid','hostApp','prebuffer','clickUrls']
                        );

                        expect(PlacementService.generateParamsModel).toHaveBeenCalledWith(
                            container.defaultTagParams.vpaid,
                            ['network','uuid']
                        );
                    });
                });

                describe('when the container has no default params set', function() {
                    beforeEach(function() {
                        SelfieContainerCtrl.initWithModel(container);
                    });

                    it('should generate params model via PlacementService', function() {
                        expect(PlacementService.generateParamsModel).toHaveBeenCalledWith(
                            undefined,
                            ['network','uuid','hostApp','prebuffer','clickUrls']
                        );

                        expect(PlacementService.generateParamsModel).toHaveBeenCalledWith(
                            undefined,
                            ['network','uuid']
                        );
                    });
                });
            });

            describe('validateName(name)', function() {
                var findDeferred;

                beforeEach(function() {
                    findDeferred = $q.defer();

                    spyOn(cinema6.db, 'findAll').and.returnValue(findDeferred.promise);

                    SelfieContainerCtrl.initWithModel(container);
                });

                describe('when name is undefined', function() {
                    it('should do nothing', function() {
                        SelfieContainerCtrl.validateName(undefined);

                        expect(cinema6.db.findAll).not.toHaveBeenCalled();
                        expect(SelfieContainerCtrl.validName).toBe(true);
                    });
                });

                describe('when name contains invalid characters', function() {
                    it('should set validName to false and should not call cinema6.db', function() {
                        SelfieContainerCtrl.validateName('bees wax');

                        expect(cinema6.db.findAll).not.toHaveBeenCalled();
                        expect(SelfieContainerCtrl.validName).toBe(false);
                    });
                });

                describe('when name is valid', function() {
                    beforeEach(function() {
                        SelfieContainerCtrl.validateName('beeswax');
                    });

                    it('should call cinema6.db to see if the container name already exists', function() {
                        expect(cinema6.db.findAll).toHaveBeenCalledWith('container', {name: 'beeswax'});
                        expect(SelfieContainerCtrl.validName).toBe(true);
                    });

                    describe('when response has containers', function() {
                        it('should set validName to false', function() {
                            $scope.$apply(function() {
                                findDeferred.resolve([
                                    {
                                        name: 'beeswax'
                                    }
                                ]);
                            });

                            expect(SelfieContainerCtrl.validName).toBe(false);
                        });
                    });

                    describe('when response has no containers', function() {
                        it('should set validName to true', function() {
                            $scope.$apply(function() {
                                findDeferred.resolve([]);
                            });

                            expect(SelfieContainerCtrl.validName).toBe(true);
                        });
                    });
                });
            });

            describe('delete(container)', function() {
                var eraseDeferred, onAffirm, onCancel, prompt;

                beforeEach(function() {
                    eraseDeferred = $q.defer();

                    spyOn(container, 'erase').and.returnValue(eraseDeferred.promise)

                    SelfieContainerCtrl.delete(container);

                    onAffirm = ConfirmDialogService.display.calls.mostRecent().args[0].onAffirm;
                    onCancel = ConfirmDialogService.display.calls.mostRecent().args[0].onCancel;
                    prompt = ConfirmDialogService.display.calls.mostRecent().args[0].prompt;
                });

                it('should display a dialog', function() {
                    expect(ConfirmDialogService.display).toHaveBeenCalled();
                    expect(prompt).toContain('Are you sure you want to delete');
                });

                describe('onAffirm', function() {
                    beforeEach(function() {
                        onAffirm();
                    });

                    it('should be a debounced function', function() {
                        expect(debouncedFns).toContain(onAffirm);
                    });

                    it('should close the dialog', function() {
                        expect(ConfirmDialogService.close).toHaveBeenCalled();
                    });

                    it('should erase the container', function() {
                        expect(container.erase).toHaveBeenCalled();
                    });

                    describe('when the container is successfully deleted', function() {
                        it('should go to Selfie:Containers state', function() {
                            $scope.$apply(function() {
                                eraseDeferred.resolve();
                            });

                            expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Containers');
                        });
                    });

                    describe('when the delete request fails', function() {
                        it('should show an error modal', function() {
                            $scope.$apply(function() {
                                eraseDeferred.reject('Failed');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toContain('There was a problem');
                        });
                    });
                });

                describe('onCancel', function() {
                    it('should close the dialog', function() {
                        onCancel();

                        expect(ConfirmDialogService.close).toHaveBeenCalled();
                    });
                });
            });

            describe('save()', function() {
                it('should be a debounced function', function() {
                    expect(debouncedFns).toContain(SelfieContainerCtrl.save);
                });

                describe('when adding params MRAID and VPAID defaults', function() {
                    beforeEach(function() {
                        SelfieContainerCtrl.initWithModel(container);

                        SelfieContainerCtrl.mraid.show = true;
                        SelfieContainerCtrl.vpaid.show = true;

                        SelfieContainerCtrl.save();
                    });

                    it('should set the defaultTagParams for MRAID and VPAID', function() {
                        expect(PlacementService.convertForSave).toHaveBeenCalledWith(SelfieContainerCtrl.mraid.params);
                        expect(PlacementService.convertForSave).toHaveBeenCalledWith(SelfieContainerCtrl.vpaid.params);

                        expect(container.defaultTagParams.mraid).toEqual({});
                        expect(container.defaultTagParams.vpaid).toEqual({});
                    });

                    it('should set pending flag to true', function() {
                        expect(SelfieContainerCtrl.pending).toBe(true);
                    });

                    it('should save the container model', function() {
                        expect(container.save).toHaveBeenCalled();
                    });

                    describe('when save succeeds', function() {
                        it('should go to the Selfie:Containers state', function() {
                            $scope.$apply(function() {
                                saveDeferred.resolve();
                            });

                            expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Containers', null, null);
                            expect(SelfieContainerCtrl.pending).toBe(false);
                        });
                    });

                    describe('when save fails', function() {
                        it('should show an error modal', function() {
                            $scope.$apply(function() {
                                saveDeferred.reject('BAD');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toContain('There was a problem');
                            expect(c6State.goTo).not.toHaveBeenCalledWith('Selfie:Containers', null, null);
                            expect(SelfieContainerCtrl.pending).toBe(false);
                        });
                    });
                });

                describe('when removing VPAID or MRAID defaults', function() {
                    beforeEach(function() {
                        container.label = 'Beeswax';
                        container.name = 'beeswax';
                        container.defaultTagParams.mraid = {
                            network: '{{NETWORK_ID}}',
                            hostApp: '{{APP_ID}}',
                            prebuffer: true,
                            playUrls: ['{play}','{{ON_PLAY}}'],
                            orientationLock: 'portrait'
                        };
                        container.defaultTagParams.vpaid = {
                            network: '{{NETWORK_ID}}',
                            clickUrls: ['{CLICK}','{{click_url}}'],
                            branding: 'reelcontent'
                        };

                        SelfieContainerCtrl.initWithModel(container);

                        SelfieContainerCtrl.mraid.show = false;
                        SelfieContainerCtrl.vpaid.show = false;

                        SelfieContainerCtrl.save();
                    });

                    it('should set pending flag to true', function() {
                        expect(SelfieContainerCtrl.pending).toBe(true);
                    });

                    it('should remove all undefined params on each hash', function() {
                        expect(container.defaultTagParams.mraid).toBe(undefined);
                        expect(container.defaultTagParams.vpaid).toBe(undefined);
                    });

                    it('should save the container model', function() {
                        expect(container.save).toHaveBeenCalled();
                    });

                    describe('when save succeeds', function() {
                        it('should go to the Selfie:Containers state', function() {
                            $scope.$apply(function() {
                                saveDeferred.resolve();
                            });

                            expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Containers', null, null);
                            expect(SelfieContainerCtrl.pending).toBe(false);
                        });
                    });

                    describe('when save fails', function() {
                        it('should show an error modal', function() {
                            $scope.$apply(function() {
                                saveDeferred.reject('BAD');
                            });

                            expect(ConfirmDialogService.display).toHaveBeenCalled();
                            expect(ConfirmDialogService.display.calls.mostRecent().args[0].prompt).toContain('There was a problem');
                            expect(c6State.goTo).not.toHaveBeenCalledWith('Selfie:Containers', null, null);
                            expect(SelfieContainerCtrl.pending).toBe(false);
                        });
                    });
                });
            });
        });
    });
});