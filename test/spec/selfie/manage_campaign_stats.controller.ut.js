define(['app'], function(appModule) {
    'use strict';

    describe('SelfieManageCampaignStatsController', function() {
        var $rootScope,
            $scope,
            $controller,
            $q,
            CampaignService,
            SelfieManageCampaignStatsCtrl,
            cState;

        function pad(num) {
            var norm = Math.abs(Math.floor(num));
            return (norm < 10 ? '0' : '') + norm;
        }

        function formatDateForView(date) {
            return pad(date.getMonth()+1) + '/' +
                pad(date.getDate()) + '/' +
                pad(date.getFullYear());
        }

        function formatDateForQuery(date) {
            return pad(date.getFullYear()) + '-' +
                pad(date.getMonth()+1) + '-' +
                pad(date.getDate());
        }

        function compileCtrl() {
            $scope = $rootScope.$new();
            $scope.$apply(function() {
                SelfieManageCampaignStatsCtrl = $controller('SelfieManageCampaignStatsController', {
                    $scope: $scope,
                    cState: cState
                });
            });
        }

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                CampaignService = $injector.get('CampaignService');
            });

            cState = {
                cParent: {
                    campaign: {
                        id: 'cam-123',
                        statusHistory: [
                            {
                                status: 'active',
                                userId: 'u-a78b667f18fdac',
                                user: 'evan@reelcontent.com',
                                date: '2016-01-19T15:40:51.888Z'
                            },
                            {
                                status: 'paused',
                                userId: 'u-53321fcb4e0af6',
                                user: 'nkarp@cinema6.com',
                                date: '2015-11-21T17:26:23.969Z'
                            },
                            {
                                status: 'active',
                                userId: 'u-c8b79e3821e693',
                                user: 'howard@cinema6.com',
                                date: '2015-11-05T20:52:13.205Z'
                            },
                            {
                                status: 'pending',
                                userId: 'u-a44f206f353c24',
                                user: 'howard@reelcontent.com',
                                date: '2015-11-05T20:51:13.458Z'
                            },
                            {
                                status: 'draft',
                                userId: 'u-a44f206f353c24',
                                user: 'howard@reelcontent.com',
                                date: '2015-11-05T20:46:14.641Z'
                            }
                        ]
                    }
                }
            };

            compileCtrl();
        });

        it('should exist', function() {
            expect(SelfieManageCampaignStatsCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('stats', function() {
                it('should be the range or the summary or an empty object', function() {
                    var range = {}, summary = {};

                    expect(SelfieManageCampaignStatsCtrl.stats).toEqual({});
                    expect(SelfieManageCampaignStatsCtrl.stats).not.toBe(range);
                    expect(SelfieManageCampaignStatsCtrl.stats).not.toBe(summary);

                    SelfieManageCampaignStatsCtrl._stats[0] = { summary: summary };

                    expect(SelfieManageCampaignStatsCtrl.stats).toBe(summary);

                    SelfieManageCampaignStatsCtrl._stats[0] = { summary: summary, range: range };

                    expect(SelfieManageCampaignStatsCtrl.stats).toBe(range);
                });
            });

            describe('max', function() {
                it('should be the end of the custom date range or 0', function() {
                    expect(SelfieManageCampaignStatsCtrl.max).toBe(0);

                    SelfieManageCampaignStatsCtrl.customRange.dates.end = '11/02/2016';

                    expect(SelfieManageCampaignStatsCtrl.max).toBe('11/02/2016');
                });
            });

            describe('selectedRange', function() {
                it('should be the range option that is selected or default to custom range', function() {
                    spyOn(CampaignService, 'getAnalytics').and.returnValue($q.defer().promise);

                    SelfieManageCampaignStatsCtrl.getStats(SelfieManageCampaignStatsCtrl.rangeOptions[2]);

                    expect(SelfieManageCampaignStatsCtrl.selectedRange).toBe(SelfieManageCampaignStatsCtrl.rangeOptions[2]);

                    SelfieManageCampaignStatsCtrl.rangeOptions[2].selected = false;

                    expect(SelfieManageCampaignStatsCtrl.selectedRange).toBe(SelfieManageCampaignStatsCtrl.customRange);

                    SelfieManageCampaignStatsCtrl.rangeOptions[1].selected = true;

                    expect(SelfieManageCampaignStatsCtrl.selectedRange).toBe(SelfieManageCampaignStatsCtrl.rangeOptions[1]);
                });
            });

            describe('totalInteractions', function() {
                describe('when campaign has no stats', function() {
                    it('should be 0', function() {
                        expect(SelfieManageCampaignStatsCtrl.totalInteractions).toBe(0);
                    });
                });

                describe('when campaign has link stats', function() {
                    describe('when there is a range', function() {
                        it('should add them up based on the range', function() {
                            SelfieManageCampaignStatsCtrl._stats[0] = {
                                summary: {
                                    linkClicks: {
                                        action: 1,
                                        youtube: 2,
                                        facebook: 3,
                                        twitter: 4
                                    }
                                },
                                range: {
                                    linkClicks: {
                                        action: 5,
                                        youtube: 6,
                                        facebook: 7,
                                        twitter: 8
                                    }
                                }
                            };

                            expect(SelfieManageCampaignStatsCtrl.totalInteractions).toBe(5 + 6 + 7 + 8);
                        });
                    });

                    describe('when there is no range', function() {
                        it('should add them up based on the summary', function() {
                            SelfieManageCampaignStatsCtrl._stats[0] = {
                                summary: {
                                    linkClicks: {
                                        action: 1,
                                        youtube: 2,
                                        facebook: 3,
                                        twitter: 4
                                    }
                                }
                            };

                            expect(SelfieManageCampaignStatsCtrl.totalInteractions).toBe(1 + 2 + 3 + 4);
                        });
                    });
                });

                describe('when campaign has share stats', function() {
                    describe('when there is a date range', function() {
                        it('should add them up based on range', function() {
                            SelfieManageCampaignStatsCtrl._stats[0] = {
                                summary: {
                                    shareClicks: {
                                        facebook: 1,
                                        twitter: 2,
                                        pinterest: 3
                                    }
                                },
                                range: {
                                    shareClicks: {
                                        facebook: 5,
                                        twitter: 6,
                                        pinterest: 7
                                    }
                                }
                            };

                            expect(SelfieManageCampaignStatsCtrl.totalInteractions).toBe(5 + 6 + 7);
                        });
                    });

                    describe('when there is no date range', function() {
                        it('should add them up based on summary', function() {
                            SelfieManageCampaignStatsCtrl._stats[0] = {
                                summary: {
                                    shareClicks: {
                                        facebook: 1,
                                        twitter: 2,
                                        pinterest: 3
                                    }
                                }
                            };

                            expect(SelfieManageCampaignStatsCtrl.totalInteractions).toBe(1 + 2 + 3);
                        });
                    });
                });

                describe('when campaignn has share and link stats', function() {
                    describe('when there is a date range', function() {
                        it('should add them up based on range', function() {
                            SelfieManageCampaignStatsCtrl._stats[0] = {
                                summary: {
                                    linkClicks: {
                                        action: 1,
                                        youtube: 2,
                                        facebook: 3,
                                        twitter: 4
                                    },
                                    shareClicks: {
                                        facebook: 1,
                                        twitter: 2,
                                        pinterest: 3
                                    }
                                },
                                range: {
                                    linkClicks: {
                                        action: 5,
                                        youtube: 6,
                                        facebook: 7,
                                        twitter: 8
                                    },
                                    shareClicks: {
                                        facebook: 9,
                                        twitter: 10,
                                        pinterest: 11
                                    }
                                }
                            };

                            expect(SelfieManageCampaignStatsCtrl.totalInteractions).toBe(5 + 6 + 7 + 8 + 9 + 10 + 11);
                        });
                    });

                    describe('when there is no date range', function() {
                        it('should add them up based on summary', function() {
                            SelfieManageCampaignStatsCtrl._stats[0] = {
                                summary: {
                                    linkClicks: {
                                        action: 1,
                                        youtube: 2,
                                        facebook: 3,
                                        twitter: 4
                                    },
                                    shareClicks: {
                                        facebook: 1,
                                        twitter: 2,
                                        pinterest: 3
                                    }
                                }
                            };

                            expect(SelfieManageCampaignStatsCtrl.totalInteractions).toBe(1 + 2 + 3 + 4 + 1 + 2 + 3);
                        });
                    });
                });
            });

            describe('totalSocialClicks', function() {
                describe('when campaign has no stats', function() {
                    it('should be 0', function() {
                        expect(SelfieManageCampaignStatsCtrl.totalSocialClicks).toBe(0);
                    });
                });

                describe('when campaign has link stats', function() {
                    describe('when there is a date range', function() {
                        it('should be the sum of everything except Call to Action and Website', function() {
                            SelfieManageCampaignStatsCtrl._stats[0] = {
                                summary: {
                                    linkClicks: {
                                        action: 1,
                                        youtube: 2,
                                        facebook: 3,
                                        twitter: 4,
                                        website: 5
                                    }
                                },
                                range: {
                                    linkClicks: {
                                        action: 10,
                                        youtube: 11,
                                        facebook: 12,
                                        twitter: 13,
                                        website: 14
                                    }
                                }
                            };

                            expect(SelfieManageCampaignStatsCtrl.totalSocialClicks).toBe(11 + 12 + 13);
                        });
                    });

                    describe('when there is no date range', function() {
                        it('should be the sum of everything except Call to Action and Website', function() {
                            SelfieManageCampaignStatsCtrl._stats[0] = {
                                summary: {
                                    linkClicks: {
                                        action: 1,
                                        youtube: 2,
                                        facebook: 3,
                                        twitter: 4,
                                        website: 5
                                    }
                                }
                            };

                            expect(SelfieManageCampaignStatsCtrl.totalSocialClicks).toBe(2 + 3 + 4);
                        });
                    });
                });
            });

            describe('totalWebsiteInteractions', function() {
                describe('when campaign has no stats', function() {
                    it('should be 0', function() {
                        expect(SelfieManageCampaignStatsCtrl.totalWebsiteInteractions).toBe(0);
                    });
                });

                describe('when campaign has link stats', function() {
                    describe('when there is a date range', function() {
                        it('should be the sum of only Call to Action and Website clicks', function() {
                            SelfieManageCampaignStatsCtrl._stats[0] = {
                                summary: {
                                    linkClicks: {
                                        action: 1,
                                        youtube: 2,
                                        facebook: 3,
                                        twitter: 4,
                                        website: 5
                                    }
                                },
                                range: {
                                    linkClicks: {
                                        action: 10,
                                        youtube: 11,
                                        facebook: 12,
                                        twitter: 13,
                                        website: 14
                                    }
                                }
                            };

                            expect(SelfieManageCampaignStatsCtrl.totalWebsiteInteractions).toBe(10 + 14);
                        });
                    });

                    describe('when there is no date range', function() {
                        it('should be the sum of only Call to Action and Website clicks', function() {
                            SelfieManageCampaignStatsCtrl._stats[0] = {
                                summary: {
                                    linkClicks: {
                                        action: 1,
                                        youtube: 2,
                                        facebook: 3,
                                        twitter: 4,
                                        website: 5
                                    }
                                }
                            };

                            expect(SelfieManageCampaignStatsCtrl.totalWebsiteInteractions).toBe(1 + 5);
                        });
                    });
                });
            });

            describe('totalShares', function() {
                describe('when campaign has no stats', function() {
                    it('should be 0', function() {
                        expect(SelfieManageCampaignStatsCtrl.totalShares).toBe(0);
                    });
                });

                describe('when campaign has share stats', function() {
                    describe('when there is a date range', function() {
                        it('should add them up based on range', function() {
                            SelfieManageCampaignStatsCtrl._stats[0] = {
                                summary: {
                                    shareClicks: {
                                        facebook: 1,
                                        twitter: 2,
                                        pinterest: 3
                                    }
                                },
                                range: {
                                    shareClicks: {
                                        facebook: 5,
                                        twitter: 6,
                                        pinterest: 7
                                    }
                                }
                            };

                            expect(SelfieManageCampaignStatsCtrl.totalShares).toBe(5 + 6 + 7);
                        });
                    });

                    describe('when there is no date range', function() {
                        it('should add them up based on summary', function() {
                            SelfieManageCampaignStatsCtrl._stats[0] = {
                                summary: {
                                    shareClicks: {
                                        facebook: 1,
                                        twitter: 2,
                                        pinterest: 3
                                    }
                                }
                            };

                            expect(SelfieManageCampaignStatsCtrl.totalShares).toBe(1 + 2 + 3);
                        });
                    });
                });
            });

            describe('rangeOptions', function() {
                var today, yesterday, oneWeek, oneMonth;

                beforeEach(function() {
                    today = new Date();
                    yesterday = new Date();
                    oneWeek = new Date();
                    oneMonth = new Date();

                    yesterday.setDate(today.getDate() - 1);
                    oneWeek.setDate(today.getDate() - 7);
                    oneMonth.setDate(today.getDate() - 30);
                });

                it('should be an array of objects', function() {
                    expect(SelfieManageCampaignStatsCtrl.rangeOptions).toEqual(jasmine.any(Array));
                    SelfieManageCampaignStatsCtrl.rangeOptions.forEach(function(option) {
                        expect(option).toEqual(jasmine.any(Object));
                    });
                });

                describe('Lifetime', function() {
                    it('should not have a start or end date', function() {
                        var start = new Date(cState.cParent.campaign.statusHistory[2].date);

                        expect(SelfieManageCampaignStatsCtrl.rangeOptions[0]).toEqual({
                            label: 'Lifetime',
                            selected: true,
                            dates: {
                                start: null,
                                end: null
                            }
                        });
                    });
                });

                describe('Yesterday', function() {
                    it('should have a start date of yesterday and end date of yesterday', function() {
                        expect(SelfieManageCampaignStatsCtrl.rangeOptions[1]).toEqual({
                            label: 'Yesterday',
                            selected: false,
                            dates: {
                                start: formatDateForView(yesterday),
                                end: formatDateForView(yesterday)
                            }
                        });
                    });
                });

                describe('Last 7 Days', function() {
                    it('should have a start date of 7 days ago and end date of today', function() {
                        expect(SelfieManageCampaignStatsCtrl.rangeOptions[2]).toEqual({
                            label: 'Last 7 Days',
                            selected: false,
                            dates: {
                                start: formatDateForView(oneWeek),
                                end: formatDateForView(today)
                            }
                        });
                    });
                });

                describe('Last 30 Days', function() {
                    it('should have a start date of 30 days ago and end date of today', function() {
                        expect(SelfieManageCampaignStatsCtrl.rangeOptions[3]).toEqual({
                            label: 'Last 30 Days',
                            selected: false,
                            dates: {
                                start: formatDateForView(oneMonth),
                                end: formatDateForView(today)
                            }
                        });
                    });
                });
            });

            describe('customRange', function() {
                it('should be an object with some defaults', function() {
                    expect(SelfieManageCampaignStatsCtrl.customRange).toEqual({
                        label: 'Custom',
                        selected: false,
                        dates: {
                            start: null,
                            end: null
                        }
                    });
                });
            });
        });

        describe('methods', function() {
            describe('getStats(option)', function() {
                var statsDeferred, today, yesterday, oneWeek, oneMonth, stats;

                beforeEach(function() {
                    today = new Date();
                    yesterday = new Date();
                    oneWeek = new Date();
                    oneMonth = new Date();

                    yesterday.setDate(today.getDate() - 1);
                    oneWeek.setDate(today.getDate() - 7);
                    oneMonth.setDate(today.getDate() - 30);

                    stats = [];
                    statsDeferred = $q.defer();
                    spyOn(CampaignService, 'getAnalytics').and.returnValue(statsDeferred.promise);
                });

                describe('when choosing Yesterday', function() {
                    beforeEach(function() {
                        SelfieManageCampaignStatsCtrl.customRange.selected = true;
                        SelfieManageCampaignStatsCtrl.rangeOptions[0].selected = true;
                        SelfieManageCampaignStatsCtrl.rangeOptions[1].selected = false;
                        SelfieManageCampaignStatsCtrl.rangeOptions[2].selected = true;
                        SelfieManageCampaignStatsCtrl.showDropdown = true;
                        SelfieManageCampaignStatsCtrl.showCustom = true;

                        SelfieManageCampaignStatsCtrl.getStats(SelfieManageCampaignStatsCtrl.rangeOptions[1]);
                    });

                    it('should unselect Custom', function() {
                        expect(SelfieManageCampaignStatsCtrl.customRange.selected).toBe(false);
                    });

                    it('should mark Yesterday as selected', function() {
                        SelfieManageCampaignStatsCtrl.rangeOptions.forEach(function(option) {
                            if (option.label === 'Yesterday') {
                                expect(option.selected).toBe(true);
                            } else {
                                expect(option.selected).toBe(false);
                            }
                        });
                    });

                    it('should hide dropdown and custom date area', function() {
                        expect(SelfieManageCampaignStatsCtrl.showDropdown).toBe(false);
                        expect(SelfieManageCampaignStatsCtrl.showCustom).toBe(false);
                    });

                    it('should query for analytics with start and end date', function() {
                        expect(CampaignService.getAnalytics).toHaveBeenCalledWith({
                            ids: 'cam-123',
                            startDate: formatDateForQuery(yesterday),
                            endDate: formatDateForQuery(yesterday)
                        });
                    });

                    describe('when stats are found', function() {
                        it('should put them on the parent Ctrl', function() {
                            $scope.$apply(function() {
                                statsDeferred.resolve(stats);
                            });

                            expect(SelfieManageCampaignStatsCtrl._stats).toEqual([]);
                        });
                    });
                });

                describe('when choosing Last 7 Days', function() {
                    beforeEach(function() {
                        SelfieManageCampaignStatsCtrl.customRange.selected = true;
                        SelfieManageCampaignStatsCtrl.rangeOptions[0].selected = true;
                        SelfieManageCampaignStatsCtrl.rangeOptions[1].selected = true;
                        SelfieManageCampaignStatsCtrl.rangeOptions[2].selected = false;
                        SelfieManageCampaignStatsCtrl.showDropdown = true;
                        SelfieManageCampaignStatsCtrl.showCustom = true;

                        SelfieManageCampaignStatsCtrl.getStats(SelfieManageCampaignStatsCtrl.rangeOptions[2]);
                    });

                    it('should unselect Custom', function() {
                        expect(SelfieManageCampaignStatsCtrl.customRange.selected).toBe(false);
                    });

                    it('should mark Yesterday as selected', function() {
                        SelfieManageCampaignStatsCtrl.rangeOptions.forEach(function(option) {
                            if (option.label === 'Last 7 Days') {
                                expect(option.selected).toBe(true);
                            } else {
                                expect(option.selected).toBe(false);
                            }
                        });
                    });

                    it('should hide dropdown and custom date area', function() {
                        expect(SelfieManageCampaignStatsCtrl.showDropdown).toBe(false);
                        expect(SelfieManageCampaignStatsCtrl.showCustom).toBe(false);
                    });

                    it('should query for analytics with start and end date', function() {
                        expect(CampaignService.getAnalytics).toHaveBeenCalledWith({
                            ids: 'cam-123',
                            startDate: formatDateForQuery(oneWeek),
                            endDate: formatDateForQuery(today)
                        });
                    });

                    describe('when stats are found', function() {
                        it('should put them on the parent Ctrl', function() {
                            $scope.$apply(function() {
                                statsDeferred.resolve(stats);
                            });

                            expect(SelfieManageCampaignStatsCtrl._stats).toEqual([]);
                        });
                    });
                });

                describe('when choosing last 30 Days', function() {
                    beforeEach(function() {
                        SelfieManageCampaignStatsCtrl.customRange.selected = true;
                        SelfieManageCampaignStatsCtrl.rangeOptions[0].selected = true;
                        SelfieManageCampaignStatsCtrl.rangeOptions[1].selected = true;
                        SelfieManageCampaignStatsCtrl.rangeOptions[2].selected = true;
                        SelfieManageCampaignStatsCtrl.rangeOptions[3].selected = false;
                        SelfieManageCampaignStatsCtrl.showDropdown = true;
                        SelfieManageCampaignStatsCtrl.showCustom = true;

                        SelfieManageCampaignStatsCtrl.getStats(SelfieManageCampaignStatsCtrl.rangeOptions[3]);
                    });

                    it('should unselect Custom', function() {
                        expect(SelfieManageCampaignStatsCtrl.customRange.selected).toBe(false);
                    });

                    it('should mark Yesterday as selected', function() {
                        SelfieManageCampaignStatsCtrl.rangeOptions.forEach(function(option) {
                            if (option.label === 'Last 30 Days') {
                                expect(option.selected).toBe(true);
                            } else {
                                expect(option.selected).toBe(false);
                            }
                        });
                    });

                    it('should hide dropdown and custom date area', function() {
                        expect(SelfieManageCampaignStatsCtrl.showDropdown).toBe(false);
                        expect(SelfieManageCampaignStatsCtrl.showCustom).toBe(false);
                    });

                    it('should query for analytics with start and end date', function() {
                        expect(CampaignService.getAnalytics).toHaveBeenCalledWith({
                            ids: 'cam-123',
                            startDate: formatDateForQuery(oneMonth),
                            endDate: formatDateForQuery(today)
                        });
                    });

                    describe('when stats are found', function() {
                        it('should put them on the parent Ctrl', function() {
                            $scope.$apply(function() {
                                statsDeferred.resolve(stats);
                            });

                            expect(SelfieManageCampaignStatsCtrl._stats).toEqual([]);
                        });
                    });
                });

                describe('when choosing Lifetime', function() {
                    beforeEach(function() {
                        SelfieManageCampaignStatsCtrl.customRange.selected = true;
                        SelfieManageCampaignStatsCtrl.rangeOptions[0].selected = false;
                        SelfieManageCampaignStatsCtrl.rangeOptions[1].selected = true;
                        SelfieManageCampaignStatsCtrl.rangeOptions[2].selected = true;
                        SelfieManageCampaignStatsCtrl.rangeOptions[3].selected = true;
                        SelfieManageCampaignStatsCtrl.showDropdown = true;
                        SelfieManageCampaignStatsCtrl.showCustom = true;

                        SelfieManageCampaignStatsCtrl.getStats(SelfieManageCampaignStatsCtrl.rangeOptions[0]);
                    });

                    it('should unselect Custom', function() {
                        expect(SelfieManageCampaignStatsCtrl.customRange.selected).toBe(false);
                    });

                    it('should mark Yesterday as selected', function() {
                        SelfieManageCampaignStatsCtrl.rangeOptions.forEach(function(option) {
                            if (option.label === 'Lifetime') {
                                expect(option.selected).toBe(true);
                            } else {
                                expect(option.selected).toBe(false);
                            }
                        });
                    });

                    it('should hide dropdown and custom date area', function() {
                        expect(SelfieManageCampaignStatsCtrl.showDropdown).toBe(false);
                        expect(SelfieManageCampaignStatsCtrl.showCustom).toBe(false);
                    });

                    it('should query for analytics without start and end date', function() {
                        expect(CampaignService.getAnalytics).toHaveBeenCalledWith({
                            ids: 'cam-123',
                            startDate: undefined,
                            endDate: undefined
                        });
                    });

                    describe('when stats are found', function() {
                        it('should put them on the Ctrl', function() {
                            $scope.$apply(function() {
                                statsDeferred.resolve(stats);
                            });

                            expect(SelfieManageCampaignStatsCtrl._stats).toEqual([]);
                        });
                    });
                });

                describe('when choosing Custom date range', function() {
                    beforeEach(function() {
                        SelfieManageCampaignStatsCtrl.customRange.selected = false;
                        SelfieManageCampaignStatsCtrl.rangeOptions[0].selected = true;
                        SelfieManageCampaignStatsCtrl.rangeOptions[1].selected = true;
                        SelfieManageCampaignStatsCtrl.rangeOptions[2].selected = true;
                        SelfieManageCampaignStatsCtrl.rangeOptions[3].selected = true;
                        SelfieManageCampaignStatsCtrl.showDropdown = true;
                        SelfieManageCampaignStatsCtrl.showCustom = true;

                        SelfieManageCampaignStatsCtrl.customRange.dates.start = '01/12/2016';
                        SelfieManageCampaignStatsCtrl.customRange.dates.end = '10/01/2016';
                        SelfieManageCampaignStatsCtrl.getStats(SelfieManageCampaignStatsCtrl.customRange);
                    });

                    it('should select Custom', function() {
                        expect(SelfieManageCampaignStatsCtrl.customRange.selected).toBe(true);
                    });

                    it('should mark Yesterday as selected', function() {
                        SelfieManageCampaignStatsCtrl.rangeOptions.forEach(function(option) {
                            expect(option.selected).toBe(false);
                        });
                    });

                    it('should hide dropdown but not custom area', function() {
                        expect(SelfieManageCampaignStatsCtrl.showDropdown).toBe(false);
                        expect(SelfieManageCampaignStatsCtrl.showCustom).toBe(true);
                    });

                    it('should query for analytics without start and end date', function() {
                        expect(CampaignService.getAnalytics).toHaveBeenCalledWith({
                            ids: 'cam-123',
                            startDate: '2016-01-12',
                            endDate: '2016-10-01'
                        });
                    });

                    describe('when stats are found', function() {
                        it('should put them on the Ctrl', function() {
                            $scope.$apply(function() {
                                statsDeferred.resolve(stats);
                            });

                            expect(SelfieManageCampaignStatsCtrl._stats).toEqual([]);
                        });
                    });
                });
            });
        });
    });
});