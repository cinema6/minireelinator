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
                $scope.scrollerViewPosition = 0.5;
                $scope.scrollerViewRatio = 0.25;

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
                                }
                            ]
                        }
                    }
                };

                paginator = $('<card-table-paginator deck="EditorCtrl.model.data.deck" on-scroll="scrollSpy(position)" scroller-view-position="scrollerViewPosition" scroller-view-ratio="scrollerViewRatio"><ul id="paginator-list" style="display:inline-block;list-style:none;margin:0;padding:0;"><li card-table-paginator-item ng-repeat="card in EditorCtrl.model.data.deck" style="width:20px;display:inline-block;margin:0;padding:0;">{{$index}}</li><li style="width:20px;display:inline-block;margin:0;padding:0;">+</li></ul></card-table-paginator>');
                $('body').append(paginator);

                $scope.$apply(function() {
                    paginator = $compile(paginator)($scope);
                });

                scope = paginator.isolateScope();
            });

            afterEach(function() {
                paginator.remove();
            });

            describe('$watchers', function() {
                describe('ready', function() {
                    it('should set scope variables when true', function() {
                        expect(scope.scrollBoxWidth).toBe(100);
                        expect(scope.scrollerWidth).toBe(25);
                    });
                });

                describe('scrollerViewRatio', function() {
                    it('should recalculate', function() {
                        $scope.$apply(function() {
                            scope.scrollerViewRatio = 0.5;
                        });

                        expect(scope.scrollBoxWidth).toBe(100);
                        expect(scope.scrollerWidth).toBe(50);
                    });
                });

                describe('scrollerViewPosition', function() {
                    it('should set the scroller position', function() {
                        $scope.$apply(function() {
                            scope.scrollerViewPosition = 0.25;
                        });

                        expect(paginator.find('#paginator-scroller')[0].style.left).toBe('25px');

                        $scope.$apply(function() {
                            scope.scrollerViewPosition = 0.5;
                        });

                        expect(paginator.find('#paginator-scroller')[0].style.left).toBe('50px');
                    });
                });
            });

            describe('scrolling', function() {
                it('should', function() {
                    var scroller = paginator.find('#paginator-scroller').data('cDrag');

                    var _event = {
                        desired: {
                            left: 1,
                        }
                    };

                    scroller.emit(_event);

                    expect($scope.scrollSpy).toHaveBeenCalled();
                });
            });
        });
    });
}());