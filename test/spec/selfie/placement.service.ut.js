define(['app'], function(appModule) {
    'use strict';

    describe('PlacementService', function() {
        var c6State,
            PlacementService;

        var selfieApp,
            paramModel;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
                PlacementService = $injector.get('PlacementService');
            });

            paramModel = [
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
                  default: '{{HOST}}',
                  editable: true
                },
                {
                  name: 'clickUrls',
                  label: 'Click Pixel',
                  type: 'Array',
                  default: ['{{CLICK}}'],
                  editable: true
                },
                {
                  name: 'playUrls',
                  label: 'Play Pixel',
                  type: 'Array',
                  editable: true
                },
                {
                  name: 'launchUrls',
                  label: 'Launch Pixel',
                  type: 'Array',
                  default: ['{{LAUNCH}}'],
                  editable: false
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
                  default: true,
                  editable: false
                },
                {
                  name: 'countdown',
                  label: 'Timer',
                  type: 'Number',
                  editable: true
                },
                {
                  name: 'forceOrientation',
                  label: 'Orientation Lock',
                  type: 'String',
                  editable: true,
                  options: ['landscape','portrait']
                }
            ];

            selfieApp = c6State.get('Selfie:App');
            selfieApp.cModel = {
                data: {
                    placement: {
                        params: paramModel
                    }
                }
            };
        });

        afterAll(function() {
            c6State = null;
            PlacementService = null;
            selfieApp = null;
            paramModel = null;
        });

        it('should exist', function() {
            expect(PlacementService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('convertForUI(model)', function() {
                describe('when model has no values', function() {
                    it('should return an array of params based on default values form the app data', function() {
                        var result = PlacementService.convertForUI({});

                        expect(result).toEqual([
                            {
                              name: 'apiRoot',
                              label: 'API Root',
                              type: 'String',
                              default: 'https://platform.reelcontent.com/',
                              editable: false,
                              value: 'https://platform.reelcontent.com/'
                            },
                            {
                              name: 'container',
                              label: 'Container Name',
                              type: 'String',
                              editable: false,
                              value: undefined
                            },
                            {
                              name: 'branding',
                              label: 'Branding',
                              type: 'String',
                              editable: true,
                              value: undefined
                            },
                            {
                              name: 'hostApp',
                              label: 'Host App',
                              type: 'String',
                              default: '{{HOST}}',
                              editable: true,
                              value: '{{HOST}}'
                            },
                            {
                              name: 'clickUrls',
                              label: 'Click Pixel',
                              type: 'Array',
                              default: ['{{CLICK}}'],
                              editable: true,
                              value: [
                                {
                                    label: 'Click Pixel',
                                    value: '{{CLICK}}'
                                }
                              ]
                            },
                            {
                              name: 'playUrls',
                              label: 'Play Pixel',
                              type: 'Array',
                              editable: true,
                              value: []
                            },
                            {
                              name: 'launchUrls',
                              label: 'Launch Pixel',
                              type: 'Array',
                              default: ['{{LAUNCH}}'],
                              editable: false,
                              value: [
                                {
                                    label: 'Launch Pixel',
                                    value: '{{LAUNCH}}'
                                }
                              ]
                            },
                            {
                              name: 'prebuffer',
                              label: 'Prebuffer',
                              type: 'Boolean',
                              editable: true,
                              value: undefined
                            },
                            {
                              name: 'preview',
                              label: 'Preview Mode',
                              type: 'Boolean',
                              default: true,
                              editable: false,
                              value: 'Yes'
                            },
                            {
                              name: 'countdown',
                              label: 'Timer',
                              type: 'Number',
                              editable: true,
                              value: undefined
                            },
                            {
                              name: 'forceOrientation',
                              label: 'Orientation Lock',
                              type: 'String',
                              editable: true,
                              options: ['landscape','portrait'],
                              value: undefined
                            }
                        ]);
                    });
                });

                describe('when model contains values', function() {
                    it('should return an array of params with values based on model', function() {
                        var result = PlacementService.convertForUI({
                            container: 'beeswax',
                            branding: 'mybrand',
                            hostApp: '${app_id}',
                            clickUrls: ['${click_url}','${click}'],
                            playUrls: ['${play_url}','${play}'],
                            prebuffer: true,
                            preview: false,
                            forceOrientation: 'portrait',
                            countdown: 30
                        });

                        expect(result).toEqual([
                            {
                              name: 'apiRoot',
                              label: 'API Root',
                              type: 'String',
                              default: 'https://platform.reelcontent.com/',
                              editable: false,
                              value: 'https://platform.reelcontent.com/'
                            },
                            {
                              name: 'container',
                              label: 'Container Name',
                              type: 'String',
                              editable: false,
                              value: 'beeswax'
                            },
                            {
                              name: 'branding',
                              label: 'Branding',
                              type: 'String',
                              editable: true,
                              value: 'mybrand'
                            },
                            {
                              name: 'hostApp',
                              label: 'Host App',
                              type: 'String',
                              default: '{{HOST}}',
                              editable: true,
                              value: '${app_id}'
                            },
                            {
                              name: 'clickUrls',
                              label: 'Click Pixel',
                              type: 'Array',
                              default: ['{{CLICK}}'],
                              editable: true,
                              value: [
                                {
                                    label: 'Click Pixel',
                                    value: '${click_url}'
                                },
                                {
                                    label: 'Click Pixel',
                                    value: '${click}'
                                }
                              ]
                            },
                            {
                              name: 'playUrls',
                              label: 'Play Pixel',
                              type: 'Array',
                              editable: true,
                              value: [
                                {
                                    label: 'Play Pixel',
                                    value: '${play_url}'
                                },
                                {
                                    label: 'Play Pixel',
                                    value: '${play}'
                                }
                              ]
                            },
                            {
                              name: 'launchUrls',
                              label: 'Launch Pixel',
                              type: 'Array',
                              default: ['{{LAUNCH}}'],
                              editable: false,
                              value: [
                                {
                                    label: 'Launch Pixel',
                                    value: '{{LAUNCH}}'
                                }
                              ]
                            },
                            {
                              name: 'prebuffer',
                              label: 'Prebuffer',
                              type: 'Boolean',
                              editable: true,
                              value: 'Yes'
                            },
                            {
                              name: 'preview',
                              label: 'Preview Mode',
                              type: 'Boolean',
                              default: true,
                              editable: false,
                              value: 'No'
                            },
                            {
                              name: 'countdown',
                              label: 'Timer',
                              type: 'Number',
                              editable: true,
                              value: 30
                            },
                            {
                              name: 'forceOrientation',
                              label: 'Orientation Lock',
                              type: 'String',
                              editable: true,
                              options: ['landscape','portrait'],
                              value: 'portrait'
                            }
                        ]);
                    });
                });
            });

            describe('convertForSave(params)', function() {
                it('should convert an array of params into a saveable object', function() {
                    var paramsInUI = [
                            {
                              name: 'apiRoot',
                              label: 'API Root',
                              type: 'String',
                              default: 'https://platform.reelcontent.com/',
                              editable: false,
                              value: 'https://platform.reelcontent.com/'
                            },
                            {
                              name: 'container',
                              label: 'Container Name',
                              type: 'String',
                              editable: false,
                              value: undefined
                            },
                            {
                              name: 'branding',
                              label: 'Branding',
                              type: 'String',
                              editable: true,
                              value: 'mybrand'
                            },
                            {
                              name: 'hostApp',
                              label: 'Host App',
                              type: 'String',
                              default: '{{HOST}}',
                              editable: true,
                              value: '${app_id}'
                            },
                            {
                              name: 'clickUrls',
                              label: 'Click Pixel',
                              type: 'Array',
                              default: ['{{CLICK}}'],
                              editable: true,
                              value: [
                                {
                                    label: 'Click Pixel',
                                    value: '${click_url}'
                                },
                                {
                                    label: 'Click Pixel',
                                    value: '${click}'
                                }
                              ]
                            },
                            {
                              name: 'playUrls',
                              label: 'Play Pixel',
                              type: 'Array',
                              editable: true,
                              value: []
                            },
                            {
                              name: 'launchUrls',
                              label: 'Launch Pixel',
                              type: 'Array',
                              default: ['{{LAUNCH}}'],
                              editable: false,
                              value: [
                                {
                                    label: 'Launch Pixel',
                                    value: '{{LAUNCH}}'
                                }
                              ]
                            },
                            {
                              name: 'prebuffer',
                              label: 'Prebuffer',
                              type: 'Boolean',
                              editable: true,
                              value: undefined
                            },
                            {
                              name: 'preview',
                              label: 'Preview Mode',
                              type: 'Boolean',
                              default: true,
                              editable: false,
                              value: 'No'
                            },
                            {
                              name: 'countdown',
                              label: 'Timer',
                              type: 'Number',
                              editable: true,
                              value: 30
                            },
                            {
                              name: 'forceOrientation',
                              label: 'Orientation Lock',
                              type: 'String',
                              editable: true,
                              options: ['landscape','portrait'],
                              value: 'portrait'
                            }
                        ];

                    var result = PlacementService.convertForSave(paramsInUI);

                    expect(result).toEqual({
                        apiRoot: 'https://platform.reelcontent.com/',
                        container: undefined,
                        branding: 'mybrand',
                        hostApp: '${app_id}',
                        clickUrls: ['${click_url}','${click}'],
                        playUrls: undefined,
                        launchUrls: ['{{LAUNCH}}'],
                        prebuffer: undefined,
                        preview: false,
                        forceOrientation: 'portrait',
                        countdown: 30
                    });
                });
            });

            describe('generateParamsModel(params, ui)', function() {
                describe('return object', function() {
                    var rawParams, ui, result;

                    beforeEach(function() {
                        rawParams = {
                            container: 'beeswax',
                            branding: 'mybrand',
                            hostApp: '${app_id}',
                            clickUrls: ['${click_url}','${click}'],
                            playUrls: ['${play_url}','${play}'],
                            prebuffer: true,
                            preview: false,
                            forceOrientation: 'portrait',
                            countdown: 30
                        };

                        ui = ['branding','hostApp','clickUrls','prebuffer'];

                        spyOn(PlacementService, 'convertForUI').and.callThrough();

                        result = PlacementService.generateParamsModel(rawParams, ui);
                    });

                    it('should contain the UI property array', function() {
                        expect(result.ui).toEqual(ui);
                    });

                    it('should contain the full list of params', function() {
                        expect(PlacementService.convertForUI).toHaveBeenCalledWith(rawParams);
                        expect(result.params).toEqual(PlacementService.convertForUI(rawParams));
                    });

                    it('should contain an object with all properties that are shown in the UI by default', function() {
                        expect(result.defaults).toEqual({
                            branding: {
                              name: 'branding',
                              label: 'Branding',
                              type: 'String',
                              editable: true,
                              value: 'mybrand'
                            },
                            hostApp: {
                              name: 'hostApp',
                              label: 'Host App',
                              type: 'String',
                              default: '{{HOST}}',
                              editable: true,
                              value: '${app_id}'
                            },
                            clickUrls: {
                              name: 'clickUrls',
                              label: 'Click Pixel',
                              type: 'Array',
                              default: ['{{CLICK}}'],
                              editable: true,
                              value: [
                                {
                                    label: 'Click Pixel',
                                    value: '${click_url}'
                                },
                                {
                                    label: 'Click Pixel',
                                    value: '${click}'
                                }
                              ]
                            },
                            prebuffer: {
                              name: 'prebuffer',
                              label: 'Prebuffer',
                              type: 'Boolean',
                              editable: true,
                              value: 'Yes'
                            }
                        })
                    });

                    it('should contain an array of added params that are editable and not already in the UI', function() {
                        expect(result.addedParams).toEqual([
                            {
                              name: 'playUrls',
                              label: 'Play Pixel',
                              type: 'Array',
                              editable: true,
                              value: [
                                {
                                    label: 'Play Pixel',
                                    value: '${play_url}'
                                },
                                {
                                    label: 'Play Pixel',
                                    value: '${play}'
                                }
                              ]
                            },
                            {
                              name: 'countdown',
                              label: 'Timer',
                              type: 'Number',
                              editable: true,
                              value: 30
                            },
                            {
                              name: 'forceOrientation',
                              label: 'Orientation Lock',
                              type: 'String',
                              editable: true,
                              options: ['landscape','portrait'],
                              value: 'portrait'
                            }
                        ]);
                    });

                    it('should contain an array of available params that are either not in the UI or support multiple values (ie. click url array)', function() {
                        expect(result.availableParams).toEqual([
                            {
                              name: 'clickUrls',
                              label: 'Click Pixel',
                              type: 'Array',
                              default: ['{{CLICK}}'],
                              editable: true,
                              value: [
                                {
                                    label: 'Click Pixel',
                                    value: '${click_url}'
                                },
                                {
                                    label: 'Click Pixel',
                                    value: '${click}'
                                }
                              ]
                            },
                            {
                              name: 'playUrls',
                              label: 'Play Pixel',
                              type: 'Array',
                              editable: true,
                              value: [
                                {
                                    label: 'Play Pixel',
                                    value: '${play_url}'
                                },
                                {
                                    label: 'Play Pixel',
                                    value: '${play}'
                                }
                              ]
                            },
                            {
                              name: 'countdown',
                              label: 'Timer',
                              type: 'Number',
                              editable: true,
                              value: 30
                            },
                            {
                              name: 'forceOrientation',
                              label: 'Orientation Lock',
                              type: 'String',
                              editable: true,
                              options: ['landscape','portrait'],
                              value: 'portrait'
                            }
                        ]);
                    });

                    it('should have a "show" flag if the params model has any properties', function() {
                        expect(result.show).toBe(true);

                        result = PlacementService.generateParamsModel({}, ui);

                        expect(result.show).toBe(false);
                    });
                });
            });
        });
    });
});
