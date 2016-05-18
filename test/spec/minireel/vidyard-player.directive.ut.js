define(['app', 'angular'], function(appModule, angular) {
    'use strict';

    describe('Vidyard directive', function() {
        var $rootScope,
            $scope,
            $compile,
            $player,
            mockIFrame,
            mockSpan;

        beforeEach(function() {
            module(appModule.name);

            mockSpan = { style: {} };
            mockIFrame = { parentElement: mockSpan };

            spyOn(document, 'createElement').and.callThrough();
            spyOn(angular.element.prototype, 'css');
            spyOn(angular.element.prototype, 'find');
            spyOn(angular.element.prototype, 'empty');
            spyOn(angular.element.prototype, 'append').and.returnValue([]);
            spyOn(angular.element.prototype, 'addClass');

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $scope = $rootScope.$new();
                $scope.id = 'abc123';
                $scope.$apply(function() {
                    $player = $compile('<vidyard-player videoid="{{id}}"></vidyard-player>')($scope);
                });
            });
        });

        afterEach(function() {
            $player.remove();
        });

        afterAll(function() {
            $rootScope = null;
            $scope = null;
            $compile = null;
            $player = null;
            mockIFrame = null;
            mockSpan = null;
        });

        it('should create a script', function() {
            expect(document.createElement).toHaveBeenCalledWith('script');
        });

        it('should create the correct script and append it', function() {
            var script;
            document.createElement.calls.all().forEach(function(call) {
                if(call.args[0] === 'script') {
                    script = call.returnValue;
                }
            });
            expect(script.getAttribute('type')).toBe('text/javascript');
            expect(script.getAttribute('id')).toBe('vidyard_embed_code_abc123');
            expect(script.getAttribute('src')).toBe('//play.vidyard.com/abc123.js?v=3.1.1&type=inline');
            expect(angular.element.prototype.append).toHaveBeenCalledWith(script);
        });

        it('should add the correct class to the directive', function() {
            expect(angular.element.prototype.addClass).toHaveBeenCalledWith('vidyardPreview');
        });

        it('should empty the element', function() {
            expect(angular.element.prototype.empty).toHaveBeenCalled();
        });

        it('should set display to none', function() {
            expect(angular.element.prototype.css).toHaveBeenCalledWith('display', 'none');
        });

        it('should watch out for the iframe', function() {
            expect(mockIFrame.width).not.toBe('100%');
            expect(mockIFrame.height).not.toBe('100%');
            expect(mockSpan.style.width).not.toBe('100%');
            expect(mockSpan.style.height).not.toBe('100%');
            expect(angular.element.prototype.css).not.toHaveBeenCalledWith('display', 'inline');
            $scope.$apply(function() {
                angular.element.prototype.find.and.returnValue([mockIFrame]);
            });
            expect(mockIFrame.width).toBe('100%');
            expect(mockIFrame.height).toBe('100%');
            expect(mockSpan.style.width).toBe('100%');
            expect(mockSpan.style.height).toBe('100%');
            expect(angular.element.prototype.css).toHaveBeenCalledWith('display', 'inline');
        });
    });
});
