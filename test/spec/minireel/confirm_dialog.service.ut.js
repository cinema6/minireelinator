(function() {
    'use strict';

    define(['minireel/app'], function(minireelModule) {
        describe('ConfirmDialogService', function() {
            var ConfirmDialogService;

            beforeEach(function() {
                module(minireelModule.name);

                inject(function($injector) {
                    ConfirmDialogService = $injector.get('ConfirmDialogService');
                });
            });

            it('should exist', function() {
                expect(ConfirmDialogService).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('model', function() {
                    it('should be an object', function() {
                        expect(ConfirmDialogService.model).toEqual(jasmine.any(Object));
                    });

                    it('should not be publically settable', function() {
                        expect(function() {
                            ConfirmDialogService.model = {};
                        }).toThrow();
                    });
                });

                describe('model.dialog', function() {
                    it('should not be publically settable', function() {
                        expect(function() {
                            ConfirmDialogService.model.dialog = {};
                        }).toThrow();
                    });

                    it('should be initialized as null', function() {
                        expect(ConfirmDialogService.model.dialog).toBeNull();
                    });
                });
            });

            describe('display(dialogModel)', function() {
                var dialog;

                beforeEach(function() {
                    dialog = {};

                    ConfirmDialogService.display(dialog);
                });

                it('should set the dialog as the model.dialog property', function() {
                    expect(ConfirmDialogService.model.dialog).toBe(dialog);
                });
            });

            describe('close()', function() {
                beforeEach(function() {
                    ConfirmDialogService.display({});
                    ConfirmDialogService.close();
                });

                it('should make the model.dialog null', function() {
                    expect(ConfirmDialogService.model.dialog).toBeNull();
                });
            });
        });
    });
}());
