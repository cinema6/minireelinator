(function() {
    'use strict';

    define(['app'], function() {
        describe('EmbedCodeController', function() {
            var $rootScope,
                $scope,
                $controller,
                $q,
                cinema6,
                EmbedCodeCtrl;

            var getAppDataDeferred,
                $attrs;

            beforeEach(function() {
                $attrs = {};

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    cinema6 = $injector.get('cinema6');
                    $q = $injector.get('$q');

                    getAppDataDeferred = $q.defer();
                    spyOn(cinema6, 'getAppData').and.returnValue(getAppDataDeferred.promise);

                    $scope = $rootScope.$new();
                    $scope.minireel = {
                        id: 'e-0277a8c7564f87',
                        data: {
                            splash: {
                                theme: 'img-text-overlay',
                                ratio: '6-4'
                            },
                            collateral: {
                                splash: '/collateral/foo.jpg'
                            },
                            title: 'This is the Title!'
                        }
                    };
                    $scope.splashSrc = '/collateral/foo.jpg?cb=0';
                    EmbedCodeCtrl = $controller('EmbedCodeController', { $scope: $scope, $attrs: $attrs });
                });
            });

            it('should exist', function() {
                expect(EmbedCodeCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('readOnly', function() {
                    describe('if the readonly attr is undefined', function() {
                        beforeEach(function() {
                            delete $attrs.readonly;

                            EmbedCodeCtrl = $controller('EmbedCodeController', { $scope: $scope, $attrs: $attrs });
                        });

                        it('should be false', function() {
                            expect(EmbedCodeCtrl.readOnly).toBe(false);
                        });
                    });

                    describe('if the readonly attr is defined', function() {
                        beforeEach(function() {
                            $attrs.readonly = '';

                            EmbedCodeCtrl = $controller('EmbedCodeController', { $scope: $scope, $attrs: $attrs });
                        });

                        it('should be true', function() {
                            expect(EmbedCodeCtrl.readOnly).toBe(true);
                        });
                    });
                });

                describe('mode', function() {
                    it('should be initialized as responsive', function() {
                        expect(EmbedCodeCtrl.mode).toBe('responsive');
                    });
                });

                describe('modes', function() {
                    it('should be the options for embedding', function() {
                        expect(EmbedCodeCtrl.modes).toEqual([
                            {
                                name: 'Responsive Auto-fit *',
                                value: 'responsive'
                            },
                            {
                                name: 'Custom Size',
                                value: 'custom'
                            }
                        ]);
                    });
                });

                describe('size', function() {
                    it('should be initialized to a custom size', function() {
                        expect(EmbedCodeCtrl.size).toEqual({
                            width: 650,
                            height: 522
                        });
                    });
                });

                describe('code', function() {
                    beforeEach(function() {
                        EmbedCodeCtrl.c6EmbedSrc = 'embed.js';
                    });

                    describe('if the size is responsive', function() {
                        it('should be a responsive embed code', function() {
                            expect(EmbedCodeCtrl.code).toBe(
                                '<script src="embed.js" data-exp="e-0277a8c7564f87" data-:title="' + btoa('This is the Title!') + '" data-splash="img-text-overlay:6/4"></script>'
                            );
                        });
                    });

                    describe('if the size is explicit', function() {
                        beforeEach(function() {
                            EmbedCodeCtrl.mode = 'custom';
                        });

                        it('should be an explicit embed code', function() {
                            expect(EmbedCodeCtrl.code).toBe(
                                '<script src="embed.js" data-exp="e-0277a8c7564f87" data-:title="' + btoa('This is the Title!') + '" data-splash="img-text-overlay:6/4" data-width="650" data-height="522"></script>'
                            );
                        });

                        it('should update if the dimensions are updated', function() {
                            EmbedCodeCtrl.size.height = 300;
                            EmbedCodeCtrl.size.width = 400;

                            expect(EmbedCodeCtrl.code).toBe(
                                '<script src="embed.js" data-exp="e-0277a8c7564f87" data-:title="' + btoa('This is the Title!') + '" data-splash="img-text-overlay:6/4" data-width="400" data-height="300"></script>'
                            );
                        });
                    });
                });

                describe('c6EmbedSrc', function() {
                    it('should be initialized as null', function() {
                        expect(EmbedCodeCtrl.c6EmbedSrc).toBeNull();
                    });

                    it('should be the value set in the experience when the appData is fetched', function() {
                        $scope.$apply(function() {
                            getAppDataDeferred.resolve({
                                experience: {
                                    data: {
                                        c6EmbedSrc: '//lib.cinema6.com/c6embed/v0.7.0-0-g495dfa0/c6embed.min.js'
                                    }
                                }
                            });
                        });

                        expect(EmbedCodeCtrl.c6EmbedSrc).toBe('//lib.cinema6.com/c6embed/v0.7.0-0-g495dfa0/c6embed.min.js');
                    });
                });
            });
        });
    });
}());
