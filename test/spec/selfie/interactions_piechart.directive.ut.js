define(['app'], function(appModule) {
    'use strict';

    describe('<interactions-piechart> directive', function() {
        var $rootScope,
            $canvas,
            $legend,
            $compile,
            $timeout,
            $pie,
            $scope,
            scope,
            Chart,
            Doughnut,
            generateLegend,
            pieData,
            pieOptions,
            _pieChart;

        function compileDirective() {
            $scope.$apply(function() {
                $pie = $compile(
                    '<div interactions-piechart stats="stats" total="total">' +
                    '   <canvas width="800" height="600"></canvas>' +
                    '   <div id="js-legend"></div>' +
                    '</div>'
                )($scope);
            });

            scope = $pie.isolateScope();
        }

        beforeEach(function() {


            generateLegend = jasmine.createSpy('generateLegend()')
                .and.callFake(function(a) {
                    $legend = '<div id="legend"></div>';
                    return $legend;
                });

            _pieChart = {
                destroy: jasmine.createSpy('pieChart.destroy()'),
                generateLegend: generateLegend
            };

            Doughnut = jasmine.createSpy('Doughnut()')
                .and.callFake(function(_pieData, _pieOptions) {
                    pieData = _pieData;
                    pieOptions = _pieOptions;
                    return _pieChart;
                });

            Chart = jasmine.createSpy('Chart()')
                .and.callFake(function(canvas) {
                    $canvas = canvas;
                    return { Doughnut: Doughnut };
                });

            module(appModule.name, ['$provide', function($provide) {
                $provide.value('Chart', Chart);
            }]);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $timeout = $injector.get('$timeout');

                $scope = $rootScope.$new();
                $scope.stats = {};
            });
        });

        afterEach(function() {
            $pie.remove();
        });

        afterAll(function() {
            $rootScope = null;
            $canvas = null;
            $legend = null;
            $compile = null;
            $timeout = null;
            $pie = null;
            $scope = null;
            scope = null;
            Chart = null;
            Doughnut = null;
            generateLegend = null;
            pieData = null;
            pieOptions = null;
            _pieChart = null;
        });

        describe('initialization', function() {
            describe('when there are no stats and no total interactions', function() {
                it('it should render a default pie chart', function() {
                    $scope.stats = undefined;
                    $scope.total = undefined;

                    compileDirective();

                    $timeout.flush();

                    expect($canvas instanceof CanvasRenderingContext2D).toBe(true);
                    expect(Chart).toHaveBeenCalledWith($canvas);
                    expect(Doughnut).toHaveBeenCalledWith(jasmine.any(Array), jasmine.any(Object));
                    expect(generateLegend).toHaveBeenCalled();

                    expect(pieData).toEqual([
                        {
                            label: 'Instagram',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Vimeo',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Share',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Website',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Call to Action',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        }
                    ]);

                    expect(pieOptions).toEqual({
                        showTooltips: false,
                        percentageInnerCutout: 0,
                        segmentShowStroke : false,
                        animateScale : true,
                        responsive: true,
                        maintainAspectRatio: true,
                        tooltipTemplate: '<%if (label){%><%=label %>: <%}%><%= value %>%'
                    });
                });
            });

            describe('when there are stats but no total number of interactions', function() {
                it('it should render a default pie chart', function() {
                    $scope.stats = {};
                    $scope.total = undefined;

                    compileDirective();

                    $timeout.flush();

                    expect($canvas instanceof CanvasRenderingContext2D).toBe(true);
                    expect(Chart).toHaveBeenCalledWith($canvas);
                    expect(Doughnut).toHaveBeenCalledWith(jasmine.any(Array), jasmine.any(Object));
                    expect(generateLegend).toHaveBeenCalled();

                    expect(pieData).toEqual([
                        {
                            label: 'Instagram',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Vimeo',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Share',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Website',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Call to Action',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        }
                    ]);

                    expect(pieOptions).toEqual({
                        showTooltips: false,
                        percentageInnerCutout: 0,
                        segmentShowStroke : false,
                        animateScale : true,
                        responsive: true,
                        maintainAspectRatio: true,
                        tooltipTemplate: '<%if (label){%><%=label %>: <%}%><%= value %>%'
                    });
                });
            });

            describe('when there are no stats but there are interactions', function() {
                it('it should render a default pie chart', function() {
                    $scope.stats = undefined;
                    $scope.total = 100;

                    compileDirective();

                    $timeout.flush();

                    expect($canvas instanceof CanvasRenderingContext2D).toBe(true);
                    expect(Chart).toHaveBeenCalledWith($canvas);
                    expect(Doughnut).toHaveBeenCalledWith(jasmine.any(Array), jasmine.any(Object));
                    expect(generateLegend).toHaveBeenCalled();

                    expect(pieData).toEqual([
                        {
                            label: 'Instagram',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Vimeo',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Share',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Website',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Call to Action',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        }
                    ]);

                    expect(pieOptions).toEqual({
                        showTooltips: true,
                        percentageInnerCutout: 0,
                        segmentShowStroke : false,
                        animateScale : true,
                        responsive: true,
                        maintainAspectRatio: true,
                        tooltipTemplate: '<%if (label){%><%=label %>: <%}%><%= value %>%'
                    });
                });
            });

            describe('when stats are defined', function() {
                beforeEach(function() {
                    $scope.stats = {
                        linkClicks: {
                            action: 12,
                            facebook: 18,
                            website: 14,
                            instagram: 6
                        },
                        shareClicks: {
                            facebook: 25,
                            twitter: 20,
                            pinterest: 5
                        }
                    };
                    $scope.total = 100;

                    compileDirective();

                    $timeout.flush();
                });

                describe('the pieData', function() {
                    it('should be an array of objects with label, value, color and highlight color', function() {
                        // total Clicks = 50
                        // total Shares = 50
                        // total Interactions = 100

                        expect(pieData).toEqual([
                            {
                                label: 'Call to Action',
                                color: jasmine.any(String),
                                highlight: jasmine.any(String),
                                value: '12.00'
                            },
                            {
                                label: 'Facebook',
                                color: jasmine.any(String),
                                highlight: jasmine.any(String),
                                value: '18.00'
                            },
                            {
                                label: 'Website',
                                color: jasmine.any(String),
                                highlight: jasmine.any(String),
                                value: '14.00'
                            },
                            {
                                label: 'Instagram',
                                color: jasmine.any(String),
                                highlight: jasmine.any(String),
                                value: '6.00'
                            },
                            {
                                label: 'Share',
                                color: jasmine.any(String),
                                highlight: jasmine.any(String),
                                value: '50.00'
                            }
                        ]);
                    });
                });

                describe('the pieOptions', function() {
                    it('should be set', function() {
                        expect(pieOptions).toEqual({
                            showTooltips: true,
                            percentageInnerCutout: 0,
                            segmentShowStroke : false,
                            animateScale : true,
                            responsive: true,
                            maintainAspectRatio: true,
                            tooltipTemplate: '<%if (label){%><%=label %>: <%}%><%= value %>%'
                        });
                    });
                });

                describe('the legend', function() {
                    it('should put the html into the js-legend div', function() {
                        expect($pie.find('#js-legend')[0].innerHTML).toEqual($legend);
                    });
                });
            });
        });

        describe('when stats update', function() {
            describe('when there is no existing pie chart', function() {
                it('should do nothing', function() {
                    $scope.stats = {};
                    $scope.total = 100;

                    compileDirective();

                    expect(Chart).not.toHaveBeenCalled();

                    $scope.$apply(function() {
                        $scope.stats = {
                            linkClicks: {}
                        };
                    });

                    expect(Chart).not.toHaveBeenCalled();
                });
            });

            describe('when there is an existing pie chart', function() {
                beforeEach(function() {
                    $scope.stats = {};
                    $scope.total = 0;

                    compileDirective();

                    $timeout.flush();

                    expect(Chart).toHaveBeenCalled();

                    expect(pieData).toEqual([
                        {
                            label: 'Instagram',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Vimeo',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Share',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Website',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        },
                        {
                            label: 'Call to Action',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: 20
                        }
                    ]);

                    expect(pieOptions).toEqual({
                        showTooltips: false,
                        percentageInnerCutout: 0,
                        segmentShowStroke : false,
                        animateScale : true,
                        responsive: true,
                        maintainAspectRatio: true,
                        tooltipTemplate: '<%if (label){%><%=label %>: <%}%><%= value %>%'
                    });
                });

                it('should call destoy()', function() {
                    $scope.$apply(function() {
                        $scope.stats = {
                            linkClicks: {}
                        };
                    });

                    expect(_pieChart.destroy).toHaveBeenCalled();
                });

                it('should create a new pie chart', function() {
                    $scope.$apply(function() {
                        $scope.total = 100;
                        $scope.stats = {
                            linkClicks: {
                                action: 12,
                                facebook: 18,
                                website: 14,
                                instagram: 6
                            },
                            shareClicks: {
                                facebook: 25,
                                twitter: 20,
                                pinterest: 5
                            }
                        };
                    });

                    expect(pieData).toEqual([
                        {
                            label: 'Call to Action',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: '12.00'
                        },
                        {
                            label: 'Facebook',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: '18.00'
                        },
                        {
                            label: 'Website',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: '14.00'
                        },
                        {
                            label: 'Instagram',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: '6.00'
                        },
                        {
                            label: 'Share',
                            color: jasmine.any(String),
                            highlight: jasmine.any(String),
                            value: '50.00'
                        }
                    ]);

                    expect(pieOptions).toEqual({
                        showTooltips: true,
                        percentageInnerCutout: 0,
                        segmentShowStroke : false,
                        animateScale : true,
                        responsive: true,
                        maintainAspectRatio: true,
                        tooltipTemplate: '<%if (label){%><%=label %>: <%}%><%= value %>%'
                    });
                });
            });
        });
    });
});
