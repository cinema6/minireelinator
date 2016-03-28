define(['app', 'angular'], function(appModule, angular) {
    'use strict';

    describe('Facebook directive', function() {
        var $rootScope,
            $scope,
            $compile,
            player,
            mockIFrame,
            mockSpan;

        beforeEach(function() {
            module(appModule.name);

            spyOn(angular.element.prototype, 'empty').and.callThrough();

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $scope = $rootScope.$new();
                $scope.id = 'video src';
                $scope.$apply(function() {
                    var $player = $compile('<facebook-player videoid="{{id}}"></facebook-player>')($scope);
                    player = angular.element($player[0]);
                });
            });
        });

        it('it should append the proper script, div, and have the proper class', function() {
            expect(angular.element.prototype.empty).toHaveBeenCalledWith();
            var children = player.children();
            expect(children.length).toBe(2);
            var div = children[0];
            expect(div.tagName).toBe('DIV');
            expect(div.className).toBe('fb-video');
            expect(div.getAttribute('data-href')).toBe('video src');
            var script = children[1];
            expect(script.tagName).toBe('SCRIPT');
            expect(script.getAttribute('src')).toBe('https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.5');
            window.FB = {
                init: jasmine.createSpy('init()'),
                XFBML: {
                    parse: jasmine.createSpy('parse()')
                }
            };
            script.onload();
            expect(window.FB.init).toHaveBeenCalledWith({
                appId: jasmine.any(String),
                version: 'v2.5'
            });
            expect(window.FB.XFBML.parse).toHaveBeenCalledWith(player[0]);
            expect(player.hasClass('facebookPreview')).toBe(true);
        });

        it('should watch the videoid and reload the video', function() {
            $scope.$apply(function() {
                $scope.id = 'different src';
            });
            expect(angular.element.prototype.empty).toHaveBeenCalledWith();
            var children = player.children();
            expect(children.length).toBe(2);
            var div = children[0];
            expect(div.tagName).toBe('DIV');
            expect(div.className).toBe('fb-video');
            expect(div.getAttribute('data-href')).toBe('different src');
        });
    });
});
