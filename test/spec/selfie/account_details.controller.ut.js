define(['app'], function(appModule) {
    'use strict';

    describe('SelfieAccountDetailsController', function() {
        var $rootScope,
            $controller,
            c6State,
            cState,
            $scope,
            $q,
            SelfieAccountDetailsCtrl,
            cinema6;

        var user,
            userDeferred;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
            });

            user = cinema6.db.create('user', {
                firstName: '',
                lastName: '',
                company: '',
                email: '',
                password: ''
            });

            userDeferred = $q.defer();

            user._update = jasmine.createSpy('user._update').and.callFake(function(updatedUser) {
                return angular.extend(user, updatedUser);
            });
            user.save = jasmine.createSpy('user.save').and.returnValue(userDeferred.promise);


            cState = {
                cParent: {
                    cModel: user
                }
            };

            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieAccountDetailsCtrl = $controller('SelfieAccountDetailsController', {cState: cState});
            });
        });

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            c6State = null;
            cState = null;
            $scope = null;
            $q = null;
            SelfieAccountDetailsCtrl = null;
            cinema6 = null;
            user = null;
            userDeferred = null;
        });

        it('should exist', function() {
            expect(SelfieAccountDetailsCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('user', function() {
                it('should be a pojoified user', function() {
                    expect(SelfieAccountDetailsCtrl.user).toEqual(user.pojoify());
                });
            });

            describe('error', function() {
                it('should be null', function() {
                    expect(SelfieAccountDetailsCtrl.error).toBe(null);
                });
            });
        });

        describe('methods', function() {
            describe('save()', function() {
                var success, failure;

                beforeEach(function() {
                    spyOn(c6State, 'goTo');

                    SelfieAccountDetailsCtrl.user.firstName = 'Sammy';
                    SelfieAccountDetailsCtrl.user.lastName = 'Selfie';
                    SelfieAccountDetailsCtrl.user.company = 'Selfie, Inc';

                    SelfieAccountDetailsCtrl.save().then(success, failure);
                });

                it('should call _update() and then save() on the user', function() {
                    expect(user._update).toHaveBeenCalledWith(SelfieAccountDetailsCtrl.user);
                    expect(user.save).toHaveBeenCalled();
                    expect(user.firstName).toEqual(SelfieAccountDetailsCtrl.user.firstName);
                    expect(user.lastName).toEqual(SelfieAccountDetailsCtrl.user.lastName);
                    expect(user.company).toEqual(SelfieAccountDetailsCtrl.user.company);
                });

                describe('when save succeeds', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            userDeferred.resolve();
                        });
                    });

                    it('should not set an error message if successful', function() {
                        expect(SelfieAccountDetailsCtrl.error).toBe(null);
                    });

                    it('should go to overview state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('Selfie:Account');
                    });
                });

                describe('when save succeeds', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            userDeferred.reject();
                        });
                    });

                    it('should set a message if successful', function() {
                        expect(SelfieAccountDetailsCtrl.error).toBe('There was a problem saving your details');
                    });

                    it('should not go to overview state', function() {
                        expect(c6State.goTo).not.toHaveBeenCalled();
                    });
                });
            });
        });
    });
});
