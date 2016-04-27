define(['app'], function(appModule) {
    'use strict';

    describe('SelfieDemoInputController', function() {
        var ctrl, $controller, $scope, mockDebounce, debounceFn, SelfieVideoService, $q, CampaignService, SettingsService, c6State, $location;

        beforeEach(function() {
            module(appModule.name);
            debounceFn = jasmine.createSpy('debounceFn()');
            mockDebounce = jasmine.createSpy('c6Debounce()').and.returnValue(debounceFn);
            module(function($provide) {
                $provide.value('c6Debounce', mockDebounce);
            });
            var $rootScope;
            inject(function($injector) {
                $controller = $injector.get('$controller');
                $rootScope = $injector.get('$rootScope');
                SelfieVideoService = $injector.get('SelfieVideoService');
                $q = $injector.get('$q');
                CampaignService = $injector.get('CampaignService');
                SettingsService = $injector.get('SettingsService');
                c6State = $injector.get('c6State');
                $location = $injector.get('$location');
            });
            $scope = $rootScope.$new();
            spyOn(SelfieVideoService, 'dataFromText');
            spyOn(SelfieVideoService, 'statsFromService');
            spyOn(SelfieVideoService, 'urlFromData');
            spyOn(CampaignService, 'create').and.callThrough();
            spyOn(SettingsService, 'register');
            spyOn(c6State, 'goTo');
            spyOn($location, 'search').and.returnValue({ });
            ctrl = $controller('SelfieDemoInputController', {
                $scope: $scope
            });
            spyOn(ctrl._private, 'updateModel');
        });

        it('should exist', function() {
            expect(ctrl).toBeDefined();
        });

        it('should initialize properties', function() {
            expect(ctrl.errors).toEqual({
                company: false,
                email: false,
                website: false,
                videoText: false
            });
            expect(ctrl.inputs).toEqual({
                company: '',
                email: '',
                website: '',
                videoText: ''
            });
            expect(ctrl.showEmailField).toBe(true);
            expect(ctrl._private.videoData).toBeNull();
            expect(ctrl._private.videoStats).toBeNull();
        });

        describe('initializing the email field', function() {
            it('should be hidden if the email query param is false', function() {
                $location.search.and.returnValue({ email: 'false' });
                ctrl = $controller('SelfieDemoInputController', {
                    $scope: $scope
                });
                expect(ctrl.showEmailField).toBe(false);
            });

            it('should be shown if the email query param is not false', function() {
                ['true', 'null', 'random'].forEach(function(param) {
                    $location.search.and.returnValue({ email: param });
                    ctrl = $controller('SelfieDemoInputController', {
                        $scope: $scope
                    });
                    expect(ctrl.showEmailField).toBe(true);
                });
            });

            it('should show the email field by default', function() {
                expect(ctrl.showEmailField).toBe(true);
            });
        });

        describe('initWithModel', function() {
            var model;

            beforeEach(function() {
                model = {
                    company: 'company',
                    email: 'email',
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

            it('should set the inputs from the model', function() {
                SelfieVideoService.urlFromData.and.returnValue('video url');
                ctrl.initWithModel(model);
                expect(SelfieVideoService.urlFromData).toHaveBeenCalledWith('service', 'videoid', model.card.data);
                expect(ctrl.inputs).toEqual({
                    company: 'company',
                    email: 'email',
                    website: 'website',
                    videoText: 'video url'
                });
            });

            it('should check the video text', function() {
                ctrl.initWithModel(model);
                expect(ctrl.checkVideoText).toHaveBeenCalledWith();
            });
        });

        describe('canContinue', function() {
            beforeEach(function() {
                ctrl.errors = {
                    company: false,
                    email: false,
                    website: false,
                    videoText: false
                };
                ctrl.inputs = {
                    company: 'value',
                    email: 'value',
                    website: 'value',
                    videoText: 'value'
                };
                ctrl._private.videoData = { };
                ctrl._private.videoStats = { };
            });

            describe('when there are missing inputs', function() {
                it('should return false', function() {
                    Object.keys(ctrl.inputs).forEach(function(key) {
                        ctrl.inputs[key] = '';
                        expect(ctrl.canContinue()).toBe(false);
                        ctrl.inputs[key] = 'value';
                    });
                });
            });

            describe('when there are some errors', function() {
                it('should return false', function() {
                    Object.keys(ctrl.errors).forEach(function(key) {
                        ctrl.errors[key] = true;
                        expect(ctrl.canContinue()).toBe(false);
                        ctrl.errors[key] = false;
                    });
                });
            });

            describe('when something is missing from the video data', function() {
                it('should return false', function() {
                    ctrl._private.videoData = { };
                    ctrl._private.videoStats = null;
                    expect(ctrl.canContinue()).toBe(false);
                    ctrl._private.videoData = null;
                    ctrl._private.videoStats = { };
                    expect(ctrl.canContinue()).toBe(false);
                });
            });

            describe('when all is well', function() {
                it('should return true', function() {
                    expect(ctrl.canContinue()).toBe(true);
                });
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

            describe('getting video data', function() {
                it('should work and be able to modify the card', function() {
                    SelfieVideoService.dataFromText.and.returnValue($q.when('video data'));
                    ctrl.inputs.videoText = 'video url';
                    check();
                    expect(SelfieVideoService.dataFromText).toHaveBeenCalledWith('video url');
                    expect(ctrl._private.videoData).toBe('video data');
                });

                it('should handle a failure', function() {
                    SelfieVideoService.dataFromText.and.returnValue($q.reject('epic fail'));
                    ctrl.inputs.videoText = 'video url';
                    check();
                    expect(ctrl.errors.videoText).toBe(true);
                });
            });

            describe('getting video stats', function() {
                it('should work and set the videoData', function() {
                    SelfieVideoService.dataFromText.and.returnValue($q.when({
                        service: 'service',
                        id: 'id'
                    }));
                    SelfieVideoService.statsFromService.and.returnValue('video stats');
                    ctrl.inputs.videoText = 'video url';
                    check();
                    expect(SelfieVideoService.statsFromService).toHaveBeenCalledWith('service', 'id');
                    expect(ctrl._private.videoStats).toBe('video stats');
                });

                it('should reset the video text error if it succeeds', function() {
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
                    ctrl.errors.videoText = true;
                    ctrl.inputs.videoText = 'video url';
                    check();
                    expect(ctrl.errors.videoText).toBe(false);
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
                    ctrl.inputs.videoText = 'video url';
                    check();
                    expect(ctrl.errors.videoText).toBe(true);
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

            it('should default title, note, and cta link', function() {
                ctrl._private.updateModel();
                expect(ctrl.model.card.title).toBe('Your Title Here!');
                expect(ctrl.model.card.note).toBe('Your Description Here!');
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
                ctrl.inputs.company = 'company';
                ctrl._private.updateModel();
                expect(ctrl.model.company).toBe('company');
            });

            it('should update the website', function() {
                ctrl.inputs.website = 'website';
                ctrl._private.updateModel();
                expect(ctrl.model.website).toBe('website');
            });

            it('should update the email', function() {
                ctrl.inputs.email = 'email';
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
                    ctrl.inputs.website = null;
                });

                it('should not modify the webiste', function() {
                    ctrl.formatWebsite();
                    expect(ctrl.inputs.website).toBeNull();
                });
            });

            describe('if the website if truthy', function() {
                it('should add a protocol if it is missing one', function() {
                    ctrl.inputs.website = 'google.com';
                    ctrl.formatWebsite();
                    expect(ctrl.inputs.website).toBe('http://google.com');
                });

                it('should not a protocol if it has one', function() {
                    ctrl.inputs.website = 'https://google.com';
                    ctrl.formatWebsite();
                    expect(ctrl.inputs.website).toBe('https://google.com');
                });
            });
        });

        describe('getPreviewHref', function() {
            it('should work if there are no query params', function() {
                $location.search.and.returnValue({ });
                expect(ctrl.getPreviewHref()).toBe('/#/demo/frame/preview');
            });

            it('should work if there is one query param', function() {
                $location.search.and.returnValue({
                    foo: 'bar'
                });
                expect(ctrl.getPreviewHref()).toBe('/#/demo/frame/preview?foo=bar');
            });

            it('should work if there are multiple query params', function() {
                $location.search.and.returnValue({
                    foo: 'bar',
                    money: '$$$'
                });
                expect(ctrl.getPreviewHref()).toBe('/#/demo/frame/preview?foo=bar&money=%24%24%24');
            });
        });
    });
});