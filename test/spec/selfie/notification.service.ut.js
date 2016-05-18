define(['app'], function(appModule) {
    'use strict';

    describe('NotificationService', function() {
        var $rootScope,
            $timeout,
            NotificationService;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $timeout = $injector.get('$timeout');
                NotificationService = $injector.get('NotificationService');
            });
        });

        afterAll(function() {
            $rootScope = null;
            $timeout = null;
            NotificationService = null;
        });

        it('should exist', function() {
            expect(NotificationService).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('model', function() {
                it('should be a computed property', function() {
                    expect(NotificationService.model).toEqual({});

                    expect(function() {
                        NotificationService.model = {};
                    }).toThrow();
                });
            });
        });

        describe('methods', function() {
            describe('display(text, timer)', function() {
                describe('when not passing a timer', function() {
                    beforeEach(function() {
                        spyOn(NotificationService, 'close');

                        NotificationService.display('You did it!', 5000);
                    });

                    it('should set model.show to true', function() {
                        expect(NotificationService.model.show).toBe(true);
                    });

                    it('should set model.text to the passed in text', function() {
                        expect(NotificationService.model.text).toBe('You did it!');
                    });

                    describe('when timer runs out', function() {
                        it('should close the notification after 3 seconds', function() {
                            $timeout.flush(2000);

                            expect(NotificationService.close).not.toHaveBeenCalled();

                            $timeout.flush(3000);

                            expect(NotificationService.close).toHaveBeenCalled();
                        });
                    });
                });

                describe('when passing a timer of 5 seconds', function() {
                    beforeEach(function() {
                        spyOn(NotificationService, 'close');

                        NotificationService.display('You did it!', 5000);
                    });

                    it('should set model.show to true', function() {
                        expect(NotificationService.model.show).toBe(true);
                    });

                    it('should set model.text to the passed in text', function() {
                        expect(NotificationService.model.text).toBe('You did it!');
                    });

                    describe('when timer runs out', function() {
                        it('should close the notification after 5 seconds', function() {
                            $timeout.flush(3000);

                            expect(NotificationService.close).not.toHaveBeenCalled();

                            $timeout.flush(3000);

                            expect(NotificationService.close).toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('close()', function() {
                it('nullify text and hide the modal', function() {
                    NotificationService.display('You did it!');

                    expect(NotificationService.model.text).toBe('You did it!');
                    expect(NotificationService.model.show).toBe(true);

                    NotificationService.close();

                    expect(NotificationService.model.text).toBe(null);
                    expect(NotificationService.model.show).toBe(false);
                });
            });
        });
    });
});
