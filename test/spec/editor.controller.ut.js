(function() {
    'use strict';

    define(['editor'], function() {
        describe('EditorController', function() {
            var $rootScope,
                $scope,
                $childScope,
                $controller,
                c6State,
                EditorCtrl;

            var cModel;

            beforeEach(function() {
                cModel = {
                    data: {
                        deck: [
                            {},
                            {},
                            {}
                        ]
                    }
                };

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    c6State = $injector.get('c6State');

                    $scope = $rootScope.$new();
                    $childScope = $scope.$new();
                    EditorCtrl = $controller('EditorController', { $scope: $scope, cModel: cModel });
                });
            });

            it('should exist', function() {
                expect(EditorCtrl).toEqual(jasmine.any(Object));
            });

            describe('initialization', function() {
                it('should put a reference to the model on itself', function() {
                    expect(EditorCtrl.model).toBe(cModel);
                });
            });

            describe('methods', function() {
                describe('editCard(card)', function() {
                    beforeEach(function() {
                        spyOn(c6State, 'transitionTo');

                        EditorCtrl.editCard({ id: 'rc-c98312239510db' });
                    });

                    it('should transition to the editor.editCard state', function() {
                        expect(c6State.transitionTo).toHaveBeenCalledWith('editor.editCard', { id: 'rc-c98312239510db' });
                    });
                });

                describe('newCard()', function() {
                    beforeEach(function() {
                        spyOn(c6State, 'transitionTo');

                        EditorCtrl.newCard();
                    });

                    it('should transition to the editor.newCard.type state', function() {
                        expect(c6State.transitionTo).toHaveBeenCalledWith('editor.newCard.type');
                    });
                });
            });

            describe('events', function() {
                describe('addCard', function() {
                    var card;

                    beforeEach(function() {
                        card = {};

                        $childScope.$emit('addCard', card);
                    });

                    it('should push the card onto the deck', function() {
                        var deck = cModel.data.deck;

                        expect(deck[deck.length - 1]).toBe(card);
                    });
                });
            });
        });
    });
}());
