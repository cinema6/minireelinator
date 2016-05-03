define( ['angular','c6_state'],
function( angular , c6State  ) {
    'use strict';

    var extend = angular.extend;

    return angular.module('c6.app.selfie.demo', [c6State.name])
        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Demo', ['SettingsService', 'CampaignService',
            function                             ( SettingsService ,  CampaignService ) {
                this.model = function() {
                    var campaign = CampaignService.create(null, { }, null);
                    var card = campaign.cards[0];
                    var model = { };

                    SettingsService.register('Selfie::demo', model, {
                        defaults: {
                            company: '',
                            email: '',
                            website: '',
                            card: card
                        }
                    });
                    return model;
                };
            }]);
        }])

        .config(['c6StateProvider',
        function( c6StateProvider ) {
            c6StateProvider.state('Selfie:Demo:Input', [function() {
                this.templateUrl = 'views/selfie/demo/input.html';
                this.controller = 'SelfieDemoInputController';
                this.controllerAs = 'SelfieDemoInputCtrl';

                this.model = function() {
                    return this.cParent.cModel;
                };
            }]);
        }])

        .controller('SelfieDemoInputController', ['c6Debounce', '$scope', 'SelfieVideoService',
                                                  'CampaignService', 'SettingsService', 'c6State',
                                                  '$location', '$window',
        function                                 ( c6Debounce ,  $scope ,  SelfieVideoService ,
                                                   CampaignService ,  SettingsService ,  c6State ,
                                                   $location ,  $window ) {
            var MAX_HEADLINE_LENGTH = 40;
            var MAX_DESCRIPTION_LENGTH = 400;
            var DEFAULT_TITLE = 'Your Title Here!';
            var DEFAULT_NOTE = 'Your Description Here!';
            var DEFAULT_LINK = 'https://www.reelcontent.com';

            var self = this;
            var _private = { };
            if (window.c6.kHasKarma) { self._private = _private; }

            // Allows query param 'email=false' to hide the email field
            self.showEmailField = ($location.search().email !== 'false');

            self.errors = {
                company: false,
                email: false,
                website: false,
                videoText: false
            };
            self.inputs = {
                company: '',
                email: '',
                website: '',
                videoText: ''
            };
            self.videoLoading = false;
            _private.video = null;

            _private.updateModel = function() {
                extend(self.model, {
                    company: self.inputs.company,
                    email: self.inputs.email,
                    website: self.inputs.website
                });

                // Create a card and add it to the model
                var campaign = CampaignService.create(null, { }, null);
                var card = campaign.cards[0];
                card.title = DEFAULT_TITLE;
                card.note = DEFAULT_NOTE;
                card.links.Action = {
                    uri: DEFAULT_LINK
                };
                if(_private.video && _private.video.data) {
                    var data = _private.video.data;
                    card.data.service = data.service;
                    card.data.videoid = data.id;
                    extend(card.data, data.data);
                }
                if(_private.video && _private.video.stats) {
                    var stats = _private.video.stats;
                    var title = (stats.title || '').slice(0, MAX_HEADLINE_LENGTH);
                    card.title = (title.length && title) || undefined;
                    var thumbs = (stats.thumbnails || { small: null, large: null });
                    card.data.thumbs = thumbs;
                    var note = (stats.description || '').slice(0, MAX_DESCRIPTION_LENGTH);
                    card.note = note;
                }
                self.model.card = card;
            };

            _private.fetchVideo = c6Debounce(function(args) {
                var text = args[0];

                self.videoLoading = true;
                return SelfieVideoService.dataFromText(text).then(function(data) {
                    return SelfieVideoService.statsFromService(data.service, data.id)
                    .then(function(stats) {
                        _private.video = {
                            data: data,
                            stats: stats
                        };
                        self.errors.videoText = false;
                        $scope.$apply();
                    });
                }).catch(function() {
                    self.errors.videoText = true;
                }).finally(function() {
                    self.videoLoading = false;
                });
            }, 1000);

            _private.getPreviewHref = function() {
                var base = '/#/demo/frame/preview';
                var params = $location.search();
                var keys = Object.keys(params);
                if(keys.length === 0) {
                    return base;
                } else {
                    return base + '?' + keys.map(function(key) {
                        return key + '=' + encodeURIComponent(params[key]);
                    }).join('&');
                }
            };

            _private.canContinue = function() {
                var hasError = Object.keys(self.errors).some(function(key) {
                    return self.errors[key];
                });
                var hasInputs = Object.keys(self.inputs).every(function(key) {
                    return self.inputs[key] || (key === 'email' && !self.showEmailField);
                });
                var hasVideo = !!_private.video;
                return !hasError && hasInputs && hasVideo;
            };

            _private.navigateTop = function(href) {
                $window.parent.location = href;
            };

            self.initWithModel = function(model) {
                var data = model.card.data;
                var text = SelfieVideoService.urlFromData(data.service, data.videoid, data);

                self.model = model;
                extend(self.inputs, {
                    company: model.company,
                    email: model.email,
                    website: model.website,
                    videoText: text
                });

                self.checkVideoText();
            };

            self.formatWebsite = function () {
                var website = self.inputs.website;

                if(website && !(/^http:\/\/|https:\/\//).test(website)) {
                    self.inputs.website = 'http://' + website;
                }
            };

            self.checkVideoText = function() {
                var text = self.inputs.videoText;

                _private.video = null;
                if(text) {
                    _private.fetchVideo(text);
                } else {
                    self.errors.videoText = false;
                }
            };

            self.gotoPreview = function() {
                self.errors.company = !self.inputs.company;
                self.errors.email = !self.inputs.email && self.showEmailField;
                self.errors.website = !self.inputs.website;
                self.errors.videoText = !_private.video;

                if(_private.canContinue()) {
                    _private.updateModel();
                    if(c6State.current.indexOf('Frame') === -1) {
                        c6State.goTo('Selfie:Demo:Preview:Full');
                    } else {
                        _private.navigateTop(_private.getPreviewHref());
                    }
                }
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider) {
            c6StateProvider.state('Selfie:Demo:Preview', ['SettingsService', 'c6State',
            function                                     ( SettingsService ,  c6State ) {
                this.templateUrl = 'views/selfie/demo/preview.html';
                this.controller = 'SelfieDemoPreviewController';
                this.controllerAs = 'SelfieDemoPreviewCtrl';

                this.beforeModel = function() {
                    SettingsService.register('MR::org', {
                        embedTypes: ['script'],
                        minireelDefaults: {
                            mode: 'light',
                            autoplay: true,
                            splash: {
                                ratio: '3-2',
                                theme: 'img-text-overlay'
                            }
                        },
                        embedDefaults: {
                            size: null
                        }
                    }).register('MR::user', {
                        minireelDefaults: {
                            splash: {
                                ratio: '3-2',
                                theme: 'img-text-overlay'
                            }
                        }
                    });
                };

                this.model = function() {
                    return this.cParent.cModel;
                };

                this.enter = function() {
                    var model = this.cParent.cModel;
                    if(!model.card || !model.card.data || !model.card.data.videoid) {
                        c6State.goTo('Selfie:Demo:Input:Full');
                    }
                };
            }]);
        }])

        .controller('SelfieDemoPreviewController', ['CollateralService','c6State','cState',
                                                    'SpinnerService','$location',
        function                                   ( CollateralService , c6State , cState ,
                                                     SpinnerService , $location ) {
            var MAX_HEADLINE_LENGTH = 40;
            var MAX_DESCRIPTION_LENGTH = 400;
            var CTA_OPTIONS = [
                'Apply Now',
                'Book Now',
                'Buy Now',
                'Contact Us',
                'Donate Now',
                'Learn More',
                'Shop Now',
                'Sign Up',
                'Watch More'
            ];
            var DEFAULT_LOGO = 'https://reelcontent.com/landing-page/images/logo-blank.png';
            var DEFAULT_FB_LINK = 'https://www.facebook.com/reelc';
            var DEFAULT_TW_LINK = 'https://twitter.com/ReelContent';
            var DEFAULT_YT_LINK = 'https://www.youtube.com/watch?v=KrcNeWIMjO0';
            var FIFTY_PROMOTION = 'pro-0gW6Qt03q32WqsC-';

            var self = this;
            var _private = { };
            if (window.c6.kHasKarma) { self._private = _private; }

            self.card = null;
            self.maxHeadlineLength = MAX_HEADLINE_LENGTH;
            self.maxDescriptionLength = MAX_DESCRIPTION_LENGTH;
            self.actionLabelOptions = CTA_OPTIONS;
            self.actionLabelOptions = CTA_OPTIONS;
            self.actionLink = '';
            self.hasFiftyPromotion = $location.search().promotion === FIFTY_PROMOTION;

            _private.generateLink = function(link) {
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

            _private.getWebsiteData = function(website) {
                return CollateralService.websiteData(website, {
                    publicEndpoint: true
                }).then(function(data) {
                    if(data.images.profile) {
                        self.card.collateral = {
                            logo: data.images.profile,
                            logoType: 'website'
                        };
                    }
                    Object.keys(data.links).forEach(function(key) {
                        var link = data.links[key];
                        var linkType = key[0].toUpperCase() + key.slice(1);
                        if(link) {
                            self.card.links[linkType] = {
                                uri: link
                            };
                        }
                    });
                }).catch(function() {
                    self.card.collateral = {
                        logo: DEFAULT_LOGO,
                        logoType: 'website'
                    };
                    self.card.links.Facebook = DEFAULT_FB_LINK;
                    self.card.links.Twitter = DEFAULT_TW_LINK;
                    self.card.links.YouTube = DEFAULT_YT_LINK;
                });
            };

            self.initWithModel = function(model) {
                SpinnerService.display();
                self.model = model;
                self.card = model.card;
                self.actionLink = model.website;
                self.updateActionLink();
                _private.getWebsiteData(model.website).finally(function() {
                    SpinnerService.close();
                });
            };

            self.updateActionLink = function() {
                var link = _private.generateLink(self.actionLink);
                self.card.links.Action = {
                    uri: link
                };
                self.actionLink = link;
            };

            self.signUp = function(device) {
                var state = (device === 'mobile') ?
                    'Selfie:SignUp:Form' :
                    cState.cName + ':SignUp';

                c6State.goTo(state);
            };
        }]);
});
