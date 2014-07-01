(function() {
    'use strict';

    define(['app'], function() {
        describe('MR:EditCard.Ballot State', function() {
            var $injector,
                $rootScope,
                MiniReelService,
                c6State,
                EditCardState,
                BallotState;

            beforeEach(function() {
                module('c6.mrmaker');

                inject(function(_$injector_) {
                    $injector = _$injector_;

                    $rootScope = $injector.get('$rootScope');
                    MiniReelService = $injector.get('MiniReelService');
                    c6State = $injector.get('c6State');
                    EditCardState = c6State.get('MR:EditCard');
                    BallotState = c6State.get('MR:EditCard.Ballot');
                });

                EditCardState.cModel = {
                    data: {
                        ballot: []
                    }
                };
            });

            it('should exist', function() {
                expect(BallotState).toEqual(jasmine.any(Object));
            });

            describe('model()', function() {
                beforeEach(function() {
                    spyOn(MiniReelService, 'setCardType').and.callThrough();
                });

                it('should return a reference to the parent\'s ballot', function() {
                    expect(BallotState.model()).toBe(EditCardState.cModel.data.ballot);
                });

                it('should convert video cards to videoBallot cards', function() {
                    var adCard = {
                            type: 'ad',
                            data: {}
                        },
                        videoCard = {
                            type: 'video',
                            data: {}
                        };

                    EditCardState.cModel = adCard;
                    expect($injector.invoke(BallotState.model, BallotState)).toBeUndefined();

                    EditCardState.cModel = videoCard;
                    expect($injector.invoke(BallotState.model, BallotState)).toBe(videoCard.data.ballot);
                    expect(MiniReelService.setCardType).toHaveBeenCalledWith(videoCard, 'videoBallot');
                    expect(videoCard.data.ballot).toEqual(jasmine.any(Object));
                });
            });
        });
    });
}());
