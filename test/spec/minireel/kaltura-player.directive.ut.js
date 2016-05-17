define(['app', 'angular'], function(appModule, angular) {
    'use strict';

    describe('Kaltura directive', function() {
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
                $scope.partnerid = 'partner-1337';
                $scope.playerid = '123-456-def';
                $scope.$apply(function() {
                    var $player = $compile('<kaltura-player videoid="{{id}}" partnerId="{{partnerid}}" playerid="{{playerid}}"></kaltura-player>')($scope);
                    player = angular.element($player[0]);
                });
            });
        });

        afterEach(function() {
            player.remove();
        });

        afterAll(function() {
            $rootScope = null;
            $scope = null;
            $compile = null;
            player = null;
            mockIFrame = null;
            mockSpan = null;
        });

        it('it should append the proper script, div, and have the proper class', function() {
            var appendedElements = angular.element.prototype.append.calls.allArgs();
            var appendedDiv = appendedElements[0][0];
            expect(appendedDiv.prop('tagName')).toBe('DIV');
            expect(appendedDiv.attr('id')).toMatch(/kaltura_player_\d{10}/);
            expect(appendedDiv.attr('style')).toContain('width: 100%;');
            expect(appendedDiv.attr('style')).toContain('height: 100%;');
            var appendedScript = appendedElements[1][0];
            expect(appendedScript.attr('src')).toMatch(/https:\/\/cdnapisec\.kaltura\.com\/p\/partner-1337\/sp\/partner-133700\/embedIframeJs\/uiconf_id\/123-456-def\/partner_id\/partner-1337\?autoembed=true&entry_id=abc123&playerId=kaltura_player_\d{10}&cache_st=\d{10}&flashvars\[autoPlay\]=false/);
            expect(player.hasClass('kalturaPreview')).toBe(true);
        });

        it('should watch the videoid and reload the video', function() {
            angular.element.prototype.append.calls.reset();
            $scope.$apply(function() {
                $scope.id = 'different';
            });
            expect(angular.element.prototype.append.calls.count()).toBe(2);
            var script = angular.element.prototype.append.calls.mostRecent().args[0];
            expect(script.attr('src')).toMatch(/https:\/\/cdnapisec\.kaltura\.com\/p\/partner-1337\/sp\/partner-133700\/embedIframeJs\/uiconf_id\/123-456-def\/partner_id\/partner-1337\?autoembed=true&entry_id=different&playerId=kaltura_player_\d{10}&cache_st=\d{10}&flashvars\[autoPlay\]=false/);
        });

        it('should watch the partnerid and reload the video', function() {
            angular.element.prototype.append.calls.reset();
            $scope.$apply(function() {
                $scope.partnerid = 'different';
            });
            expect(angular.element.prototype.append.calls.count()).toBe(2);
            var script = angular.element.prototype.append.calls.mostRecent().args[0];
            expect(script.attr('src')).toMatch(/https:\/\/cdnapisec\.kaltura\.com\/p\/different\/sp\/different00\/embedIframeJs\/uiconf_id\/123-456-def\/partner_id\/different\?autoembed=true&entry_id=abc123&playerId=kaltura_player_\d{10}&cache_st=\d{10}&flashvars\[autoPlay\]=false/);
        });

        it('should watch the playerid and reload the video', function() {
            angular.element.prototype.append.calls.reset();
            $scope.$apply(function() {
                $scope.playerid = 'different';
            });
            expect(angular.element.prototype.append.calls.count()).toBe(2);
            var script = angular.element.prototype.append.calls.mostRecent().args[0];
            expect(script.attr('src')).toMatch(/https:\/\/cdnapisec\.kaltura\.com\/p\/partner-1337\/sp\/partner-133700\/embedIframeJs\/uiconf_id\/different\/partner_id\/partner-1337\?autoembed=true&entry_id=abc123&playerId=kaltura_player_\d{10}&cache_st=\d{10}&flashvars\[autoPlay]=false/);
        });
    });
});
