define(['app'], function(appModule) {
    'use strict';

    var state;

    describe('Selfie:Demo:Full', function() {
        beforeEach(function() {
            module(appModule.name);

            var c6State;
            inject(function($injector) {
                c6State = $injector.get('c6State');
            });
            state = c6State.get('Selfie:Demo:Input:Full');
        });

        it('should be using the correct template', function() {
            expect(state.templateUrl).toBe('views/selfie/demo/input.html');
        });

        it('should be using the correct controller', function() {
            expect(state.controller).toBe('SelfieDemoInputController');
        });

        it('should use controllerAs', function() {
            expect(state.controllerAs).toBe('SelfieDemoInputCtrl');
        });
    });

    describe('Selfie:Demo:Frame', function() {
        beforeEach(function() {
            module(appModule.name);

            var c6State;
            inject(function($injector) {
                c6State = $injector.get('c6State');
            });
            state = c6State.get('Selfie:Demo:Input:Frame');
        });

        it('should be using the correct template', function() {
            expect(state.templateUrl).toBe('views/selfie/demo/input.html');
        });

        it('should be using the correct controller', function() {
            expect(state.controller).toBe('SelfieDemoInputController');
        });

        it('should use controllerAs', function() {
            expect(state.controllerAs).toBe('SelfieDemoInputCtrl');
        });
    });
});
