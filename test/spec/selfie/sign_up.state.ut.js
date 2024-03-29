define(['app'], function(appModule) {
    'use strict';

    ['Selfie:SignUp:Full','Selfie:SignUp:Form','Selfie:Demo:Preview:Full:SignUp','Selfie:Demo:Preview:Frame:SignUp'].forEach(function(stateName) {
        describe('Selfie:SignUp State', function() {
            var c6State,
                $rootScope,
                $q,
                $location,
                SettingsService,
                signUp;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    c6State = $injector.get('c6State');
                    $q = $injector.get('$q');
                    $location = $injector.get('$location');
                    SettingsService = $injector.get('SettingsService');

                    spyOn($location, 'search').and.returnValue({});
                    spyOn(SettingsService, 'register');
                    spyOn(SettingsService, 'getReadOnly').and.returnValue({});
                });

                signUp = c6State.get(stateName);
            });

            it('should exist', function() {
                expect(signUp).toEqual(jasmine.any(Object));
            });

            afterAll(function() {
                c6State = null;
                $rootScope = null;
                $q = null;
                $location = null;
                SettingsService = null;
                signUp = null;
            });

            describe('beforeModel()', function() {
                describe('when there is a ref=code query param', function() {
                    it('should register the code with the SettingsService', function() {
                        $location.search.and.returnValue({ ref: 'testcode' });

                        signUp.beforeModel();

                        expect(SettingsService.register).toHaveBeenCalledWith('Selfie::referral', { referral: 'testcode' }, {
                            localSync: 'testcode',
                            validateLocal: jasmine.any(Function)
                        });
                    });
                });

                describe('when there is no ref=code query param', function() {
                    it('should register the code with the SettingsService', function() {
                        $location.search.and.returnValue({});

                        signUp.beforeModel();

                        expect(SettingsService.register).toHaveBeenCalledWith('Selfie::referral', { referral: undefined }, {
                            localSync: true,
                            validateLocal: jasmine.any(Function)
                        });
                    });
                });

                describe('when there is a promotion=code query param', function() {
                    it('should register the code with the SettingsService', function() {
                        $location.search.and.returnValue({ promotion: 'promotest' });

                        signUp.beforeModel();

                        expect(SettingsService.register).toHaveBeenCalledWith('Selfie::promotion', { promotion: 'promotest' }, {
                            localSync: 'promotest',
                            validateLocal: jasmine.any(Function)
                        });
                    });
                });

                describe('when there is no promotion=code query param', function() {
                    it('should register the code with the SettingsService', function() {
                        $location.search.and.returnValue({});

                        signUp.beforeModel();

                        expect(SettingsService.register).toHaveBeenCalledWith('Selfie::promotion', { promotion: undefined }, {
                            localSync: true,
                            validateLocal: jasmine.any(Function)
                        });
                    });
                });

                describe('when there is a fullAccess=true query param', function() {
                    it('should add it to the state', function() {
                        $location.search.and.returnValue({ fullAccess: true });

                        signUp.beforeModel();

                        expect(signUp.fullAccess).toBe(true);
                    });
                });

                describe('when there is no fullAccess=true query param', function() {
                    it('should be undefined on the state', function() {
                        $location.search.and.returnValue({});

                        signUp.beforeModel();

                        expect(signUp.fullAccess).toBe(undefined);
                    });
                });
            });

            describe('model()', function() {
                describe('there is a referral code', function() {
                    it('should add it to the model', function() {
                        SettingsService.getReadOnly.and.returnValue({ referral: 'testcode', promotion: 'promotest' });

                        var result = signUp.model();

                        expect(result).toEqual({
                            email: '',
                            password: '',
                            company: '',
                            firstName: '',
                            lastName: '',
                            referralCode: 'testcode',
                            promotion: 'promotest'
                        });
                    });
                });

                describe('there is not a referral code', function() {
                    it('should leave the referralCode undefined', function() {
                        SettingsService.getReadOnly.and.returnValue({});

                        var result = signUp.model();

                        expect(result).toEqual({
                            email: '',
                            password: '',
                            company: '',
                            firstName: '',
                            lastName: '',
                            referralCode: undefined,
                            promotion: undefined
                        });
                    });
                });
            });
        });
    });
});
