define( ['angular','select2','braintree'],
function( angular , select2 , braintree ) {
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

        .directive('blurValidate', [function() {
            return {
                restrict: 'A',
                link: function(scope, $element, attrs) {
                    var input = $element.find('#' + attrs.blurValidate);

                    input.on('blur', function() {
                        var value = $(this).val();

                        if (!value) {
                            $element.addClass('ui--hasError');
                        } else {
                            $element.removeClass('ui--hasError');
                        }
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
        function                                         ( $scope ) {
            var SelfieCategoriesCtrl = this,
                campaign = $scope.campaign,
                categories = $scope.categories;

            this.category = categories.filter(function(category) {
                return campaign.contentCategories.primary === category.name;
            })[0] || null;

            $scope.$watch(function() {
                return SelfieCategoriesCtrl.category;
            }, function(newCat, oldCat) {
                if (newCat === oldCat) { return; }

                campaign.contentCategories.primary = newCat.name;
            });
        }])

        .directive('selfieInterests', [function() {
            return {
                restrict: 'E',
                scope: {
                    categories: '=',
                    campaign: '='
                },
                templateUrl: 'views/selfie/directives/interests.html',
                controller: 'SelfieInterestsController',
                controllerAs: 'SelfieInterestsCtrl'
            };
        }])

        .controller('SelfieInterestsController', ['$scope',
        function                                 ( $scope ) {
            var SelfieInterestsCtrl = this,
                campaign = $scope.campaign,
                categories = $scope.categories;

            this.interests = categories.filter(function(category) {
                return campaign.targeting.interests.indexOf(category.name) > -1;
            });

            $scope.$watch(function() {
                return SelfieInterestsCtrl.interests;
            }, function(newInterests, oldInterests) {
                if (newInterests === oldInterests) { return; }

                campaign.targeting.interests = newInterests.map(function(interest) {
                    return interest.name;
                });
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

        .controller('SelfieGeotargetingController', ['$scope','GeoService',
        function                                    ( $scope , GeoService ) {
            var SelfieGeotargetingCtrl = this,
                campaign = $scope.campaign;

            this.stateOptions = GeoService.usa.map(function(state) {
                return {
                    state: state,
                    country: 'usa'
                };
            });

            this.dmaOptions = GeoService.dmas;

            // we filter the options and use only the ones saved on the campaign
            this.states = this.stateOptions.filter(function(option) {
                return campaign.targeting.geo.states.filter(function(state) {
                    return option.state === state;
                }).length > 0;
            });

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
                    campaign: '='
                },
                templateUrl: 'views/selfie/directives/demographics.html',
                controller: 'SelfieDemographcisController',
                controllerAs: 'SelfieDemographicsCtrl'
            };
        }])

        .controller('SelfieDemographcisController', ['DemographicsService',
        function                                    ( DemographicsService ) {
            this.ageOptions = DemographicsService.ages;
            this.incomeOptions = DemographicsService.incomes;
            this.genderOptions = ['Male','Female'];
        }])

        .directive('selfieBudget', [function() {
            return {
                restrict: 'E',
                scope: {
                    campaign: '='
                },
                templateUrl: 'views/selfie/directives/budget.html',
                controller: 'SelfieBudgetController',
                controllerAs: 'SelfieBudgetCtrl'
            };
        }])

        .controller('SelfieBudgetController', ['$scope',
        function                              ( $scope ) {
            var SelfieBudgetCtrl = this,
                campaign = $scope.campaign,
                validation = $scope.validation || {};

            this.budget = campaign.pricing.budget || null;
            this.limit = campaign.pricing.dailyLimit || null;

            Object.defineProperties(this, {
                cpv: {
                    get: function() {
                        var hasInterests = campaign.targeting.interests.length,
                            hasStates = campaign.targeting.geo.states.length,
                            hasDmas = campaign.targeting.geo.dmas.length;

                        return 50 + ([hasInterests, hasStates, hasDmas]
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

                var Ctrl = SelfieBudgetCtrl,
                    budget = params[0],
                    limit = params[1];

                if (Ctrl.validBudget && !Ctrl.dailyLimitError) {
                    campaign.pricing.budget = params[0];
                    campaign.pricing.dailyLimit = params[1];

                    validation.budget = !!budget && !!limit;
                } else {
                    validation.budget = false;
                }
            });
        }])

        .directive('c6Payment', ['$http','c6UrlMaker',
        function                ( $http , c6UrlMaker ) {
            return {
                restrict: 'E',
                scope: {
                    // clientToken: '=', // maybe the parent state creates this and passes it in?
                    onSuccess: '&',
                    onFailure: '&',
                    onCancel: '&',
                    method: '='
                },
                templateUrl: 'views/selfie/directives/payment.html',
                link: function(scope, $element, atts, ctrl) {
                    scope.makeDefault = scope.method.makeDefault ? 'Yes' : 'No';
                    scope.name = scope.method.cardholderName;

                    $http.get(c6UrlMaker('payments/clientToken', 'api'))
                        .then(function(resp) {
                            braintree.setup(resp.data.clientToken, 'custom', {
                                id: 'c6-payment-method',
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
                                    onFieldEvent: function(event) {
                                        var fieldSet = event.target.container,
                                            isFocused = event.isFocused,
                                            isEmpty = event.isEmpty;

                                        if (isFocused) {
                                            $(fieldSet).addClass('form__fillCheck--filled');
                                        } else if (isEmpty) {
                                            $(fieldSet).removeClass('form__fillCheck--filled');
                                        }
                                    }
                                },
                                onPaymentMethodReceived: function(method) {
                                    scope.method.paymentMethodNonce = method.nonce;
                                    scope.method.cardholderName = scope.name;
                                    scope.method.makeDefault = scope.makeDefault === 'Yes';

                                    scope.onSuccess();

                                    // we got the nonce, make call to payment service to add it
                                    // or maybe we just call the onSuccess() function passed
                                    // on the scope. That way the state/controller gets to decide
                                    // what to do with the info
                                }
                            });
                        });
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
        }]);
});