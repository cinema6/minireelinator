(function() {
    'use strict';

    define(['editor'], function() {
        describe('NewCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                VideoService,
                computer,
                c6State,
                MiniReelService,
                NewCardCtrl;

            var model;

            beforeEach(function() {
                model = null;

                module('c6.ui', function($provide) {
                    $provide.decorator('c6Computed', function($delegate) {
                        return jasmine.createSpy('c6Computed()')
                            .and.callFake(function() {
                                computer = $delegate.apply($delegate, arguments);
                                return computer;
                            });
                    });
                });

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    VideoService = $injector.get('VideoService');
                    c6State = $injector.get('c6State');
                    MiniReelService = $injector.get('MiniReelService');

                    spyOn(VideoService, 'createVideoUrl').and.callThrough();
                    c6State.get('MR:Editor').cModel = { id: 'e-fcfb709c23e0fd' };

                    $scope = $rootScope.$new();
                    NewCardCtrl = $controller('NewCardController', { $scope: $scope, cModel: model });
                    NewCardCtrl.model = model;
                });
            });

            it('should exist', function() {
                expect(NewCardCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('type', function() {
                    it('should be initialized as "videoBallot"', function() {
                        expect(NewCardCtrl.type).toBe('videoBallot');
                    });
                });
            });

            describe('methods', function() {
                describe('edit()', function() {
                    var card;

                    beforeEach(function() {
                        card = {
                            id: 'rc-39635762f9ab06'
                        };

                        NewCardCtrl.type = 'blah';
                        spyOn(c6State, 'goTo');
                        spyOn(MiniReelService, 'createCard')
                            .and.returnValue(card);

                        NewCardCtrl.edit();
                    });

                    it('should create a card of the current type', function() {
                        expect(MiniReelService.createCard).toHaveBeenCalledWith(NewCardCtrl.type);
                    });

                    it('should transition to the edit card state', function() {
                        expect(c6State.goTo).toHaveBeenCalledWith('MR:EditCard', [card]);
                    });
                });
            });
        });
    });
}());
