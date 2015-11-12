define( ['angular','select2','braintree'],
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
                            mode: 'desktop-card',
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
            var SelfieInterestsCtrl = this,
                campaign = $scope.campaign,
                categories = $scope.categories,
                schema = $scope.schema;

            this.interests = categories.filter(function(category) {
                return campaign.targeting.interests.indexOf(category.id) > -1;
            });

            this.priceForInterests = schema.pricing.cost.__priceForInterests;

            $scope.$watch(function() {
                return SelfieInterestsCtrl.interests;
            }, function(newInterests, oldInterests) {
                if (newInterests === oldInterests) { return; }

                campaign.targeting.interests = newInterests.map(function(interest) {
                    return interest.id;
                });
            });
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

        .controller('SelfieBudgetController', ['$scope',
        function                              ( $scope ) {
            var SelfieBudgetCtrl = this,
                campaign = $scope.campaign,
                validation = $scope.validation || {},
                schema = $scope.schema,
                pricing = schema.pricing,
                budgetMin = pricing.budget.__min,
                budgetMax = pricing.budget.__max,
                limitMinPercent = pricing.dailyLimit.__percentMin,
                basePrice = pricing.cost.__base,
                pricePerGeo = pricing.cost.__pricePerGeo,
                pricePerDemo = pricing.cost.__pricePerDemo,
                priceForInterests = pricing.cost.__priceForInterests;

            function getPrice(booleanArray, price) {
                return booleanArray.filter(function(bool) {
                    return !!bool;
                }).length * price;
            }

            this.budget = campaign.pricing.budget || null;
            this.limit = campaign.pricing.dailyLimit || null;
            this.limitMinPercent = limitMinPercent;
            this.budgetMin = budgetMin;
            this.budgetMax = budgetMax;

            validation.budget = !!this.budget;

            Object.defineProperties(this, {
                cpv: {
                    get: function() {
                        var hasInterests = campaign.targeting.interests.length,
                            hasStates = campaign.targeting.geo.states.length,
                            hasDmas = campaign.targeting.geo.dmas.length,
                            hasAge = campaign.targeting.demographics.age.length,
                            hasIncome = campaign.targeting.demographics.income.length,
                            hasGender = campaign.targeting.demographics.gender.length,
                            geoPrice = getPrice([hasStates, hasDmas], pricePerGeo),
                            demoPrice = getPrice([hasAge, hasIncome, hasGender], pricePerDemo),
                            interestsPrice = getPrice([hasInterests], priceForInterests);

                        return basePrice + geoPrice + demoPrice + interestsPrice;
                    }
                },
                validBudget: {
                    get: function() {
                        var budget = parseFloat(this.budget);

                        return !budget || !this.budgetError;
                    }
                },
                budgetError: {
                    get: function() {
                        var budget = parseFloat(this.budget),
                            validDecimal = !budget || (/^[0-9]+(\.[0-9]{1,2})?$/).test(budget);

                        if (budget < budgetMin) { return 1; }
                        if (budget > budgetMax) { return 2; }
                        if (!validDecimal) { return 3; }

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
                    'updateRequest': 'Update Request ID'
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
                'params\\.action.*', 'campaign\\.adtechName'
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
