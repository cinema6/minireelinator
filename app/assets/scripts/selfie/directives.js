define( ['angular','select2','braintree','jqueryui','chartjs','c6_defines'],
function( angular , select2 , braintree , jqueryui , Chart   , c6Defines  ) {
    'use strict';

    var $ = angular.element,
        extend = angular.extend,
        copy = angular.copy,
        forEach = angular.forEach,
        isObject = angular.isObject,
        isArray = angular.isArray,
        equals = angular.equals;

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
                        if (ngModel.$modelValue || (checkView && ngModel.$viewValue)) {
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

                        if (!value) {
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
            return {
                restrict: 'A',
                scope: {
                    stats: '=',
                    duration: '='
                },
                link: function(scope, $element) {
                    var _barGraph, _actualData;

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
                            if (i < first) {
                                data.push(
                                    Math.round(views - (i * (diff0to1 / qSecs)))
                                );
                            } else if (i < second) {
                                data.push(
                                    Math.round(q1 - ((i - first) * (diff1to2 / qSecs)))
                                );
                            } else if (i < third) {
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

                    function initGraph() {
                        // only called when stats change
                        var canvas = $element.find('canvas')[0].getContext('2d'),
                            duration = scope.duration,
                            stats = scope.stats,
                            views = stats.views,
                            options = {
                                scaleOverride : true,
                                scaleSteps : 10,
                                scaleStepWidth : 10,
                                scaleStartValue : 0
                            };

                        // set actualData in directive scope
                        _actualData = calculateCompleteViewData(stats, duration.actual);

                        _barGraph = new Chart(canvas).barSkinny({
                            labels : ['','','',''],
                            datasets : [
                                {
                                    fillColor: 'rgba(17, 157, 164, 0.75)',
                                    strokeColor: 'rgba(17, 157, 164, 1)',
                                    data: [
                                        getPercentage(stats.quartile1, views),
                                        getPercentage(stats.quartile2, views),
                                        getPercentage(stats.quartile3, views),
                                        getPercentage(stats.quartile4, views)
                                    ]
                                },
                                {
                                    fillColor: 'rgba(0, 0, 0, 0.1)',
                                    strokeColor: 'rgba(0, 0, 0, 0.25)',
                                    data: getCalculatedData(views, duration.custom, _actualData)
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
                        if (_barGraph) {
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
                    stats: '='
                },
                link: function(scope, $element) {
                    var totalClicks = 0,
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
                        };

                    if (!scope.stats) { return; }

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

                    // pie chart options
                    var pieOptions = {
                        segmentShowStroke : false,
                        animateScale : true,
                        responsive: true,
                        maintainAspectRatio: true,
                        tooltipTemplate: '<%if (label){%><%=label %>: <%}%><%= value %>%'
                    };

                    $timeout(function() {
                        // get pie chart canvas
                        var canvas = $element.find('canvas')[0].getContext('2d');
                        // draw pie chart
                        var pie = new Chart(canvas).Doughnut(pieData, pieOptions);
                        // add legend
                        $element.find('#js-legend')[0].innerHTML = pie.generateLegend();
                    });
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
            $scope.device = $scope.device || 'desktop';

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
                    schema: '='
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
                schema = $scope.schema,
                pricing = schema.pricing,
                budgetMin = pricing.budget.__min,
                budgetMax = pricing.budget.__max,
                limitMinPercent = pricing.dailyLimit.__percentMin;

            this.budget = campaign.pricing.budget || null;
            this.limit = campaign.pricing.dailyLimit || null;
            this.limitMinPercent = limitMinPercent;
            this.budgetMin = budgetMin;
            this.budgetMax = budgetMax;

            validation.budget = !!this.budget;

            Object.defineProperties(this, {
                cpv: {
                    get: function() {
                        return CampaignService.getCpv(campaign, schema);
                    }
                },
                validBudget: {
                    get: function() {
                        var budget = parseFloat(this.budget);

                        return (!budget && !validation.show) || !this.budgetError;
                    }
                },
                budgetError: {
                    get: function() {
                        var budget = parseFloat(this.budget),
                            validDecimal = !budget || (/^[0-9]+(\.[0-9]{1,2})?$/).test(budget);

                        if (budget < budgetMin) { return 1; }
                        if (budget > budgetMax) { return 2; }
                        if (!validDecimal) { return 3; }
                        if (!budget && validation.show) { return 4; }

                        return false;
                    }
                },
                dailyLimitError: {
                    get: function() {
                        var budget = parseFloat(this.budget),
                            max = parseFloat(this.limit),
                            validDecimal = !max || (/^[0-9]+(\.[0-9]{1,2})?$/).test(max),
                            startDate = card.campaign && card.campaign.startDate &&
                                new Date(card.campaign.startDate),
                            endDate = card.campaign && card.campaign.endDate &&
                                new Date(card.campaign.endDate),
                            oneDay = 24*60*60*1000,
                            tomorrow = new Date(),
                            days;

                        if (budget && endDate) {
                            tomorrow.setDate(tomorrow.getDate() + 1);

                            startDate = startDate || tomorrow;

                            days = Math.round(
                                Math.abs((endDate.getTime() - startDate.getTime()) / oneDay)
                            ) || 1;
                        }

                        if (max && !budget) { return { code: 1 }; }
                        if (max < budget * limitMinPercent) { return { code: 2 }; }
                        if (max > budget) { return { code: 3 }; }
                        if (!validDecimal) { return { code: 4 }; }
                        if (max && budget && days && max < (budget / days)) {
                            return { code: 5, min: budget / days };
                        }

                        return false;
                    }
                }
            });

            Object.defineProperties(validation, {
                dailyLimit: {
                    get: function() {
                        return !SelfieBudgetCtrl.dailyLimitError;
                    }
                }
            });

            this.setBudget = function() {
                var Ctrl = SelfieBudgetCtrl,
                    budget = Ctrl.budget,
                    limit = Ctrl.limit;

                if (Ctrl.validBudget && !Ctrl.dailyLimitError) {
                    campaign.pricing.budget = budget;
                    campaign.pricing.dailyLimit = limit;

                    validation.budget = !!budget;
                } else {
                    validation.budget = false;
                }
            };
        }])

        .directive('braintreeCreditCard', [function() {
            return {
                restrict: 'E',
                scope: {
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
                    campaign: '=',
                    methods: '='
                },
                templateUrl: 'views/selfie/directives/payment_methods.html',
                controller: 'SelfiePaymentMethodsController',
                controllerAs: 'SelfiePaymentMethodsCtrl'
            };
        }])

        .controller('SelfiePaymentMethodsController', ['$scope',
        function                                      ( $scope ) {
            var campaign = $scope.campaign,
                methods = $scope.methods,
                SelfiePaymentMethodsCtrl = this;

            function getPrimaryMethod() {
                return methods.filter(function(method) {
                    return !!method.default;
                })[0];
            }

            function getMethodById(token) {
                return methods.filter(function(method) {
                    return token === method.token;
                })[0];
            }

            Object.defineProperties(this, {
                methods: {
                    get: function() {
                        var current = SelfiePaymentMethodsCtrl.currentMethod || {};

                        return (methods || []).filter(function(method) {
                            return method.token !== current.token;
                        });
                    }
                }
            });

            this.currentMethod = methods.filter(function(method) {
                return campaign.paymentMethod === method.token;
            })[0] || getPrimaryMethod();

            if (!campaign.paymentMethod && this.currentMethod) {
                campaign.paymentMethod = this.currentMethod.token;
            }

            this.setCurrentMethod = function(method) {
                this.currentMethod = method;
                campaign.paymentMethod = method.token;
                this.showDropdown = false;
            };

            this.toggleDropdown = function() {
                if (methods.length < 2) { return; }

                this.showDropdown = !this.showDropdown;
            };

            $scope.$watch(function() {
                return campaign.paymentMethod;
            }, function(newToken, oldToken) {
                if (newToken === oldToken) { return; }

                SelfiePaymentMethodsCtrl.setCurrentMethod(getMethodById(newToken));
            });
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

        .directive('selfieCampaignSummary', ['SelfieCampaignSummaryService',
        function                            ( SelfieCampaignSummaryService ) {
            return {
                restrict: 'E',
                templateUrl: 'views/selfie/directives/campaign_summary.html',
                scope: {},
                link: function(scope) {
                    scope.model = SelfieCampaignSummaryService.model;
                }
            };
        }])

        .service('SelfieCampaignSummaryService', ['CampaignService',
        function                                 ( CampaignService ) {
            var model = {};

            Object.defineProperty(this, 'model', {
                get: function() {
                    return model;
                }
            });

            this.display = function(dialogModel) {
                var campaign = dialogModel.campaign,
                    interests = dialogModel.interests,
                    schema = dialogModel.schema;

                if (!campaign || !interests || !schema) { return; }

                extend(model, dialogModel);

                extend(model, CampaignService.getSummary({
                    campaign: campaign,
                    interests: interests
                }));

                model.cpv = CampaignService.getCpv(campaign, schema);

                model.show = true;
            };

            this.close = function() {
                model.show = false;
            };

            this.pending = function(bool) {
                model.pending = bool;
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
                    updatedCard: '='
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
            this._loadSummary = function(campaign, updatedCampaign) {
                var firstUpdate = (campaign.status === 'pending');
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

            this._loadSummary($scope.campaign, $scope.updatedCampaign);
        }]);
});
