define(['app', 'angular'], function(appModule, angular) {
    'use strict';

    describe('JWPlayer directive', function() {
        var $rootScope,
            $scope,
            $compile,
            $player;

        beforeEach(function() {
            module(appModule.name);

            spyOn(document, 'createElement').and.callThrough();
            spyOn(angular.element.prototype, 'empty');
            spyOn(angular.element.prototype, 'append');
            spyOn(angular.element.prototype, 'addClass');
            spyOn(Node.prototype, 'appendChild').and.callThrough();

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $scope = $rootScope.$new();
                $scope.id = 'playerId-videoId';
                $scope.$apply(function() {
                    $player = $compile('<jw-player videoid="{{id}}"></jw-player>')($scope);
                });
            });
        });

        it('should empty the element', function() {
            expect(angular.element.prototype.empty).toHaveBeenCalled();
        });

        it('should create a style', function() {
            expect(document.createElement).toHaveBeenCalledWith('style');
        });

        it('should create a script', function() {
            expect(document.createElement).toHaveBeenCalledWith('script');
        });

        it('should create a div', function() {
            expect(document.createElement).toHaveBeenCalledWith('div');
        });

        it('should create an iframe', function() {
            expect(document.createElement).toHaveBeenCalledWith('iframe');
        });

        it('should append the correct iframe to the directive', function() {
            expect(angular.element.prototype.append).toHaveBeenCalled();
            var appended = angular.element.prototype.append.calls.mostRecent().args[0];
            expect(appended.tagName).toBe('IFRAME');
            expect(appended.getAttribute('width')).toBe('100%');
            expect(appended.getAttribute('height')).toBe('100%');
            expect(appended.getAttribute('frameBorder')).toBe('0');
            expect(appended.getAttribute('src')).toBe('blank.html');
        });

        it('should create the correct style', function(){
            var style;
            document.createElement.calls.all().forEach(function(call) {
                if(call.args[0] === 'style') {
                    style = call.returnValue;
                }
            });
            expect(style.innerHTML).toBe('div#botr_playerId_videoId_div{ width: 100% !important; height: 100% !important; }');
        });

        it('should create the correct script', function() {
            var script;
            document.createElement.calls.all().forEach(function(call) {
                if(call.args[0] === 'script') {
                    script = call.returnValue;
                }
            });
            expect(script.getAttribute('type')).toBe('application/javascript');
            expect(script.getAttribute('src')).toBe('//content.jwplatform.com/players/playerId-videoId.js');
        });

        it('should create the correct div', function() {
            var div;
            document.createElement.calls.all().forEach(function(call) {
                if(call.args[0] === 'div') {
                    div = call.returnValue;
                }
            });
            expect(div.getAttribute('id')).toBe('botr_playerId_videoId_div');
        });

        it('should add the correct class to the directive', function() {
            expect(angular.element.prototype.addClass).toHaveBeenCalledWith('jwplayerPreview');
        });

        it('should reload the preview when the videoid changes', function() {
            expect(angular.element.prototype.append.calls.count()).toBe(1);
            $scope.$apply(function() {
                $scope.id = 'changed-id';
            });
            expect(angular.element.prototype.append.calls.count()).toBe(2);
        });
    });
});
