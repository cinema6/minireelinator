(function() {
    'use strict';

    define(['app', 'minireel/services'], function(appModule, servicesModule) {
        describe('NewCardState', function() {
            var $injector,
                $rootScope,
                $q,
                c6State,
                MiniReelService,
                PortalState,
                NewCardState;

            var user,
                card;

            beforeEach(function() {
                module(servicesModule.name, function($provide) {
                    $provide.decorator('MiniReelService', function($delegate) {
                        var createCard = $delegate.createCard;

                        spyOn($delegate, 'createCard').and.callFake(function() {
                            return (card = createCard.apply($delegate, arguments));
                        });

                        return $delegate;
                    });
                });

                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    c6State = $injector.get('c6State');
                    MiniReelService = $injector.get('MiniReelService');
                });

                PortalState = c6State.get('Portal');
                user = PortalState.cModel = {
                    permissions: {}
                };

                NewCardState = c6State.get('MR:Editor.NewCard');
            });

            it('should exist', function() {
                expect(NewCardState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                var result;

                beforeEach(function() {
                    result = NewCardState.model();
                });

                it('should return a new card', function() {
                    expect(MiniReelService.createCard).toHaveBeenCalledWith('videoBallot');
                    expect(result).toBe(card);
                });
            });

            describe('afterModel()', function() {
                var success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    spyOn(c6State, 'goTo');
                });

                describe('if the user does not have campaign permissions', function() {
                    beforeEach(function() {
                        delete user.permissions.campaigns;

                        $rootScope.$apply(function() {
                            NewCardState.afterModel(MiniReelService.createCard('videoBallot')).then(success, failure);
                        });
                    });

                    it('should go to the edit card state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('MR:EditCard', [card], null, true);
                    });

                    it('should reject the transition', function() {
                        expect(failure).toHaveBeenCalledWith(jasmine.any(Error));
                    });
                });

                describe('if the user has campaign permissions', function() {
                    beforeEach(function() {
                        user.permissions.campaigns = {};

                        $rootScope.$apply(function() {
                            NewCardState.afterModel(MiniReelService.createCard('videoBallot')).then(success, failure);
                        });
                    });

                    it('should succeed with true', function() {
                        expect(success).toHaveBeenCalledWith(true);
                    });
                });
            });
        });
    });
}());
