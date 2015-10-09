define(['app'], function(appModule) {
    'use strict';

    describe('SelfieAccountDetailsController', function() {
        var $rootScope,
            $controller,
            c6State,
            cState,
            $scope,
            SelfieAccountDetailsCtrl;

        var user;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');
            });

            user = {
                firstName: '',
                lastName: '',
                company: '',
                email: '',
                password: '',
                save: jasmine.createSpy('user.save()')
            };

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

        it('should exist', function() {
            expect(SelfieAccountDetailsCtrl).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('save()', function() {
                it('should call save() on the user', function() {
                    SelfieAccountDetailsCtrl.save();

                    expect(user.save).toHaveBeenCalled();
                });
            });
        });
    });
});