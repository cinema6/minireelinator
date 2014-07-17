(function() {
    'use strict';
    /* global angular:true */

    define(['minireel/card_table'], function(cardTableModule) {
        var forEach = angular.forEach;

        describe('render-deck=""', function() {
            var $rootScope,
                $scope,
                $compile;

            var $container,
                deck,
                domElements;

            beforeEach(function() {
                deck = [
                    {
                        id: 'rc-1',
                        title: 'Card 1'
                    },
                    {
                        id: 'rc-2',
                        title: 'Card 2'
                    },
                    {
                        id: 'rc-3',
                        title: 'Card 3'
                    },
                    {
                        id: 'rc-4',
                        title: 'Card 4'
                    },
                    {
                        id: 'rc-5',
                        title: 'Card 5'
                    }
                ];

                module(cardTableModule.name, function($compileProvider) {
                    $compileProvider.directive('parentTest', function() {
                        return {
                            link: function(scope, $element) {
                                expect($element.parent().length).toBe(1);
                            }
                        };
                    });
                });

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');

                    $scope = $rootScope.$new();
                    $scope.deck = deck;
                });

                $scope.$apply(function() {
                    $container = $compile([
                        '<ul>',
                        '    <li render-deck="deck" parent-test>{{$index}}: {{$this.title}}</li>',
                        '</ul>'
                    ].join('\n'))($scope);
                });

                domElements = (function() {
                    var object = {};

                    forEach($container.find('li'), function(li) {
                        object[$(li).scope().this.id] = li;
                    });

                    return object;
                }());
            });

            it('should repeat the DOM element for every item in the collection, making each item available as "$this"', function() {
                var $lis = $container.find('li');

                expect($lis.length).toBe(5);
                forEach($lis, function(li, index) {
                    expect($(li).text()).toBe(index + ': Card ' + (index + 1));
                });
            });

            it('should support inserting new items (without re-rendering the entire list)', function() {
                var $lis;

                $scope.$apply(function() {
                    deck.splice(2, 0, { id: 'rc-a', title: 'Card A' });
                });

                $lis = $container.find('li');

                expect($lis.length).toBe(6);
                expect($lis.eq(2).text()).toBe('2: Card A');
                forEach($lis, function(li, listIndex) {
                    var id = $(li).scope().$this.id,
                        index = id.match(/(rc-)(\w)/)[2].toUpperCase(),
                        element = domElements[id];

                    expect($(li).text()).toBe(listIndex + ': Card ' + index);

                    if (element) {
                        expect(li).toBe(element);
                    }
                });
            });

            it('should support removing items from the list', function() {
                var $lis,
                    destroySpy = jasmine.createSpy('$destroy');

                $container.find('li:eq(1)').scope().$on('$destroy', destroySpy);
                $scope.$apply(function() {
                    deck.splice(1, 1);
                });
                $lis = $container.find('li');

                expect(destroySpy).toHaveBeenCalled();

                expect($lis.length).toBe(4);
                forEach(deck, function(card, index) {
                    var element = domElements[card.id];

                    if (element) {
                        expect(element).toBe($lis.eq(index)[0]);
                    }

                    expect($lis.eq(index).text()).toBe(index + ': ' + card.title);
                });
            });

            it('should support moving items in the list', function() {
                var $lis;

                $scope.$apply(function() {
                    var card = deck.splice(3, 1)[0];
                    deck.splice(1, 0, card);
                });
                $lis = $container.find('li');

                forEach(deck, function(card, index) {
                    var element = domElements[card.id];

                    if (element) {
                        expect(element).toBe($lis.eq(index)[0]);
                    }

                    expect($lis.eq(index).text()).toBe(index + ': ' + card.title);
                });
            });
        });
    });
}());
