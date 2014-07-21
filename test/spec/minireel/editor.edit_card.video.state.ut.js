(function() {
    'use strict';

    define(['app'], function(appModule) {
        describe('VideoState', function() {
            var $injector,
                c6State,
                MiniReelService,
                EditCardState,
                VideoState;

            beforeEach(function() {
                module(appModule.name);

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    c6State = $injector.get('c6State');
                    MiniReelService = $injector.get('MiniReelService');
                    VideoState = c6State.get('MR:EditCard.Video');
                    EditCardState = c6State.get('MR:EditCard');
                });
            });

            it('should exist', function() {
                expect(VideoState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                beforeEach(function() {
                    spyOn(MiniReelService, 'setCardType').and.callThrough();
                    EditCardState.cModel = {
                        type: 'video',
                        data: {}
                    };
                });

                ['video', 'videoBallot'].forEach(function(type) {
                    describe('if the card is of type ' + type, function() {
                        beforeEach(function() {
                            EditCardState.cModel.type = type;
                        });

                        it('should not change the type', function() {
                            expect(VideoState.model()).toBe(EditCardState.cModel);
                            expect(MiniReelService.setCardType).not.toHaveBeenCalled();
                        });
                    });
                });

                ['text', 'ad', 'links'].forEach(function(type) {
                    describe('if the card is of type ' + type, function() {
                        beforeEach(function() {
                            EditCardState.cModel.type = type;
                        });

                        it('should change the type to a video card', function() {
                            expect(VideoState.model()).toBe(EditCardState.cModel);
                            expect(MiniReelService.setCardType).toHaveBeenCalledWith(EditCardState.cModel, 'video');
                        });
                    });
                });
            });
        });
    });
}());
