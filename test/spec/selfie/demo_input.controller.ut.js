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
            spyOn(ctrl, 'checkVideoText');
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
            expect(ctrl._private.video).toBeNull();
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
                ctrl._private.video = {
                    data: { },
                    stats: { }
                };
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

            describe('when there is no video', function() {
                it('should return false', function() {
                    ctrl._private.video = null;
                    expect(ctrl.canContinue()).toBe(false);
                });
            });

            describe('when all is well', function() {
                it('should return true', function() {
                    expect(ctrl.canContinue()).toBe(true);
                });
            });
        });

        describe('fetchVideo', function() {
            var fetch;

            beforeEach(function() {
                spyOn($scope, '$apply');
                fetch = function(text) {
                    ctrl._private.fetchVideo();
                    mockDebounce.calls.mostRecent().args[0]([text]);
                    $scope.$digest();
                };
            });

            it('should be debounced', function() {
                expect(ctrl._private.fetchVideo).toBe(debounceFn);
                expect(mockDebounce).toHaveBeenCalledWith(jasmine.any(Function), 1000);
            });

            describe('getting video data', function() {
                it('should work', function() {
                    SelfieVideoService.dataFromText.and.returnValue($q.when('video data'));
                    SelfieVideoService.statsFromService.and.returnValue($q.when());
                    fetch('video url');
                    expect(SelfieVideoService.dataFromText).toHaveBeenCalledWith('video url');
                });

                it('should handle a failure', function() {
                    SelfieVideoService.dataFromText.and.returnValue($q.reject('epic fail'));
                    fetch('video url');
                    expect(ctrl.errors.videoText).toBe(true);
                });
            });

            describe('getting video stats', function() {
                it('should work and set the video data', function() {
                    var data = {
                        service: 'service',
                        id: 'id'
                    };
                    SelfieVideoService.dataFromText.and.returnValue($q.when(data));
                    SelfieVideoService.statsFromService.and.returnValue($q.when('video stats'));
                    fetch('video url');
                    expect(SelfieVideoService.statsFromService).toHaveBeenCalledWith('service', 'id');
                    expect(ctrl._private.video.data).toBe(data);
                    expect(ctrl._private.video.stats).toBe('video stats');
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
                    fetch('video url');
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
                    fetch('video url');
                    expect(ctrl.errors.videoText).toBe(true);
                });
            });
        });

        describe('checkVideoText', function() {
            beforeEach(function() {
                ctrl.checkVideoText.and.callThrough();
            });

            it('should set the video to null', function() {
                ctrl._private.video = 'video';
                ctrl.checkVideoText();
                expect(ctrl._private.video).toBeNull();
            });

            describe('if there is video text', function() {
                it('should fetch the video', function() {
                    ctrl.inputs.videoText = 'video text';
                    ctrl.checkVideoText();
                    expect(debounceFn).toHaveBeenCalledWith('video text');
                });
            });

            describe('if there is no video text', function() {
                it('should not fetch the video', function() {
                    ctrl.checkVideoText();
                    expect(debounceFn).not.toHaveBeenCalled();
                });

                it('should clear any video text errors', function() {
                    ctrl.errors.videoText = true;
                    ctrl.checkVideoText();
                    expect(ctrl.errors.videoText).toBe(false);
                });
            });
        });

        describe('updateModel', function() {
            beforeEach(function() {
                ctrl._private.updateModel.and.callThrough();
                ctrl.model = { card: { data: { } } };
            });

            it('should create a new card for the model', function() {
                var campaign = { cards: [ { links: { Action: { } } } ] };
                CampaignService.create.and.returnValue(campaign);
                ctrl._private.updateModel();
                expect(CampaignService.create).toHaveBeenCalledWith(null, { }, null);
                expect(ctrl.model.card).toBe(campaign.cards[0]);
            });

            it('should default title, note, and cta link', function() {
                ctrl._private.video = null;
                ctrl._private.updateModel();
                expect(ctrl.model.card.title).toBe('Your Title Here!');
                expect(ctrl.model.card.note).toBe('Your Description Here!');
                expect(ctrl.model.card.links.Action.uri).toBe('https://www.reelcontent.com');
            });

            it('should be able to set card properties from video data', function() {
                ctrl._private.video = {
                    data: {
                        service: 'service',
                        id: 'id',
                        data: {
                            foo: 'bar'
                        }
                    },
                    stats: null
                };
                ctrl._private.updateModel();
                var card = ctrl.model.card;
                expect(card.data.service).toBe('service');
                expect(card.data.videoid).toBe('id');
                expect(card.data.foo).toBe('bar');
            });

            it('should be able to set card properties from video stats', function() {
                ctrl._private.video = {
                    data: null,
                    stats: {
                        title: 'hello this is a title',
                        thumbnails: {
                            small: 'small.jpg',
                            large: 'large.jpg'
                        },
                        description: 'message in a bottle'
                    }
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
