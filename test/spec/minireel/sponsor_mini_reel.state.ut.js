define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorMiniReel', function() {
        var c6State,
            cinema6,
            $q,
            SettingsService,
            EditorService,
            sponsorMiniReel;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                $q = $injector.get('$q');
                SettingsService = $injector.get('SettingsService');
                EditorService = $injector.get('EditorService');
            });

            sponsorMiniReel = c6State.get('MR:SponsorMiniReel');
        });

        it('should exist', function() {
            expect(sponsorMiniReel).toEqual(jasmine.any(Object));
        });

        describe('model()', function() {
            var id = 'e-70c9ce53799e91',
                result;

            beforeEach(function() {
                spyOn(cinema6.db, 'find').and.returnValue($q.defer().promise);

                result = sponsorMiniReel.model({
                    minireelId: id
                });
            });

            it('should find the experience', function() {
                expect(cinema6.db.find).toHaveBeenCalledWith('experience', id);
            });

            it('should return the promise', function() {
                expect(result).toBe(cinema6.db.find());
            });
        });

        describe('afterModel(model)', function() {
            var minireel;

            beforeEach(function() {
                minireel = {
                    id: 'e-24753698925532',
                    data: {
                        deck: [],
                        splash: {
                            theme: 'img-only',
                            ratio: '16-9',
                            source: 'specified'
                        }
                    }
                };

                SettingsService
                    .register('MR::org', {}, {
                        localSync: false
                    })
                    .register('MR::user', {
                        minireelDefaults: {
                            splash: {
                                ratio: '16-9',
                                theme: 'img-text-overlay'
                            }
                        }
                    }, {
                        localSync: false
                    });

                spyOn(EditorService, 'open').and.callThrough();

                sponsorMiniReel.afterModel(minireel);
            });

            it('should open the minireel', function() {
                expect(EditorService.open).toHaveBeenCalledWith(minireel);
            });

            describe('if a minireel is already open', function() {
                beforeEach(function() {
                    EditorService.open(minireel);

                    EditorService.open.calls.reset();
                });

                describe('if the model has the same id', function() {
                    beforeEach(function() {
                        sponsorMiniReel.afterModel(minireel);
                    });

                    it('should not open the MiniReel again', function() {
                        expect(EditorService.open).not.toHaveBeenCalled();
                    });
                });

                describe('if the model has a different id', function() {
                    beforeEach(function() {
                        minireel.id = 'e-35858fc1c9fa64';

                        sponsorMiniReel.afterModel(minireel);
                    });

                    it('should open the MiniReel', function() {
                        expect(EditorService.open).toHaveBeenCalledWith(minireel);
                    });
                });
            });
        });
    });
});
