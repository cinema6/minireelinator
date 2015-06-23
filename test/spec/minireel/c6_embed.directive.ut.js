define( ['minireel/editor','c6embed','jquery'],
function( editorModule    , c6embed , $      ) {
    'use strict';

    describe('<c6-embed>', function() {
        var $rootScope;
        var $compile;
        var $q;
        var $timeout;

        var $scope;
        var $c6Embed;

        beforeEach(function() {
            module(editorModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $q = $injector.get('$q');
                $timeout = $injector.get('$timeout');
            });

            $scope = $rootScope.$new();

            $scope.experience = null;
            $scope.active = null;
            $scope.profile = null;
            $scope.card = null;

            $scope.$apply(function() {
                $c6Embed = $compile('<c6-embed experience="experience" active="active" profile="profile" card="card"></c6-embed>')($scope);
            });

            $('body').append($c6Embed);
        });

        afterEach(function() {
            $c6Embed.remove();
        });

        describe('$watchers', function() {
            var session;
            var player;
            var sessionReadyDeferred;

            beforeEach(function() {
                spyOn(c6embed, 'loadExperience').and.callFake(function(settings) {
                    sessionReadyDeferred = $q.defer();
                    session = {
                        ping: jasmine.createSpy('session.ping()')
                    };

                    player = {
                        getReadySession: function() {
                            return sessionReadyDeferred.promise;
                        }
                    };

                    settings.state = {
                        set: jasmine.createSpy('state.set()'),
                        observe: jasmine.createSpy('state.observe()').and.callFake(function() {
                            return settings.state;
                        })
                    };
                    settings.getPlayer = function() {
                        return $q.when(player);
                    };
                    $(settings.embed).append('<iframe src="about:blank"></iframe>');
                });
            });

            describe('experience', function() {
                describe('when set', function() {
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
                            $scope.profile = {
                                device: 'desktop',
                                flash: true
                            };
                            $scope.experience = experience;
                        });
                    });

                    it('should load the experience', function() {
                        expect(c6embed.loadExperience).toHaveBeenCalledWith(jasmine.objectContaining({
                            experience: experience,
                            embed: $c6Embed[0],
                            splashDelegate: {},
                            profile: $scope.profile,
                            config: {
                                container: 'studio',
                                exp: experience.id,
                                responsive: true,
                                title: experience.data.title
                            }
                        }), jasmine.any(Boolean));
                    });

                    it('should observe the active property', function() {
                        var settings = c6embed.loadExperience.calls.mostRecent().args[0];

                        expect(settings.state.observe).toHaveBeenCalledWith('active', jasmine.any(Function));
                    });

                    describe('when active is', function() {
                        var settings;
                        var handler;
                        var digestSpy;

                        beforeEach(function() {
                            settings = c6embed.loadExperience.calls.mostRecent().args[0];
                            digestSpy = jasmine.createSpy('digestSpy()');
                            handler = settings.state.observe.calls.mostRecent().args[1];
                        });

                        describe('changed', function() {
                            describe('to false', function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        $scope.active = true;
                                    });

                                    $scope.$watch('active', digestSpy);

                                    handler(false, true);
                                });

                                it('should set scope.active to false', function() {
                                    expect($scope.active).toBe(false);
                                    expect(digestSpy).toHaveBeenCalled();
                                });
                            });

                            describe('to true', function() {
                                beforeEach(function() {
                                    $scope.$apply(function() {
                                        $scope.active = false;
                                    });

                                    $scope.$watch('active', digestSpy);

                                    handler(true, false);
                                });

                                it('should set scope.active to true', function() {
                                    expect($scope.active).toBe(true);
                                    expect(digestSpy).toHaveBeenCalled();
                                });
                            });
                        });

                        describe('initialized', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    $scope.active = true;
                                });

                                handler(false, false);
                            });

                            it('should do nothing', function() {
                                expect($scope.active).toBe(true);
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
                            c6embed.loadExperience.calls.reset();
                            $scope.active = false;

                            $scope.$apply(function() {
                                $c6Embed = $compile('<c6-embed experience="experience" active="active"></c6-embed>')($scope);
                            });
                        });

                        it('should call with the second parameter as true', function() {
                            expect(c6embed.loadExperience).toHaveBeenCalledWith(jasmine.any(Object), true);
                        });
                    });

                    describe('if active is true', function() {
                        beforeEach(function() {
                            c6embed.loadExperience.calls.reset();
                            $scope.active = true;

                            $scope.$apply(function() {
                                $c6Embed = $compile('<c6-embed experience="experience" active="active"></c6-embed>')($scope);
                            });
                        });

                        it('should call with the second parameter as false', function() {
                            expect(c6embed.loadExperience).toHaveBeenCalledWith(jasmine.any(Object), false);
                        });
                    });
                });
            });

            describe('profile', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.profile = {
                            device: 'desktop',
                            flash: true
                        };
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

                describe('when changed', function() {
                    beforeEach(function() {
                        c6embed.loadExperience.calls.reset();

                        $scope.$apply(function() {
                            $scope.profile = {
                                device: 'desktop',
                                flash: true
                            };
                        });
                    });

                    it('should re-embed the minireel', function() {
                        expect(c6embed.loadExperience).toHaveBeenCalledWith(jasmine.objectContaining({
                            profile: $scope.profile
                        }), !$scope.active);
                    });

                    describe('if the device is', function() {
                        beforeEach(function() {
                            c6embed.loadExperience.calls.reset();
                        });

                        describe('desktop', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    $scope.profile = { device: 'desktop' };
                                });
                            });

                            it('should allow fullscreen', function() {
                                expect(c6embed.loadExperience).toHaveBeenCalledWith(jasmine.objectContaining({
                                    allowFullscreen: true
                                }), jasmine.any(Boolean));
                            });
                        });

                        describe('phone', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    $scope.profile = { device: 'phone' };
                                });
                            });

                            it('should not allow fullscreen', function() {
                                expect(c6embed.loadExperience).toHaveBeenCalledWith(jasmine.objectContaining({
                                    allowFullscreen: false
                                }), jasmine.any(Boolean));
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

                        it('should not ping the session', function() {
                            expect(session.ping).not.toHaveBeenCalled();
                        });

                        describe('when the session is ready', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    sessionReadyDeferred.resolve(session);
                                });
                            });

                            it('should not ping the session', function() {
                                expect(session.ping).not.toHaveBeenCalled();
                            });

                            describe('after a timeout of 0', function() {
                                beforeEach(function() {
                                    $timeout.flush();
                                });

                                it('should ping the session with the id of the card it should show', function() {
                                    expect(session.ping).toHaveBeenCalledWith('showCard', $scope.card.id);
                                });
                            });
                        });
                    });

                    describe('if active is false', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                $scope.card = { id: 'rc-d045f231ca8a46' };
                                $scope.active = false;
                            });
                            $scope.$apply(function() {
                                sessionReadyDeferred.resolve(session);
                            });
                            try { $timeout.flush(); } catch(e) {}
                        });

                        it('should not ping the session', function() {
                            expect(session.ping).not.toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('active', function() {
                describe('if true', function() {
                    describe('if there is no experience', function() {
                        beforeEach(function() {
                            $scope.experience = null;

                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should do nothing', function() {
                            expect(c6embed.loadExperience).not.toHaveBeenCalled();
                        });
                    });

                    describe('if there is an experience', function() {
                        var experience;
                        var settings;
                        var iframe;

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
                            settings = c6embed.loadExperience.calls.mostRecent().args[0];

                            c6embed.loadExperience.calls.reset();
                            settings.state.observe.calls.reset();
                            iframe = $c6Embed.find('iframe')[0];
                            $c6Embed.css({ padding: '100px' });

                            $scope.$apply(function() {
                                $scope.active = true;
                            });
                        });

                        it('should call loadExperience() with the same settings as the inital call', function() {
                            expect(c6embed.loadExperience).toHaveBeenCalledWith(settings, false);
                            expect(c6embed.loadExperience.calls.mostRecent().args[0]).toBe(settings);
                        });

                        it('should not observe the active property again', function() {
                            expect(settings.state.observe).not.toHaveBeenCalled();
                        });

                        it('should not wipe out the iframe', function() {
                            expect(Array.prototype.slice.call($c6Embed.prop('childNodes')).indexOf(iframe)).not.toBe(-1);
                        });

                        it('should not clear the element\'s style', function() {
                            expect($c6Embed.attr('style')).not.toBe('');
                        });
                    });
                });

                describe('if false', function() {
                    describe('if there is no experience', function() {
                        beforeEach(function() {
                            $scope.experience = null;

                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                        });

                        it('should do nothing', function() {
                            expect(c6embed.loadExperience).not.toHaveBeenCalled();
                        });
                    });

                    describe('if there is an experience', function() {
                        var experience;
                        var settings;

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
                            settings = c6embed.loadExperience.calls.mostRecent().args[0];

                            c6embed.loadExperience.calls.reset();

                            $scope.$apply(function() {
                                $scope.active = false;
                            });
                        });

                        it('should not load any experiences', function() {
                            expect(c6embed.loadExperience).not.toHaveBeenCalled();
                        });

                        it('should set state.active to false', function() {
                            expect(settings.state.set).toHaveBeenCalledWith('active', false);
                        });
                    });
                });
            });

            describe('experience and active', function() {
                describe('if both set in the same $digest', function() {
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
                            $scope.active = true;
                        });
                    });

                    it('should only call loadExperience() once', function() {
                        expect(c6embed.loadExperience.calls.count()).toBe(1);
                    });
                });
            });
        });
    });
});
