define(['app'], function(appModule) {
    'use strict';

    describe('SelfieGeotargetingController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            GeoService,
            CampaignService,
            SelfieGeotargetingCtrl;

        var campaign,
            schema,
            validation;

        function compileCtrl() {
            $scope.$apply(function() {
                SelfieGeotargetingCtrl = $controller('SelfieGeotargetingController', {
                    $scope: $scope,
                    GeoService: GeoService
                });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                CampaignService = $injector.get('CampaignService');

                campaign = {
                    targeting: {
                        geo: {
                            states: [],
                            dmas: [],
                            zipcodes: {
                                codes: []
                            }
                        }
                    }
                };

                schema = {
                    pricing: {
                        budget: {
                            __min:50,
                            __max:20000
                        },
                        dailyLimit: {
                            __percentMin:0.015,
                            __percentMax:1,
                            __percentDefault:0.03
                        },
                        cost: {
                            __base: 0.05,
                            __pricePerGeo: 0.01,
                            __pricePerDemo: 0.01,
                            __priceForInterests: 0.01
                        }
                    },
                    targeting: {
                        geo: {
                            zipcodes: {
                                codes: {
                                    __length: 20
                                },
                                radius: {
                                    __min: 20,
                                    __max: 100,
                                    __default: 50
                                }
                            }
                        }
                    }
                };

                validation = {
                    radius: true
                };

                GeoService = {
                    usa: [
                        'Alabama',
                        'Alaska',
                        'Arizona',
                        'Arkansas'
                    ]
                };

                $scope = $rootScope.$new();
                $scope.campaign = campaign;
                $scope.schema = schema;
                $scope.validation = validation;
            });

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieGeotargetingCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('pricePerGeo', function() {
                it('should be the price from the schema', function() {
                    expect(SelfieGeotargetingCtrl.pricePerGeo).toEqual(schema.pricing.cost.__pricePerGeo);
                });
            });

            describe('minRadius', function() {
                it('should be the price from the schema', function() {
                    expect(SelfieGeotargetingCtrl.minRadius).toEqual(schema.targeting.geo.zipcodes.radius.__min);
                });
            });

            describe('maxRadius', function() {
                it('should be the price from the schema', function() {
                    expect(SelfieGeotargetingCtrl.maxRadius).toEqual(schema.targeting.geo.zipcodes.radius.__max);
                });
            });

            describe('defaultRadius', function() {
                it('should be the price from the schema', function() {
                    expect(SelfieGeotargetingCtrl.defaultRadius).toEqual(schema.targeting.geo.zipcodes.radius.__default);
                });
            });

            describe('maxCodes', function() {
                it('should be the price from the schema', function() {
                    expect(SelfieGeotargetingCtrl.maxCodes).toEqual(schema.targeting.geo.zipcodes.codes.__length);
                });
            });

            describe('newZip', function() {
                it('should be null', function() {
                    expect(SelfieGeotargetingCtrl.newZip).toEqual(null);
                });
            });

            describe('radius', function() {
                describe('if campaign has a radius set', function() {
                    it('should come from campaign', function() {
                        campaign.targeting.geo.zipcodes.radius = 35;

                        compileCtrl();

                        expect(SelfieGeotargetingCtrl.radius).toEqual(35);
                    });
                });

                describe('if campaign does not have a radius set', function() {
                    it('should use default form schema', function() {
                        campaign.targeting.geo.zipcodes.radius = undefined;

                        compileCtrl();

                        expect(SelfieGeotargetingCtrl.radius).toEqual(schema.targeting.geo.zipcodes.radius.__default);
                    });
                });
            });

            describe('dmaOptions', function() {
                it('should be the list from the GeoService', function() {
                    expect(SelfieGeotargetingCtrl.dmaOptions).toEqual(GeoService.dmas);
                });
            });

            describe('stateOptions', function() {
                it('should contain the U.S. States', function() {
                    expect(SelfieGeotargetingCtrl.stateOptions).toContain({
                        state: 'Alabama', country: 'usa'
                    });

                    expect(SelfieGeotargetingCtrl.stateOptions).toContain({
                        state: 'Arizona', country: 'usa'
                    });
                });
            });

            describe('states', function() {
                it('should be the state(s) from the campaign', function() {
                    expect(SelfieGeotargetingCtrl.states).toEqual([]);

                    campaign.targeting.geo.states.push('Arizona');
                    campaign.targeting.geo.states.push('Alabama');

                    compileCtrl();

                    expect(SelfieGeotargetingCtrl.states).toEqual([
                        {
                            state: 'Alabama', country: 'usa'
                        },
                        {
                            state: 'Arizona', country: 'usa'
                        }
                    ]);
                });
            });

            describe('zips', function() {
                describe('when campaign has zips defined', function() {
                    it('should be an array of zip objects', function() {
                        campaign.targeting.geo.zipcodes.codes.push('06236');
                        campaign.targeting.geo.zipcodes.codes.push('10256');

                        compileCtrl();

                        expect(SelfieGeotargetingCtrl.zips).toEqual([
                            {
                                code: '06236', valid: true
                            },
                            {
                                code: '10256', valid: true
                            }
                        ]);
                    });
                });

                describe('when campaign has no zips set', function() {
                    it('should be an array of zip objects', function() {
                        expect(SelfieGeotargetingCtrl.zips).toEqual([]);
                    });
                });
            });

            describe('radiusError', function() {
                beforeEach(function() {
                    SelfieGeotargetingCtrl.zips.push({
                        code: '02687',
                        valid: true
                    });
                });

                describe('when radius not defined', function() {
                    it('should be 1', function() {
                        SelfieGeotargetingCtrl.radius = '';
                        expect(SelfieGeotargetingCtrl.radiusError).toEqual(1);
                    });

                    it('should set validation to false unless there are no zips set on the campaign', function() {
                        SelfieGeotargetingCtrl.radius = '';

                        expect(SelfieGeotargetingCtrl.radiusError).toEqual(1);
                        expect(validation.radius).toBe(false);

                        SelfieGeotargetingCtrl.zips = [];
                        expect(SelfieGeotargetingCtrl.radiusError).toEqual(1);
                        expect(validation.radius).toBe(true);
                    });
                });

                describe('when radius is less than minRadius', function() {
                    it('should be 1', function() {
                        SelfieGeotargetingCtrl.radius = 5;
                        expect(SelfieGeotargetingCtrl.radiusError).toEqual(2);
                    });

                    it('should set validation to false unless there are no zips set on the campaign', function() {
                        SelfieGeotargetingCtrl.radius = 5;

                        expect(SelfieGeotargetingCtrl.radiusError).toEqual(2);
                        expect(validation.radius).toBe(false);

                        SelfieGeotargetingCtrl.zips = [];
                        expect(SelfieGeotargetingCtrl.radiusError).toEqual(2);
                        expect(validation.radius).toBe(true);
                    });
                });

                describe('when radius is greater than maxRadius', function() {
                    it('should be 1', function() {
                        SelfieGeotargetingCtrl.radius = 200;
                        expect(SelfieGeotargetingCtrl.radiusError).toEqual(3);
                    });

                    it('should set validation to false unless there are no zips set on the campaign', function() {
                        SelfieGeotargetingCtrl.radius = 200;

                        expect(SelfieGeotargetingCtrl.radiusError).toEqual(3);
                        expect(validation.radius).toBe(false);

                        SelfieGeotargetingCtrl.zips = [];
                        expect(SelfieGeotargetingCtrl.radiusError).toEqual(3);
                        expect(validation.radius).toBe(true);
                    });
                });

                describe('when radius is valid', function() {
                    it('should be 1', function() {
                        SelfieGeotargetingCtrl.radius = 50;
                        expect(SelfieGeotargetingCtrl.radiusError).toEqual(0);
                    });

                    it('should set validation to false unless there are no zips set on the campaign', function() {
                        SelfieGeotargetingCtrl.radius = 50;

                        expect(SelfieGeotargetingCtrl.radiusError).toEqual(0);
                        expect(validation.radius).toBe(true);

                        SelfieGeotargetingCtrl.zips = [];
                        expect(SelfieGeotargetingCtrl.radiusError).toEqual(0);
                        expect(validation.radius).toBe(true);
                    });
                });
            });
        });

        describe('methods', function() {
            describe('setRadius()', function() {
                describe('when radiusError is false', function() {
                    it('should do nothing', function() {
                        SelfieGeotargetingCtrl.radius = 5;

                        SelfieGeotargetingCtrl.setRadius();

                        expect(campaign.targeting.geo.zipcodes.radius).toBe(undefined);
                    });
                });

                describe('when radiusError is true', function() {
                    it('should do nothing', function() {
                        SelfieGeotargetingCtrl.radius = 50;

                        SelfieGeotargetingCtrl.setRadius();

                        expect(campaign.targeting.geo.zipcodes.radius).toBe(50);
                    });
                });
            });

            describe('removeZip(i)', function() {
                beforeEach(function() {
                    SelfieGeotargetingCtrl.zips = [
                        { code: '01234', valid: true },
                        { code: '123', valid: false },
                        { code: '54321', valid: true }
                    ];
                });

                it('should remove the zip object at the provided index', function() {
                    SelfieGeotargetingCtrl.removeZip(1);

                    expect(SelfieGeotargetingCtrl.zips).toEqual([
                        { code: '01234', valid: true },
                        { code: '54321', valid: true }
                    ]);
                });

                describe('when the zip is found on the campaign object', function() {
                    it('should remove it', function() {
                        campaign.targeting.geo.zipcodes.codes.push('54321');

                        SelfieGeotargetingCtrl.removeZip(2);

                        expect(campaign.targeting.geo.zipcodes.codes).toEqual([]);
                    });
                });

                describe('when the zip is not found on the campaign object', function() {
                    it('should not modify the campaign codes array', function() {
                        campaign.targeting.geo.zipcodes.codes.push('98765');

                        SelfieGeotargetingCtrl.removeZip(2);

                        expect(campaign.targeting.geo.zipcodes.codes).toEqual(['98765']);
                    });
                });
            });

            describe('validateZip()', function() {
                var zipDeferred;

                beforeEach(function() {
                    zipDeferred = $q.defer();

                    spyOn(CampaignService, 'getZip').and.returnValue(zipDeferred.promise);
                    spyOn(SelfieGeotargetingCtrl, 'addNewZip');
                });

                describe('if no zip is defined', function() {
                    it('should do nothing', function() {
                        SelfieGeotargetingCtrl.newZip = '';

                        SelfieGeotargetingCtrl.validateZip();

                        expect(CampaignService.getZip).not.toHaveBeenCalled();
                        expect(SelfieGeotargetingCtrl.addNewZip).not.toHaveBeenCalled();
                    });
                });

                describe('if the codes array is maxed out', function() {
                    it('should do nothing', function() {
                        campaign.targeting.geo.zipcodes.codes = [
                            '11111','11112','11113','11114','11115','11116','11117','11118','11119','11120',
                            '11121','11122','11123','11124','11125','11126','11127','11128','11129','11130'
                        ];

                        compileCtrl();
                        spyOn(SelfieGeotargetingCtrl, 'addNewZip');

                        SelfieGeotargetingCtrl.newZip = '05672';
                        SelfieGeotargetingCtrl.validateZip();

                        expect(CampaignService.getZip).not.toHaveBeenCalled();
                        expect(SelfieGeotargetingCtrl.addNewZip).not.toHaveBeenCalled();
                    });
                });

                describe('when a zip is defined', function() {
                    beforeEach(function() {
                        SelfieGeotargetingCtrl.newZip = '12345';

                        SelfieGeotargetingCtrl.validateZip();
                    });

                    it('should call the campaign service', function() {
                        expect(CampaignService.getZip).toHaveBeenCalledWith('12345');
                    });

                    describe('when the request succeeds', function() {
                        it('should call addNewZip and pass in a valid object', function() {
                            $scope.$apply(function() {
                                zipDeferred.resolve();
                            });

                            expect(SelfieGeotargetingCtrl.addNewZip).toHaveBeenCalledWith({
                                code: '12345', valid: true
                            });
                        });
                    });

                    describe('when the request fails', function() {
                        it('should call addNewZip and pass in an invalid object', function() {
                            $scope.$apply(function() {
                                zipDeferred.reject();
                            });

                            expect(SelfieGeotargetingCtrl.addNewZip).toHaveBeenCalledWith({
                                code: '12345', valid: false
                            });
                        });
                    });
                });
            });

            describe('addNewZip()', function() {
                beforeEach(function() {
                    spyOn(SelfieGeotargetingCtrl, 'setRadius');
                });

                describe('when it is valid', function() {
                    it('it should be added to the campaign zipcodes array if not already there', function() {
                        SelfieGeotargetingCtrl.addNewZip({ code: '12345', valid: true });

                        expect(campaign.targeting.geo.zipcodes.codes).toEqual(['12345']);

                        SelfieGeotargetingCtrl.newZip = '12345';
                        SelfieGeotargetingCtrl.addNewZip({ code: '12345', valid: true });
                        SelfieGeotargetingCtrl.newZip = '12345';
                        SelfieGeotargetingCtrl.addNewZip({ code: '12345', valid: true });

                        expect(campaign.targeting.geo.zipcodes.codes).toEqual(['12345']);
                    });
                });

                describe('when it is not valid', function() {
                    it('it not should be added to the campaign zipcodes array', function() {
                        SelfieGeotargetingCtrl.addNewZip({ code: '123', valid: false });

                        expect(campaign.targeting.geo.zipcodes.codes.indexOf('123')).toEqual(-1);
                    });
                });

                describe('when it already exists in the UI list', function() {
                    it('should move it to the last position', function() {
                        SelfieGeotargetingCtrl.zips = [
                            { code: '01234', valid: true },
                            { code: '123', valid: false },
                            { code: '54321', valid: true }
                        ];

                        SelfieGeotargetingCtrl.addNewZip({ code: '01234', valid: true });

                        expect(SelfieGeotargetingCtrl.zips.length).toBe(3);
                        expect(SelfieGeotargetingCtrl.zips[2]).toEqual({
                            code: '01234', valid: true
                        });
                    });
                });

                describe('when it does not already exists in the UI list', function() {
                    it('should move it to the last position', function() {
                        SelfieGeotargetingCtrl.zips = [
                            { code: '01234', valid: true },
                            { code: '123', valid: false },
                            { code: '54321', valid: true }
                        ];

                        SelfieGeotargetingCtrl.addNewZip({ code: '99999', valid: true });

                        expect(SelfieGeotargetingCtrl.zips.length).toBe(4);
                        expect(SelfieGeotargetingCtrl.zips[3]).toEqual({
                            code: '99999', valid: true
                        });
                    });
                });

                describe('when any new zip added, regardless of validity', function() {
                    it('should reset newZip to null', function() {
                        SelfieGeotargetingCtrl.addNewZip({ code: '99999', valid: false });

                        expect(SelfieGeotargetingCtrl.newZip).toBe(null);
                    });

                    it('should set radius', function() {
                        SelfieGeotargetingCtrl.addNewZip({ code: '99999', valid: false });

                        expect(SelfieGeotargetingCtrl.setRadius).toHaveBeenCalled();
                    });
                });
            });

            describe('handleZipKeydown(e)', function() {
                beforeEach(function() {
                    spyOn(SelfieGeotargetingCtrl, 'removeZip');
                    spyOn(SelfieGeotargetingCtrl, 'validateZip');
                });

                describe('when keyCode is 8 (delete button)', function() {
                    it('should call removeZip() with the index of the last zip in the UI if there is no newZip', function() {
                        SelfieGeotargetingCtrl.newZip = '123';
                        SelfieGeotargetingCtrl.handleZipKeydown({keyCode: 8});

                        expect(SelfieGeotargetingCtrl.removeZip).not.toHaveBeenCalled();

                        SelfieGeotargetingCtrl.newZip = '';
                        SelfieGeotargetingCtrl.zips = [];
                        SelfieGeotargetingCtrl.handleZipKeydown({keyCode: 8});

                        expect(SelfieGeotargetingCtrl.removeZip).not.toHaveBeenCalled();

                        SelfieGeotargetingCtrl.newZip = '';
                        SelfieGeotargetingCtrl.zips = [
                            { code: '01234', valid: true },
                            { code: '123', valid: false },
                            { code: '54321', valid: true }
                        ];
                        SelfieGeotargetingCtrl.handleZipKeydown({keyCode: 8});

                        expect(SelfieGeotargetingCtrl.removeZip).toHaveBeenCalledWith(2);
                    });
                });

                describe('when keyCode is 188 (comma button) or 13 (return/enter button)', function() {
                    it('should call addNewZip()', function() {
                        SelfieGeotargetingCtrl.newZip = '123';

                        SelfieGeotargetingCtrl.handleZipKeydown({keyCode: 188});

                        expect(SelfieGeotargetingCtrl.validateZip).toHaveBeenCalled();

                        SelfieGeotargetingCtrl.validateZip.calls.reset();

                        SelfieGeotargetingCtrl.newZip = '';

                        SelfieGeotargetingCtrl.handleZipKeydown({keyCode: 13});

                        expect(SelfieGeotargetingCtrl.validateZip).toHaveBeenCalled();
                    });
                });

                describe('when keyCode is anything other than 188, 13 or 8', function() {
                    it('should not call addNewZip() or removeZip()', function() {
                        SelfieGeotargetingCtrl.newZip = '123';

                        SelfieGeotargetingCtrl.handleZipKeydown({keyCode: 45});

                        expect(SelfieGeotargetingCtrl.validateZip).not.toHaveBeenCalled();
                        expect(SelfieGeotargetingCtrl.removeZip).not.toHaveBeenCalled();

                        SelfieGeotargetingCtrl.newZip = '';

                        SelfieGeotargetingCtrl.handleZipKeydown({keyCode: 6});

                        expect(SelfieGeotargetingCtrl.validateZip).not.toHaveBeenCalled();
                        expect(SelfieGeotargetingCtrl.removeZip).not.toHaveBeenCalled();
                    });
                });
            });

            describe('handleZipChange()', function() {
                it('should trim out any non-digit characters', function() {
                    SelfieGeotargetingCtrl.newZip = '1a7Bk&$s"9';

                    SelfieGeotargetingCtrl.handleZipChange();

                    expect(SelfieGeotargetingCtrl.newZip).toEqual('179');
                });
            });
        });

        describe('$watchers', function() {
            describe('states', function() {
                it('should set the states on the campaign', function() {
                    expect(campaign.targeting.geo.states).toEqual([]);

                    $scope.$apply(function() {
                        SelfieGeotargetingCtrl.states = [ SelfieGeotargetingCtrl.stateOptions[2],  SelfieGeotargetingCtrl.stateOptions[3]];
                    });

                    expect(campaign.targeting.geo.states).toEqual(['Arizona', 'Arkansas']);

                    $scope.$apply(function() {
                        SelfieGeotargetingCtrl.states = [];
                    });

                    expect(campaign.targeting.geo.states).toEqual([]);
                });
            });
        });
    });
});