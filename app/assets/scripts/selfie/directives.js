define( ['angular','select2','braintree','jqueryui'],
function( angular , select2 , braintree ) {
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
        .directive('c6FillCheck', ['$timeout',
        function                  ( $timeout ) {
            return {
                restrict: 'A',
                require: '?ngModel',
                link: function(scope, $element, attrs, ngModel) {

                    function handleModelChange() {
                        if (ngModel.$viewValue) {
                            $element.addClass('form__fillCheck--filled');
                        } else {
                            $element.removeClass('form__fillCheck--filled');
                        }
                    }

                    if (ngModel) {
                        ngModel.$viewChangeListeners.push(handleModelChange);
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

                    $element.on('click', function() {
                        var input = $document[0].getElementById(attrs.hiddenInputClick);

                        if (input && input.click) {
                            input.click();
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
                        } else {
                            $element.removeClass('ui--hasError');
                        }
                    });
                }
            };
        }])

        .directive('datepicker', ['$timeout',
        function                 ( $timeout ) {
            return {
                restrict: 'A',
                scope: {
                    minDate: '=',
                    maxDate: '=',
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

                        if (minDate && minDate < now) {
                            minDate = pad(now.getMonth() + 1) +
                                '/' + pad(now.getDate()) +
                                '/' + now.getFullYear();

                            return minDate;
                        }

                        return scope.minDate;
                    }

                    $element.datepicker({
                        defaultDate: scope.defaultDate || null,
                        minDate: scope.minDate || 0,
                        maxDate: scope.maxDate || null,
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
                            $element.datepicker('option', 'minDate', getMin() || 0);
                            $element.datepicker('option', 'maxDate', scope.maxDate || null);

                            $timeout(function() {
                                var $picker = $('#ui-datepicker-div'),
                                    pickerWidth = $picker.outerWidth(),
                                    offset = left + ((inputWidth - pickerWidth) / 2);

                                // center the datepicker
                                $picker.css('left', offset);
                            });
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

        .controller('SelfieInterestsController', ['$scope',
        function                                 ( $scope ) {
            var campaign = $scope.campaign,
                categories = $scope.categories,
                schema = $scope.schema;

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

            this.tiers = generateInterestTiers(categories);
            this.priceForInterests = schema.pricing.cost.__priceForInterests;

        }])

        .directive('selfieGeotargeting', [function() {
            return {
                restrict: 'E',
                scope: {
                    campaign: '=',
                    schema: '='
                },
                templateUrl: 'views/selfie/directives/geotargeting.html',
                controller: 'SelfieGeotargetingController',
                controllerAs: 'SelfieGeotargetingCtrl'
            };
        }])

        .controller('SelfieGeotargetingController', ['$scope','GeoService',
        function                                    ( $scope , GeoService ) {
            var SelfieGeotargetingCtrl = this,
                campaign = $scope.campaign,
                schema = $scope.schema;

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

            this.pricePerGeo = schema.pricing.cost.__pricePerGeo;

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
        function                                    ( DemographicsService , $scope ) {
            var SelfieDemographicsCtrl = this,
                campaign = $scope.campaign,
                schema = $scope.schema,
                demographics = campaign.targeting.demographics;

            this.ageOptions = DemographicsService.ages;
            this.incomeOptions = DemographicsService.incomes;
            this.genderOptions = ['Male','Female'];
            this.pricePerDemo = schema.pricing.cost.__pricePerDemo;

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
                            validDecimal = !max || (/^[0-9]+(\.[0-9]{1,2})?$/).test(max);

                        if (max && !budget) { return 1; }
                        if (max < budget * limitMinPercent) { return 2; }
                        if (max > budget) { return 3; }
                        if (!validDecimal) { return 4; }

                        return false;
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
                            });
                        },
                        onPaymentMethodReceived: function(method) {
                            method.makeDefault = scope.makeDefault === 'Yes';
                            method.cardholderName = scope.name;

                            scope.$apply(function() {
                                scope.onSuccess({ method: method })
                                    .catch(function(err) {
                                        scope.errorMessage = err.data;
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

        .controller('SelfieLoginDialogController', ['$q','AuthService','SelfieLoginDialogService',
        function                                   ( $q , AuthService , SelfieLoginDialogService ) {
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

            function pad(num) {
                var norm = Math.abs(Math.floor(num));
                return (norm < 10 ? '0' : '') + norm;
            }

            function formatDate(iso) {
                var date = new Date(iso);

                return pad(date.getMonth() + 1) +
                    '/' + pad(date.getDate()) +
                    '/' + date.getFullYear();
            }

            function generateInterests(campaign, interests) {
                return interests.filter(function(interest) {
                    return campaign.targeting.interests.indexOf(interest.id) > -1;
                }).map(function(interest) {
                    return interest.label;
                }).join(', ');
            }

            function generateDemo(campaign) {
                var demographics = campaign.targeting.demographics,
                    demoModel = [];

                forEach(demographics, function(demo, type) {
                    if (demo.length) {
                        demoModel.push({
                            name: type.slice(0, 1).toUpperCase() + type.slice(1),
                            list: demo.join(', ')
                        });
                    }
                });

                return demoModel;
            }

            function generateGeo(campaign) {
                var geo = campaign.targeting.geo,
                    geoModel = [];

                forEach(geo, function(geo, type) {
                    if (geo.length) {
                        geoModel.push({
                            name: type === 'dmas' ? 'DMA' :
                                type.slice(0, 1).toUpperCase() + type.slice(1),
                            list: geo.join(', ')
                        });
                    }
                });

                return geoModel;
            }

            function generateDuration(campaign) {
                var startDate = campaign.cards[0].campaign.startDate,
                    endDate = campaign.cards[0].campaign.endDate;

                if (!startDate && !endDate) {
                    return 'Once approved, run until stopped.';
                }
                if (!endDate) {
                    return formatDate(startDate) + ' until stopped.';
                }
                if (!startDate) {
                    return 'Once approved until ' + formatDate(endDate);
                }

                return formatDate(startDate) + ' to ' + formatDate(endDate);
            }

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

                model.interests = generateInterests(campaign, interests);
                model.demographics = generateDemo(campaign);
                model.duration = generateDuration(campaign);
                model.geo = generateGeo(campaign);
                model.cpv = CampaignService.getCpv(campaign, schema);

                model.show = true;
            };

            this.close = function() {
                model.show = false;
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
            return function(val) {
                if(val === null) {
                    return '';
                }
                if(isArray(val)) {
                    if(val.length === 0) {
                        return '';
                    }
                    return val.join(', ');
                }
                var isDate = (new Date(val) !== 'Invalid Date' && !isNaN(new Date(val)) &&
                    String(val).indexOf('-') === 4);
                if (isDate) {
                    var date = new Date(val);
                    return $filter('date')(date, 'medium');
                }
                return String(val);
            };
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
                'data\\.(service|videoid)', 'collateral\\.logo',
                'links.*', 'shareLinks.*',
                'params\\.action.*', 'campaign\\.(adtechName|startDate|endDate)'
            ];

            // Campaign Constants
            var CAMPAIGN_PREFIX = 'Campaign';
            var CAMPAIGN_EDITABLE_FIELDS = ['name', 'advertiserDisplayName'];
            var CAMPAIGN_APPROVAL_FIELDS = [
                'adtechId', 'name', 'advertiserDisplayName',
                'created', 'user', 'org', 'lastUpdated',
                'status', 'updateRequest', 'id',
                'targeting.*', 'pricing\\.(budget|dailyLimit|cost)'
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
