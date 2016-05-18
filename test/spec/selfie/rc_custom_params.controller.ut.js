define(['app'], function(appModule) {
    'use strict';

    describe('RcCustomParamsController', function() {
        var $rootScope,
            $scope,
            $controller,
            RcCustomParamsCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
            });

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                RcCustomParamsCtrl = $controller('RcCustomParamsController', {
                    $scope: $scope
                });
            });
        });

        afterAll(function() {
            $rootScope = null;
            $scope = null;
            $controller = null;
            RcCustomParamsCtrl = null;
        });

        it('should exist', function() {
            expect(RcCustomParamsCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('addParam(param)', function() {
                describe('when param in not defined', function() {
                    it('should do nothing', function() {
                        $scope.addedParams = [];
                        $scope.uiBlacklist = [];

                        RcCustomParamsCtrl.addParam(null);

                        expect($scope.addedParams.length).toBe(0);
                    });
                });

                describe('when param is defined, has not been added already, and is not in the UI', function() {
                    it('should be added', function() {
                        var param = {
                            label: 'Branding',
                            value: 'mybrand'
                        };

                        $scope.addedParams = [];
                        $scope.uiBlacklist = [];

                        RcCustomParamsCtrl.addParam(param);
                        RcCustomParamsCtrl.addParam(param);
                        RcCustomParamsCtrl.addParam(param);
                        RcCustomParamsCtrl.addParam(param);

                        expect($scope.addedParams.length).toBe(1);
                        expect($scope.addedParams[0]).toBe(param);
                    });
                });

                describe('when param has already been added', function() {
                    it('should not add it again', function() {
                        var param = {
                            label: 'Branding',
                            value: 'mybrand'
                        };

                        $scope.addedParams = [param];
                        $scope.uiBlacklist = [];

                        RcCustomParamsCtrl.addParam(param);
                        RcCustomParamsCtrl.addParam(param);
                        RcCustomParamsCtrl.addParam(param);
                        RcCustomParamsCtrl.addParam(param);

                        expect($scope.addedParams.length).toBe(1);
                    });
                });

                describe('when param is already in the UI', function() {
                    it('should not add it', function() {
                        var param = {
                            label: 'Branding',
                            name: 'branding',
                            value: 'mybrand'
                        };

                        $scope.addedParams = [];
                        $scope.uiBlacklist = ['branding'];

                        RcCustomParamsCtrl.addParam(param);
                        RcCustomParamsCtrl.addParam(param);
                        RcCustomParamsCtrl.addParam(param);
                        RcCustomParamsCtrl.addParam(param);

                        expect($scope.addedParams.length).toBe(0);
                    });
                });

                describe('when param is an array', function() {
                    it('should add a new object to the value array', function() {
                        var param = {
                            label: 'Click Pixel',
                            name: 'clickUrls',
                            type: 'Array',
                            value: []
                        };

                        $scope.addedParams = [];
                        $scope.uiBlacklist = [];

                        RcCustomParamsCtrl.addParam(param);
                        RcCustomParamsCtrl.addParam(param);
                        RcCustomParamsCtrl.addParam(param);
                        RcCustomParamsCtrl.addParam(param);

                        expect($scope.addedParams.length).toBe(1);
                        expect(param.value.length).toBe(4);
                    });
                });
            });

            describe('removeParam(param, subParam)', function() {
                describe('when param in not defined', function() {
                    it('should do nothing', function() {
                        $scope.addedParams = [{},{},{}];

                        RcCustomParamsCtrl.removeParam(null);

                        expect($scope.addedParams.length).toBe(3);
                    });
                });

                describe('when param type is Array', function() {
                    it('should do nothing', function() {
                        $scope.addedParams = [
                            {
                                type: 'Array'
                            },
                            {
                                type: 'Array'
                            },
                            {
                                type: 'Array'
                            }
                        ];

                        RcCustomParamsCtrl.removeParam($scope.addedParams[1]);

                        expect($scope.addedParams.length).toBe(3);
                    });
                });

                describe('when param type is not array', function() {
                    describe('when it is a Boolean', function() {
                        describe('if there is a default value', function() {
                            it('should reset value to Yes or No and remove from addedParams', function() {
                                var param = {
                                    type: 'Boolean',
                                    value: 'Yes',
                                    default: false
                                };

                                $scope.addedParams = [param];

                                RcCustomParamsCtrl.removeParam(param);

                                expect($scope.addedParams.length).toBe(0);
                                expect(param.value).toBe('No');
                            });
                        });

                        describe('when there is no default value', function() {
                            it('should reset value to undefined and remove form addedParams', function() {
                                var param = {
                                    type: 'Boolean',
                                    value: 'Yes'
                                };

                                $scope.addedParams = [param];

                                RcCustomParamsCtrl.removeParam(param);

                                expect($scope.addedParams.length).toBe(0);
                                expect(param.value).toBe(undefined);
                            });
                        });
                    });

                    describe('when it is not a Boolean', function() {
                        describe('when there is a default value', function() {
                            it('should reset value to default and remove from addedParams', function() {
                                var param = {
                                    type: 'String',
                                    value: 'something',
                                    default: 'Some Default'
                                };

                                $scope.addedParams = [param];

                                RcCustomParamsCtrl.removeParam(param);

                                expect($scope.addedParams.length).toBe(0);
                                expect(param.value).toBe('Some Default');
                            });
                        });

                        describe('when there is no default value', function() {
                            it('should reset value to undefined and remove from addedParams', function() {
                                var param = {
                                    type: 'String',
                                    value: 'something'
                                };

                                $scope.addedParams = [param];

                                RcCustomParamsCtrl.removeParam(param);

                                expect($scope.addedParams.length).toBe(0);
                                expect(param.value).toBe(undefined);
                            });
                        });
                    });
                });

                describe('when a subParam is removed', function() {
                    it('should remove the subParam from the param value array but should never remove the entire param', function() {
                        var param = {
                            label: 'Click Pixel',
                            name: 'clickUrls',
                            type: 'Array',
                            value: [
                                {
                                    value: 'click1'
                                },
                                {
                                    value: 'click2'
                                }
                            ]
                        };

                        $scope.addedParams = [param];

                        RcCustomParamsCtrl.removeParam(param, param.value[0]);

                        expect(param.value.length).toBe(1);
                        expect(param.value[0]).toEqual({ value: 'click2' });
                        expect($scope.addedParams.length).toBe(1);

                        RcCustomParamsCtrl.removeParam(param, param.value[0]);

                        expect(param.value.length).toBe(0);
                        expect(param.value).toEqual([]);
                        expect($scope.addedParams.length).toBe(1);
                    });
                });
            });
        });
    });
});
