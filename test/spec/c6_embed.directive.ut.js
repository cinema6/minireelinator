define(['preview_minireel'], function(previewMiniReelModule) {
    'use strict';

    describe('<c6-embed>', function() {
        var $rootScope,
            $scope,
            $compile;

        var $window;

        var $c6Embed;

        beforeEach(function() {
            module('ng', function($provide) {
                $provide.value('$window', {
                    c6: {},
                    navigator: window.navigator,
                    document: window.document
                });
            });
            module(previewMiniReelModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');

                $window = $injector.get('$window');
            });

            $scope = $rootScope.$new();

            $scope.config = null;

            $scope.$apply(function() {
                $c6Embed = $compile('<c6-embed src="//lib.cinema6.com/c6embed/v1/c6embed.min.js" config="config"></c6-embed>')($scope);
            });
        });

        describe('when a config is provided', function() {
            beforeEach(function() {
                $scope.$apply(function() {
                    $scope.config = {
                        exp: 'e-e7de1bfac3e1af',
                        preload: true,
                        splash: 'horizontal-stack:16/9',
                        title: 'Awesome MiniReel!',
                        branding: 'digitaljournal'
                    };
                });
            });

            it('should add an id to the c6.pending array', function() {
                expect($window.c6.pending).toEqual([jasmine.any(String)]);
            });

            it('should put a c6Embed script in the DOM', function() {
                var id = $window.c6.pending[0],
                    $script = $c6Embed.children('script');

                expect($script.length).toBe(1);

                expect($script.attr('id')).toBe(id);
                expect($script.attr('src')).toBe('//lib.cinema6.com/c6embed/v1/c6embed.min.js');
                expect($script.attr('data-exp')).toBe($scope.config.exp);
                expect($script.attr('data-preload')).toBe('');
                expect($script.attr('data-splash')).toBe($scope.config.splash);
                expect($script.attr('data-title')).toBe($scope.config.title);
                expect($script.attr('data-branding')).toBe($scope.config.branding);
            });

            it('should clear out the element whenever the config changes', function() {
                $c6Embed.append('<div>');

                $scope.$apply(function() {
                    $scope.config.preload = false;
                });

                expect($c6Embed.children('script').length).toBe(1);
                expect($c6Embed.children().length).toBe(1);
            });
        });
    });
});
