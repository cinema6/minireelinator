define(['app', 'angular'], function(appModule, angular) {
    'use strict';

    describe('Brightcove directive', function() {
        var $rootScope,
            $scope,
            $compile,
            player,
            mockIFrame,
            mockSpan;

        beforeEach(function() {
            module(appModule.name);

            spyOn(angular.element.prototype, 'append');

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $scope = $rootScope.$new();
                $scope.id = 'abc123';
                $scope.acctId = 'acct-1337';
                $scope.playerId = '123-456-def';
                $scope.embedId = 'default';
                $scope.$apply(function() {
                    var $player = $compile('<brightcove-player videoid="{{id}}" accountid="{{acctId}}" playerid="{{playerId}}" embedid="{{embedId}}"></brightcove-player>')($scope);
                    player = angular.element($player[0]);
                });
            });
        });

        it('should append the correct iframe', function() {
            expect(angular.element.prototype.append).toHaveBeenCalled();
            var iframe = angular.element.prototype.append.calls.mostRecent().args[0];
            expect(iframe.attr('src')).toBe('//players.brightcove.net/acct-1337/123-456-def_default/index.html?videoId=abc123');
            expect(iframe.attr('allowfullscreen')).toBe('');
            expect(iframe.attr('webkitallowfullscreen')).toBe('');
            expect(iframe.attr('mozallowfullscreen')).toBe('');
            expect(iframe.attr('style')).toContain('width: 100%;');
            expect(iframe.attr('style')).toContain('height: 100%;');
            expect(iframe.attr('style')).toContain('position: absolute;');
            expect(iframe.attr('style')).toContain('top: 0px;');
            expect(iframe.attr('style')).toContain('bottom: 0px;');
            expect(iframe.attr('style')).toContain('left: 0px;');
            expect(iframe.attr('style')).toContain('right: 0px;');
        });
        
        it('should have the proper class', function() {
            expect(player.hasClass('brightcovePreview')).toBe(true);
        });
        
        it('should watch the videoid and reload the video', function() {
            angular.element.prototype.append.calls.reset();
            $scope.$apply(function() {
                $scope.id = 'different';
            });
            expect(angular.element.prototype.append.calls.count()).toBe(1);
            var iframe = angular.element.prototype.append.calls.mostRecent().args[0];
            expect(iframe.attr('src')).toBe('//players.brightcove.net/acct-1337/123-456-def_default/index.html?videoId=different');
        });
        
        it('should watch the accountid and reload the video', function() {
            angular.element.prototype.append.calls.reset();
            $scope.$apply(function() {
                $scope.acctId = 'different';
            });
            expect(angular.element.prototype.append.calls.count()).toBe(1);
            var iframe = angular.element.prototype.append.calls.mostRecent().args[0];
            expect(iframe.attr('src')).toBe('//players.brightcove.net/different/123-456-def_default/index.html?videoId=abc123');
        });
        
        it('should watch the playerid and reload the video', function() {
            angular.element.prototype.append.calls.reset();
            $scope.$apply(function() {
                $scope.playerId = 'different';
            });
            expect(angular.element.prototype.append.calls.count()).toBe(1);
            var iframe = angular.element.prototype.append.calls.mostRecent().args[0];
            expect(iframe.attr('src')).toBe('//players.brightcove.net/acct-1337/different_default/index.html?videoId=abc123');
        });
        
        it('should watch the embedid and relaod the video', function() {
            angular.element.prototype.append.calls.reset();
            $scope.$apply(function() {
                $scope.embedId = 'different';
            });
            expect(angular.element.prototype.append.calls.count()).toBe(1);
            var iframe = angular.element.prototype.append.calls.mostRecent().args[0];
            expect(iframe.attr('src')).toBe('//players.brightcove.net/acct-1337/123-456-def_different/index.html?videoId=abc123');
        });
    });
});
