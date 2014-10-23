define(['minireel/sponsor'], function(sponsorModule) {
    'use strict';

    describe('AdPlayerController', function() {
        var $rootScope,
            $controller,
            c6EventEmitter,
            $scope,
            AdPlayerCtrl;

        beforeEach(function() {
            module(sponsorModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6EventEmitter = $injector.get('c6EventEmitter');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    AdPlayerCtrl = $controller('AdPlayerController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(AdPlayerCtrl).toEqual(jasmine.any(Object));
        });

        describe('player', function() {
            it('should be null', function() {
                expect(AdPlayerCtrl.player).toBeNull();
            });
        });

        describe('$events', function() {
            ['<vpaid-player>:init', '<vast-player>:init'].forEach(function($event) {
                describe($event, function() {
                    var iface;

                    beforeEach(function() {
                        iface = c6EventEmitter({});

                        $scope.$emit($event, iface);
                    });

                    describe('when the interface is ready', function() {
                        beforeEach(function() {
                            iface.emit('ready');
                        });

                        it('should make the interface the "player" property', function() {
                            expect(AdPlayerCtrl.player).toBe(iface);
                        });
                    });
                });
            });
        });
    });
});
