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
                    card.title = 'Your Title Here!';
                    card.links.Action = {
                        uri: 'https://www.reelcontent.com'
                    };

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
        function                                 ( c6Debounce ,  $scope ,  SelfieVideoService ,
                                                   CampaignService ,  SettingsService ,  c6State ) {
            var MAX_HEADLINE_LENGTH = 40;
            var MAX_DESCRIPTION_LENGTH = 400;

            var self = this;
            var _private = { };
            if (window.c6.kHasKarma) { self._private = _private; }

            self.videoText = '';
            self.company = '';
            self.email = '';
            self.website = '';
            self.videoError = false;
            self.validWebsite = false;
            self.validVideoText = false;
            _private.videoData = null;
            _private.videoStats = null;

            _private.updateModel = function() {
                self.model.company = self.company;
                self.model.email = self.email;
                self.model.website = self.website;

                var campaign = CampaignService.create(null, { }, null);
                var card = campaign.cards[0];
                card.title = 'Your Title Here!';
                card.links.Action = {
                    uri: 'https://www.reelcontent.com'
                };
                if(_private.videoData) {
                    card.data.service = _private.videoData.service;
                    card.data.videoid = _private.videoData.id;
                    extend(card.data, _private.videoData.data);
                }
                if(_private.videoStats) {
                    var title = (_private.videoStats.title || '').slice(0, MAX_HEADLINE_LENGTH);
                    card.title = (title.length && title) || undefined;
                    var thumbs = (_private.videoStats.thumbnails || { small: null, large: null });
                    card.data.thumbs = thumbs;
                    var note = (_private.videoStats.description || '')
                        .slice(0, MAX_DESCRIPTION_LENGTH);
                    card.note = note;
                }
                self.model.card = card;
            };

            self.initWithModel = function(model) {
                var data = model.card.data;

                self.model = model;
                self.company = model.company;
                self.website = model.website;
                self.videoText = SelfieVideoService.urlFromData(data.service, data.videoid, data);
                self.checkWebsite();
                self.checkVideoText();
            };

            self.canContinue = function() {
                return self.validWebsite && self.validVideoText;
            };

            self.checkWebsite = function() {
                self.validWebsite = (!!self.website);
            };

            self.formatWebsite = function () {
                if (!self.website) { return; }

                if (!(/^http:\/\/|https:\/\//).test(self.website)) {
                    self.website = 'http://' + self.website;
                }
            };

            self.checkVideoText = c6Debounce(function() {
                var text = self.videoText;

                if(!text) {
                    self.videoError = false;
                    self.validVideoText = false;
                    return;
                }

                return SelfieVideoService.dataFromText(text).then(function(data) {
                    _private.videoData = data;
                    return SelfieVideoService.statsFromService(data.service, data.id);
                }).then(function(data) {
                    _private.videoStats = data;
                    self.videoError = false;
                    self.validVideoText = true;
                }).catch(function() {
                    _private.videoData = null;
                    _private.videoStats = null;
                    self.videoError = true;
                    self.validVideoText = false;
                });
            }, 1000);

            self.gotoPreview = function() {
                _private.updateModel();
                if($scope.currentState.indexOf('Frame') === -1) {
                    c6State.goTo('Selfie:Demo:Preview:Full');
                }
            };
        }])

        .config(['c6StateProvider',
        function( c6StateProvider) {
            c6StateProvider.state('Selfie:Demo:Preview', ['SettingsService',
            function                                     ( SettingsService ) {
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
            }]);
        }])

        .controller('SelfieDemoPreviewController', ['CollateralService',
        function                                   ( CollateralService ) {
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

            var self = this;
            var _private = { };
            if (window.c6.kHasKarma) { self._private = _private; }

            self.card = null;
            self.maxHeadlineLength = MAX_HEADLINE_LENGTH;
            self.maxDescriptionLength = MAX_DESCRIPTION_LENGTH;
            self.actionLabelOptions = CTA_OPTIONS;
            self.actionLabelOptions = CTA_OPTIONS;
            self.actionLink = '';

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
                return CollateralService.websiteData(website).then(function(data) {
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
                });
            };

            self.initWithModel = function(model) {
                self.model = model;
                self.card = model.card;
                self.actionLink = model.website;
                self.updateActionLink();
                _private.getWebsiteData(model.website);
            };

            self.updateActionLink = function() {
                var link = _private.generateLink(self.actionLink);
                self.card.links.Action.uri = link;
                self.actionLink = link;
            };
        }]);
});
