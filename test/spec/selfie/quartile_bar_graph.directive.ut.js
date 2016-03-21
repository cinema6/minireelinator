define(['app','c6uilib'], function(appModule, c6uilib) {
    'use strict';

    describe('quartile-bar-graph directive', function() {
        var $rootScope,
            $canvas,
            $compile,
            $timeout,
            $graph,
            $scope,
            scope,
            Chart,
            barSkinny,
            _barSkinny,
            graphData,
            graphOptions,
            datasets,
            c6Debounce;

        function compileDirective() {
            $scope.$apply(function() {
                $graph = $compile(
                    '<div quartile-bar-graph stats="stats" duration="duration">' +
                    '   <canvas width="800" height="600"></canvas>' +
                    '</div>'
                )($scope);
            });

            scope = $graph.isolateScope();
        }

        beforeEach(function() {
            datasets = [
                {
                    bars: [
                        { value: 0 },
                        { value: 0 },
                        { value: 0 },
                        { value: 0 }
                    ]
                },
                {
                    bars: [
                        { value: 0 },
                        { value: 0 },
                        { value: 0 },
                        { value: 0 }
                    ]
                }
            ];

            _barSkinny = {
                update: jasmine.createSpy('barSkinny.update()'),
                destroy: jasmine.createSpy('barSkinny.destroy()'),
                datasets: datasets
            };

            barSkinny = jasmine.createSpy('barSkinny()')
                .and.callFake(function(_graphData, _graphOptions) {
                    graphData = _graphData;
                    graphOptions = _graphOptions;

                    graphData.datasets[0].data.forEach(function(val, index) {
                        datasets[0].bars[index].value = val;
                    });

                    graphData.datasets[1].data.forEach(function(val, index) {
                        datasets[1].bars[index].value = val;
                    });

                    return _barSkinny;
                });

            Chart = jasmine.createSpy('Chart()')
                .and.callFake(function(canvas) {
                    $canvas = canvas;
                    return { barSkinny: barSkinny };
                });

            Chart.types = {
                Bar: {
                    extend: jasmine.createSpy('Chart.types.Bar.extend()')
                }
            };

            module(c6uilib.name, function($provide) {
                $provide.decorator('c6Debounce', function($delegate) {
                    return jasmine.createSpy('c6Debounce()').and.callFake(function(fn, time) {
                        c6Debounce.debouncedFn = fn;
                        spyOn(c6Debounce, 'debouncedFn').and.callThrough();

                        return $delegate.call(null, c6Debounce.debouncedFn, time);
                    });
                });
            });

            module(appModule.name, ['$provide', function($provide) {
                $provide.value('Chart', Chart);
            }]);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $timeout = $injector.get('$timeout');
                c6Debounce = $injector.get('c6Debounce');

                $scope = $rootScope.$new();
                $scope.stats = {};
                $scope.duration = {
                    actual: 60,
                    custom: 60
                };
            });
        });

        describe('initialization', function() {
            it('should extend the Bar Chart type', function() {
                compileDirective();

                expect(Chart.types.Bar.extend).toHaveBeenCalledWith({
                    name: 'barSkinny',
                    draw: jasmine.any(Function)
                });
            });

            it('should create a c6Debounced function to handle updating the graph', function() {
                compileDirective();

                expect(c6Debounce).toHaveBeenCalled();
                expect(c6Debounce.debouncedFn).toEqual(jasmine.any(Function));
            });

            it('should initialize a graph', function() {
                $scope.stats = {
                    impressions: 1656,
                    views: 1000,
                    quartile1: 900,
                    quartile2: 800,
                    quartile3: 300,
                    quartile4: 200,
                    totalSpend: '0',
                    linkClicks: {},
                    shareClicks: {}
                };

                compileDirective();

                $timeout.flush();

                expect(Chart).toHaveBeenCalledWith($canvas);
                expect(barSkinny).toHaveBeenCalledWith({
                    labels : ['','','',''],
                    datasets: [
                        {
                            label: 'Actual',
                            fillColor: 'rgba(17, 157, 164, 0.75)',
                            strokeColor: 'rgba(17, 157, 164, 1)',
                            data: [90, 80, 30, 20]
                        },
                        {
                            label: 'Estimated',
                            fillColor: 'rgba(0, 0, 0, 0.1)',
                            strokeColor: 'rgba(0, 0, 0, 0.25)',
                            data: [90, 80, 30, 20]
                        }
                    ]
                }, {
                    scaleOverride : true,
                    scaleSteps : 10,
                    scaleStepWidth : 10,
                    scaleStartValue : 0,
                    showTooltips: true,
                    tooltipTitleFontSize: 0,
                    scaleLabel: '<%= value + "%" %>',
                    multiTooltipTemplate: '<%= datasetLabel %>: <%= value + "%" %>'
                });
            });

            describe('when views are 0', function() {
                it('should render a default graph', function() {
                    $scope.stats = {
                        impressions: 1656,
                        views: 0,
                        quartile1: 900,
                        quartile2: 800,
                        quartile3: 300,
                        quartile4: 200,
                        totalSpend: '0',
                        linkClicks: {},
                        shareClicks: {}
                    };

                    compileDirective();

                    $timeout.flush();

                    expect(Chart).toHaveBeenCalledWith($canvas);
                    expect(barSkinny).toHaveBeenCalledWith({
                        labels : ['','','',''],
                        datasets: [
                            {
                                label: 'Actual',
                                fillColor: 'rgba(17, 157, 164, 0.75)',
                                strokeColor: 'rgba(17, 157, 164, 1)',
                                data: [80, 60, 40, 20]
                            },
                            {
                                label: 'Estimated',
                                fillColor: 'rgba(0, 0, 0, 0.1)',
                                strokeColor: 'rgba(0, 0, 0, 0.25)',
                                data: [80, 60, 40, 20]
                            }
                        ]
                    }, {
                        scaleOverride : true,
                        scaleSteps : 10,
                        scaleStepWidth : 10,
                        scaleStartValue : 0,
                        showTooltips: false,
                        tooltipTitleFontSize: 0,
                        scaleLabel: '<%= value + "%" %>',
                        multiTooltipTemplate: '<%= datasetLabel %>: <%= value + "%" %>'
                    });
                });
            });

            describe('when there is no duration', function() {
                it('should render a default graph', function() {
                    $scope.duration.actual = -1;
                    $scope.stats = {
                        impressions: 1656,
                        views: 1000,
                        quartile1: 900,
                        quartile2: 800,
                        quartile3: 300,
                        quartile4: 200,
                        totalSpend: '0',
                        linkClicks: {},
                        shareClicks: {}
                    };

                    compileDirective();

                    $timeout.flush();

                    expect(Chart).toHaveBeenCalledWith($canvas);
                    expect(barSkinny).toHaveBeenCalledWith({
                        labels : ['','','',''],
                        datasets: [
                            {
                                label: 'Actual',
                                fillColor: 'rgba(17, 157, 164, 0.75)',
                                strokeColor: 'rgba(17, 157, 164, 1)',
                                data: [80, 60, 40, 20]
                            },
                            {
                                label: 'Estimated',
                                fillColor: 'rgba(0, 0, 0, 0.1)',
                                strokeColor: 'rgba(0, 0, 0, 0.25)',
                                data: [80, 60, 40, 20]
                            }
                        ]
                    }, {
                        scaleOverride : true,
                        scaleSteps : 10,
                        scaleStepWidth : 10,
                        scaleStartValue : 0,
                        showTooltips: false,
                        tooltipTitleFontSize: 0,
                        scaleLabel: '<%= value + "%" %>',
                        multiTooltipTemplate: '<%= datasetLabel %>: <%= value + "%" %>'
                    });
                });
            });

            describe('when duration is -1', function() {
                it('should render a default graph', function() {
                    $scope.duration.actual = undefined;
                    $scope.stats = {
                        impressions: 1656,
                        views: 1000,
                        quartile1: 900,
                        quartile2: 800,
                        quartile3: 300,
                        quartile4: 200,
                        totalSpend: '0',
                        linkClicks: {},
                        shareClicks: {}
                    };

                    compileDirective();

                    $timeout.flush();

                    expect(Chart).toHaveBeenCalledWith($canvas);
                    expect(barSkinny).toHaveBeenCalledWith({
                        labels : ['','','',''],
                        datasets: [
                            {
                                label: 'Actual',
                                fillColor: 'rgba(17, 157, 164, 0.75)',
                                strokeColor: 'rgba(17, 157, 164, 1)',
                                data: [80, 60, 40, 20]
                            },
                            {
                                label: 'Estimated',
                                fillColor: 'rgba(0, 0, 0, 0.1)',
                                strokeColor: 'rgba(0, 0, 0, 0.25)',
                                data: [80, 60, 40, 20]
                            }
                        ]
                    }, {
                        scaleOverride : true,
                        scaleSteps : 10,
                        scaleStepWidth : 10,
                        scaleStartValue : 0,
                        showTooltips: false,
                        tooltipTitleFontSize: 0,
                        scaleLabel: '<%= value + "%" %>',
                        multiTooltipTemplate: '<%= datasetLabel %>: <%= value + "%" %>'
                    });
                });
            });
        });

        describe('when the stats change', function() {
            describe('when the graph has not been rendered yet', function() {
                it('should do nothing', function() {
                    compileDirective();

                    $scope.$apply(function() {
                        $scope.stats = {
                            impressions: 1656,
                            views: 1000,
                            quartile1: 900,
                            quartile2: 800,
                            quartile3: 300,
                            quartile4: 200,
                            totalSpend: '0',
                            linkClicks: {},
                            shareClicks: {}
                        };
                    });

                    expect(Chart).not.toHaveBeenCalled();
                    expect(barSkinny).not.toHaveBeenCalled();
                    expect(_barSkinny.destroy).not.toHaveBeenCalled();
                });
            });

            describe('when the duration is not set or is -1', function() {
                it('should do nothing', function() {
                    compileDirective();

                    $timeout.flush();

                    Chart.calls.reset();
                    barSkinny.calls.reset();

                    $scope.duration.actual = -1;

                    $scope.$apply(function() {
                        $scope.stats = {
                            impressions: 1656,
                            views: 1000,
                            quartile1: 900,
                            quartile2: 800,
                            quartile3: 300,
                            quartile4: 200,
                            totalSpend: '0',
                            linkClicks: {},
                            shareClicks: {}
                        };
                    });

                    expect(Chart).not.toHaveBeenCalled();
                    expect(barSkinny).not.toHaveBeenCalled();
                    expect(_barSkinny.destroy).not.toHaveBeenCalled();

                    $scope.duration.actual = undefined;

                    $scope.$apply(function() {
                        $scope.stats = {
                            impressions: 165600,
                            views: 100000,
                            quartile1: 90000,
                            quartile2: 8000,
                            quartile3: 3000,
                            quartile4: 2000,
                            totalSpend: '1000',
                            linkClicks: {},
                            shareClicks: {}
                        };
                    });

                    expect(Chart).not.toHaveBeenCalled();
                    expect(barSkinny).not.toHaveBeenCalled();
                    expect(_barSkinny.destroy).not.toHaveBeenCalled();
                });
            });

            describe('when there is already a graph', function() {
                describe('when the custom duration is the same as the actual duration', function() {
                    beforeEach(function() {
                        $scope.stats = {
                            impressions: 0,
                            views: 0,
                            quartile1: 0,
                            quartile2: 0,
                            quartile3: 0,
                            quartile4: 0,
                            totalSpend: '0',
                            linkClicks: {},
                            shareClicks: {}
                        };

                        compileDirective();

                        $timeout.flush();

                        Chart.calls.reset();
                        barSkinny.calls.reset();

                        $scope.$apply(function() {
                            $scope.stats = {
                                impressions: 1656,
                                views: 10000,
                                quartile1: 9750,
                                quartile2: 7230,
                                quartile3: 5100,
                                quartile4: 1900,
                                totalSpend: '0',
                                linkClicks: {},
                                shareClicks: {}
                            };
                        });
                    });

                    it('should destroy the original', function() {
                        expect(_barSkinny.destroy).toHaveBeenCalled();
                    });

                    it('should initialize a new graph', function() {
                        expect(Chart).toHaveBeenCalledWith($canvas);
                        expect(barSkinny).toHaveBeenCalledWith({
                            labels : ['','','',''],
                            datasets: [
                                {
                                    label: 'Actual',
                                    fillColor: 'rgba(17, 157, 164, 0.75)',
                                    strokeColor: 'rgba(17, 157, 164, 1)',
                                    data: [98, 72, 51, 19]
                                },
                                {
                                    label: 'Estimated',
                                    fillColor: 'rgba(0, 0, 0, 0.1)',
                                    strokeColor: 'rgba(0, 0, 0, 0.25)',
                                    data: [98, 72, 51, 19]
                                }
                            ]
                        }, {
                            scaleOverride : true,
                            scaleSteps : 10,
                            scaleStepWidth : 10,
                            scaleStartValue : 0,
                            showTooltips: true,
                            tooltipTitleFontSize: 0,
                            scaleLabel: '<%= value + "%" %>',
                            multiTooltipTemplate: '<%= datasetLabel %>: <%= value + "%" %>'
                        });
                    });
                });

                describe('when the custom duration is different than the actual duration', function() {
                    beforeEach(function() {
                        $scope.stats = {
                            impressions: 0,
                            views: 0,
                            quartile1: 0,
                            quartile2: 0,
                            quartile3: 0,
                            quartile4: 0,
                            totalSpend: '0',
                            linkClicks: {},
                            shareClicks: {}
                        };

                        compileDirective();

                        $timeout.flush();

                        Chart.calls.reset();
                        barSkinny.calls.reset();

                        $scope.duration.custom = 30;

                        $scope.$apply(function() {
                            $scope.stats = {
                                impressions: 1656,
                                views: 10000,
                                quartile1: 9750,
                                quartile2: 7230,
                                quartile3: 5100,
                                quartile4: 1900,
                                totalSpend: '0',
                                linkClicks: {},
                                shareClicks: {}
                            };
                        });
                    });

                    it('should destroy the original', function() {
                        expect(_barSkinny.destroy).toHaveBeenCalled();
                    });

                    it('should initialize a new graph with custom data', function() {
                        expect(Chart).toHaveBeenCalledWith($canvas);
                        expect(barSkinny).toHaveBeenCalledWith({
                            labels : ['','','',''],
                            datasets: [
                                {
                                    label: 'Actual',
                                    fillColor: 'rgba(17, 157, 164, 0.75)',
                                    strokeColor: 'rgba(17, 157, 164, 1)',
                                    data: [98, 72, 51, 19]
                                },
                                {
                                    label: 'Estimated',
                                    fillColor: 'rgba(0, 0, 0, 0.1)',
                                    strokeColor: 'rgba(0, 0, 0, 0.25)',
                                    data: [99, 98, 84, 72]
                                }
                            ]
                        }, {
                            scaleOverride : true,
                            scaleSteps : 10,
                            scaleStepWidth : 10,
                            scaleStartValue : 0,
                            showTooltips: true,
                            tooltipTitleFontSize: 0,
                            scaleLabel: '<%= value + "%" %>',
                            multiTooltipTemplate: '<%= datasetLabel %>: <%= value + "%" %>'
                        });
                    });
                });
            });
        });

        describe('when the duration changes', function() {
            it('should get calculated data and update the graph', function() {
                $scope.duration = {
                    actual: 20,
                    custom: 20
                };
                $scope.stats = {
                    impressions: 1656,
                    views: 1000,
                    quartile1: 900,
                    quartile2: 800,
                    quartile3: 300,
                    quartile4: 100,
                    totalSpend: '0',
                    linkClicks: {},
                    shareClicks: {}
                };

                compileDirective();
                $timeout.flush();

                expect(datasets[0].bars[0].value).toBe(90);
                expect(datasets[0].bars[1].value).toBe(80);
                expect(datasets[0].bars[2].value).toBe(30);
                expect(datasets[0].bars[3].value).toBe(10);

                expect(datasets[1].bars[0].value).toBe(90);
                expect(datasets[1].bars[1].value).toBe(80);
                expect(datasets[1].bars[2].value).toBe(30);
                expect(datasets[1].bars[3].value).toBe(10);

                $scope.$apply(function() {
                    $scope.duration.custom = 18;
                });
                $timeout.flush(500);

                expect(datasets[0].bars[0].value).toBe(90);
                expect(datasets[0].bars[1].value).toBe(80);
                expect(datasets[0].bars[2].value).toBe(30);
                expect(datasets[0].bars[3].value).toBe(10);

                expect(datasets[1].bars[0].value).toBe(90);
                expect(datasets[1].bars[1].value).toBe(82);
                expect(datasets[1].bars[2].value).toBe(40);
                expect(datasets[1].bars[3].value).toBe(18);

                expect(_barSkinny.update).toHaveBeenCalled();
                _barSkinny.update.calls.reset();

                $scope.$apply(function() {
                    $scope.duration.custom = 15;
                });
                $timeout.flush(500);

                expect(datasets[0].bars[0].value).toBe(90);
                expect(datasets[0].bars[1].value).toBe(80);
                expect(datasets[0].bars[2].value).toBe(30);
                expect(datasets[0].bars[3].value).toBe(10);

                expect(datasets[1].bars[0].value).toBe(92);
                expect(datasets[1].bars[1].value).toBe(84);
                expect(datasets[1].bars[2].value).toBe(70);
                expect(datasets[1].bars[3].value).toBe(30);

                expect(_barSkinny.update).toHaveBeenCalled();
                _barSkinny.update.calls.reset();

                $scope.$apply(function() {
                    $scope.duration.custom = 10;
                });
                $timeout.flush(500);

                expect(datasets[0].bars[0].value).toBe(90);
                expect(datasets[0].bars[1].value).toBe(80);
                expect(datasets[0].bars[2].value).toBe(30);
                expect(datasets[0].bars[3].value).toBe(10);

                expect(datasets[1].bars[0].value).toBe(94);
                expect(datasets[1].bars[1].value).toBe(90);
                expect(datasets[1].bars[2].value).toBe(84);
                expect(datasets[1].bars[3].value).toBe(80);

                expect(_barSkinny.update).toHaveBeenCalled();
                _barSkinny.update.calls.reset();

                $scope.$apply(function() {
                    $scope.duration.custom = 20;
                });
                $timeout.flush(500);

                expect(datasets[0].bars[0].value).toBe(90);
                expect(datasets[0].bars[1].value).toBe(80);
                expect(datasets[0].bars[2].value).toBe(30);
                expect(datasets[0].bars[3].value).toBe(10);

                expect(datasets[1].bars[0].value).toBe(90);
                expect(datasets[1].bars[1].value).toBe(80);
                expect(datasets[1].bars[2].value).toBe(30);
                expect(datasets[1].bars[3].value).toBe(10);

                expect(_barSkinny.update).toHaveBeenCalled();
            });
        });
    });
});