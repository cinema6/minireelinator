define(['app'], function(appModule) {
    'use strict';

    describe('SponsorCardSurveyController', function() {
        var $rootScope,
            $controller,
            c6State,
            MiniReelService,
            $scope,
            SponsorCardCtrl,
            SponsorCardSurveyCtrl;

        var card;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                c6State = $injector.get('c6State');
                MiniReelService = $injector.get('MiniReelService');

                card = MiniReelService.createCard('video');
                card.sponsored = true;

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    SponsorCardCtrl = $scope.SponsorCardCtrl = $controller('SponsorCardController', {
                        $scope: $scope,
                        cState: c6State.get('MR:SponsorCard')
                    });
                    SponsorCardCtrl.initWithModel(card);

                    SponsorCardSurveyCtrl = $controller('SponsorCardSurveyController', {
                        $scope: $scope
                    });
                });
            });
        });

        it('should exist', function() {
            expect(SponsorCardSurveyCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('hasSurvey', function() {
                describe('getting', function() {
                    describe('if the card has a survey', function() {
                        beforeEach(function() {
                            card.data.survey = {
                                election: null,
                                prompt: null,
                                choices: []
                            };
                        });

                        it('should be true', function() {
                            expect(SponsorCardSurveyCtrl.hasSurvey).toBe(true);
                        });
                    });

                    describe('if the card has no survey', function() {
                        beforeEach(function() {
                            card.data.survey = null;
                        });

                        it('should be false', function() {
                            expect(SponsorCardSurveyCtrl.hasSurvey).toBe(false);
                        });
                    });
                });

                describe('setting', function() {
                    describe('to false', function() {
                        beforeEach(function() {
                            card.data.survey = {
                                election: null,
                                prompt: null,
                                choices: []
                            };

                            SponsorCardSurveyCtrl.hasSurvey = false;
                        });

                        it('should make the survey null', function() {
                            expect(card.data.survey).toBeNull();
                        });
                    });

                    describe('to true', function() {
                        beforeEach(function() {
                            card.data.survey = null;

                            SponsorCardSurveyCtrl.hasSurvey = true;
                        });

                        it('should create survey data', function() {
                            expect(card.data.survey).toEqual({
                                election: null,
                                prompt: null,
                                choices: []
                            });
                        });
                    });
                });
            });
        });
    });
});
