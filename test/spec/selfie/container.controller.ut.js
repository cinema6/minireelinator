define(['app'], function(appModule) {
    'use strict';

    fdescribe('SelfieContainerController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            c6State,
            cState,
            cinema6,
            selfieApp,
            SelfieContainerCtrl;

        var container,
            saveDeferred;

        function compileCtrl(cState, model) {
            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieContainerCtrl = $controller('SelfieContainerController', {
                    cState: cState
                });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
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
                            }
                        ]
                    }
                }
            };

            cState = {
                heading: 'Add New DSP'
            };

            container = cinema6.db.create('container', {
                name: null,
                label: null,
                defaultTagParams: {
                    mraid: {},
                    vpaid: {}
                }
            });

            saveDeferred = $q.defer();

            spyOn(container, 'pojoify').and.callThrough();
            spyOn(container, 'save').and.returnValue(saveDeferred.promise);

            compileCtrl(cState);
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

                it('should set the container prop to be a pojoified version of the DB model', function() {
                    expect(container.pojoify).toHaveBeenCalled();

                    expect(SelfieContainerCtrl.container).toEqual(container.pojoify());
                });

                it('should set the hasName flag if the container has a name', function() {
                    expect(SelfieContainerCtrl.hasName).toBe(false);

                    container.name = 'beeswax';

                    SelfieContainerCtrl.initWithModel(container);

                    expect(SelfieContainerCtrl.hasName).toBe(true);
                });

                it('should set the heading to match the cState', function() {
                    expect(SelfieContainerCtrl.heading).toEqual(cState.heading);
                });

                describe('when the container has default params', function() {
                    beforeEach(function() {
                        container.label = 'Beeswax';
                        container.name = 'beeswax';
                        container.defaultTagParams.mraid = {
                            network: '{{NETWORK_ID}}',
                            hostApp: '{{APP_ID}}',
                            prebuffer: true,
                            playUrls: ['{play}','{{ON_PLAY}}']
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
                                      value: null
                                    },
                                    {
                                      name: 'clickUrls',
                                      label: 'Click Pixel',
                                      type: 'Array',
                                      value: []
                                    },
                                    {
                                      name: 'playUrls',
                                      label: 'Play Pixel',
                                      type: 'Array',
                                      value: []
                                    },
                                    {
                                      name: 'preview',
                                      label: 'Preview Mode',
                                      type: 'Boolean',
                                      value: null
                                    },
                                    {
                                      name: 'countdown',
                                      label: 'Timer',
                                      type: 'Number',
                                      value: null
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
                                    }
                                ]);
                            });
                        });

                        describe('defaults', function() {
                            it('should be an object containing every param in the UI plus any params that were set', function() {
                                expect(SelfieContainerCtrl.mraid.defaults).toEqual({
                                    apiRoot: {
                                        name: 'apiRoot',
                                        label: 'API Root',
                                        type: 'String',
                                        value: 'https://platform.reelcontent.com/'
                                    },
                                    hostApp: {
                                        name: 'hostApp',
                                        label: 'Host App',
                                        type: 'String',
                                        value: '{{APP_ID}}'
                                    },
                                    network: {
                                        name: 'network',
                                        label: 'Network',
                                        type: 'String',
                                        value: '{{NETWORK_ID}}'
                                    },
                                    uuid: {
                                        name: 'uuid',
                                        label: 'UUID',
                                        type: 'String',
                                        value: undefined
                                    },
                                    prebuffer: {
                                        name: 'prebuffer',
                                        label: 'Prebuffer',
                                        type: 'Boolean',
                                        value: 'Yes'
                                    },
                                    clickUrls: {
                                        name: 'clickUrls',
                                        label: 'Click Pixel',
                                        type: 'Array',
                                        value: [
                                            {
                                                label: 'Click Pixel',
                                                value: ''
                                            }
                                        ]
                                    },
                                    playUrls: {
                                        name: 'playUrls',
                                        label: 'Play Pixel',
                                        type: 'Array',
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
                });
            });
        });
    });
});