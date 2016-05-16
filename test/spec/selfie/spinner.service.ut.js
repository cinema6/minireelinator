(function() {
    'use strict';

    define(['selfie/app'], function(selfieModule) {
        describe('SpinnerService', function() {
            var SpinnerService;

            beforeEach(function() {
                module(selfieModule.name);

                inject(function($injector) {
                    SpinnerService = $injector.get('SpinnerService');
                });
            });

            afterAll(function() {
                SpinnerService = null;
            });

            it('should exist', function() {
                expect(SpinnerService).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('model', function() {
                    it('should be an object', function() {
                        expect(SpinnerService.model).toEqual(jasmine.any(Object));
                    });

                    it('should not be publically settable', function() {
                        expect(function() {
                            SpinnerService.model = {};
                        }).toThrow();
                    });
                });
            });

            describe('display()', function() {
                it('should set model.show to true', function() {
                    SpinnerService.display();

                    expect(SpinnerService.model.show).toBe(true);
                });
            });

            describe('close()', function() {
                beforeEach(function() {
                    SpinnerService.display();
                    SpinnerService.close();
                });

                it('should set model.show to false', function() {
                    expect(SpinnerService.model.show).toBe(false);
                });
            });
        });
    });
}());
