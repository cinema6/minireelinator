(function() {
    'use strict';

    define(['selfie/app'], function(selfieModule) {
        describe('SoftAlertService', function() {
            var SoftAlertService,
                $timeout;

            beforeEach(function() {
                module(selfieModule.name);

                inject(function($injector) {
                    SoftAlertService = $injector.get('SoftAlertService');
                    $timeout = $injector.get('$timeout');
                });
            });

            it('should exist', function() {
                expect(SoftAlertService).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('model', function() {
                    it('should be an object', function() {
                        expect(SoftAlertService.model).toEqual(jasmine.any(Object));
                    });

                    it('should not be publically settable', function() {
                        expect(function() {
                            SoftAlertService.model = {};
                        }).toThrow();
                    });
                });
            });

            describe('display(dialogModel)', function() {
                var dialog;

                beforeEach(function() {
                    dialog = {
                        success: true,
                        action: 'saving'
                    };

                    SoftAlertService.display(dialog);
                });

                it('should set model.show to true', function() {
                    expect(SoftAlertService.model.show).toBe(true);
                });

                it('should extend the model', function() {
                    expect(SoftAlertService.model.success).toEqual(dialog.success);
                    expect(SoftAlertService.model.action).toEqual(dialog.action);
                });

                describe('when a timer is set', function() {
                    it('should close the service after the timeout', function() {
                        dialog = {
                            success: true,
                            action: 'saving',
                            timer: 3000
                        };

                        SoftAlertService.display(dialog);

                        expect(SoftAlertService.model.show).toBe(true);

                        $timeout.flush(3000);

                        expect(SoftAlertService.model.show).toBe(false);
                    });
                });
            });

            describe('close()', function() {
                beforeEach(function() {
                    SoftAlertService.display({});
                    SoftAlertService.close();
                });

                it('should set model.show to false', function() {
                    expect(SoftAlertService.model.show).toBe(false);
                });
            });
        });
    });
}());
