define(['app'], function(appModule) {
    'use strict';

    describe('SelfieDemoInputController', function() {
        var ctrl, $scope, mockDebounce, debounceFn, SelfieVideoService, $q, CampaignService, SettingsService, c6State;

        beforeEach(function() {
            module(appModule.name);
            debounceFn = jasmine.createSpy('debounceFn()');
            mockDebounce = jasmine.createSpy('c6Debounce()').and.returnValue(debounceFn);
            module(function($provide) {
                $provide.value('c6Debounce', mockDebounce);
            });
            var $controller, $rootScope;
            inject(function($injector) {
                $controller = $injector.get('$controller');
                $rootScope = $injector.get('$rootScope');
                SelfieVideoService = $injector.get('SelfieVideoService');
                $q = $injector.get('$q');
                CampaignService = $injector.get('CampaignService');
                SettingsService = $injector.get('SettingsService');
                c6State = $injector.get('c6State');
            });
            $scope = $rootScope.$new();
            spyOn(SelfieVideoService, 'dataFromText');
            spyOn(SelfieVideoService, 'statsFromService');
            spyOn(SelfieVideoService, 'urlFromData');
            spyOn(CampaignService, 'create').and.callThrough();
            spyOn(SettingsService, 'register');
            spyOn(c6State, 'goTo');
            ctrl = $controller('SelfieDemoInputController', {
                $scope: $scope
            });
            spyOn(ctrl._private, 'updateModel');
            spyOn(ctrl, 'checkWebsite');
        });

        it('should exist', function() {
            expect(ctrl).toBeDefined();
        });

        it('should initialize properties', function() {
            expect(ctrl.videoText).toBe('');
            expect(ctrl.website).toBe('');
            expect(ctrl.company).toBe('');
            expect(ctrl.email).toBe('');
            expect(ctrl.videoError).toBe(false);
            expect(ctrl.validWebsite).toBe(false);
            expect(ctrl.validVideoText).toBe(false);
            expect(ctrl._private.videoData).toBeNull();
            expect(ctrl._private.videoStats).toBeNull();
        });

        describe('initWithModel', function() {
            var model;

            beforeEach(function() {
                model = {
                    company: 'company',
                    website: 'website',
                    card: {
                        data: {
                            service: 'service',
                            videoid: 'videoid'
                        }
                    }
                };
            });

            it('should set the model', function() {
                ctrl.initWithModel(model);
                expect(ctrl.model).toBe(model);
            });

            it('should set the company', function() {
                ctrl.initWithModel(model);
                expect(ctrl.company).toBe('company');
            });

            it('should set the website and validate it', function() {
                ctrl.initWithModel(model);
                expect(ctrl.website).toBe('website');
                expect(ctrl.checkWebsite).toHaveBeenCalledWith();
            });

            it('should set the video text and validate it', function() {
                SelfieVideoService.urlFromData.and.returnValue('video url');
                ctrl.initWithModel(model);
                expect(SelfieVideoService.urlFromData).toHaveBeenCalledWith('service', 'videoid', model.card.data);
                expect(ctrl.videoText).toBe('video url');
                expect(ctrl.checkVideoText).toHaveBeenCalledWith();
            });
        });

        describe('canContinue', function() {
            it('should be true if there are valid inputs', function() {
                ctrl.validWebsite = true;
                ctrl.validVideoText = true;
                expect(ctrl.canContinue()).toBe(true);
            });

            it('should be false if any input is invalid', function() {
                ctrl.validWebsite = true;
                ctrl.validVideoText = false;
                expect(ctrl.canContinue()).toBe(false);
                ctrl.validWebsite = false;
                ctrl.validVideoText = true;
                expect(ctrl.canContinue()).toBe(false);
            });
        });

        describe('checkVideoText', function() {
            var check;

            beforeEach(function() {
                check = function() {
                    ctrl.checkVideoText();
                    mockDebounce.calls.mostRecent().args[0]();
                    $scope.$digest();
                };
            });

            it('should be debounced', function() {
                expect(ctrl.checkVideoText).toBe(debounceFn);
                expect(mockDebounce).toHaveBeenCalledWith(jasmine.any(Function), 1000);
            });

            describe('if the provided text is falsy', function() {
                it('should reset the video error', function() {
                    ['', null, undefined].forEach(function(text) {
                        ctrl.videoError = true;
                        ctrl.videoText = text;
                        check();
                        expect(ctrl.videoError).toBe(false);
                    });
                });

                it('should indicate that this is not valid video text', function() {
                    ['', null, undefined].forEach(function(text) {
                        ctrl.validVideoText = true;
                        ctrl.videoText = text;
                        check();
                        expect(ctrl.validVideoText).toBe(false);
                    });
                });
            });

            describe('getting video data', function() {
                it('should work and be able to modify the card', function() {
                    SelfieVideoService.dataFromText.and.returnValue($q.when('video data'));
                    ctrl.videoText = 'video url';
                    check();
                    expect(SelfieVideoService.dataFromText).toHaveBeenCalledWith('video url');
                    expect(ctrl._private.videoData).toBe('video data');
                });

                it('should handle a failure', function() {
                    SelfieVideoService.dataFromText.and.returnValue($q.reject('epic fail'));
                    ctrl.videoText = 'video url';
                    check();
                    expect(ctrl.videoError).toBe(true);
                    expect(ctrl.validVideoText).toBe(false);
                });
            });

            describe('getting video stats', function() {
                it('should work and set the videoData', function() {
                    SelfieVideoService.dataFromText.and.returnValue($q.when({
                        service: 'service',
                        id: 'id'
                    }));
                    SelfieVideoService.statsFromService.and.returnValue('video stats');
                    ctrl.videoText = 'video url';
                    check();
                    expect(SelfieVideoService.statsFromService).toHaveBeenCalledWith('service', 'id');
                    expect(ctrl._private.videoStats).toBe('video stats');
                });

                it('should reset the video error if it succeeds', function() {
                    SelfieVideoService.dataFromText.and.returnValue($q.when({
                        service: 'service',
                        id: 'id',
                        data: {
                            foo: 'bar'
                        }
                    }));
                    SelfieVideoService.statsFromService.and.returnValue($q.when({
                        title: 'hello this is a title'
                    }));
                    ctrl.videoError = true;
                    ctrl.videoText = 'video url';
                    check();
                    expect(ctrl.videoError).toBe(false);
                });

                it('should be able to indicate valid video text', function() {
                    SelfieVideoService.dataFromText.and.returnValue($q.when({
                        service: 'service',
                        id: 'id'
                    }));
                    SelfieVideoService.statsFromService.and.returnValue('video stats');
                    ctrl.videoText = 'video url';
                    check();
                    expect(ctrl.validVideoText).toBe(true);
                });

                it('should handle a failure', function() {
                    SelfieVideoService.dataFromText.and.returnValue($q.when({
                        service: 'service',
                        id: 'id',
                        data: {
                            foo: 'bar'
                        }
                    }));
                    SelfieVideoService.statsFromService.and.returnValue($q.reject('epic fail'));
                    ctrl.videoText = 'video url';
                    check();
                    expect(ctrl.videoError).toBe(true);
                    expect(ctrl.validVideoText).toBe(false);
                });
            });
        });

        describe('updateModel', function() {
            beforeEach(function() {
                ctrl._private.updateModel.and.callThrough();
                ctrl.model = { card: { data: { } } };
            });

            it('should create a new card for the model', function() {
                var campaign = {
                    cards: [{
                        links: {
                            Action: {

                            }
                        }
                    }]
                };
                CampaignService.create.and.returnValue(campaign);
                ctrl._private.updateModel();
                expect(CampaignService.create).toHaveBeenCalledWith(null, { }, null);
                expect(ctrl.model.card).toBe(campaign.cards[0]);
            });

            it('should default title and cta link', function() {
                ctrl._private.updateModel();
                expect(ctrl.model.card.title).toBe('Your Title Here!');
                expect(ctrl.model.card.links.Action.uri).toBe('https://www.reelcontent.com');
            });

            it('should be able to set card properties from video data', function() {
                ctrl._private.videoData = {
                    service: 'service',
                    id: 'id',
                    data: {
                        foo: 'bar'
                    }
                };
                ctrl._private.updateModel();
                var card = ctrl.model.card;
                expect(card.data.service).toBe('service');
                expect(card.data.videoid).toBe('id');
                expect(card.data.foo).toBe('bar');
            });

            it('should be able to set card properties from video stats', function() {
                ctrl._private.videoStats = {
                    title: 'hello this is a title',
                    thumbnails: {
                        small: 'small.jpg',
                        large: 'large.jpg'
                    },
                    description: 'message in a bottle'
                };
                ctrl._private.updateModel();
                var card = ctrl.model.card;
                expect(card.title).toBe('hello this is a title');
                expect(card.data.thumbs).toEqual({
                    small: 'small.jpg',
                    large: 'large.jpg'
                });
                expect(card.note).toBe('message in a bottle');
            });

            it('should update the company', function() {
                ctrl.company = 'company';
                ctrl._private.updateModel();
                expect(ctrl.model.company).toBe('company');
            });

            it('should update the website', function() {
                ctrl.website = 'website';
                ctrl._private.updateModel();
                expect(ctrl.model.website).toBe('website');
            });

            it('should update the email', function() {
                ctrl.email = 'email';
                ctrl._private.updateModel();
                expect(ctrl.model.email).toBe('email');
            });
        });

        describe('gotoPreview', function() {
            describe('if the page is in an iframe', function() {
                beforeEach(function() {
                    $scope.currentState = 'Selfie:Demo:Input:Frame';
                });

                it('should direct the parent page to the correct preview state', function() {
                    ctrl.gotoPreview();
                    expect(c6State.goTo).not.toHaveBeenCalled();
                });

                it('should update the model', function() {
                    ctrl.model = 'the model';
                    ctrl.gotoPreview();
                    expect(ctrl._private.updateModel).toHaveBeenCalledWith();
                });
            });

            describe('if the page is not in an iframe', function() {
                beforeEach(function() {
                    $scope.currentState = 'Selfie:Demo:Input:Full';
                });

                it('should navigate to the correct preview state', function() {
                    ctrl.gotoPreview();
                    expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Demo:Preview:Full');
                });

                it('should update the model', function() {
                    ctrl.model = 'the model';
                    ctrl.gotoPreview();
                    expect(ctrl._private.updateModel).toHaveBeenCalledWith();
                });
            });
        });

        describe('formatWebsite', function() {
            describe('if the website is falsy', function() {
                beforeEach(function() {
                    ctrl.website = null;
                });

                it('should not modify the webiste', function() {
                    ctrl.formatWebsite();
                    expect(ctrl.website).toBeNull();
                });
            });

            describe('if the website if truthy', function() {
                it('should add a protocol if it is missing one', function() {
                    ctrl.website = 'google.com';
                    ctrl.formatWebsite();
                    expect(ctrl.website).toBe('http://google.com');
                });

                it('should not a protocol if it has one', function() {
                    ctrl.website = 'https://google.com';
                    ctrl.formatWebsite();
                    expect(ctrl.website).toBe('https://google.com');
                });
            });
        });

        describe('checkWebsite', function() {
            beforeEach(function() {
                ctrl.checkWebsite.and.callThrough();
            });

            it('should be able to determine if a website is invalid', function() {
                ctrl.website = 'website';
                ctrl.validWebsite = false;
                ctrl.checkWebsite();
                expect(ctrl.validWebsite).toBe(true);
            });

            it('should be able to determine if a website is invalid', function() {
                ctrl.website = null;
                ctrl.validWebsite = true;
                ctrl.checkWebsite();
                expect(ctrl.validWebsite).toBe(false);
            });
        });
    });
});
