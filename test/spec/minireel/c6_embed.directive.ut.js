define( ['app',     'c6embed','jquery'],
function( appModule, c6embed , $      ) {
    'use strict';

    describe('<c6-embed>', function() {
        var $rootScope;
        var $compile;
        var $q;
        var $timeout;
        var c6EventEmitter;
        var MiniReelService;

        var $scope;
        var $c6Embed;

        var player;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $q = $injector.get('$q');
                $timeout = $injector.get('$timeout');
                c6EventEmitter = $injector.get('c6EventEmitter');
                MiniReelService = $injector.get('MiniReelService');
            });

            spyOn(MiniReelService, 'modeDataOf');

            spyOn(c6embed, 'Player').and.callFake(function() {
                player = c6EventEmitter({});
                player.session = null;
                player.frame = null;

                player.shown = false;

                player.show = jasmine.createSpy('Player.prototype.show()');
                player.hide = jasmine.createSpy('Player.prototype.hide()');

                player.bootstrap = jasmine.createSpy('Player.prototype.bootstrap()').and.callFake(function(container, styles) {
                    var $frame = $('<iframe src="about:blank"></iframe>');
                    var session = c6EventEmitter({});

                    $frame.css(styles);

                    session.ping = jasmine.createSpy('PlayerSession.prototype.ping()');

                    session.on('open', function() { player.shown = true; });
                    session.on('close', function() { player.shown = false; });

                    $(container).append($frame);

                    player.frame = $frame[0];
                    player.session = session;

                    return $q.defer().promise;
                });

                return player;
            });

            $scope = $rootScope.$new();

            $scope.experience = null;
            $scope.active = null;
            $scope.profile = null;
            $scope.card = null;
            $scope.standalone = null;

            $scope.$apply(function() {
                $c6Embed = $compile('<c6-embed experience="experience" active="active" profile="profile" card="card" standalone="standalone"></c6-embed>')($scope);
            });

            $('body').append($c6Embed);
        });

        afterEach(function() {
            $c6Embed.remove();
        });

        describe('$watchers', function() {
            describe('experience', function() {
                describe('when set', function() {
                    var experience;
                    var modeData;

                    beforeEach(function() {
                        experience = {
                            id: 'e-f3ee40317d2cac',
                            appUri: 'mini-reel-player',
                            data: {
                                branding: 'c6studio',
                                mode: 'light',
                                title: 'My MiniReel',
                                deck: []
                            }
                        };

                        modeData = { fullscreen: false };

                        MiniReelService.modeDataOf.and.callFake(function(minireel) {
                            expect(minireel).toBe(experience);

                            return modeData;
                        });

                        $scope.$apply(function() {
                            $scope.experience = experience;
                        });
                    });

                    it('should load the player', function() {
                        expect(c6embed.Player).toHaveBeenCalledWith('/api/public/players/light', {
                            container: 'studio',
                            context: 'studio',
                            preview: true,
                            standalone: null,
                            branding: experience.data.branding
                        }, { experience: experience });
                    });

                    it('should bootstrap the player', function() {
                        expect(player.bootstrap).toHaveBeenCalledWith($c6Embed[0], {
                            position: 'absolute',
                            top: '0px',
                            left: '0px',
                            width: '100%',
                            height: '100%',
                            zIndex: 'auto'
                        });
                    });

                    describe('when responsiveStyles are sent', function() {
                        var styles;

                        beforeEach(function() {
                            styles = { display: 'block' };
                        });

                        describe('before the player is opened', function() {
                            beforeEach(function() {
                                player.session.emit('responsiveStyles', styles);
                            });

                            it('should not set the styles', function() {
                                expect($c6Embed.css('display')).not.toBe('block');
                            });

                            describe('but then it is opened', function() {
                                beforeEach(function() {
                                    player.session.emit('open');
                                });

                                it('should set the styles', function() {
                                    expect($c6Embed.css('display')).toBe('block');
                                });
                            });
                        });

                        describe('after the player is opened', function() {
                            beforeEach(function() {
                                player.session.emit('open');

                                player.session.emit('responsiveStyles', styles);
                            });

                            it('should set the styles', function() {
                                expect($c6Embed.css('display')).toBe('block');
                            });
                        });
                    });

                    describe('when the player is', function() {
                        var digestSpy;

                        beforeEach(function() {
                            digestSpy = jasmine.createSpy('digestSpy()');
                        });

                        describe('closed', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    $scope.active = true;
                                });
                                player.session.emit('open');
                                player.session.emit('responsiveStyles', {
                                    display: 'block'
                                });

                                $scope.$watch('active', digestSpy);

                                player.session.emit('close');
                            });

                            it('should set scope.active to false', function() {
                                expect($scope.active).toBe(false);
                                expect(digestSpy).toHaveBeenCalled();
                            });

                            it('should clear the element\'s style', function() {
                                expect($c6Embed.attr('style')).toBe('');
                            });

                            describe('and reopened', function() {
                                beforeEach(function() {
                                    player.session.emit('open');
                                });

                                it('should set the styles again', function() {
                                    expect($c6Embed.css('display')).toBe('block');
                                });
                            });
                        });

                        describe('opened', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    $scope.active = false;
                                });

                                $scope.$watch('active', digestSpy);
                            });

                            describe('and there is no mode data', function() {
                                beforeEach(function() {
                                    modeData = undefined;

                                    player.session.emit('open');
                                });

                                it('should set scope.active to true', function() {
                                    expect($scope.active).toBe(true);
                                    expect(digestSpy).toHaveBeenCalled();
                                });

                                it('should not fullscreen the player', function() {
                                    expect($(player.frame).css('position')).not.toBe('fixed');
                                    expect($(player.frame).css('z-index')).not.toBe('2147483647');
                                });
                            });

                            describe('and the mode is not fullscreen', function() {
                                beforeEach(function() {
                                    modeData = { fullscreen: false };

                                    player.session.emit('open');
                                });

                                it('should set scope.active to true', function() {
                                    expect($scope.active).toBe(true);
                                    expect(digestSpy).toHaveBeenCalled();
                                });

                                it('should not fullscreen the player', function() {
                                    expect($(player.frame).css('position')).not.toBe('fixed');
                                    expect($(player.frame).css('z-index')).not.toBe('2147483647');
                                });
                            });

                            describe('and the mode is fullscreen', function() {
                                beforeEach(function() {
                                    modeData = { fullscreen: true };

                                    player.session.emit('open');
                                });

                                it('should set scope.active to true', function() {
                                    expect($scope.active).toBe(true);
                                    expect(digestSpy).toHaveBeenCalled();
                                });

                                it('should fullscreen the player', function() {
                                    expect($(player.frame).css('position')).toBe('fixed');
                                    expect($(player.frame).css('z-index')).toBe('2147483647');
                                });

                                describe('and then it is closed', function() {
                                    beforeEach(function() {
                                        player.session.emit('close');
                                    });

                                    it('should remove the fullscreen styles', function() {
                                        expect($(player.frame).css('position')).toBe('absolute');
                                        expect($(player.frame).css('z-index')).toBe('auto');
                                    });
                                });

                                describe('but the device type is a phone', function() {
                                    beforeEach(function() {
                                        $scope.$apply(function() {
                                            $scope.profile = { device: 'phone' };
                                        });

                                        player.session.emit('open');
                                    });

                                    it('should not fullscreen the player', function() {
                                        expect($(player.frame).css('position')).not.toBe('fixed');
                                        expect($(player.frame).css('z-index')).not.toBe('2147483647');
                                    });
                                });
                            });
                        });
                    });

                    describe('if the experience is changed', function() {
                        beforeEach(function() {
                            experience = {
                                id: 'e-bb48a12d32b3d4',
                                appUri: 'mini-reel-player',
                                data: {
                                    title: 'Some Other MiniReel',
                                    deck: []
                                }
                            };
                            $c6Embed.css({
                                padding: '100px',
                                margin: '5px',
                                color: 'red'
                            });

                            $scope.$apply(function() {
                                $scope.experience = experience;
                            });
                        });

                        it('should only allow one iframe to be in the DOM', function() {
                            expect($c6Embed.find('iframe').length).toBe(1);
                        });

                        it('should clear the element\'s style', function() {
                            expect($c6Embed.attr('style')).toBe('');
                        });
                    });

                    describe('if the experience is set to null', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.experience = null;
                            });
                        });

                        it('should remove the iframe', function() {
                            expect($c6Embed.find('iframe').length).toBe(0);
                        });
                    });

                    describe('if active is false', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = true;
                            });

                            player.hide.calls.reset();
                            player.show.calls.reset();
                            player.bootstrap.calls.reset();

                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                        });

                        it('should not bootstrap the player', function() {
                            expect(player.bootstrap).not.toHaveBeenCalled();
                        });

                        it('should not remove the iframe', function() {
                            expect($c6Embed.find('iframe').length).toBe(1);
                        });

                        it('should close the player', function() {
                            expect(player.show).not.toHaveBeenCalled();
                            expect(player.hide).toHaveBeenCalled();
                        });
                    });

                    describe('if active is true', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.active = false;
                            });

                            player.hide.calls.reset();
                            player.show.calls.reset();
                            player.bootstrap.calls.reset();

                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should not bootstrap the player', function() {
                            expect(player.bootstrap).not.toHaveBeenCalled();
                        });

                        it('should not remove the iframe', function() {
                            expect($c6Embed.find('iframe').length).toBe(1);
                        });

                        it('should show the player', function() {
                            expect(player.show).toHaveBeenCalled();
                            expect(player.hide).not.toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('profile', function() {
                describe('if there is no experience', function() {
                    beforeEach(function() {
                        $scope.experience = null;
                        c6embed.Player.calls.reset();
                        player.bootstrap.calls.reset();

                        $scope.$apply(function() {
                            $scope.profile = {
                                device: 'desktop'
                            };
                        });
                    });

                    it('should do nothing', function() {
                        expect(c6embed.Player).not.toHaveBeenCalled();
                        expect(player.bootstrap).not.toHaveBeenCalled();
                    });
                });

                describe('if there is an experience', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.experience = {
                                id: 'e-f3ee40317d2cac',
                                appUri: 'mini-reel-player',
                                data: {
                                    mode: 'light',
                                    title: 'My MiniReel',
                                    deck: []
                                }
                            };
                        });

                        c6embed.Player.calls.reset();
                        player.bootstrap.calls.reset();
                    });

                    ['desktop'].forEach(function(type) {
                        describe('if the device is ' + type, function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    $scope.profile = { device: type };
                                });
                            });

                            it('should not change the mode', function() {
                                expect(c6embed.Player).toHaveBeenCalledWith('/api/public/players/light', jasmine.any(Object), jasmine.any(Object));
                            });
                        });
                    });

                    ['phone'].forEach(function(type) {
                        describe('if the device is ' + type, function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    $scope.profile = { device: type };
                                });
                            });

                            it('should change the mode to mobile', function() {
                                expect(c6embed.Player).toHaveBeenCalledWith('/api/public/players/mobile', jasmine.any(Object), jasmine.any(Object));
                            });
                        });
                    });
                });
            });

            describe('card', function() {
                describe('when set', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            $scope.experience = {
                                id: 'e-f3ee40317d2cac',
                                appUri: 'mini-reel-player',
                                data: {
                                    title: 'My MiniReel',
                                    deck: []
                                }
                            };
                        });
                    });

                    describe('if active is true', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.card = { id: 'rc-d045f231ca8a46' };
                                $scope.active = true;
                            });
                        });

                        it('should ping the session with the id of the card it should show', function() {
                            expect(player.session.ping).toHaveBeenCalledWith('showCard', $scope.card.id);
                        });
                    });

                    describe('if active is false', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.card = { id: 'rc-d045f231ca8a46' };
                                $scope.active = false;
                            });
                        });

                        it('should not ping the session', function() {
                            expect(player.session.ping).not.toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('active', function() {
                describe('if true', function() {
                    describe('if there is no experience', function() {
                        beforeEach(function() {
                            $scope.experience = null;
                            c6embed.Player.calls.reset();
                            player.bootstrap.calls.reset();

                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should do nothing', function() {
                            expect(c6embed.Player).not.toHaveBeenCalled();
                            expect(player.bootstrap).not.toHaveBeenCalled();
                        });
                    });

                    describe('if there is an experience', function() {
                        var experience;

                        beforeEach(function() {
                            experience = {
                                id: 'e-f3ee40317d2cac',
                                appUri: 'mini-reel-player',
                                data: {
                                    title: 'My MiniReel',
                                    deck: []
                                }
                            };

                            $scope.$apply(function() {
                                $scope.experience = experience;
                            });

                            c6embed.Player.calls.reset();
                            player.bootstrap.calls.reset();
                            player.show.calls.reset();

                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should not create a new Player', function() {
                            expect(c6embed.Player).not.toHaveBeenCalled();
                            expect(player.bootstrap).not.toHaveBeenCalled();
                        });

                        it('should show the player', function() {
                            expect(player.show).toHaveBeenCalled();
                        });
                    });
                });

                describe('if false', function() {
                    describe('if there is no experience', function() {
                        beforeEach(function() {
                            $scope.experience = null;
                            c6embed.Player.calls.reset();
                            player.bootstrap.calls.reset();

                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                        });

                        it('should do nothing', function() {
                            expect(c6embed.Player).not.toHaveBeenCalled();
                            expect(player.bootstrap).not.toHaveBeenCalled();
                        });
                    });

                    describe('if there is an experience', function() {
                        var experience;

                        beforeEach(function() {
                            experience = {
                                id: 'e-f3ee40317d2cac',
                                appUri: 'mini-reel-player',
                                data: {
                                    title: 'My MiniReel',
                                    deck: []
                                }
                            };

                            $scope.$apply(function() {
                                $scope.experience = experience;
                            });

                            c6embed.Player.calls.reset();
                            player.bootstrap.calls.reset();
                            player.hide.calls.reset();

                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                        });

                        it('should not create a new Player', function() {
                            expect(c6embed.Player).not.toHaveBeenCalled();
                            expect(player.bootstrap).not.toHaveBeenCalled();
                        });

                        it('should hide the player', function() {
                            expect(player.hide).toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('experience and active', function() {
                describe('when both initially set', function() {
                    beforeEach(function() {
                        $scope.$destroy();
                        $scope = $rootScope.$new();

                        $scope.experience = {
                            id: 'e-f3ee40317d2cac',
                            appUri: 'mini-reel-player',
                            data: {
                                title: 'My MiniReel',
                                deck: []
                            }
                        };
                        $scope.active = true;

                        $c6Embed.remove();

                        c6embed.Player.calls.reset();
                        player.bootstrap.calls.reset();
                        player.show.calls.reset();

                        $scope.$apply(function() {
                            $c6Embed = $compile('<c6-embed experience="experience" active="active" profile="profile" card="card" standalone="standalone"></c6-embed>')($scope);
                        });
                    });

                    it('should create a player', function() {
                        expect(c6embed.Player).toHaveBeenCalled();
                    });

                    it('should bootstrap the player', function() {
                        expect(player.bootstrap).toHaveBeenCalled();
                    });

                    it('should show the player', function() {
                        expect(player.show).toHaveBeenCalled();
                    });
                });
            });
        });
    });
});
