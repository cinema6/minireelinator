define( ['angular','select2','braintree','jqueryui','chartjs','jquerymasked','c6_defines'],
function( angular , select2 , braintree , jqueryui , Chart   , jquerymasked , c6Defines  ) {
    'use strict';

    var $ = angular.element,
        extend = angular.extend,
        copy = angular.copy,
        forEach = angular.forEach,
        isObject = angular.isObject,
        isArray = angular.isArray,
        equals = angular.equals;

    function pad(num) {
        var norm = Math.abs(Math.floor(num));
        return (norm < 10 ? '0' : '') + norm;
    }

    function deepExtend(target, extension) {
        forEach(extension, function(extensionValue, prop) {
            var targetValue = target[prop];

            if (isObject(extensionValue) && isObject(targetValue)) {
                deepExtend(targetValue, extensionValue);
            } else {
                target[prop] = copy(extensionValue);
            }
        });

        return target;
    }

    return angular.module('c6.app.selfie.directives', [])
        .value('Chart', Chart)

        .directive('accountBalance', [function() {
            return {
                restrict: 'E',
                templateUrl: 'views/selfie/directives/account_balance.html'
            };
        }])

        .directive('stopPropagate', [function() {
            return {
                restrict: 'A',
                link: function(scope, $element) {
                    $element.on('click', function(e) {
                        e.stopPropagation();
                    });
                }
            };
        }])

        .directive('c6FillCheck', ['$timeout',
        function                  ( $timeout ) {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function(scope, $element, attrs, ngModel) {
                    var checkView = attrs.checkView;

                    function handleModelChange(value) {
                        if ((ngModel.$modelValue || ngModel.$modelValue === 0) ||
                            (checkView && (ngModel.$viewValue || ngModel.$viewValue === 0))) {
                            $element.addClass('form__fillCheck--filled');
                        } else {
                            $element.removeClass('form__fillCheck--filled');
                        }

                        return value;
                    }

                    if (ngModel) {
                        ngModel.$viewChangeListeners.push(handleModelChange);
                        ngModel.$formatters.push(handleModelChange);
                        $timeout(handleModelChange);
                    }
                }
            };
        }])

        .directive('c6Indeterminate', [function() {
            return {
                restrict: 'A',
                scope: {
                    c6Indeterminate: '='
                },
                link: function(scope, $element) {
                    scope.$watch('c6Indeterminate', function(value) {
                        if (value === 'indeterminate') {
                            $element.prop('indeterminate', true);
                        } else {
                            $element.prop('indeterminate', false);
                            $element.prop('checked', value);
                        }
                    });
                }
            };
        }])

        .directive('c6SelectBox', ['$timeout',
        function                  ( $timeout ) {
            return {
                restrict: 'A',
                scope: {
                    options: '=',
                    config: '='
                },
                require: 'ngModel',
                link: function(scope, $element, attrs, ngModel) {
                    function findBy(prop, value, arr) {
                        return arr.filter(function(item) {
                            return item[prop] === value;
                        })[0];
                    }

                    function shouldHideDefaultOption() {
                        return attrs.unselectDefault && $element.val() === '0';
                    }

                    function renderOptions(options, config) {
                        function format(option) {
                            var found = findBy('label', option.text, options) || {};

                            if (!found.src) { return option.text; }

                            var $option = $('<span><img src="' +
                                found.src + '" /> ' + option.text + '</span>');

                            return $option;
                        }

                        config = config || {};

                        if (attrs.thumbnails) {
                            config.templateResult = format;
                        }

                        $element.select2(extend({
                            minimumResultsForSearch: Infinity
                        }, config));

                        if (attrs.preselected || ($element.val() && !shouldHideDefaultOption())) {
                            $element.addClass('form__fillCheck--filled');
                        }
                    }

                    $element.on('select2:open', function() {
                        $element.addClass('form__fillCheck--filled');
                        $element.addClass('ui--active');
                    });

                    $element.on('select2:close', function() {
                        if (!$element.val() || shouldHideDefaultOption()) {
                            $element.removeClass('form__fillCheck--filled');
                        }
                        $element.removeClass('ui--active');
                    });

                    if (ngModel) {
                        ngModel.$formatters.push(function(value) {
                            // this only gets called when the model changes
                            // programmatically. When a selection is made via
                            // the DOM / UI only the $parser and $viewChange
                            // listeners get called. This does get called
                            // when the directive is initialized, so we can
                            // use it to set the default option and render
                            // the initial dropdown. It will also get called
                            // if we programmatically change the selected
                            // option (ie. when we import website data)

                            // this sets the selection to the correct option
                            $element.val(scope.options.indexOf(value));

                            // this will render the dropdown and current selection.
                            // It needs to go in a $timeout because when this
                            // is first called on initialization of the directive
                            // the $viewValue has not been set yet, so the select2
                            // rendering cannot determine the default selection
                            $timeout(function() {
                                renderOptions(scope.options, scope.config);
                            });

                            return value;
                        });
                    }
                }
            };
        }])

        .directive('c6ScrollTo', [function() {
            return {
                restrict: 'A',
                link: function(scope, $element, attrs) {
                    $element.click(function(e) {
                        e.preventDefault();

                        var distance = $(attrs.href).offset().top;

                        $('html, body').animate({ scrollTop: distance + 'px' });
                    });
                }
            };
        }])

        .directive('hiddenInputClick', ['$document',function($document) {
            return {
                restrict: 'A',
                link: function(scope, $element, attrs) {

                    $element.on('click', function() {
                        var input = $document[0].getElementById(attrs.hiddenInputClick);

                        if (input && input.click) {
                            input.click();
                        }
                    });
                }
            };
        }])

        .directive('hiddenInputFocus', ['$document',function($document) {
            return {
                restrict: 'A',
                link: function(scope, $element, attrs) {

                    $element.on('click', function() {
                        var input = $document[0].getElementById(attrs.hiddenInputFocus);

                        if (input && input.focus) {
                            input.focus();
                        }
                    });
                }
            };
        }])

        .directive('selectLabel', ['$document',function($document) {
            return {
                restrict: 'A',
                link: function(scope, $element, attrs) {

                    $element.on('click', function() {
                        var input = $document[0].getElementById(attrs['for']),
                            $input = $(input);

                        if ($input.hasClass('ui--active')) {
                            $input.select2('close');
                        } else {
                            $input.select2('open');
                        }
                    });
                }
            };
        }])

        .directive('blurValidate', [function() {
            return {
                restrict: 'A',
                link: function(scope, $element, attrs) {
                    var input = $element.find('#' + attrs.blurValidate);

                    input.on('blur', function() {
                        var value = $(this).val();

                        if (!value || input.hasClass('ng-invalid')) {
                            $element.addClass('ui--hasError');
                        } else if (input.hasClass('ng-valid')) {
                            $element.removeClass('ui--hasError');
                        }
                    });
                }
            };
        }])

        .directive('softAlert', ['SoftAlertService',
        function                ( SoftAlertService ) {
            return {
                restrict: 'E',
                templateUrl: 'views/selfie/directives/soft_alert.html',
                scope: {},
                link: function(scope) {
                    scope.model = SoftAlertService.model;
                }
            };
        }])

        .service('SoftAlertService', ['$timeout',
        function                     ( $timeout ) {
            var service = this,
                model = {};

            Object.defineProperty(this, 'model', {
                get: function() {
                    return model;
                }
            });

            this.display = function(dialogModel) {
                extend(model, dialogModel);
                model.show = true;

                if (model.timer) {
                    $timeout(function() {
                        service.close();
                    }, model.timer);
                }
            };

            this.close = function() {
                model.show = false;
            };
        }])

        .directive('spinner', ['SpinnerService',
        function              ( SpinnerService ) {
            return {
                restrict: 'E',
                templateUrl: 'views/selfie/directives/spinner.html',
                scope: {},
                link: function(scope) {
                    scope.model = SpinnerService.model;
                }
            };
        }])

        .service('SpinnerService', [function() {
            var model = {};

            Object.defineProperty(this, 'model', {
                get: function() {
                    return model;
                }
            });

            this.display = function() {
                model.show = true;
            };

            this.close = function() {
                model.show = false;
            };
        }])

        .directive('datepicker', ['$timeout',
        function                 ( $timeout ) {
            return {
                restrict: 'A',
                scope: {
                    minDate: '=',
                    maxDate: '=',
                    allowPast: '=',
                    defaultDate: '='
                },
                link: function(scope, $element) {
                    function pad(num) {
                        var norm = Math.abs(Math.floor(num));
                        return (norm < 10 ? '0' : '') + norm;
                    }

                    function getMin() {
                        var now = new Date(),
                            minDate = scope.minDate && new Date(scope.minDate);

                        if (!scope.allowPast) {
                            if (!scope.minDate) { return 0; }

                            if (minDate && minDate < now) {
                                minDate = pad(now.getMonth() + 1) +
                                    '/' + pad(now.getDate()) +
                                    '/' + now.getFullYear();

                                return minDate;
                            }
                        }

                        return scope.minDate;
                    }

                    function getMax() {
                        return scope.maxDate !== undefined ? scope.maxDate : null;
                    }

                    $element.datepicker({
                        defaultDate: scope.defaultDate || null,
                        minDate: getMin(),
                        maxDate: getMax(),
                        changeMonth: false,
                        numberOfMonths: 1,
                        prevText: '',
                        nextText: '',
                        onClose: function() {
                            // this is needed because sometimes
                            // the datepicker plugin changes the
                            // date programmatically and ng-change
                            // doesn't pick up on it
                            $element.trigger('change');
                        },
                        beforeShow: function() {
                            var left = $element.offset().left,
                                inputWidth = $element.outerWidth();

                            // update the options based on current selections
                            $element.datepicker('option', 'minDate', getMin());
                            $element.datepicker('option', 'maxDate', getMax());

                            $timeout(function() {
                                var $picker = $('#ui-datepicker-div'),
                                    pickerWidth = $picker.outerWidth(),
                                    offset = left + ((inputWidth - pickerWidth) / 2);

                                // center the datepicker
                                $picker.css('left', offset);
                            });
                        }
                    });

                    $('#ui-datepicker-div').click(function(e) {
                        e.stopPropagation();
                    });
                }
            };
        }])

        .directive('parseAsInt', [function() {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, $element, attrs, ngModel) {
                    ngModel.$parsers.push(function(value) {
                        return parseInt(value);
                    });
                }
            };
        }])

        .directive('rangeSlider', ['$timeout',function($timeout) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, $element, attrs, ngModel) {
                    // this fixes an angular bug
                    $timeout(function() {
                        $element.val(ngModel.$viewValue);
                    });
                }
            };
        }])

        .directive('quartileBarGraph', ['Chart','$timeout','c6Debounce',
        function                       ( Chart , $timeout , c6Debounce ) {
            function getPercentage(num, total) {
                return !total ? 0 : Math.round(((num / total) * 100));
            }

            function calculateCompleteViewData(stats, duration) {
                var data = [];

                var views = stats.views,
                    q1 = stats.quartile1,
                    q2 = stats.quartile2,
                    q3 = stats.quartile3,
                    q4 = stats.quartile4;

                var diff0to1 = views - q1,
                    diff1to2 = q1 - q2,
                    diff2to3 = q2 - q3,
                    diff3to4 = q3 - q4;

                var qSecs = Math.round(duration * 0.25),
                    first = Math.round(duration * 0.25),
                    second = Math.round(duration * 0.5),
                    third = Math.round(duration * 0.75);

                var i;

                for (i = 0; i <= duration; i++) {
                    if (i <= first) {
                        data.push(
                            Math.round(views - (i * (diff0to1 / qSecs)))
                        );
                    } else if (i <= second) {
                        data.push(
                            Math.round(q1 - ((i - first) * (diff1to2 / qSecs)))
                        );
                    } else if (i <= third) {
                        data.push(
                            Math.round(q2 - ((i - second) * (diff2to3 / qSecs)))
                        );
                    } else {
                        data.push(
                            Math.round(q3 - ((i - third) * (diff3to4 / qSecs)))
                        );
                    }
                }

                return data;
            }

            function getCalculatedData(views, duration, data) {
                var first = Math.round(duration * 0.25),
                    second = Math.round(duration * 0.5),
                    third = Math.round(duration * 0.75);

                var newData = [
                    getPercentage(data[first], views),
                    getPercentage(data[second], views),
                    getPercentage(data[third], views),
                    getPercentage(data[duration], views)
                ];

                return newData;
            }

            return {
                restrict: 'A',
                scope: {
                    stats: '=',
                    duration: '='
                },
                link: function(scope, $element) {
                    var _barGraph, _actualData;

                    function initGraph() {
                        // only called when stats change
                        var canvas = $element.find('canvas')[0].getContext('2d'),
                            duration = scope.duration,
                            stats = scope.stats,
                            views = stats.views,
                            hasData = !!duration.actual && duration.actual !== -1 && !!views,
                            options = {
                                scaleOverride : true,
                                scaleSteps : 10,
                                scaleStepWidth : 10,
                                scaleStartValue : 0,
                                showTooltips: hasData,
                                tooltipTitleFontSize: 0,
                                scaleLabel: '<%= value + "%" %>',
                                multiTooltipTemplate: '<%= datasetLabel %>: <%= value + "%" %>'
                            },
                            realData = hasData ? [
                                getPercentage(stats.quartile1, views),
                                getPercentage(stats.quartile2, views),
                                getPercentage(stats.quartile3, views),
                                getPercentage(stats.quartile4, views)
                            ] : [80, 60, 40, 20];

                        // set actualData in directive scope
                        _actualData = calculateCompleteViewData(stats, duration.actual);

                        _barGraph = new Chart(canvas).barSkinny({
                            labels : ['','','',''],
                            datasets : [
                                {
                                    label: 'Actual',
                                    fillColor: 'rgba(17, 157, 164, 0.75)',
                                    strokeColor: 'rgba(17, 157, 164, 1)',
                                    data: realData
                                },
                                {
                                    label: 'Estimated',
                                    fillColor: 'rgba(0, 0, 0, 0.1)',
                                    strokeColor: 'rgba(0, 0, 0, 0.25)',
                                    data: duration.actual !== duration.custom && hasData ?
                                        getCalculatedData(views, duration.custom, _actualData) :
                                        realData
                                }
                            ]
                        }, options);
                    }

                    var updateGraph = c6Debounce(function(args) {
                        if (args[0] === args[1]) { return; }

                        // only called when duration changes
                        var views = scope.stats.views,
                            duration = scope.duration.custom,
                            newData = getCalculatedData(views, duration, _actualData);

                        _barGraph.datasets[1].bars[0].value = newData[0];
                        _barGraph.datasets[1].bars[1].value = newData[1];
                        _barGraph.datasets[1].bars[2].value = newData[2];
                        _barGraph.datasets[1].bars[3].value = newData[3];

                        _barGraph.update();
                    }, 500);

                    Chart.types.Bar.extend({
                        name: 'barSkinny',
                        draw: function() {
                            this.options.barValueSpacing = this.chart.width / 20;
                            Chart.types.Bar.prototype.draw.apply(this, arguments);
                        }
                    });

                    scope.$watch('duration', updateGraph, true);

                    scope.$watch('stats', function() {
                        if (_barGraph && scope.duration.actual && scope.duration.actual !== -1) {
                            _barGraph.destroy();
                            initGraph();
                        }
                    });

                    $timeout(initGraph);
                }
            };
        }])

        .directive('interactionsPiechart', ['$timeout','$filter','Chart',
        function                           ( $timeout , $filter , Chart ) {
            return {
                restrict: 'A',
                scope: {
                    stats: '=',
                    total: '='
                },
                link: function(scope, $element) {
                    var _pieChart;

                    function initGraph() {
                        var canvas = $element.find('canvas')[0].getContext('2d'),
                            totalClicks = 0,
                            totalShares = 0,
                            pieData = [],
                            pieSections = {
                                youtube: {
                                    color : '#bb0000',
                                    highlight : '#a30000',
                                    label : 'Youtube'
                                },
                                pinterest: {
                                    color : '#cb2027',
                                    highlight : '#c21e24',
                                    label : 'Pinterest'
                                },
                                facebook: {
                                    color:'#3b5998',
                                    highlight : '#334D84',
                                    label: 'Facebook'
                                },
                                twitter: {
                                    color : '#00aced',
                                    highlight : '#00A5E0',
                                    label : 'Twitter'
                                },
                                instagram: {
                                    color : '#125688',
                                    highlight : '#10517E',
                                    label : 'Instagram'
                                },
                                vimeo: {
                                    color: '#1AB7EA',
                                    highlight: '#1AB7EA',
                                    label: 'Vimeo'
                                },
                                share: {
                                    color : '#039753',
                                    highlight : '#027841',
                                    label : 'Share'
                                },
                                website: {
                                    color : '#FFC803',
                                    highlight : '#FFC803',
                                    label : 'Website'
                                },
                                action: {
                                    color : '#FF4E03',
                                    highlight : '#F54900',
                                    label : 'Call to Action'
                                }
                            },
                            pieOptions = {
                                showTooltips: !!scope.total,
                                percentageInnerCutout: 0,
                                segmentShowStroke : false,
                                animateScale : true,
                                responsive: true,
                                maintainAspectRatio: true,
                                tooltipTemplate: '<%if (label){%><%=label %>: <%}%><%= value %>%'
                            },
                            noDataDefaultSections = ['action','website','share','instagram','vimeo'];

                        if (!scope.stats || !scope.total) {
                            forEach(pieSections, function(section, key) {
                                if (noDataDefaultSections.indexOf(key) > -1) {
                                    section.value = 20;
                                    pieData.push(section);
                                }
                            });
                        } else {
                            forEach(scope.stats.linkClicks, function(link, key) {
                                pieSections[key].value = link;
                                pieData.push(pieSections[key]);
                                totalClicks += link;
                            });

                            forEach(scope.stats.shareClicks, function(share) {
                                if (pieData.indexOf(pieSections.share) > -1) {
                                    pieSections.share.value += share;
                                } else {
                                    pieSections.share.value = share;
                                    pieData.push(pieSections.share);
                                }
                                totalShares += share;
                            });

                            forEach(pieData, function(item) {
                                var percentage = (item.value / (totalShares + totalClicks)) * 100;

                                item.value = $filter('number')(percentage, '2');
                            });
                        }

                        // draw pie chart
                        _pieChart = new Chart(canvas).Doughnut(pieData, pieOptions);

                        // add legend
                        $element.find('#js-legend')[0].innerHTML = _pieChart.generateLegend();
                    }

                    scope.$watch('stats', function() {
                        if (_pieChart) {
                            _pieChart.destroy();
                            initGraph();
                        }
                    });

                    $timeout(initGraph);
                }
            };
        }])

        .directive('selfiePreview', [function() {
            return {
                restrict: 'E',
                scope: {
                    card: '=',
                    active: '=?',
                    device: '=?',
                    profile: '=?',
                    experience: '=?',
                    standalone: '=?'
                },
                templateUrl: 'views/selfie/directives/preview.html',
                controller: 'SelfiePreviewController',
                controllerAs: 'SelfiePreviewCtrl'
            };
        }])

        .controller('SelfiePreviewController', ['$scope','MiniReelService','c6BrowserInfo',
        function                               ( $scope , MiniReelService , c6BrowserInfo ) {
            var SelfiePreviewCtrl = this,
                experience;

            // we call this when the card is changed or when the
            // base experience is overridden
            function loadPreview(card) {
                if (!card) { return; }

                MiniReelService.convertCardForPlayer(card)
                    .then(function(cardForPlayer) {
                        var newExperience = copy(experience);

                        cardForPlayer.data.autoplay = false;
                        cardForPlayer.data.skip = true;
                        cardForPlayer.data.controls = true;

                        newExperience.data.deck = [cardForPlayer];

                        SelfiePreviewCtrl.card = cardForPlayer;
                        SelfiePreviewCtrl.experience = newExperience;

                        var mobileOnly = cardForPlayer.params.action &&
                            cardForPlayer.params.action.group === 'phone';
                        SelfiePreviewCtrl.mobileOnly = mobileOnly;
                        $scope.device = (c6BrowserInfo.profile.device === 'phone' || mobileOnly) ?
                            'phone' : 'desktop';
                    });
            }

            // on initiation we create a base experience for previewing
            // this can be overridden on the scope by the consumer
            MiniReelService.create()
                .then(function(minireel) {
                    experience = deepExtend(minireel, {
                        id: 'e-123',
                        data: {
                            mode: 'light',
                            autoplay: false,
                            autoadvance: false,
                            branding: 'rcplatform',
                            adConfig: {
                                video: {
                                    firstPlacement: -1,
                                    frequency: 0
                                },
                                display: {}
                            }
                        }
                    });
                });

            // we allow the consumer to set this on initiation
            // but default to the browser info
            // maybe we want to allow more dynamic updating?
            this.profile = $scope.profile || copy(c6BrowserInfo.profile);

            // we allow the consumer to set these, we default to true
            this.active = typeof $scope.active === 'undefined' || $scope.active;
            this.standalone = typeof $scope.standalone === 'undefined' || $scope.standalone;

            // we allow the consumer to this, we default to desktop
            // we're watching this value so the consumer can change
            // outside the directive
            $scope.device = $scope.device || this.profile.device || 'desktop';

            // watch for changes to the campaign's card
            $scope.$watch('card', loadPreview, true);

            // watch for changes to the experience in case
            // the consumer wants to mess with mode or whatnot
            $scope.$watch('experience', function(exp) {
                if (!exp) { return; }
                experience = copy(exp);
                loadPreview($scope.card);
            });

            // watch for changes in case the consumer wants to
            // override the device outside of the directive
            $scope.$watch('device', function(device) {
                var profile = SelfiePreviewCtrl.profile;

                if (device === profile.device) { return; }

                SelfiePreviewCtrl.profile = extend(copy(profile), {
                    device: device,
                    flash: device !== 'phone'
                });
            });
        }])

        .directive('selfieCategories', [function() {
            return {
                restrict: 'E',
                scope: {
                    categories: '=',
                    campaign: '='
                },
                templateUrl: 'views/selfie/directives/categories.html',
                controller: 'SelfieCategoriesController',
                controllerAs: 'SelfieCategoriesCtrl'
            };
        }])

        .controller('SelfieCategoriesController', ['$scope',
        function                                  ( $scope ) {
            var SelfieCategoriesCtrl = this,
                campaign = $scope.campaign,
                categories = $scope.categories;

            this.category = categories.filter(function(category) {
                return campaign.contentCategories.primary === category.id;
            })[0] || null;

            $scope.$watch(function() {
                return SelfieCategoriesCtrl.category;
            }, function(newCat, oldCat) {
                if (newCat === oldCat) { return; }

                campaign.contentCategories.primary = newCat.id;
            });
        }])

        .directive('selfieInterests', [function() {
            return {
                restrict: 'E',
                scope: {
                    categories: '=',
                    campaign: '=',
                    schema: '='
                },
                templateUrl: 'views/selfie/directives/interests.html',
                controller: 'SelfieInterestsController',
                controllerAs: 'SelfieInterestsCtrl'
            };
        }])

        .controller('SelfieInterestsController', ['$scope','CampaignService',
        function                                 ( $scope , CampaignService ) {
            var campaign = $scope.campaign,
                categories = $scope.categories,
                schema = $scope.schema,
                categoryIds = categories.map(function(category) {
                    return category.id;
                });

            function filterOut(needles, haystack) {
                needles = isArray(needles) ? needles : [needles];

                return haystack.filter(function(item) {
                    return needles.indexOf(item) < 0;
                });
            }

            function generateInterestTiers(categories) {
                var interests = campaign.targeting.interests,
                    tiersArray = categories.reduce(function(result, category) {
                        if (category.externalId.indexOf('-') < 0) {
                            result.push({
                                name: category.name,
                                label: category.label,
                                id: category.id,
                                iab: category.externalId,
                                selected: interests.indexOf(category.id) > -1,
                                children: []
                            });
                        }
                        return result;
                    }, []);

                categories.map(function(category) {
                    var id = category.externalId,
                        isTopTier = !(/-/).test(id),
                        tierId = id.split('-')[0];

                    tiersArray.map(function(tier) {
                        if (!isTopTier && tier.iab === tierId) {
                            tier.children.push({
                                id: category.id,
                                iab: category.externalId,
                                name: category.name,
                                label: category.label,
                                selected: interests.indexOf(category.id) > -1 ||
                                    interests.indexOf(tier.id) > -1
                            });
                        }
                    });
                });

                tiersArray.forEach(function(tier) {
                    var length = tier.children.length,
                        count = tier.children.filter(function(item) {
                            return item.selected;
                        }).length;

                    if (count && count === length) {
                        tier.selected = true;
                    }
                    if (count < length && count > 0) {
                        tier.selected = 'indeterminate';
                    }
                });

                return tiersArray;
            }

            this.toggleTier = function(tier) {
                var targeting = campaign.targeting,
                    tierIds = tier.children.map(function(item) {
                        return item.id;
                    });

                if (tier.selected === 'indeterminate') {
                    // if it's partially selected then
                    // always select all on click
                    tier.selected = true;
                } else {
                    // otherwise simply toggle the selection
                    tier.selected = !tier.selected;
                }

                // mark all children as selected
                tier.children.forEach(function(item) {
                    item.selected = tier.selected;
                });

                // remove all the child ids because we're either replacing
                // them with the tier id (if they're selecting all) or we're
                // removing the tier id also (if they're de-selecting all)
                targeting.interests = filterOut(tierIds, targeting.interests);

                if (tier.selected) {
                    // if we're selecting all then add the tier id
                    targeting.interests.push(tier.id);
                } else {
                    // if we're de-selecting all then remove tier id
                    targeting.interests = filterOut(tier.id, targeting.interests);
                }
            };

            this.toggleInterest = function(item, tier) {
                var targeting = campaign.targeting,
                    isSelected = item.selected,
                    selectedInTier = tier.children.filter(function(item) {
                        return item.selected;
                    }).length,
                    tierIsFull = selectedInTier === tier.children.length,
                    tierWasFull = !isSelected && selectedInTier === tier.children.length -1,
                    tierIds = tier.children.map(function(item) {
                        return item.id;
                    });

                if (isSelected && !tierIsFull) {
                    // we have a new selection but the tier
                    // isn't full yet, so we just add the id
                    targeting.interests.push(item.id);

                    // mark the top tier as indeterminate
                    tier.selected = 'indeterminate';

                    return;
                }

                if (isSelected && tierIsFull) {
                    // our selection makes the tier full
                    // we need to remove all ids from this
                    // tier and replace with the top tier id
                    targeting.interests = filterOut(tierIds, targeting.interests)
                        .concat(tier.id);

                    // mark the tier as selected
                    tier.selected = true;

                    return;

                }

                if (tierWasFull) {
                    // the tier was full before we removed one
                    // so now we need to remove the top tier id
                    // and replace it will all of the other ids
                    // that belong to the tier
                    targeting.interests = filterOut(tier.id, targeting.interests)
                        .concat(tier.children.reduce(function(result, i) {
                            if (i.id !== item.id) {
                                result.push(i.id);
                            }
                            return result;
                        }, []));

                    // mark the top tier as indeterminate
                    tier.selected = 'indeterminate';

                    return;
                }

                // if we're still here we're just removing a single item
                targeting.interests = filterOut(item.id, targeting.interests);

                // if nothing is selected in the tier we de-select,
                // otherwise we leave it indeterminate
                tier.selected = !selectedInTier ? false : 'indeterminate';

            };

            this.removeInterest = function(item, tier) {
                item.selected = false;
                this.toggleInterest(item, tier);
            };

            this.expandTier = function(tier) {
                tier.show = !tier.show;

                if (!tier.children.length) {
                    this.toggleTier(tier);
                }
            };

            this.cost = CampaignService.getTargetingCost(schema);

            // remove any old, unused categories from interest array
            campaign.targeting.interests = campaign.targeting.interests
                .filter(function(interest) {
                    return categoryIds.indexOf(interest) > -1;
                });

            this.tiers = generateInterestTiers(categories);
            this.priceForInterests = schema.pricing.cost.__priceForInterests;

        }])

        .directive('selfieGeotargeting', [function() {
            return {
                restrict: 'E',
                scope: {
                    campaign: '=',
                    schema: '=',
                    validation: '='
                },
                templateUrl: 'views/selfie/directives/geotargeting.html',
                controller: 'SelfieGeotargetingController',
                controllerAs: 'SelfieGeotargetingCtrl'
            };
        }])

        .controller('SelfieGeotargetingController', ['$scope','GeoService',
                                                     'CampaignService',
        function                                    ( $scope , GeoService ,
                                                      CampaignService ) {
            var SelfieGeotargetingCtrl = this,
                campaign = $scope.campaign,
                zipcodes = campaign.targeting.geo.zipcodes,
                codesArray = zipcodes.codes,
                schema = $scope.schema,
                config = schema.targeting.geo,
                validation = $scope.validation;

            this.pricePerGeo = schema.pricing.cost.__pricePerGeo;
            this.minRadius = config.zipcodes.radius.__min;
            this.maxRadius = config.zipcodes.radius.__max;
            this.defaultRadius = config.zipcodes.radius.__default;
            this.maxCodes = config.zipcodes.codes.__length;
            this.cost = CampaignService.getTargetingCost(schema);

            this.newZip = null;
            this.radius = zipcodes.radius || this.defaultRadius;
            this.dmaOptions = GeoService.dmas;
            this.stateOptions = GeoService.usa.map(function(state) {
                return {
                    state: state,
                    country: 'usa'
                };
            });
            this.states = this.stateOptions.filter(function(option) {
                return campaign.targeting.geo.states.filter(function(state) {
                    return option.state === state;
                }).length > 0;
            });
            this.zips = zipcodes.codes.map(function(zip) {
                return { code: zip, valid: true };
            });

            Object.defineProperties(this, {
                radiusError: {
                    get: function() {
                        var errorCode = 0;
                        if (this.radius < this.minRadius) { errorCode = 2; }
                        if (this.radius > this.maxRadius) { errorCode = 3; }
                        if (!this.radius) { errorCode = 1; }
                        validation.radius = !errorCode || !this.zips.length;
                        return errorCode;
                    }
                }
            });

            this.setRadius = function() {
                if (!this.radiusError) {
                    zipcodes.radius = this.radius;
                }
            };

            this.removeZip = function(i) {
                var zip = this.zips[i],
                    index = codesArray.indexOf(zip.code);

                this.zips.splice(i, 1);

                if (index > -1) {
                    codesArray.splice(index, 1);
                }
            };

            this.validateZip = function() {
                var newZip = this.newZip,
                    self = this;

                if (!newZip || codesArray.length >= this.maxCodes) { return; }

                CampaignService.getZip(newZip)
                    .then(function() {
                        self.addNewZip({
                            code: newZip,
                            valid: true
                        });
                    })
                    .catch(function() {
                        self.addNewZip({
                            code: newZip,
                            valid: false
                        });
                    });
            };

            this.addNewZip = function(zip) {
                var index;

                // if it's valid and not on the campaign already, add it
                if (zip.valid && codesArray.indexOf(zip.code) === -1) {
                    codesArray.push(zip.code);
                }

                // see if we already have this zip in the UI
                this.zips.forEach(function(z, i) {
                    if (z.code === zip.code) {
                        index = i;
                    }
                });

                // if we do then remove it from it's position
                if (index !== undefined) {
                    this.zips.splice(index, 1);
                }

                // then add the new one
                this.zips.push(zip);

                // reset the value in the UI
                this.newZip = null;

                this.setRadius();
            };

            this.handleZipKeydown = function(e) {
                var keyCode = e.keyCode;

                if (keyCode === 8 && !this.newZip && this.zips.length) {
                    this.removeZip(this.zips.length-1);
                }

                if (keyCode === 188 || keyCode === 13) {
                    this.validateZip();
                }
            };

            this.handleZipChange = function() {
                var newZip = this.newZip;

                if (newZip && /\D/.test(newZip)) {
                    this.newZip = newZip.replace(/\D/g,'');
                }
            };

            // we watch the geo choices and save an array of states
            $scope.$watch(function() {
                return SelfieGeotargetingCtrl.states;
            }, function(newStates, oldStates) {
                if (newStates === oldStates) { return; }

                campaign.targeting.geo.states = newStates.map(function(state) {
                    return state.state;
                });
            });
        }])

        .directive('selfieDemographics', [function() {
            return {
                restrict: 'E',
                scope: {
                    campaign: '=',
                    schema: '='
                },
                templateUrl: 'views/selfie/directives/demographics.html',
                controller: 'SelfieDemographicsController',
                controllerAs: 'SelfieDemographicsCtrl'
            };
        }])

        .controller('SelfieDemographicsController', ['DemographicsService','$scope',
                                                     'CampaignService',
        function                                    ( DemographicsService , $scope ,
                                                      CampaignService ) {
            var SelfieDemographicsCtrl = this,
                campaign = $scope.campaign,
                schema = $scope.schema,
                demographics = campaign.targeting.demographics;

            this.ageOptions = DemographicsService.ages;
            this.incomeOptions = DemographicsService.incomes;
            this.genderOptions = ['Male','Female'];
            this.pricePerDemo = schema.pricing.cost.__pricePerDemo;
            this.cost = CampaignService.getTargetingCost(schema);

            this.gender = demographics.gender;

            $scope.$watch(function() {
                return SelfieDemographicsCtrl.gender;
            }, function(newGender, oldGender) {
                if (newGender === oldGender) { return; }

                if (oldGender[0]) {
                    newGender.splice(newGender.indexOf(oldGender[0]), 1);
                }

                demographics.gender = newGender;
            });
        }])

        .directive('selfieBudget', [function() {
            return {
                restrict: 'E',
                scope: {
                    campaign: '=',
                    validation: '=',
                    schema: '=',
                    stats: '=',
                    hideEstimates: '=',
                    increaseBudget: '='
                },
                templateUrl: 'views/selfie/directives/budget.html',
                controller: 'SelfieBudgetController',
                controllerAs: 'SelfieBudgetCtrl'
            };
        }])

        .controller('SelfieBudgetController', ['$scope','CampaignService',
        function                              ( $scope , CampaignService ) {
            var SelfieBudgetCtrl = this,
                campaign = $scope.campaign,
                card = campaign.cards[0],
                validation = $scope.validation || {},
                stats = $scope.stats || { summary: {} },
                schema = $scope.schema,
                pricing = schema.pricing,
                budgetMin = pricing.budget.__min,
                budgetMax = pricing.budget.__max,
                limitMinPercent = pricing.dailyLimit.__percentMin,
                currentBudget = campaign.pricing.budget;

            this.budget = campaign.pricing.budget || null;
            this.limit = campaign.pricing.dailyLimit || null;
            this.limitMinPercent = limitMinPercent;
            this.budgetMin = budgetMin;
            this.budgetMax = budgetMax;
            this.additionalBudget = (function() {
                if (!$scope.increaseBudget) { return; }

                var spent = parseFloat(stats.summary.totalSpend) || 0;

                return (campaign.pricing.budget - spent) > 0 ? 0 : budgetMin;
            }());
            this.additionalBudgetRequired = !!this.additionalBudget;

            Object.defineProperties(this, {
                cpv: {
                    get: function() {
                        return CampaignService.getCpv(campaign, schema);
                    }
                },
                totalBudget: {
                    get: function() {
                        var budget = parseFloat(this.budget),
                            additionalBudget = parseFloat(this.additionalBudget);

                        return (budget || 0) + (additionalBudget || 0);
                    }
                },
                validBudget: {
                    get: function() {
                        return (!this.totalBudget && !validation.show) ||
                            (!this.budgetError && !this.additionalBudgetError);
                    }
                },
                budgetError: {
                    get: function() {
                        var budget = parseFloat(this.budget),
                            validDecimal = !budget || (/^[0-9]+(\.[0-9]{1,2})?$/).test(budget),
                            status = campaign.status;

                        if (budget < budgetMin) { return 1; }
                        if (budget > budgetMax) { return 2; }
                        if (!validDecimal) { return 3; }
                        if (!budget && validation.show) { return 4; }
                        if (status === 'outOfBudget' && this.totalBudget <= currentBudget) {
                            return 5;
                        }

                        return false;
                    }
                },
                additionalBudgetError: {
                    get: function() {
                        var budget = parseFloat(this.additionalBudget),
                            validDecimal = !budget || (/^[0-9]+(\.[0-9]{1,2})?$/).test(budget),
                            status = campaign.status;

                        if (budget < 0) { return 1; }
                        if (this.totalBudget > budgetMax) { return 2; }
                        if (!validDecimal) { return 3; }
                        if (status === 'outOfBudget' && !budget && validation.show) { return 4; }

                        return false;
                    }
                },
                dailyLimitError: {
                    get: function() {
                        var max = parseFloat(this.limit),
                            spent = parseFloat(stats.summary.totalSpend),
                            totalBudget = this.totalBudget,
                            calculatedBudget = totalBudget - (spent || 0),
                            validDecimal = !max || (/^[0-9]+(\.[0-9]{1,2})?$/).test(max),
                            startDate = card.campaign && card.campaign.startDate &&
                                new Date(card.campaign.startDate),
                            endDate = card.campaign && card.campaign.endDate &&
                                new Date(card.campaign.endDate),
                            oneDay = 24*60*60*1000,
                            tomorrow = new Date(),
                            today = new Date(),
                            days;

                        if (totalBudget && endDate) {
                            tomorrow.setDate(tomorrow.getDate() + 1);

                            startDate = (startDate && startDate > today) ? startDate : tomorrow;

                            days = Math.round(
                                Math.abs((endDate.getTime() - startDate.getTime()) / oneDay)
                            ) || 1;
                        }

                        if (max && !totalBudget) { return { code: 1 }; }
                        if (max < totalBudget * limitMinPercent) {
                            return { code: 2, min: totalBudget * limitMinPercent };
                        }
                        if (max > totalBudget) { return { code: 3 }; }
                        if (!validDecimal) { return { code: 4 }; }
                        if (max && totalBudget && days && max < (calculatedBudget / days)) {
                            return { code: 5, min: calculatedBudget / days };
                        }

                        return false;
                    }
                }
            });

            Object.defineProperties(validation, {
                dailyLimit: {
                    get: function() {
                        return !SelfieBudgetCtrl.dailyLimitError ||
                            SelfieBudgetCtrl.dailyLimitError.code === 5;
                    }
                }
            });

            validation.budget = !!this.budget && this.validBudget;

            this.setBudget = function() {
                var Ctrl = SelfieBudgetCtrl;

                if (Ctrl.validBudget && validation.dailyLimit) {
                    campaign.pricing.budget = Math.round(Ctrl.totalBudget*100)/100;
                    campaign.pricing.dailyLimit = Ctrl.limit;

                    validation.budget = !!Ctrl.totalBudget;
                } else {
                    validation.budget = false;
                }
            };

            // if the directive is being used to increase
            // the budget then we want to trigger setBudget()
            // so any default increases get applied and validated
            if ($scope.increaseBudget) {
                this.setBudget();
            }
        }])

        .directive('selfieFlightDates', [function() {
            return {
                restrict: 'E',
                scope: {
                    campaign: '=',
                    masterCampaign: '=',
                    validation: '=',
                    hideHeader: '='
                },
                templateUrl: 'views/selfie/directives/flight_dates.html',
                controller: 'SelfieFlightDatesController',
                controllerAs: 'SelfieFlightDatesCtrl'
            };
        }])

        .controller('SelfieFlightDatesController', ['$scope',
        function                                   ( $scope ) {
            var SelfieFlightDatesCtrl = this,
                originalCampaign = $scope.masterCampaign,
                campaign = $scope.campaign,
                card = campaign.cards[0],
                campaignHash = card.campaign,
                validation = $scope.validation || {};

            var now = new Date();
            now.setHours(0,0,1);

            function fromISO(string) {
                if (!string) { return; }

                var date = new Date(string);

                return pad(date.getMonth() + 1) +
                    '/' + pad(date.getDate()) +
                    '/' + date.getFullYear();
            }

            function toISO(type, string) {
                if (!string) { return; }

                var date = new Date(string);

                date.setHours.apply(date, (type === 'start' ? [0,1] : [23,59]));

                return date.toISOString();
            }

            function setDatesOnCard() {
                var self = SelfieFlightDatesCtrl,
                    validStart = self.validStartDate,
                    validEnd = self.validEndDate;

                campaignHash.startDate = validStart ?
                    toISO('start', self.startDate) : campaignHash.startDate;
                campaignHash.endDate = validEnd ?
                    toISO('end', self.endDate) : campaignHash.endDate;

                validation.startDate = validStart;
                validation.endDate = validEnd;
            }

            Object.defineProperties(this, {
                validStartDate: {
                    get: function() {
                        var startDate = this.startDate && new Date(this.startDate),
                            endDate = this.endDate && new Date(this.endDate);

                        // need this in case user chooses today.
                        // set to end of day so startDate > now
                        if (startDate) {
                            startDate.setHours(23,59);
                        }
                        if (endDate) {
                            endDate.setHours(23,59);
                        }

                        return !startDate || !this.editableStartDate ||
                            (startDate && startDate instanceof Date && startDate > now &&
                                (!endDate || (endDate && startDate <= endDate)));
                    }
                },
                validEndDate: {
                    get: function() {
                        var startDate = this.startDate && new Date(this.startDate),
                            endDate = this.endDate && new Date(this.endDate);

                        // need this in case user chooses today.
                        // set to end of day so endDate > now
                        if (endDate) {
                            endDate.setHours(23,59);
                        }

                        return !endDate || (endDate && endDate instanceof Date && endDate > now &&
                            (!startDate || (startDate && endDate > startDate)));
                    }
                },
                canShowError: {
                    get: function() {
                        return !originalCampaign.status ||
                            originalCampaign.status === 'draft' ||
                            this.hasChanged;
                    }
                },
                imminentDates: {
                    get: function() {
                        var start = this.startDate,
                            end = this.endDate,
                            today = fromISO(now),
                            tomorrow = new Date(now);

                        tomorrow.setDate(tomorrow.getDate() + 1);
                        tomorrow = fromISO(tomorrow);

                        return this.editableStartDate && this.validStartDate && this.validEndDate &&
                            ((start && (start === today || start === tomorrow)) ||
                            (end && (end === today || end === tomorrow)));
                    }
                }
            });

            this.startDate = fromISO(campaignHash.startDate);
            this.endDate = fromISO(campaignHash.endDate);
            this.isPending = originalCampaign.status === 'pending';
            this.hasChanged = false;
            this.hasDates = (function() {
                var startDate = campaignHash.startDate && new Date(campaignHash.startDate);

                return (!!startDate && (startDate > now || campaign.status === 'draft')) ||
                        !!campaignHash.endDate;
            }());
            this.editableStartDate = (function() {
                var startDate = campaignHash.startDate && new Date(campaignHash.startDate);

                return (!startDate || startDate > now) ||
                    (!campaign.status || campaign.status === 'draft' ||
                        originalCampaign.status === 'pending');
            }());

            this.setDates = function() {
                if (this.startDate !== fromISO(campaignHash.startDate) ||
                    this.endDate !== fromISO(campaignHash.endDate)) {
                    this.hasChanged = true;
                }

                setDatesOnCard();
            };

            this.setTimelineOption = function() {
                if (!this.hasDates) {
                    campaignHash.startDate = undefined;
                    campaignHash.endDate = undefined;
                } else {
                    setDatesOnCard();
                }
            };
        }])

        .directive('addFundsModal', [function() {
            return {
                restrict: 'E',
                templateUrl: 'views/selfie/directives/add_funds.html',
                controller: 'AddFundsModalController',
                controllerAs: 'AddFundsModalCtrl'
            };
        }])

        .controller('AddFundsModalController', ['AddFundsModalService','PaymentService','cinema6',
        function                               ( AddFundsModalService , PaymentService , cinema6 ) {
            var self = this;

            this.newPaymentType = 'creditcard';
            this.model = AddFundsModalService.model;

            Object.defineProperties(this, {
                canSubmit: {
                    get: function() {
                        var deposit = this.model.deposit;

                        return (!!this.model.chosenMethod || !(this.model.methods || []).length) &&
                            !!deposit && deposit >= 1;
                    }
                },
                validDeposit: {
                    get: function() {
                        var deposit = this.model.deposit;

                        return (!deposit && deposit !== 0) || (!!deposit && deposit >= 1);
                    }
                }
            });

            this.makeDeposit = function() {
                this.pendingConfirmation = true;

                if (!this.model.showCreditCardForm) {
                    this.makePayment();
                }
            };

            this.makePayment = function() {
                return PaymentService.makePayment(this.model.chosenMethod.token, this.model.deposit)
                    .then(function() {
                        PaymentService.getBalance();
                    })
                    .then(this.resolve)
                    .catch(function() {
                        self.paymentMethodError = true;
                    })
                    .finally(function() {
                        self.pendingConfirmation = false;
                    });
            };

            this.addCreditCard = function() {
                this.newPaymentType = 'creditcard';
                this.model.showCreditCardForm = true;
            };

            this.success = function(method) {
                extend(this.model.newMethod, {
                    cardholderName: method.cardholderName,
                    paymentMethodNonce: method.nonce
                });

                return this.model.newMethod.save()
                    .then(function(newMethod) {
                        self.model.showCreditCardForm = false;
                        self.model.methods.unshift(newMethod);
                        self.model.chosenMethod = newMethod;
                        self.model.newMethod = cinema6.db.create('paymentMethod', {});

                        if (newMethod.type === 'creditCard' && self.canSubmit) {
                            return self.makePayment();
                        }
                    })
                    .catch(function() {
                        self.paymentMethodError = true;
                    })
                    .finally(function() {
                        self.pendingConfirmation = false;
                    });
            };

            this.failure = function() {
                this.pendingConfirmation = false;
            };

            this.resolve = function() {
                self.close();
                AddFundsModalService.resolve();
            };

            this.cancel = function() {
                self.close();
                AddFundsModalService.cancel();
            };

            this.close = function() {
                self.model.show = false;
                self.paymentMethodError = false;
                self.pendingConfirmation = false;
            };
        }])

        .service('AddFundsModalService', ['cinema6','$q','PaymentService',
        function                         ( cinema6 , $q , PaymentService ) {
            var model = {},
                deferred;

            Object.defineProperty(this, 'model', {
                get: function() {
                    return model;
                }
            });

            this.display = function() {
                model.show = true;
                model.pending = true;

                deferred = $q.defer();

                $q.all({
                    paymentMethods: cinema6.db.findAll('paymentMethod'),
                    newMethod: cinema6.db.create('paymentMethod', {}),
                    token: PaymentService.getToken()
                }).then(function(promises) {
                    model.deposit = null;
                    model.pending = false;
                    model.token = promises.token;
                    model.newMethod = promises.newMethod;
                    model.methods = promises.paymentMethods;
                    model.showCreditCardForm = !promises.paymentMethods.length;
                    model.chosenMethod = model.methods.filter(function(method) {
                        return !!method.default;
                    })[0];
                });

                return deferred.promise;
            };

            this.cancel = function() {
                deferred.reject();
            };

            this.resolve = function() {
                deferred.resolve();
            };
        }])

        .directive('campaignFundingModal', [function() {
            return {
                restrict: 'E',
                templateUrl: 'views/selfie/directives/campaign_funding/campaign_funding.html',
                controller: 'CampaignFundingController',
                controllerAs: 'CampaignFundingCtrl'
            };
        }])

        .controller('CampaignFundingController', ['CampaignFundingService','PaymentService','$q',
                                                  'cinema6','c6AsyncQueue',
        function                                 ( CampaignFundingService , PaymentService , $q ,
                                                   cinema6 , c6AsyncQueue ) {
            var self = this,
                queue = c6AsyncQueue();

            this.model = CampaignFundingService.model;

            Object.defineProperties(this, {
                depositError: {
                    get: function() {
                        if (this.model.minDeposit &&
                            (!this.model.deposit || this.model.deposit < this.model.minDeposit)) {
                            // a deposit of at least {{minDeposit}} is required
                            return 1;
                        }

                        if ((this.model.minDeposit && this.model.deposit < 1) ||
                            (this.model.deposit && this.model.deposit < 1)) {
                            // a deposit must be at least $1
                            return 2;
                        }

                        return false;
                    }
                }
            });

            this.close = function() {
                // this is on the "X" button in upper right
                this.paymentError = false;
                this.model.show = false;
                this.model.onClose();
            };

            this.cancel = function() {
                // this is on the Deposit "back/cancel" button
                this.paymentError = false;
                this.model.show = false;
                this.model.onCancel();
            };

            this.confirm = queue.debounce(function() {
                // this is on the Confirmation button
                var token = (this.model.paymentMethod || {}).token;

                this.confirmationPending = true;

                return (!!this.model.deposit ?
                        PaymentService.makePayment(token, this.model.deposit) :
                        $q.when(null))
                    .then(function() {
                        $q.when(self.model.onSuccess())
                            .finally(function() {
                                self.model.show = false;
                                self.confirmationPending = false;
                            });
                    }, function() {
                        self.paymentError = true;
                        self.confirmationPending = false;
                    });
            }, this);

            this.nextStep = function() {
                // this is on the Deposit "continue" button
                // and should transition from Deposit to Confirm UI
                // and should submit new method if form is active

                if (this.model.showCreditCardForm) {
                    this.newMethodPending = true;
                } else {
                    this.model.deposit = this.model.deposit || 0;
                    this.model.showDepositView = false;
                }
            };

            this.successfulPaymentMethod = function(method) {
                // this is passed to braintree directives and
                // called if braintree succeeds

                extend(this.model.newMethod, {
                    cardholderName: method.cardholderName,
                    paymentMethodNonce: method.nonce
                });

                self.paymentMethodError = false;

                return this.model.newMethod.save()
                    .then(function(method) {
                        self.model.showCreditCardForm = false;
                        self.model.paymentMethods.unshift(method);
                        self.model.paymentMethod = method;
                        self.model.newMethod = cinema6.db.create('paymentMethod', {});
                        self.model.deposit = self.model.deposit || 0;

                        if (method.type === 'creditCard') {
                            self.model.showDepositView = false;
                        }
                    })
                    .catch(function() {
                        self.paymentMethodError = true;
                    })
                    .finally(function() {
                        self.newMethodPending = false;
                    });
            };

            this.failedPaymentmethod = function() {
                // this is passed to braintree directives and
                // called if braintree fails
                this.newMethodPending = false;
            };

            this.goBack = function() {
                // this method is on the Confirm "back" button

                if (this.model.skipDeposit) {
                    // if we skipped Deposit then this
                    // is the same as canceling
                    this.cancel();
                } else {
                    // this will show the Deposit UI
                    this.model.showDepositView = true;
                }
            };
        }])

        .service('CampaignFundingService', ['$q','c6State','cinema6','CampaignService',
                                            'PaymentService',
        function                           ( $q , c6State , cinema6 , CampaignService ,
                                             PaymentService ) {
            var model = {};

            Object.defineProperty(this, 'model', {
                get: function() {
                    return model;
                }
            });

            this.fund = function(config) {
                var campId = config.originalCampaign.id,
                    orgId = config.originalCampaign.org,
                    budget = config.campaign.pricing.budget;

                extend(model, config);

                model.show = true;
                model.loading = true;
                model.showDepositView = true;
                model.newPaymentType = 'creditcard';
                model.isDraft = model.originalCampaign.status === 'draft';
                model.newBudget = budget;
                model.oldBudget = !!model.updateRequest ?
                    model.updateRequest.data.pricing.budget :
                    model.originalCampaign.pricing.budget;
                model.budgetChange = !model.isDraft ?
                    model.newBudget - model.oldBudget :
                    model.newBudget;

                $q.all({
                    token: PaymentService.getToken(),
                    balance: PaymentService.getBalance(),
                    newMethod: cinema6.db.create('paymentMethod', {}),
                    paymentMethods: cinema6.db.findAll('paymentMethod'),
                    creditCheck: PaymentService.creditCheck(campId, orgId, budget)
                }).then(function(promises) {
                    var SelfieUser = c6State.get('Selfie').cModel,
                        paymentOptional = SelfieUser.entitlements.paymentOptional,
                        hasPaymentMethods = !!promises.paymentMethods.length;

                    model.loading = false;
                    model.token = promises.token;
                    model.newMethod = promises.newMethod;
                    model.accounting = PaymentService.balance;
                    model.showCreditCardForm = !hasPaymentMethods;
                    model.minDeposit = promises.creditCheck.depositAmount;
                    model.skipDeposit = (hasPaymentMethods || paymentOptional) && !model.minDeposit;
                    model.showDepositView = !model.skipDeposit;
                    model.deposit = model.minDeposit;
                    model.paymentMethods = promises.paymentMethods;
                    model.paymentMethod = model.paymentMethods.filter(function(method) {
                        return !!method.default;
                    })[0];
                    model.cpv = CampaignService.getCpv(model.campaign, model.schema);
                    model.summary = CampaignService.getSummary({
                        campaign: model.campaign,
                        interests: config.interests
                    });
                });
            };
        }])

        .directive('braintreeCreditCard', [function() {
            return {
                restrict: 'E',
                scope: {
                    hideSaveButton: '=',
                    clientToken: '@',
                    onSuccess: '&',
                    onFailure: '&',
                    onCancel: '&',
                    method: '='
                },
                templateUrl: 'views/selfie/directives/credit_card.html',
                link: function(scope) {
                    scope.makeDefault = scope.method.default ? 'Yes' : 'No';
                    scope.name = scope.method.cardholderName;

                    braintree.setup(scope.clientToken, 'custom', {
                        id: 'c6-payment-method',
                        onReady: function() {
                            scope.$apply(function() {
                                scope.ready = true;
                            });
                        },
                        hostedFields: {
                            number: {
                                selector: '#c6-addCard-number'
                            },
                            cvv: {
                                selector: '#c6-cvv'
                            },
                            expirationDate: {
                                selector: '#c6-expiration-date'
                            },
                            postalCode: {
                                selector: '#c6-zip'
                            },
                            onFieldEvent: function(event) {
                                var container = event.target.container,
                                    fieldSet = container.parentElement,
                                    isFocused = event.isFocused,
                                    isEmpty = event.isEmpty,
                                    isValid = event.isValid,
                                    isPotentiallyValid = event.isPotentiallyValid;

                                if (isFocused || !isEmpty) {
                                    $(container).addClass('form__fillCheck--filled');
                                } else if (isEmpty) {
                                    $(container).removeClass('form__fillCheck--filled');
                                }

                                if (!isFocused && !isValid) {
                                    $(fieldSet).addClass('ui--hasError');
                                }

                                if (isFocused && isPotentiallyValid) {
                                    $(fieldSet).removeClass('ui--hasError');
                                }

                                if (isFocused) {
                                    $(container).addClass('in--focus');
                                } else {
                                    $(container).removeClass('in--focus');
                                }

                                if (scope.errorMessage) {
                                    scope.$apply(function() {
                                        scope.errorMessage = null;
                                    });
                                }
                            }
                        },
                        onError: function(event) {
                            scope.$apply(function() {
                                scope.errorMessage = event.message;
                                scope.pending = false;
                                scope.onFailure();
                            });
                        },
                        onPaymentMethodReceived: function(method) {
                            method.makeDefault = scope.makeDefault === 'Yes';
                            method.cardholderName = scope.name;

                            scope.$apply(function() {
                                scope.onSuccess({ method: method })
                                    .catch(function(err) {
                                        scope.errorMessage = err.data;
                                    })
                                    .finally(function() {
                                        scope.pending = false;
                                    });
                            });
                        }
                    });
                }
            };
        }])

        .directive('braintreePaypal', ['PaymentService',
        function                      ( PaymentService ) {
            return {
                restrict: 'E',
                scope: {
                    onSuccess: '&',
                    onFailure: '&',
                    onCancel: '&'
                },
                link: function(scope) {
                    PaymentService.getToken().then(function(token) {

                        braintree.setup(token, 'paypal', {
                            container: 'c6-paypal',
                            onPaymentMethodReceived: function(method) {
                                scope.$apply(function() {
                                    scope.onSuccess({ method: method });
                                });
                            }
                        });

                    });
                }
            };
        }])

        .directive('selfiePaymentMethods', [function() {
            return {
                restrict: 'E',
                scope: {
                    chosenMethod: '=',
                    methods: '='
                },
                templateUrl: 'views/selfie/directives/payment_methods.html',
                controller: 'SelfiePaymentMethodsController',
                controllerAs: 'SelfiePaymentMethodsCtrl'
            };
        }])

        .controller('SelfiePaymentMethodsController', ['$scope',
        function                                      ( $scope ) {
            Object.defineProperties(this, {
                methods: {
                    get: function() {
                        var methods = $scope.methods,
                            current = $scope.chosenMethod || {};

                        return (methods || []).filter(function(method) {
                            return method.token !== current.token;
                        });
                    }
                }
            });

            this.setChosenMethod = function(method) {
                $scope.chosenMethod = method;

                this.showDropdown = false;
            };

            this.toggleDropdown = function() {
                if ($scope.methods.length < 2) { return; }

                this.showDropdown = !this.showDropdown;
            };
        }])

        .directive('selfieNotification', [function() {
            return {
                restrict: 'E',
                templateUrl: 'views/selfie/directives/notification.html',
                controller: 'SelfieNotificationController',
                controllerAs: 'SelfieNotificationCtrl'
            };
        }])

        .controller('SelfieNotificationController', ['NotificationService',
        function                                    ( NotificationService ) {
            this.model = NotificationService.model;

            this.close = function() {
                this.model.text = null;
                this.model.show = false;
            };
        }])

        .directive('selfieLoginDialog', ['SelfieLoginDialogService',
        function                        ( SelfieLoginDialogService ) {
            return {
                restrict: 'E',
                templateUrl: 'views/selfie/directives/login_dialog.html',
                controller: 'SelfieLoginDialogController',
                controllerAs: 'LoginCtrl',
                scope: {},
                link: function(scope) {
                    scope.model = SelfieLoginDialogService.model;
                }
            };
        }])

        .controller('SelfieLoginDialogController', ['$q','AuthService','intercom',
                                                    'SelfieLoginDialogService',
        function                                   ( $q , AuthService , intercom ,
                                                     SelfieLoginDialogService ) {
            var LoginCtrl = this;

            this.error = null;
            this.model = {
                email: '',
                password: ''
            };

            this.submit = function() {
                var self = this;

                function validate(model) {
                    if (model.email && model.password) {
                        return $q.when(model);
                    } else {
                        return $q.reject('Email and password required.');
                    }
                }

                function login(model) {
                    return AuthService.login(model.email, model.password);
                }

                function goToApp(user) {
                    SelfieLoginDialogService.success();

                    /* jshint camelcase:false */
                    intercom('boot', {
                        app_id: c6Defines.kIntercomId,
                        name: user.firstName + ' ' + user.lastName,
                        email: user.email,
                        created_at: user.created
                    });
                    /* jshint camelcase:true */

                    LoginCtrl.model.email = '';
                    LoginCtrl.model.password = '';

                    return user;
                }

                function writeError(error) {
                    self.error = error;
                    return $q.reject(error);
                }

                return validate(this.model)
                    .then(login)
                    .then(goToApp)
                    .catch(writeError);
            };
        }])

        .directive('rcCustomParams', [function() {
            return {
                restrict: 'E',
                templateUrl: 'views/selfie/directives/custom_params.html',
                controller: 'RcCustomParamsController',
                controllerAs: 'RcCustomParamsCtrl',
                scope: {
                    checked: '=',
                    checkedText: '@',
                    uiBlacklist: '=',
                    addedParams: '=',
                    availableParams: '='
                }
            };
        }])

        .controller('RcCustomParamsController', ['$scope',
        function                                ( $scope ) {
            this.addParam = function(param) {
                if (!param) { return; }

                var addedParams = $scope.addedParams,
                    hasBeenAdded = addedParams.indexOf(param) > -1,
                    isInUI = $scope.uiBlacklist.indexOf(param.name) > -1;

                if (param.type === 'Array') {
                    param.value.push({
                        label: param.label,
                        value: undefined
                    });
                }

                if (!hasBeenAdded && !isInUI) {
                    addedParams.push(param);
                }
            };

            this.removeParam = function(param, subParam) {
                if (!param) { return; }

                var addedParams = $scope.addedParams,
                    index = addedParams.indexOf(param);

                if (subParam) {
                    param.value.splice(param.value.indexOf(subParam), 1);
                }

                if (param.type !== 'Array') {
                    addedParams.splice(index, 1);

                    if (param.type === 'Boolean') {
                        param.value = param.default !== undefined ?
                            (!!param.default ? 'Yes' : 'No') :
                            undefined;
                    } else {
                        param.value = param.default;
                    }
                }
            };
        }])

        .filter('abs', [function() {
            return function(number) {
                return Math.abs(number);
            };
        }])

        .filter('dollars', ['$filter',function($filter) {
            return function(number, decimals) {
                return (number < 0 ? '-$' : '$') + $filter('number')(Math.abs(number), decimals);
            };
        }])

        .filter('status', [function() {
            return function(service) {
                switch (service) {
                case 'draft':
                    return 'Draft';
                case 'pending':
                    return 'Pending';
                case 'active':
                    return 'Active';
                case 'paused':
                    return 'Paused';
                case 'canceled':
                    return 'Canceled';
                case 'outOfBudget':
                    return 'Out of Budget';
                case 'expired':
                    return 'Expired';
                default:
                    return service.charAt(0).toUpperCase() + service.slice(1);
                }
            };
        }])

        .filter('videoService', [function() {
            return function(service) {
                switch (service) {
                case 'youtube':
                    return 'YouTube';
                case 'vimeo':
                    return 'Vimeo';
                case 'dailymotion':
                    return 'DailyMotion';
                case 'adUnit':
                    return 'VAST';
                }
            };
        }])

        .filter('paymentType', [function() {
            return function(type) {
                switch (type) {
                case 'American Express':
                    return 'AMEX';
                case 'Diners Club':
                    return 'DCI';
                case 'MasterCard':
                    return 'MC';
                case 'Discover':
                    return 'DISC';
                case 'Visa':
                    return 'VISA';
                default:
                    return type;
                }
            };
        }])

        .directive('selfieCampaignUpdatesSummary', [function() {
            return {
                restrict: 'E',
                scope: {
                    campaign: '=',
                    card: '=',
                    updatedCampaign: '=',
                    updatedCard: '=',
                    updateRequest: '='
                },
                templateUrl: 'views/selfie/directives/updatesSummary.html',
                controller: 'SelfieCampaignUpdatesSummaryController',
                controllerAs: 'SelfieCampaignUpdatesSummaryCtrl'
            };
        }])

        .filter('readableTableKey', [function() {
            function capitalize(input) {
                if (input !== null) {
                    input = input.toLowerCase();
                    return input[0].toUpperCase() + input.slice(1);
                }
            }
            return function(keysHash) {
                var strings = {
                    'data': 'Data:',
                    'videoid': 'Video ID',
                    'id': 'ID',
                    'note': 'Copy',
                    'campaign': 'Campaign:',
                    'adtechName': 'Adtech Name',
                    'collateral': 'Collateral:',
                    'thumb': 'Custom Thumbnail',
                    'links': 'Links:',
                    'shareLinks': 'Sharing Links:',
                    'params': 'Params:',
                    'action': 'Call-To-Action',
                    'adtechid': 'Adtech ID',
                    'demographics': 'Demographics:',
                    'advertiserDisplayName': 'Advertiser Display Name',
                    'user': 'User ID',
                    'org': 'Organization ID',
                    'lastUpdated': 'Last Updated',
                    'updateRequest': 'Update Request ID',
                    'startDate': 'Start Date',
                    'endDate': 'End Date'
                };
                return keysHash.split('.').reduce(function(acc, key) {
                    return acc + ' ' + (strings[key] || capitalize(key));
                });
            };
        }])

        .filter('readableTableValue', ['$filter',
        function                      ( $filter ) {
            function makeReadable(val) {
                if(val === null) {
                    return '';
                }
                if(isArray(val)) {
                    if(val.length === 0) {
                        return '';
                    }
                    return val.map(function(entry) {
                        return makeReadable(entry);
                    }).join(', ');
                }
                var isDate = (new Date(val) !== 'Invalid Date' && !isNaN(new Date(val)) &&
                    String(val).indexOf('-') === 4);
                if (isDate) {
                    var date = new Date(val);
                    return $filter('date')(date, 'medium');
                }
                if(isObject(val)) {
                    if(val.type === 'interest') {
                        return '(' + val.label + ', ' + val.externalId + ')';
                    }
                }
                return String(val);
            }
            return makeReadable;
        }])

        .controller('SelfieCampaignUpdatesSummaryController', ['$scope', 'CampaignService',
        function                                              ( $scope ,  CampaignService ) {
            var self = this;
            self.edits = {};
            self.firstUpdate = false;
            self.summary = [];

            // Card Constants
            var CARD_PREFIX = 'Card';
            var CARD_EDITABLE_FIELDS = ['title', 'note', 'links.*', 'shareLinks.*'];
            var CARD_APPROVAL_FIELDS = [
                'id', 'type', 'title', 'note', 'thumb',
                'data\\.(service|videoid|duration)', 'collateral\\.logo',
                'links.*', 'shareLinks.*', 'params\\.action.*',
                'campaign\\.(startDate|endDate)'
            ];

            // Campaign Constants
            var CAMPAIGN_PREFIX = 'Campaign';
            var CAMPAIGN_EDITABLE_FIELDS = ['name', 'advertiserDisplayName'];
            var CAMPAIGN_APPROVAL_FIELDS = [
                'advertiserId', 'name', 'advertiserDisplayName', 'created', 'user', 'org',
                'status', 'id', 'targeting.*', 'pricing\\.(budget|dailyLimit|cost)'
            ];

            // Constructs the summary object used to generate the table
            this._loadSummary = function(campaign, updatedCampaign, updateRequest) {
                var firstUpdate = updateRequest.initialSubmit;
                self.firstUpdate = firstUpdate;
                var originalCampaign = (firstUpdate) ? {} : campaign;
                var summary = CampaignService.campaignDiffSummary(
                    originalCampaign, updatedCampaign, CAMPAIGN_PREFIX, CARD_PREFIX);

                var tableData = [];
                summary.forEach(function(diff) {
                    var approvalWhitelist, editableWhitelist;
                    if(diff.type === CARD_PREFIX) {
                        approvalWhitelist = CARD_APPROVAL_FIELDS;
                        editableWhitelist = CARD_EDITABLE_FIELDS;
                    } else {
                        approvalWhitelist = CAMPAIGN_APPROVAL_FIELDS;
                        editableWhitelist = CAMPAIGN_EDITABLE_FIELDS;
                    }
                    if(self._isWhitelisted(approvalWhitelist, diff.key)) {
                        var tableEntry = {
                            originalValue: diff.originalValue,
                            updatedValue: diff.updatedValue,
                            title: diff.type + '.' + diff.key,
                            editable: self._isWhitelisted(editableWhitelist, diff.key)
                        };
                        if(tableEntry.editable) {
                            self.edits[tableEntry.title] = diff.updatedValue;
                        }
                        tableData.push(tableEntry);
                    }
                });
                self.tableData = tableData;
            };

            this._isWhitelisted = function(whitelist, value) {
                for(var i=0;i<whitelist.length;i++) {
                    var regExp = whitelist[i];
                    var match = value.match(regExp);
                    if(match && match[0] === value ) {
                        return true;
                    }
                }
                return false;
            };

            $scope.$watch(function() {
                return self.edits;
            }, function(newVal, oldVal) {
                if(!equals(newVal, oldVal)) {
                    Object.keys(self.edits).forEach(function(keysHash) {
                        var keys = keysHash.split('.');
                        var editedValue = self.edits[keysHash];
                        var baseObj = $scope.updatedCampaign;
                        if(keys[0] === CARD_PREFIX) {
                            baseObj = baseObj.cards[0];
                        }
                        keys = keys.slice(1);
                        var prop = keys.pop();
                        var tailObj = keys.reduce(function(acc, key) {
                            return acc[key];
                        }, baseObj);
                        tailObj[prop] = editedValue;
                    });
                }
            }, true);

            this._loadSummary($scope.campaign, $scope.updatedCampaign, $scope.updateRequest);
        }])

        .directive('inputMask', [function() {
            return {
                restrict: 'A',
                link: function(scope, $element, attrs) {
                    var mask = attrs.inputMask;

                    if(!mask) {
                        return;
                    }

                    $($element).mask(mask);
                }
            };
        }])

        .directive('ctaSelect', [function() {
            return {
                restrict: 'E',
                scope: {
                    card: '=',
                    validation: '=',
                    maxLength: '=',
                    options: '='
                },
                templateUrl: 'views/selfie/directives/cta_select.html',
                controller: 'CtaSelectController',
                controllerAs: 'CtaSelectCtrl'
            };
        }])

        .controller('CtaSelectController', ['$scope', function($scope) {
            var self = this;

            var _private = { };
            if (window.c6.kHasKarma) { self._private = _private; }

            _private.generateWebsiteLink = function(link) {
                var hasProtocol = (/^http:\/\/|https:\/\//).test(link),
                    hasSlashes = (/^\/\//).test(link);

                if (hasProtocol) {
                    return link;
                }

                if (link) {
                    return (hasSlashes ? 'http:' : 'http://') + link;
                }

                return link;
            };

            _private.generatePhoneLink = function(phoneNumber) {
                if(phoneNumber) {
                    return 'tel:' + phoneNumber.replace(/\D/g, '');
                } else {
                    return '';
                }
            };

            _private.getActionLabel = function(card) {
                var options = self.actionLabelOptions;
                var defaultOption;
                var currentOption;
                var action = card.params.action;
                var found = options.some(function(option) {
                    currentOption = option;
                    if(option.label === 'Custom' && option.group === action.group) {
                        defaultOption = option;
                    }
                    return (option.label === action.label && option.group === action.group);
                });
                return found ? currentOption : defaultOption;
            };

            _private.getActionWebsite = function(card) {
                var actionLink = card.links.Action;
                return (card.params.action.group === 'website' && actionLink) ? actionLink :
                    card.links.Website || '';
            };

            _private.getActionPhone = function(card) {
                var actionLink = card.links.Action;
                if (card.params.action.group === 'phone' && actionLink) {
                    var number = actionLink.slice(4, actionLink.length);
                    return '+1 (' + number.slice(1, 4) + ') ' + number.slice(4, 7) + '-' +
                        number.slice(7, number.length);
                } else {
                    return '';
                }
            };

            $scope.card.params.action = $scope.card.params.action || { type: 'button' };
            $scope.card.params.action.label = $scope.card.params.action.label || 'Learn More';
            $scope.card.params.action.group = $scope.card.params.action.group || 'website';

            self.bindLinkToWebsite = !$scope.card.links.Action;
            self.actionWebsite = _private.getActionWebsite($scope.card);
            self.actionPhone = _private.getActionPhone($scope.card);
            self.groupLabels = $scope.options.groupLabels;
            self.actionLabelOptions = $scope.options.options;
            self.actionLabel = _private.getActionLabel($scope.card);

            self.updateActionLabel = function() {
                var group = self.actionLabel.group;
                var input = (group === 'website') ? self.actionWebsite : self.actionPhone;

                if (self.actionLabel.label !== 'Custom') {
                    $scope.card.params.action.label = self.actionLabel.label;
                }
                $scope.card.params.action.group = group;
                self.updateActionLink(input, group);
            };

            self.updateActionLink = function(input, group) {
                var link;
                switch(group) {
                case 'website':
                    link = _private.generateWebsiteLink(input);
                    self.actionWebsite = link;
                    break;
                case 'phone':
                    link = _private.generatePhoneLink(input);
                    break;
                default:
                    link = '';
                }

                $scope.card.links.Action = link;
            };

            $scope.$watch(function() {
                return $scope.card.links.Website;
            }, function(website) {
                if (website && self.bindLinkToWebsite && self.actionLabel.group === 'website') {
                    self.updateActionLink(website, 'website');
                }
            });
        }]);
});
