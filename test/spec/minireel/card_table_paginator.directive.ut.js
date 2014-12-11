(function() {
    'use strict';

    define(['minireel/card_table','app','templates'], function(appModule,cardTableModule) {
        ddescribe('<card-table-paginator>', function() {
            var $rootScope,
                $scope,
                $compile;

            var paginator,
                scope;

            beforeEach(function() {
                module(appModule.name);
                module(cardTableModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');

                    $scope = $rootScope.$new();
                });

                $scope.scrollSpy = jasmine.createSpy('scrollSpy');
                $scope.scrollerViewPosition = 0;
                $scope.scrollerViewRatio = 0;

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

                paginator = $('<card-table-paginator deck="EditorCtrl.model.data.deck" on-scroll="scrollSpy(position)" scroller-view-position="scrollerViewPosition" scroller-view-ratio="scrollerViewRatio"><ul id="paginator-list" style="display:inline-block;list-style:none;margin:0;padding:0;"><li card-table-paginator-item ng-repeat="card in EditorCtrl.model.data.deck" style="width:25px;display:inline-block;margin:0;padding:0;">{{$index}}</li></ul></card-table-paginator>');
                $('body').append(paginator);

                $scope.$apply(function() {
                    paginator = $compile(paginator)($scope);
                });

                scope = paginator.isolateScope();
            });

            afterEach(function() {
                paginator.remove();
            });

            describe('when ready', function() {
                it('should set scope variables', function() {
                    expect(scope.scrollBoxWidth).toBe(125);
                });
            });
        });
    });
}());