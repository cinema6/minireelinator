(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('SelfieLoginDialogService', function() {
            var $rootScope,
                SelfieLoginDialogService;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    SelfieLoginDialogService = $injector.get('SelfieLoginDialogService');
                });
            });

            it('should exist', function() {
                expect(SelfieLoginDialogService).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('model', function() {
                    it('should be an object', function() {
                        expect(SelfieLoginDialogService.model).toEqual(jasmine.any(Object));
                    });

                    it('should not be publically settable', function() {
                        expect(function() {
                            SelfieLoginDialogService.model = {};
                        }).toThrow();
                    });
                });
            });

            describe('display()', function() {
                beforeEach(function() {
                    SelfieLoginDialogService.display();
                });

                it('should set model.show to true', function() {
                    expect(SelfieLoginDialogService.model.show).toBe(true);
                });

                it('should return a promise', function() {
                    expect(SelfieLoginDialogService.display().then).toBeDefined();
                });
            });

            describe('success()', function() {
                var success;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');

                    SelfieLoginDialogService.display().then(success);
                    SelfieLoginDialogService.success();

                    $rootScope.$digest();
                });

                it('should set model.show to false', function() {
                    expect(SelfieLoginDialogService.model.show).toBe(false);
                });

                it('should resolve the promise returned by display()', function() {
                    expect(success).toHaveBeenCalled();
                });
            });
        });
    });
}());
