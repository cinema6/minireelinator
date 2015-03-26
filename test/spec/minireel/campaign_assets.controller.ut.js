define(['app'], function(appModule) {
    'use strict';

    describe('CampaignAssetsController', function() {
        var $rootScope,
            $controller,
            cinema6,
            $scope,
            CampaignCtrl,
            CampaignAssetsCtrl;

        var campaign;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                cinema6 = $injector.get('cinema6');

                campaign = cinema6.db.create('campaign', {
                    logos: {},
                    links: {},
                    brand: 'Diageo'
                });

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    $scope.CampaignCtrl = CampaignCtrl = $controller('CampaignController', {
                        $scope: $scope
                    });
                    CampaignCtrl.initWithModel(campaign);

                    $scope.CampaignAssetsCtrl = CampaignAssetsCtrl = $controller('CampaignAssetsController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(CampaignAssetsCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('newLink', function() {
                it('should be a blank link object', function() {
                    expect(CampaignAssetsCtrl.newLink).toEqual(jasmine.objectContaining({
                        name: 'Untitled',
                        href: null
                    }));
                });
            });
        });

        describe('methods', function() {
            describe('push()', function() {
                var link;

                beforeEach(function() {
                    link = CampaignAssetsCtrl.newLink;

                    link.name = 'MyAwesomeSite';
                    link.href = 'http://www.awesome.co';

                    spyOn(CampaignCtrl, 'addLink').and.callThrough();

                    CampaignAssetsCtrl.push();
                });

                it('should add the link', function() {
                    expect(CampaignCtrl.addLink).toHaveBeenCalledWith(link);
                });

                it('should reset the newLink', function() {
                    expect(CampaignAssetsCtrl.newLink).not.toBe(link);
                    expect(CampaignAssetsCtrl.newLink).toEqual(jasmine.objectContaining({
                        name: 'Untitled',
                        href: null
                    }));
                });
            });
        });

        describe('events', function() {
            describe('$scope:$destroy', function() {
                beforeEach(function() {
                    spyOn(CampaignCtrl, 'updateLinks');

                    $scope.$emit('$destroy');
                });

                it('should update the links', function() {
                    expect(CampaignCtrl.updateLinks).toHaveBeenCalled();
                });
            });
        });
    });
});
