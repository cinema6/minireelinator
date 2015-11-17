define(['app', 'angular'], function(appModule, angular) {
    'use strict';

    describe('Vidyard directive', function() {
        var $rootScope,
            $scope,
            $compile,
            $player;

        beforeEach(function() {
            module(appModule.name);

            spyOn(document, 'createElement').and.callThrough();
            spyOn(angular.element.prototype, 'append');
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

        it('should create a style', function() {
            expect(document.createElement).toHaveBeenCalledWith('style');
        });

        it('should create a script', function() {
            expect(document.createElement).toHaveBeenCalledWith('script');
        });

        it('should create the correct style', function(){
            var style;
            document.createElement.calls.all().forEach(function(call) {
                if(call.args[0] === 'style') {
                    style = call.returnValue;
                }
            });
            expect(style.innerHTML).toBe('span#vidyard_span_abc123{width:100%!important;height:100%!important;}');
        });

        it('should create the correct script', function() {
            var script;
            document.createElement.calls.all().forEach(function(call) {
                if(call.args[0] === 'script') {
                    script = call.returnValue;
                }
            });
            expect(script.getAttribute('type')).toBe('text/javascript');
            expect(script.getAttribute('id')).toBe('vidyard_embed_code_abc123');
            expect(script.getAttribute('src')).toBe('//play.vidyard.com/abc123.js?v=3.1.1&type=inline');
        });

        it('should add the correct class to the directive', function() {
            expect(angular.element.prototype.addClass).toHaveBeenCalledWith('vidyardPreview');
        });
    });
});
