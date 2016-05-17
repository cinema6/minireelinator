define(['app', 'angular'], function(appModule, angular) {
    'use strict';

    describe('<instagram-player> directive', function() {
        var $rootScope,
            $scope,
            $compile,
            $q,
            InstagramService,
            deferred,
            player;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $q = $injector.get('$q');
                InstagramService = $injector.get('InstagramService');
            });

            spyOn(InstagramService, 'getEmbedInfo').and.callFake(function() {
                deferred = $q.defer();
                return deferred.promise.then(function(result) {
                    deferred = null;
                    return result;
                });
            });

            $scope = $rootScope.$new();
            $scope.id = 'abc123';
            $scope.$apply(function() {
                var $player = $compile('<instagram-player videoid="{{id}}"></instagram-player>')($scope);
                player = angular.element($player[0]);
            });
        });

        afterEach(function() {
            player.remove();
        });

        afterAll(function() {
            $rootScope = null;
            $scope = null;
            $compile = null;
            $q = null;
            InstagramService = null;
            deferred = null;
            player = null;
        });

        it('should watch the video id and replace the loaded video', function() {
            // Load the first video
            $scope.$apply(function() {
                deferred.resolve({ src: 'some src', type: 'video' });
            });
            expect(player.children().length).toBe(1);
            expect(player.children()[0].tagName).toBe('VIDEO');
            expect(player.children()[0].getAttribute('src')).toBe('some src');

            // Load another video
            $scope.$apply(function() {
                $scope.id = '123abc';
            });
            $scope.$apply(function() {
                deferred.resolve({ src: 'some more src', type: 'video' });
            });
            expect(player.children().length).toBe(1);
            expect(player.children()[0].tagName).toBe('VIDEO');
            expect(player.children()[0].getAttribute('src')).toBe('some more src');
        });

        it('should be able to create a video tag with the instagram src', function() {
            $scope.$apply(function() {
                deferred.resolve({ src: 'some src', type: 'video' });
            });
            expect(player.children().length).toBe(1);
            expect(player.children()[0].tagName).toBe('VIDEO');
            expect(player.children()[0].getAttribute('src')).toBe('some src');
            expect(player.children()[0].getAttribute('controls')).toBe('controls');
            expect(player.children()[0].getAttribute('width')).toBe('100%');
            expect(player.children()[0].getAttribute('height')).toBe('100%');
            expect(player.hasClass('instagramVideoPreview')).toBe(true);
        });

        it('should not append a video element if the id does not belong to an Instagram video', function() {
            $scope.$apply(function() {
                deferred.resolve({ src: 'some src', type: 'image' });
            });
            expect(player.children().length).toBe(0);
        });
    });
});
