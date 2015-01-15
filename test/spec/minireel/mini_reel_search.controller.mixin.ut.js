define(['minireel/mixins/MiniReelSearchController', 'app'], function(MiniReelSearchController, appModule) {
    'use strict';

    describe('MiniReelSearchController mixin', function() {
        var $rootScope,
            $controller,
            $q,
            cinema6,
            ScopedPromise,
            $scope,
            PortalCtrl,
            MiniReelSearchCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                cinema6 = $injector.get('cinema6');

                ScopedPromise = $injector.get('scopePromise')($q.defer().promise).constructor;

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    $scope.PortalCtrl = PortalCtrl = $controller('PortalController', {
                        $scope: $scope
                    });
                    PortalCtrl.model = {
                        org: {
                            id: 'o-af832d9d946478'
                        }
                    };

                    MiniReelSearchCtrl = $injector.instantiate(MiniReelSearchController, {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(MiniReelSearchCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('result', function() {
                it('should be null', function() {
                    expect(MiniReelSearchCtrl.result).toBeNull();
                });
            });

            describe('query', function() {
                it('should be an empty string', function() {
                    expect(MiniReelSearchCtrl.query).toBe('');
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

                    MiniReelSearchCtrl.query = 'Foo Bar';

                    $scope.$apply(function() {
                        result = MiniReelSearchCtrl.search();
                    });
                });

                it('should query for experiences', function() {
                    expect(cinema6.db.findAll).toHaveBeenCalledWith('experience', {
                        org: PortalCtrl.model.org.id,
                        text: MiniReelSearchCtrl.query
                    });
                });

                it('should return the query\'s promise', function() {
                    expect(result).toBe(findAllDeferred.promise);
                });

                it('should set the result to a scoped promise for the request', function() {
                    expect(MiniReelSearchCtrl.result).toEqual(jasmine.any(ScopedPromise));
                    expect(MiniReelSearchCtrl.result.promise).toBe(findAllDeferred.promise);
                });
            });
        });
    });
});
