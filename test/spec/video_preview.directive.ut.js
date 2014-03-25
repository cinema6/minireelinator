(function() {
    'use strict';

    define(['editor'], function() {
        describe('<video-preview>', function() {
            var $rootScope,
                $scope,
                $compile,
                $preview;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');

                    $scope = $rootScope.$new();
                });

                $scope.service = null;
                $scope.videoid = null;

                $scope.$apply(function() {
                    $preview = $compile('<video-preview service="{{service}}" videoid="{{videoid}}"></video-preview>')($scope);
                });

                expect($preview.find('iframe').length).toBe(0);
            });

            describe('youtube', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.service = 'youtube';
                    });
                });

                it('should not create any iframes when there is no videoid', function() {
                    expect($preview.find('iframe').length).toBe(0);
                });

                it('should create a youtube embed iframe when a videoid is provided', function() {
                    var $iframe;

                    $scope.$apply(function() {
                        $scope.videoid = 'gy1B3agGNxw';
                    });
                    $iframe = $preview.find('iframe');

                    expect($iframe.length).toBe(1);

                    expect($iframe.attr('src')).toBe('//www.youtube.com/embed/gy1B3agGNxw?rel=0');
                });
            });

            describe('vimeo', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.service = 'vimeo';
                    });
                });

                it('should not create any iframes when there is no videoid', function() {
                    expect($preview.find('iframe').length).toBe(0);
                });

                it('should create a vimeo embed iframe when a videoid is provided', function() {
                    var $iframe;

                    $scope.$apply(function() {
                        $scope.videoid = '2424355';
                    });
                    $iframe = $preview.find('iframe');

                    expect($iframe.length).toBe(1);

                    expect($iframe.attr('src')).toBe('//player.vimeo.com/video/2424355');
                });
            });

            describe('dailymotion', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.service = 'dailymotion';
                    });
                });

                it('should not create any iframes when there is no videoid', function() {
                    expect($preview.find('iframe').length).toBe(0);
                });

                it('should create a vimeo embed iframe when a videoid is provided', function() {
                    var $iframe;

                    $scope.$apply(function() {
                        $scope.videoid = 'x199caf';
                    });
                    $iframe = $preview.find('iframe');

                    expect($iframe.length).toBe(1);

                    expect($iframe.attr('src')).toBe('http://www.dailymotion.com/embed/video/x199caf');
                });
            });
        });
    });
}());
