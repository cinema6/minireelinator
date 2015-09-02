define( ['angular','select2'],
function( angular ) {
    'use strict';

    var $ = angular.element,
        extend = angular.extend,
        copy = angular.copy,
        forEach = angular.forEach,
        isObject = angular.isObject;

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
        .directive('c6FillCheck', ['$timeout',
        function                  ( $timeout ) {
            return {
                restrict: 'A',
                link: function(scope, $element) {
                    $timeout(function() {
                        if ($element.val()) {
                            $element.addClass('form__fillCheck--filled');
                        }

                        $element.blur(function() {
                            if ($element.val()){
                                $element.addClass('form__fillCheck--filled');
                            } else {
                                $element.removeClass('form__fillCheck--filled');
                            }
                        });
                    });
                }
            };
        }])

        .directive('c6SelectBox', ['$timeout','$parse',
        function                  ( $timeout , $parse ) {
            return {
                restrict: 'A',
                link: function(scope, $element, attrs) {
                    $timeout(function() {
                        var config = $parse(attrs.config)(scope) || {},
                            options = $parse(attrs.options)(scope);

                        function findBy(prop, value, arr) {
                            return arr.filter(function(item) {
                                return item[prop] === value;
                            })[0];
                        }

                        function format(option) {
                            var found = findBy('label', option.text, options) || {};

                            if (!found.src) { return option.text; }

                            var $option = $('<span><img src="' +
                                found.src + '" /> ' + option.text + '</span>');

                            return $option;
                        }

                        function shouldHideDefaultOption() {
                            return attrs.unselectDefault && $element.val() === '0';
                        }

                        if (attrs.thumbnails) {
                            config.templateResult = format;
                        }

                        $element.select2(extend({
                            minimumResultsForSearch: Infinity
                        }, config));

                        // console.log(attrs.unselectDefault, $element.val() === '0');

                        if (attrs.preselected || ($element.val() && !shouldHideDefaultOption())) {
                            $element.addClass('form__fillCheck--filled');
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
                    });
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
                    var input = $document[0].getElementById(attrs.hiddenInputClick);

                    $element.on('click', function() {
                        angular.element(input).trigger('click');
                    });
                }
            };
        }])

        .directive('selfieCategories', ['$compile',
        function                       ( $compile ) {
            return {
                restrict: 'E',
                scope: {
                    campaign: '='
                },
                templateUrl: 'views/selfie/directives/categories.html',
                controller: 'SelfieCategoriesController',
                controllerAs: 'SelfieCategoriesCtrl',
                link: function(scope, element, attrs, ctrl) {
                    ctrl.loadCategories().then(function() {
                        $compile(element.contents())(scope);
                    });
                }
            };
        }])

        .controller('SelfieCategoriesController', ['$scope','cinema6',
        function                                  ( $scope , cinema6 ) {
            var SelfieCategoriesCtrl = this,
                campaign = $scope.campaign;

            this.loadCategories = function() {
                return cinema6.db.findAll('category').then(function(cats) {
                    // we need to have a selectable item in the dropdown for 'none'
                    SelfieCategoriesCtrl.categories = [{
                        name: 'none',
                        label: 'No Category Targeting'
                    }].concat(cats);

                    // we default to 'none'
                    SelfieCategoriesCtrl.category = SelfieCategoriesCtrl.categories
                        .filter(function(category) {
                            var name = campaign.categories[0] || 'none';

                            return name === category.name;
                        })[0];

                    return cats;
                });
            };

            // we watch the category choice and add only one to the campaign if chosen
            // and set to empty array if 'No Categories' is chosen
            $scope.$watch(function() {
                return SelfieCategoriesCtrl.category;
            }, function(newCat, oldCat) {
                if (newCat === oldCat) { return; }

                campaign.categories = newCat.name !== 'none' ? [newCat.name] : [];
            });
        }])

        .directive('selfieGeotargeting', [function() {
            return {
                restrict: 'E',
                scope: {
                    campaign: '='
                },
                templateUrl: 'views/selfie/directives/geotargeting.html',
                controller: 'SelfieGeotargetingController',
                controllerAs: 'SelfieGeotargetingCtrl'
            };
        }])

        .controller('SelfieGeotargetingController', ['$scope','cinema6','GeoService',
        function                                    ( $scope , cinema6 , GeoService ) {
            var SelfieGeotargetingCtrl = this,
                campaign = $scope.campaign;

            this.geoOptions = GeoService.usa.map(function(state) {
                return {
                    state: state,
                    country: 'usa'
                };
            });

            // we filter the options and use only the ones saved on the campaign
            this.geo = this.geoOptions.filter(function(option) {
                return campaign.geoTargeting.filter(function(geo) {
                    return option.state === geo.state;
                }).length > 0;
            });

            // we watch the geo choices and save an array of states
            $scope.$watch(function() {
                return SelfieGeotargetingCtrl.geo;
            }, function(newGeo, oldGeo) {
                if (newGeo === oldGeo) { return; }

                campaign.geoTargeting = newGeo.map(function(geo) {
                    return { state: geo.state };
                });
            });
        }])

        .directive('selfieBudget', [function() {
            return {
                restrict: 'E',
                scope: {
                    campaign: '=',
                    valid: '='
                },
                templateUrl: 'views/selfie/directives/budget.html',
                controller: 'SelfieBudgetController',
                controllerAs: 'SelfieBudgetCtrl'
            };
        }])

        .controller('SelfieBudgetController', ['$scope','c6Computed',
        function                              ( $scope , c6Computed ) {
            var c = c6Computed($scope),
                SelfieBudgetCtrl = this,
                campaign = $scope.campaign;

            c($scope, 'valid', function() {
                return !!SelfieBudgetCtrl.budget && !!SelfieBudgetCtrl.limit &&
                    !!SelfieBudgetCtrl.validBudget && !SelfieBudgetCtrl.dailyLimitError;
            }, ['SelfieBudgetCtrl.budget','SelfieBudgetCtrl.limit']);

            this.budget = campaign.pricing.budget;
            this.limit = campaign.pricing.dailyLimit;

            Object.defineProperties(this, {
                cpv: {
                    get: function() {
                        var hasCategory = campaign.categories.length,
                            hasGeos = campaign.geoTargeting.length;

                        return 50 + ([hasCategory, hasGeos]
                            .filter(function(bool) { return bool; }).length * 0.5);
                    }
                },
                validBudget: {
                    get: function() {
                        var budget = parseInt(this.budget);

                        return !budget || (budget > 50 && budget < 20000);
                    }
                },
                dailyLimitError: {
                    get: function() {
                        var budget = parseInt(this.budget),
                            max = parseInt(this.limit);

                        if (max && !budget) {
                            return 'Please enter your Total Budget first';
                        }

                        if (max < budget * 0.015) {
                            return 'Must be greater than 1.5% of the Total Budget';
                        }

                        if (max > budget) {
                            return 'Must be less than Total Budget';
                        }

                        return false;
                    }
                }
            });

            // watch the budget and limit but only add them to the campaign
            // if they're valid so no bad values get autosaved
            $scope.$watchCollection(function() {
                return [
                    SelfieBudgetCtrl.budget,
                    SelfieBudgetCtrl.limit
                ];
            }, function(params, oldParams) {
                if (params === oldParams) { return; }

                var Ctrl = SelfieBudgetCtrl;

                if (Ctrl.validBudget && !Ctrl.dailyLimitError) {
                    campaign.pricing.budget = params[0];
                    campaign.pricing.dailyLimit = params[1];
                }
            });
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
            $scope.$watch('card', loadPreview);

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
        }]);
});