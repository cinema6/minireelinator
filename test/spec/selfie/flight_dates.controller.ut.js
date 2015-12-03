define(['app'], function(appModule) {
    'use strict';

    function pad(num) {
        var norm = Math.abs(Math.floor(num));
        return (norm < 10 ? '0' : '') + norm;
    }

    describe('SelfieFlightDatesController', function() {
        var $rootScope,
            $scope,
            $controller,
            SelfieFlightDatesCtrl;

        var campaign,
            originalCampaign,
            card,
            laterDate,
            evenLaterDate,
            earlierDate,
            today,
            now;

        function compileCtrl() {
            $scope = $rootScope.$new();
            $scope.SelfieCampaignCtrl = {
                originalCampaign: originalCampaign,
                campaign: campaign,
                card: campaign.cards[0]
            };

            $scope.$apply(function() {
                SelfieFlightDatesCtrl = $controller('SelfieFlightDatesController', {
                    $scope: $scope
                });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');

                card = {
                    campaign: {}
                };

                campaign = {
                    cards: [card]
                };

                originalCampaign = angular.copy(campaign);
            });

            compileCtrl();

            now = new Date();
            today = pad(now.getMonth() + 1) + '/' + pad(now.getDate()) + '/' + now.getFullYear();
            earlierDate = pad(now.getMonth() + 1) + '/' + pad(now.getDate()) + '/' + (now.getFullYear() - 1);
            laterDate = pad(now.getMonth() + 1) + '/' + pad(now.getDate()) + '/' + (now.getFullYear() + 1);
            evenLaterDate = pad(now.getMonth() + 1) + '/' + pad(now.getDate()) + '/' + (now.getFullYear() + 2);
        });

        it('should exist', function() {
            expect(SelfieFlightDatesCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('validStartDate', function() {
                describe('when no start date is set', function() {
                    it('should be true', function() {
                        SelfieFlightDatesCtrl.startDate = undefined;

                        expect(SelfieFlightDatesCtrl.validStartDate).toBe(true);
                    });
                });

                describe('when start date is not editable', function() {
                    it('should be true', function() {
                        SelfieFlightDatesCtrl.startDate = earlierDate;
                        expect(SelfieFlightDatesCtrl.validStartDate).toBe(false);

                        campaign.status = 'active';
                        card.campaign.startDate = earlierDate;
                        expect(SelfieFlightDatesCtrl.validStartDate).toBe(true);
                    });
                });

                describe('when start date is before now', function() {
                    it('should be false if editable', function() {
                        SelfieFlightDatesCtrl.startDate = earlierDate;
                        expect(SelfieFlightDatesCtrl.validStartDate).toBe(false);
                    });

                    it('should be true if not editable', function() {
                        SelfieFlightDatesCtrl.startDate = earlierDate;
                        expect(SelfieFlightDatesCtrl.validStartDate).toBe(false);

                        campaign.status = 'active';
                        card.campaign.startDate = earlierDate;
                        expect(SelfieFlightDatesCtrl.validStartDate).toBe(true);
                    });
                });

                describe('when start date is after now', function() {
                    it('should be true if before end date', function() {
                        SelfieFlightDatesCtrl.startDate = laterDate;
                        SelfieFlightDatesCtrl.endDate = evenLaterDate;
                        expect(SelfieFlightDatesCtrl.validStartDate).toBe(true);
                    });

                    it('should be false if after end date', function() {
                        SelfieFlightDatesCtrl.startDate = laterDate;
                        SelfieFlightDatesCtrl.endDate = earlierDate;
                        expect(SelfieFlightDatesCtrl.validStartDate).toBe(false);
                    });
                });

                describe('when start date is today', function() {
                    it('should be true', function() {
                        SelfieFlightDatesCtrl.startDate = today;
                        expect(SelfieFlightDatesCtrl.validStartDate).toBe(true);
                    });
                });

                describe('when start date and end date are today', function() {
                    it('should be true', function() {
                        SelfieFlightDatesCtrl.startDate = today;
                        SelfieFlightDatesCtrl.endDate = today;
                        expect(SelfieFlightDatesCtrl.validStartDate).toBe(true);
                    });
                });
            });

            describe('validEndDate', function() {
                describe('when no end date is set', function() {
                    it('should be true', function() {
                        SelfieFlightDatesCtrl.endDate = undefined;

                        expect(SelfieFlightDatesCtrl.validEndDate).toBe(true);
                    });
                });

                describe('when end date is later than now', function() {
                    describe('when no start date is set', function() {
                        it('should be true', function() {
                            SelfieFlightDatesCtrl.endDate = laterDate;

                            expect(SelfieFlightDatesCtrl.validEndDate).toBe(true);
                        });
                    });

                    describe('when start date is set', function() {
                        describe('when start date is after end date', function() {
                            it('should be false', function() {
                                SelfieFlightDatesCtrl.startDate = evenLaterDate;
                                SelfieFlightDatesCtrl.endDate = laterDate;

                                expect(SelfieFlightDatesCtrl.validEndDate).toBe(false);
                            });
                        });

                        describe('when start date is before end date', function() {
                            it('should be true', function() {
                                SelfieFlightDatesCtrl.startDate = laterDate;
                                SelfieFlightDatesCtrl.endDate = evenLaterDate;

                                expect(SelfieFlightDatesCtrl.validEndDate).toBe(true);
                            });
                        });
                    });
                });
            });

            describe('editableStartDate', function() {
                describe('when campaign has no status', function() {
                    describe('when no start date is set', function() {
                        it('should be true', function() {
                            campaign.status = undefined;
                            campaign.cards[0].campaign.startDate = undefined;

                            expect(SelfieFlightDatesCtrl.editableStartDate).toBe(true);
                        });
                    });

                    describe('when start date is later than now', function() {
                        it('should be true', function() {
                            campaign.status = undefined;
                            campaign.cards[0].campaign.startDate = laterDate;

                            expect(SelfieFlightDatesCtrl.editableStartDate).toBe(true);
                        });
                    });
                });

                describe('when campaign status === "draft"', function() {
                    describe('when no start date is set', function() {
                        it('should be true', function() {
                            campaign.status = 'draft';
                            campaign.cards[0].campaign.startDate = undefined;

                            expect(SelfieFlightDatesCtrl.editableStartDate).toBe(true);
                        });
                    });

                    describe('when start date is later than now', function() {
                        it('should be true', function() {
                            campaign.status = 'draft';
                            campaign.cards[0].campaign.startDate = laterDate;

                            expect(SelfieFlightDatesCtrl.editableStartDate).toBe(true);
                        });
                    });
                });

                describe('when original campaign status === "pending"', function() {
                    describe('when no start date is set', function() {
                        it('should be true', function() {
                            campaign.status = 'active';
                            originalCampaign.status = 'pending';
                            campaign.cards[0].campaign.startDate = undefined;

                            expect(SelfieFlightDatesCtrl.editableStartDate).toBe(true);
                        });
                    });

                    describe('when start date is later than now', function() {
                        it('should be true', function() {
                            campaign.status = 'active';
                            originalCampaign.status = 'pending';
                            campaign.cards[0].campaign.startDate = laterDate;

                            expect(SelfieFlightDatesCtrl.editableStartDate).toBe(true);
                        });
                    });
                });

                describe('when campaign status is not draft, pending or undefined', function() {
                    describe('when no start date is set', function() {
                        it('should be true', function() {
                            campaign.status = 'paused';
                            campaign.cards[0].campaign.startDate = undefined;

                            expect(SelfieFlightDatesCtrl.editableStartDate).toBe(true);
                        });
                    });

                    describe('when start date is later than now', function() {
                        it('should be true', function() {
                            campaign.status = 'paused';
                            campaign.cards[0].campaign.startDate = laterDate;

                            expect(SelfieFlightDatesCtrl.editableStartDate).toBe(true);
                        });
                    });

                    describe('when start date is earlier than now', function() {
                        it('should be false', function() {
                            campaign.status = 'paused';
                            campaign.cards[0].campaign.startDate = earlierDate;

                            expect(SelfieFlightDatesCtrl.editableStartDate).toBe(false);
                        });
                    });
                });
            });

            describe('startDate', function() {
                it('should come from the card or be undefined', function() {
                    expect(SelfieFlightDatesCtrl.startDate).toBe(undefined);

                    card.campaign.startDate = '2016-06-26T04:59:00.000Z';

                    compileCtrl();

                    expect(SelfieFlightDatesCtrl.startDate).toEqual('06/26/2016');
                });
            });

            describe('endDate', function() {
                it('should come from the card or be undefined', function() {
                    expect(SelfieFlightDatesCtrl.endDate).toBe(undefined);

                    card.campaign.endDate = '2016-06-26T04:59:00.000Z';

                    compileCtrl();

                    expect(SelfieFlightDatesCtrl.endDate).toEqual('06/26/2016');
                });
            });

            describe('canShowError', function() {
                it('should be false if campaign is pending and user has not entered and then left the start date picker', function() {
                    expect(SelfieFlightDatesCtrl.canShowError).toBe(true);

                    originalCampaign.status = 'pending';

                    expect(SelfieFlightDatesCtrl.canShowError).toBe(false);

                    SelfieFlightDatesCtrl.startDateBlur = true;

                    expect(SelfieFlightDatesCtrl.canShowError).toBe(true);
                });
            });
        });

        describe('methods', function() {
            describe('setDates()', function() {
                describe('when start date is not set', function() {
                    it('should remove the start date on the card', function() {
                        SelfieFlightDatesCtrl.startDate = undefined;

                        SelfieFlightDatesCtrl.setDates();

                        expect(card.campaign.startDate).toBe(undefined);

                        card.campaign.startDate = '2016-06-26T04:59:00.000Z';

                        SelfieFlightDatesCtrl.setDates();

                        expect(card.campaign.startDate).toEqual(undefined);
                    });
                });

                describe('when start date is set', function() {
                    describe('when start date is valid', function() {
                        it('should set the date on the card', function() {
                            SelfieFlightDatesCtrl.startDate = laterDate;

                            expect(card.campaign.startDate).toBe(undefined);

                            SelfieFlightDatesCtrl.setDates();

                            expect(card.campaign.startDate).toEqual(jasmine.any(String));
                        });
                    });

                    describe('when start date is not valid', function() {
                        it('should not set the date on the card', function() {
                            SelfieFlightDatesCtrl.startDate = earlierDate;

                            expect(card.campaign.startDate).toBe(undefined);

                            SelfieFlightDatesCtrl.setDates();

                            expect(card.campaign.startDate).toBe(undefined);
                        });
                    });
                });

                describe('when end date is not set', function() {
                    it('should remove any end date on the card', function() {
                        SelfieFlightDatesCtrl.endDate = undefined;

                        SelfieFlightDatesCtrl.setDates();

                        expect(card.campaign.endDate).toBe(undefined);

                        card.campaign.endDate = '2016-06-26T04:59:00.000Z';

                        SelfieFlightDatesCtrl.setDates();

                        expect(card.campaign.endDate).toEqual(undefined);
                    });
                });

                describe('when end date is set', function() {
                    describe('when end date is valid', function() {
                        it('should set the date on the card', function() {
                            SelfieFlightDatesCtrl.endDate = laterDate;

                            expect(card.campaign.endDate).toBe(undefined);

                            SelfieFlightDatesCtrl.setDates();

                            expect(card.campaign.endDate).toEqual(jasmine.any(String));
                        });
                    });

                    describe('when end date is not valid', function() {
                        it('should not set the date on the card', function() {
                            SelfieFlightDatesCtrl.endDate = earlierDate;

                            expect(card.campaign.endDate).toBe(undefined);

                            SelfieFlightDatesCtrl.setDates();

                            expect(card.campaign.endDate).toBe(undefined);
                        });
                    });
                });
            });
        });
    });
});