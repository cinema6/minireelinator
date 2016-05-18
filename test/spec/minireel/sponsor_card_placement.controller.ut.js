define(['app'], function(appModule) {
    'use strict';

    describe('SponsorCardPlacementController', function() {
        var $rootScope,
            $controller,
            $q,
            cinema6,
            scopePromise,
            ScopedPromise,
            $scope,
            PortalCtrl,
            SponsorCardPlacementCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');
                scopePromise = $injector.get('scopePromise');

                ScopedPromise = scopePromise($q.defer().promise).constructor;

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    PortalCtrl = $scope.PortalCtrl = $controller('PortalController', {
                        $scope: $scope
                    });
                    PortalCtrl.model = {
                        org: {
                            id: 'o-af832d9d946478'
                        }
                    };

                    SponsorCardPlacementCtrl = $controller('SponsorCardPlacementController', {
                        $scope: $scope
                    });
                });
            });
        });

        afterAll(function() {
            $rootScope = null;
            $controller = null;
            $q = null;
            cinema6 = null;
            scopePromise = null;
            ScopedPromise = null;
            $scope = null;
            PortalCtrl = null;
            SponsorCardPlacementCtrl = null;
        });

        it('should exist', function() {
            expect(SponsorCardPlacementCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('result', function() {
                it('should be null', function() {
                    expect(SponsorCardPlacementCtrl.result).toBeNull();
                });
            });

            describe('query', function() {
                it('should be an empty string', function() {
                    expect(SponsorCardPlacementCtrl.query).toBe('');
                });
            });
        });

        describe('methods', function() {
            describe('search()', function() {
                var findAllDeferred,
                    result;

                beforeEach(function() {
                    findAllDeferred = $q.defer();

                    spyOn(cinema6.db, 'findAll').and.returnValue(findAllDeferred.promise);

                    SponsorCardPlacementCtrl.query = 'Foo Bar';

                    $scope.$apply(function() {
                        result = SponsorCardPlacementCtrl.search();
                    });
                });

                it('should query for experiences', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('experience', {
                        org: PortalCtrl.model.org.id,
                        text: SponsorCardPlacementCtrl.query
                    });
                });

                it('should return the query\'s promise', function() {
                    expect(result).toBe(findAllDeferred.promise);
                });

                it('should set the result to a scoped promise for the request', function() {
                    expect(SponsorCardPlacementCtrl.result).toEqual(jasmine.any(ScopedPromise));
                    expect(SponsorCardPlacementCtrl.result.promise).toBe(findAllDeferred.promise);
                });
            });

            describe('isUnsponsored(minireel)', function() {
                var minireel;

                beforeEach(function() {
                    minireel = {
                        data: {
                            sponsored: false
                        }
                    };
                });

                describe('if the minireel is sponsored', function() {
                    beforeEach(function() {
                        minireel.data.sponsored = true;
                    });

                    it('should be false', function() {
                        expect(SponsorCardPlacementCtrl.isUnsponsored(minireel)).toBe(false);
                    });
                });

                describe('if the minireel is not sponsored', function() {
                    beforeEach(function() {
                        minireel.data.sponsored = false;
                    });

                    it('should be true', function() {
                        expect(SponsorCardPlacementCtrl.isUnsponsored(minireel)).toBe(true);
                    });
                });
            });
        });
    });
});
