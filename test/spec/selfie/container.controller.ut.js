define(['app','angular'], function(appModule, angular) {
    'use strict';

    var extend = angular.extend;

    describe('SelfieContainerController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            c6State,
            cinema6,
            ConfirmDialogService,
            selfieApp,
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
            });

            selfieApp = c6State.get('Selfie:App');
            selfieApp.cModel = {
                data: {
                    placement: {
                        params: [
                            {
                              name: 'apiRoot',
                              label: 'API Root',
                              type: 'String',
                              default: 'https://platform.reelcontent.com/',
                              editable: false
                            },
                            {
                              name: 'container',
                              label: 'Container Name',
                              type: 'String',
                              editable: false
                            },
                            {
                              name: 'branding',
                              label: 'Branding',
                              type: 'String',
                              editable: true
                            },
                            {
                              name: 'hostApp',
                              label: 'Host App',
                              type: 'String',
                              editable: true
                            },
                            {
                              name: 'network',
                              label: 'Network',
                              type: 'String',
                              editable: true
                            },
                            {
                              name: 'uuid',
                              label: 'UUID',
                              type: 'String',
                              editable: true
                            },
                            {
                              name: 'clickUrls',
                              label: 'Click Pixel',
                              type: 'Array',
                              editable: true
                            },
                            {
                              name: 'playUrls',
                              label: 'Play Pixel',
                              type: 'Array',
                              editable: true
                            },
                            {
                              name: 'prebuffer',
                              label: 'Prebuffer',
                              type: 'Boolean',
                              editable: true
                            },
                            {
                              name: 'preview',
                              label: 'Preview Mode',
                              type: 'Boolean',
                              editable: true
                            },
                            {
                              name: 'countdown',
                              label: 'Timer',
                              type: 'Number',
                              editable: true
                            },
                            {
                              name: 'orientationLock',
                              label: 'Orientation Lock',
                              type: 'String',
                              editable: true,
                              options: ['landscape','portrait']
                            }
                        ]
                    }
                }
            };

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

                it('should set the container prop to be a pojoified version of the DB model and initialize mraid and vpaid hashes', function() {
                    expect(container.pojoify).toHaveBeenCalled();

                    var _container = container.pojoify();

                    extend(_container.defaultTagParams, {
                      mraid: {},
                      vpaid: {}
                    });

                    expect(SelfieContainerCtrl.container).toEqual(_container);
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

                    describe('the MRAID object', function() {
                        describe('availableParams', function() {
                            it('should include all editable params that are not in the UI or are Arrays', function() {
                                expect(SelfieContainerCtrl.mraid.availableParams).toEqual([
                                    {
                                      name: 'branding',
                                      label: 'Branding',
                                      type: 'String',
                                      options: undefined,
                                      value: undefined
                                    },
                                    {
                                      name: 'clickUrls',
                                      label: 'Click Pixel',
                                      type: 'Array',
                                      options: undefined,
                                      value: []
                                    },
                                    {
                                      name: 'playUrls',
                                      label: 'Play Pixel',
                                      type: 'Array',
                                      options: undefined,
                                      value: []
                                    },
                                    {
                                      name: 'preview',
                                      label: 'Preview Mode',
                                      type: 'Boolean',
                                      options: undefined,
                                      value: undefined
                                    },
                                    {
                                      name: 'countdown',
                                      label: 'Timer',
                                      type: 'Number',
                                      options: undefined,
                                      value: undefined
                                    },
                                    {
                                      name: 'orientationLock',
                                      label: 'Orientation Lock',
                                      type: 'String',
                                      options: ['landscape','portrait'],
                                      value: undefined
                                    }
                                ]);
                            });
                        });

                        describe('addedParams', function() {
                            it('should include all params that were set but were not in the UI', function() {
                                expect(SelfieContainerCtrl.mraid.addedParams).toEqual([
                                    {
                                        name: 'playUrls',
                                        label: 'Play Pixel',
                                        type: 'Array',
                                        options: undefined,
                                        value: [
                                            {
                                                label: 'Play Pixel',
                                                value: '{play}'
                                            },
                                            {
                                                label: 'Play Pixel',
                                                value: '{{ON_PLAY}}'
                                            }
                                        ]
                                    },
                                    {
                                        name: 'orientationLock',
                                        label: 'Orientation Lock',
                                        type: 'String',
                                        options: ['landscape','portrait'],
                                        value: 'portrait'
                                    }
                                ]);
                            });
                        });

                        describe('defaults', function() {
                            it('should be an object containing every param in the UI plus any params that are not ediable but have defaults', function() {
                                expect(SelfieContainerCtrl.mraid.defaults).toEqual({
                                    apiRoot: {
                                        name: 'apiRoot',
                                        label: 'API Root',
                                        type: 'String',
                                        value: 'https://platform.reelcontent.com/',
                                        options: undefined
                                    },
                                    hostApp: {
                                        name: 'hostApp',
                                        label: 'Host App',
                                        type: 'String',
                                        value: '{{APP_ID}}',
                                        options: undefined
                                    },
                                    network: {
                                        name: 'network',
                                        label: 'Network',
                                        type: 'String',
                                        value: '{{NETWORK_ID}}',
                                        options: undefined
                                    },
                                    uuid: {
                                        name: 'uuid',
                                        label: 'UUID',
                                        type: 'String',
                                        value: undefined,
                                        options: undefined
                                    },
                                    prebuffer: {
                                        name: 'prebuffer',
                                        label: 'Prebuffer',
                                        type: 'Boolean',
                                        value: 'Yes',
                                        options: undefined
                                    },
                                    clickUrls: {
                                        name: 'clickUrls',
                                        label: 'Click Pixel',
                                        type: 'Array',
                                        options: undefined,
                                        value: [
                                            {
                                                label: 'Click Pixel',
                                                value: ''
                                            }
                                        ]
                                    }
                                });
                            });
                        });

                        describe('show property', function() {
                            it('should be true', function() {
                                expect(SelfieContainerCtrl.mraid.show).toBe(true);
                            });
                        });
                    });

                    describe('the VPAID object', function() {
                        describe('availableParams', function() {
                            it('should include all editable params that are not in the UI or are Arrays', function() {
                                expect(SelfieContainerCtrl.vpaid.availableParams).toEqual([
                                    {
                                      name: 'branding',
                                      label: 'Branding',
                                      type: 'String',
                                      options: undefined,
                                      value: undefined
                                    },
                                    {
                                        name: 'hostApp',
                                        label: 'Host App',
                                        type: 'String',
                                        value: undefined,
                                        options: undefined
                                    },
                                    {
                                      name: 'clickUrls',
                                      label: 'Click Pixel',
                                      type: 'Array',
                                      options: undefined,
                                      value: []
                                    },
                                    {
                                      name: 'playUrls',
                                      label: 'Play Pixel',
                                      type: 'Array',
                                      options: undefined,
                                      value: []
                                    },
                                    {
                                      name: 'prebuffer',
                                      label: 'Prebuffer',
                                      type: 'Boolean',
                                      options: undefined,
                                      value: undefined
                                    },
                                    {
                                      name: 'preview',
                                      label: 'Preview Mode',
                                      type: 'Boolean',
                                      options: undefined,
                                      value: undefined
                                    },
                                    {
                                      name: 'countdown',
                                      label: 'Timer',
                                      type: 'Number',
                                      options: undefined,
                                      value: undefined
                                    },
                                    {
                                      name: 'orientationLock',
                                      label: 'Orientation Lock',
                                      type: 'String',
                                      options: ['landscape','portrait'],
                                      value: undefined
                                    }
                                ]);
                            });
                        });

                        describe('addedParams', function() {
                            it('should include all params that were set but were not in the UI', function() {
                                expect(SelfieContainerCtrl.vpaid.addedParams).toEqual([
                                    {
                                        name: 'branding',
                                        label: 'Branding',
                                        type: 'String',
                                        options: undefined,
                                        value: 'reelcontent'
                                    },
                                    {
                                        name: 'clickUrls',
                                        label: 'Click Pixel',
                                        type: 'Array',
                                        options: undefined,
                                        value: [
                                            {
                                                label: 'Click Pixel',
                                                value: '{CLICK}'
                                            },
                                            {
                                                label: 'Click Pixel',
                                                value: '{{click_url}}'
                                            }
                                        ]
                                    },
                                ]);
                            });
                        });

                        describe('defaults', function() {
                            it('should be an object containing every param in the UI plus any params that were set', function() {
                                expect(SelfieContainerCtrl.vpaid.defaults).toEqual({
                                    apiRoot: {
                                        name: 'apiRoot',
                                        label: 'API Root',
                                        type: 'String',
                                        value: 'https://platform.reelcontent.com/',
                                        options: undefined
                                    },
                                    network: {
                                        name: 'network',
                                        label: 'Network',
                                        type: 'String',
                                        value: '{{NETWORK_ID}}',
                                        options: undefined
                                    },
                                    uuid: {
                                        name: 'uuid',
                                        label: 'UUID',
                                        type: 'String',
                                        value: undefined,
                                        options: undefined
                                    }
                                });
                            });
                        });

                        describe('show property', function() {
                            it('should be true', function() {
                                expect(SelfieContainerCtrl.vpaid.show).toBe(true);
                            });
                        });
                    });
                });

                describe('when the container has no default params set', function() {
                    beforeEach(function() {
                        SelfieContainerCtrl.initWithModel(container);
                    });

                    describe('the MRAID object', function() {
                        describe('availableParams', function() {
                            it('should include all editable params that are not in the UI or are Arrays', function() {
                                expect(SelfieContainerCtrl.mraid.availableParams).toEqual([
                                    {
                                      name: 'branding',
                                      label: 'Branding',
                                      type: 'String',
                                      options: undefined,
                                      value: undefined
                                    },
                                    {
                                      name: 'clickUrls',
                                      label: 'Click Pixel',
                                      type: 'Array',
                                      options: undefined,
                                      value: []
                                    },
                                    {
                                      name: 'playUrls',
                                      label: 'Play Pixel',
                                      type: 'Array',
                                      options: undefined,
                                      value: []
                                    },
                                    {
                                      name: 'preview',
                                      label: 'Preview Mode',
                                      type: 'Boolean',
                                      options: undefined,
                                      value: undefined
                                    },
                                    {
                                      name: 'countdown',
                                      label: 'Timer',
                                      type: 'Number',
                                      options: undefined,
                                      value: undefined
                                    },
                                    {
                                      name: 'orientationLock',
                                      label: 'Orientation Lock',
                                      type: 'String',
                                      options: ['landscape','portrait'],
                                      value: undefined
                                    }
                                ]);
                            });
                        });

                        describe('addedParams', function() {
                            it('should be an empty array', function() {
                                expect(SelfieContainerCtrl.mraid.addedParams).toEqual([]);
                            });
                        });

                        describe('defaults', function() {
                            it('should be an object containing every param in the UI or has a default value', function() {
                                expect(SelfieContainerCtrl.mraid.defaults).toEqual({
                                    apiRoot: {
                                        name: 'apiRoot',
                                        label: 'API Root',
                                        type: 'String',
                                        value: 'https://platform.reelcontent.com/',
                                        options: undefined
                                    },
                                    hostApp: {
                                        name: 'hostApp',
                                        label: 'Host App',
                                        type: 'String',
                                        value: undefined,
                                        options: undefined
                                    },
                                    network: {
                                        name: 'network',
                                        label: 'Network',
                                        type: 'String',
                                        value: undefined,
                                        options: undefined
                                    },
                                    uuid: {
                                        name: 'uuid',
                                        label: 'UUID',
                                        type: 'String',
                                        value: undefined,
                                        options: undefined
                                    },
                                    clickUrls: {
                                        name: 'clickUrls',
                                        label: 'Click Pixel',
                                        type: 'Array',
                                        options: undefined,
                                        value: [
                                            {
                                                label: 'Click Pixel',
                                                value: ''
                                            }
                                        ]
                                    },
                                    prebuffer: {
                                        name: 'prebuffer',
                                        label: 'Prebuffer',
                                        type: 'Boolean',
                                        value: undefined,
                                        options: undefined
                                    },
                                });
                            });
                        });

                        describe('show property', function() {
                            it('should be false', function() {
                                expect(SelfieContainerCtrl.mraid.show).toBe(false);
                            });
                        });
                    });

                    describe('the VPAID object', function() {
                        describe('availableParams', function() {
                            it('should include all editable params that are not in the UI or are Arrays', function() {
                                expect(SelfieContainerCtrl.vpaid.availableParams).toEqual([
                                    {
                                      name: 'branding',
                                      label: 'Branding',
                                      type: 'String',
                                      options: undefined,
                                      value: undefined
                                    },
                                    {
                                        name: 'hostApp',
                                        label: 'Host App',
                                        type: 'String',
                                        value: undefined,
                                        options: undefined
                                    },
                                    {
                                      name: 'clickUrls',
                                      label: 'Click Pixel',
                                      type: 'Array',
                                      options: undefined,
                                      value: []
                                    },
                                    {
                                      name: 'playUrls',
                                      label: 'Play Pixel',
                                      type: 'Array',
                                      options: undefined,
                                      value: []
                                    },
                                    {
                                      name: 'prebuffer',
                                      label: 'Prebuffer',
                                      type: 'Boolean',
                                      options: undefined,
                                      value: undefined
                                    },
                                    {
                                      name: 'preview',
                                      label: 'Preview Mode',
                                      type: 'Boolean',
                                      options: undefined,
                                      value: undefined
                                    },
                                    {
                                      name: 'countdown',
                                      label: 'Timer',
                                      type: 'Number',
                                      options: undefined,
                                      value: undefined
                                    },
                                    {
                                      name: 'orientationLock',
                                      label: 'Orientation Lock',
                                      type: 'String',
                                      options: ['landscape','portrait'],
                                      value: undefined
                                    }
                                ]);
                            });
                        });

                        describe('addedParams', function() {
                            it('should be an empty array', function() {
                                expect(SelfieContainerCtrl.vpaid.addedParams).toEqual([]);
                            });
                        });

                        describe('defaults', function() {
                            it('should be an object containing every param in the UI plus any params that were set', function() {
                                expect(SelfieContainerCtrl.vpaid.defaults).toEqual({
                                    apiRoot: {
                                        name: 'apiRoot',
                                        label: 'API Root',
                                        type: 'String',
                                        value: 'https://platform.reelcontent.com/',
                                        options: undefined
                                    },
                                    network: {
                                        name: 'network',
                                        label: 'Network',
                                        type: 'String',
                                        value: undefined,
                                        options: undefined
                                    },
                                    uuid: {
                                        name: 'uuid',
                                        label: 'UUID',
                                        type: 'String',
                                        value: undefined,
                                        options: undefined
                                    }
                                });
                            });
                        });

                        describe('show property', function() {
                            it('should be false', function() {
                                expect(SelfieContainerCtrl.vpaid.show).toBe(false);
                            });
                        });
                    });
                });
            });

            describe('addParam(type, param)', function() {
                beforeEach(function() {
                    SelfieContainerCtrl.initWithModel(container);
                });

                describe('when no param is passed in', function() {
                    it('should do nothing', function() {
                        SelfieContainerCtrl.addParam('mraid', undefined);

                        expect(SelfieContainerCtrl.mraid.addedParams.length).toBe(0);
                    });
                });

                describe('when the param is an array', function() {
                    var playParam;

                    beforeEach(function() {
                        playParam = SelfieContainerCtrl.mraid.availableParams.filter(function(param) {
                            return param.name === 'playUrls';
                        })[0];
                    });

                    it('should add an option to the value array', function() {
                        SelfieContainerCtrl.addParam('mraid', playParam);

                        expect(SelfieContainerCtrl.mraid.addedParams[0]).toEqual(playParam);
                        expect(SelfieContainerCtrl.mraid.addedParams[0].value[0]).toEqual({
                            label: 'Play Pixel',
                            value: undefined
                        });
                    });

                    describe('when adding another of the same kind', function() {
                        beforeEach(function() {
                            SelfieContainerCtrl.addParam('mraid', playParam);
                            SelfieContainerCtrl.addParam('mraid', playParam);
                            SelfieContainerCtrl.addParam('mraid', playParam);
                        });

                        it('should not add the param to the addedParams array more than once', function() {
                            expect(SelfieContainerCtrl.mraid.addedParams[0]).toEqual(playParam);
                            expect(SelfieContainerCtrl.mraid.addedParams.length).toBe(1);
                        });

                        it('should add an option to the value array each time', function() {
                            expect(SelfieContainerCtrl.mraid.addedParams[0].value.length).toBe(3);

                            SelfieContainerCtrl.mraid.addedParams[0].value.forEach(function(param) {
                                expect(param).toEqual({
                                    label: 'Play Pixel',
                                    value: undefined
                                });
                            });
                        });
                    });
                });

                describe('when the param is not an array', function() {
                    it('should add it to the addedParams array once', function() {
                        var brandingParam = SelfieContainerCtrl.mraid.availableParams.filter(function(param) {
                            return param.name === 'branding';
                        })[0];

                        SelfieContainerCtrl.addParam('mraid', brandingParam);

                        expect(SelfieContainerCtrl.mraid.addedParams[0]).toEqual(brandingParam);
                        expect(SelfieContainerCtrl.mraid.addedParams.length).toBe(1);

                        SelfieContainerCtrl.addParam('mraid', brandingParam);
                        SelfieContainerCtrl.addParam('mraid', brandingParam);
                        SelfieContainerCtrl.addParam('mraid', brandingParam);
                        SelfieContainerCtrl.addParam('mraid', brandingParam);

                        expect(SelfieContainerCtrl.mraid.addedParams.length).toBe(1);
                    });
                });
            });

            describe('removeParam(type, param)', function() {
                var playParam, brandingParam;

                beforeEach(function() {
                    SelfieContainerCtrl.initWithModel(container);

                    playParam = SelfieContainerCtrl.mraid.availableParams.filter(function(param) {
                        return param.name === 'playUrls';
                    })[0];

                    brandingParam = SelfieContainerCtrl.mraid.availableParams.filter(function(param) {
                        return param.name === 'branding';
                    })[0];

                    SelfieContainerCtrl.addParam('vpaid', playParam);
                    SelfieContainerCtrl.addParam('vpaid', brandingParam);
                });

                describe('when no param is passed in', function() {
                    it('should do nothing', function() {
                        SelfieContainerCtrl.removeParam('vpaid', undefined);

                        expect(SelfieContainerCtrl.vpaid.addedParams.length).toBe(2);
                    });
                });

                describe('when passing a subParam of an array param', function() {
                    describe('when another subParam remains', function() {
                        it('should remove the subParam but leave the array param in the addedParams array', function() {
                            SelfieContainerCtrl.addParam('vpaid', playParam);

                            var playPixel1 = SelfieContainerCtrl.vpaid.addedParams[0].value[0];
                            var playPixel2 = SelfieContainerCtrl.vpaid.addedParams[0].value[1];

                            expect(SelfieContainerCtrl.vpaid.addedParams[0].value.length).toBe(2);

                            SelfieContainerCtrl.removeParam('vpaid', playParam, playPixel1);

                            expect(SelfieContainerCtrl.vpaid.addedParams[0].value.length).toBe(1);
                            expect(SelfieContainerCtrl.vpaid.addedParams[0].value[0]).toBe(playPixel2);
                        });
                    });

                    describe('when there are no other subParams', function() {
                        it('should remove the subParam and remove the array param from the addedParams array', function() {
                            expect(SelfieContainerCtrl.vpaid.addedParams.length).toBe(2);
                            expect(SelfieContainerCtrl.vpaid.addedParams[0]).toBe(playParam);
                            expect(SelfieContainerCtrl.vpaid.addedParams[0].value.length).toBe(1);

                            SelfieContainerCtrl.removeParam('vpaid', playParam, SelfieContainerCtrl.vpaid.addedParams[0].value[0]);

                            expect(SelfieContainerCtrl.vpaid.addedParams.length).toBe(1);
                            expect(SelfieContainerCtrl.vpaid.addedParams[0]).toBe(brandingParam);
                            expect(playParam.value).toEqual([]);
                        });
                    });
                });

                describe('when removing a non-Array param', function() {
                    it('should remove it from the addedParams array', function() {
                        expect(SelfieContainerCtrl.vpaid.addedParams.length).toBe(2);
                        expect(SelfieContainerCtrl.vpaid.addedParams[1]).toBe(brandingParam);

                        brandingParam.value = 'mybranding';

                        SelfieContainerCtrl.removeParam('vpaid', brandingParam);

                        expect(SelfieContainerCtrl.vpaid.addedParams.length).toBe(1);
                        expect(SelfieContainerCtrl.vpaid.addedParams[0]).toBe(playParam);
                        expect(brandingParam.value).toEqual(undefined);
                    });

                    it('should reset to default value', function() {
                        brandingParam.value = 'mybranding';
                        brandingParam.default = 'reelcontent';

                        SelfieContainerCtrl.removeParam('vpaid', brandingParam);

                        expect(brandingParam.value).toEqual('reelcontent');
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

                describe('when adding params', function() {
                    beforeEach(function() {
                        SelfieContainerCtrl.initWithModel(container);

                        SelfieContainerCtrl.mraid.show = true;
                        SelfieContainerCtrl.vpaid.show = true;

                        var addedMraidParams = SelfieContainerCtrl.mraid.availableParams.reduce(function(result, param) {
                            switch (param.name) {
                            case 'clickUrls':
                                param.value = [
                                    {value: '{{click}}'},
                                    {value: '{CLICK}'}
                                ];
                                break;
                            case 'branding':
                                param.value = 'mybranding';
                                break;
                            case 'preview':
                                param.value = 'Yes';
                                break;
                            case 'orientationLock':
                                param.value = 'portrait';
                                break;
                            case 'countdown':
                                param.value = 30;
                                break;
                            }

                            result.push(param);

                            return result;
                        }, []);

                        var addedVpaidParams = SelfieContainerCtrl.vpaid.availableParams.reduce(function(result, param) {
                            switch (param.name) {
                            case 'playUrls':
                                param.value = [
                                    {value: '{{play}}'},
                                    {value: '{PLAY}'}
                                ];
                                break;
                            case 'branding':
                                param.value = 'vpaidbranding';
                                break;
                            case 'preview':
                                param.value = 'No';
                                break;
                            case 'orientationLock':
                                param.value = 'landscape';
                                break;
                            }

                            result.push(param);

                            return result;
                        }, []);

                        SelfieContainerCtrl.mraid.defaults.network.value = '{{network}}';
                        SelfieContainerCtrl.mraid.defaults.hostApp.value = '{{host}}';
                        SelfieContainerCtrl.mraid.defaults.uuid.value = '{{UUID}}';

                        SelfieContainerCtrl.vpaid.defaults.network.value = '{NETWORK}';
                        SelfieContainerCtrl.vpaid.defaults.uuid.value = '{uuid}';

                        SelfieContainerCtrl.mraid.addedParams = addedMraidParams;
                        SelfieContainerCtrl.vpaid.addedParams = addedVpaidParams;

                        SelfieContainerCtrl.save();
                    });

                    it('should set pending flag to true', function() {
                        expect(SelfieContainerCtrl.pending).toBe(true);
                    });

                    it('should add all defined params to each hash', function() {
                        expect(container.defaultTagParams.mraid).toEqual({
                            apiRoot: 'https://platform.reelcontent.com/',
                            network: '{{network}}',
                            hostApp: '{{host}}',
                            uuid: '{{UUID}}',
                            clickUrls: ['{{click}}','{CLICK}'],
                            branding: 'mybranding',
                            preview: true,
                            orientationLock: 'portrait',
                            countdown: 30
                        });

                        expect(container.defaultTagParams.vpaid).toEqual({
                            apiRoot: 'https://platform.reelcontent.com/',
                            network: '{NETWORK}',
                            uuid: '{uuid}',
                            playUrls: ['{{play}}','{PLAY}'],
                            branding: 'vpaidbranding',
                            preview: false,
                            orientationLock: 'landscape'
                        });
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

                describe('when removing params', function() {
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

                        SelfieContainerCtrl.mraid.defaults.network.value = '';
                        SelfieContainerCtrl.mraid.defaults.prebuffer.value = undefined;
                        SelfieContainerCtrl.mraid.addedParams.forEach(function(param) {
                            if (param.name === 'playUrls') {
                                param.value = [
                                    { value: '{play}' }
                                ];
                            }
                            if (param.name === 'orientationLock') {
                                param.value = undefined;
                            }
                        });

                        SelfieContainerCtrl.vpaid.defaults.network.value = '';
                        SelfieContainerCtrl.vpaid.addedParams.forEach(function(param) {
                            if (param.name === 'clickUrls') {
                                param.value = [
                                    { value: '' }
                                ];
                            }
                            if (param.name === 'branding') {
                                param.value = '';
                            }
                        });

                        SelfieContainerCtrl.save();
                    });

                    it('should set pending flag to true', function() {
                        expect(SelfieContainerCtrl.pending).toBe(true);
                    });

                    it('should remove all undefined params on each hash', function() {
                        expect(container.defaultTagParams.mraid).toEqual({
                            apiRoot: 'https://platform.reelcontent.com/',
                            hostApp: '{{APP_ID}}',
                            playUrls: ['{play}']
                        });

                        expect(container.defaultTagParams.vpaid).toEqual({
                            apiRoot: 'https://platform.reelcontent.com/'
                        });
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

                describe('when removing VPAID or MRAID option', function() {
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