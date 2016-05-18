define(['app'], function(appModule) {
    'use strict';

    describe('SelfieNotificationController', function() {
        var $rootScope,
            $scope,
            $controller,
            NotificationService,
            SelfieNotificationCtrl;

        var model;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
            });

            model = {
                show: false,
                text: null
            };

            NotificationService = {
                model: model,
                resolve: jasmine.createSpy('resolve()'),
                cancel: jasmine.createSpy('cancel()')
            };

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieNotificationCtrl = $controller('SelfieNotificationController', { $scope: $scope, NotificationService: NotificationService });
            });
        });

        afterAll(function() {
            $rootScope = null;
            $scope = null;
            $controller = null;
            NotificationService = null;
            SelfieNotificationCtrl = null;
            model = null;
        });

        it('should exist', function() {
            expect(SelfieNotificationCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('model', function() {
                it('should be the model from the NotificationService', function() {
                    expect(SelfieNotificationCtrl.model).toBe(NotificationService.model);
                });
            });
        });

        describe('methods', function() {
            describe('close()', function() {
                it('should hide modal and nullify text', function() {
                    SelfieNotificationCtrl.model.show = true;
                    SelfieNotificationCtrl.model.text = 'You did it!';

                    SelfieNotificationCtrl.close();

                    expect(SelfieNotificationCtrl.model.show).toBe(false);
                    expect(SelfieNotificationCtrl.model.text).toBe(null);
                });
            });
        });
    });
});
