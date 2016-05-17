(function() {
    'use strict';

    define(['minireel/card_table','app','templates'], function(appModule,cardTableModule) {
        describe('<card-table>', function() {
            var $rootScope,
                $scope,
                $compile,
                $window,
                $timeout,
                cardTable,
                Ctrl;

            beforeEach(function() {
                module(appModule.name);
                module(cardTableModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    $window = $injector.get('$window');
                    $timeout = $injector.get('$timeout');

                    $scope = $rootScope.$new();
                });

                $scope.EditorCtrl = {
                    model: {
                        data: {
                            deck: [
                                {
                                    id: 'rc-1',
                                    title: 'Card 1',
                                    view: 'video',
                                    data: {
                                        service: 'youtube'
                                    }
                                },
                                {
                                    id: 'rc-2',
                                    title: 'Card 2',
                                    view: 'video',
                                    data: {
                                        service: 'youtube'
                                    }
                                },
                                {
                                    id: 'rc-3',
                                    title: 'Card 3',
                                    view: 'video',
                                    data: {
                                        service: 'youtube'
                                    }
                                },
                                {
                                    id: 'rc-4',
                                    title: 'Card 4',
                                    view: 'video',
                                    data: {
                                        service: 'youtube'
                                    }
                                },
                                {
                                    id: 'rc-5',
                                    title: 'Card 5',
                                    view: 'video',
                                    data: {
                                        service: 'youtube'
                                    }
                                }
                            ]
                        }
                    }
                };

                $scope.$apply(function() {
                    cardTable = $compile('<card-table></card-table>')($scope);
                });

                Ctrl = cardTable.controller('cardTable');
                spyOn(Ctrl, 'getThumbs');
                spyOn(Ctrl, 'setScrollerFullWidth');
                spyOn(Ctrl, 'setFirstButtonWidth');
                spyOn(Ctrl, 'setScrollerRect');
            });

            afterEach(function() {
                cardTable.remove();
            });

            afterAll(function() {
                $rootScope = null;
                $scope = null;
                $compile = null;
                $window = null;
                $timeout = null;
                cardTable = null;
                Ctrl = null;
            });

            describe('initialization', function() {
                it('should set props on the Ctrl', function() {
                    $timeout.flush();
                    expect(Ctrl.setScrollerFullWidth).toHaveBeenCalled();
                    expect(Ctrl.setFirstButtonWidth).toHaveBeenCalled();
                    expect(Ctrl.setScrollerRect).toHaveBeenCalled();
                });
            });

            describe('when a card is added to the deck', function() {
                it('should recalculate', function() {
                    $timeout.flush();
                    Ctrl.setScrollerFullWidth.calls.reset();
                    Ctrl.setFirstButtonWidth.calls.reset();
                    Ctrl.setScrollerRect.calls.reset();

                    $scope.EditorCtrl.model.data.deck.push({
                        id: 'rc-6',
                        title: 'Card 6',
                        view: 'video',
                        data: {
                            service: 'youtube'
                        }
                    });
                    $scope.$digest();
                    $timeout.flush();

                    expect(Ctrl.setScrollerFullWidth).toHaveBeenCalled();
                    expect(Ctrl.setFirstButtonWidth).toHaveBeenCalled();
                    expect(Ctrl.setScrollerRect).toHaveBeenCalled();
                });
            });

            describe('when the window is resized', function() {
                it('should recalculate', function() {
                    $timeout.flush();
                    Ctrl.setScrollerFullWidth.calls.reset();
                    Ctrl.setFirstButtonWidth.calls.reset();
                    Ctrl.setScrollerRect.calls.reset();

                    angular.element($window).trigger('resize');
                    $scope.$digest();
                    $timeout.flush();

                    expect(Ctrl.setScrollerFullWidth).toHaveBeenCalled();
                    expect(Ctrl.setFirstButtonWidth).toHaveBeenCalled();
                    expect(Ctrl.setScrollerRect).toHaveBeenCalled();
                });
            });

            describe('when cards in the deck are re-ordered', function() {
                it('should not trigger a resize', function() {
                    var editedDeck = angular.copy($scope.EditorCtrl.model.data.deck);
                    editedDeck.reverse();

                    $timeout.flush();
                    Ctrl.setScrollerFullWidth.calls.reset();
                    Ctrl.setFirstButtonWidth.calls.reset();
                    Ctrl.setScrollerRect.calls.reset();

                    $scope.EditorCtrl.model.data.deck = editedDeck;
                    $scope.$digest();

                    expect(Ctrl.setScrollerFullWidth).not.toHaveBeenCalled();
                    expect(Ctrl.setFirstButtonWidth).not.toHaveBeenCalled();
                    expect(Ctrl.setScrollerRect).not.toHaveBeenCalled();
                });
            });
        });
    });
}());
