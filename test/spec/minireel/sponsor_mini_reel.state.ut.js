define(['app'], function(appModule) {
    'use strict';

    describe('MR:SponsorMiniReel', function() {
        var $rootScope,
            c6State,
            cinema6,
            $q,
            SettingsService,
            EditorService,
            sponsorMiniReel;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                c6State = $injector.get('c6State');
                cinema6 = $injector.get('cinema6');
                $q = $injector.get('$q');
                SettingsService = $injector.get('SettingsService');
                EditorService = $injector.get('EditorService');
            });

            sponsorMiniReel = c6State.get('MR:SponsorMiniReel');
        });

        afterAll(function() {
            $rootScope = null;
            c6State = null;
            cinema6 = null;
            $q = null;
            SettingsService = null;
            EditorService = null;
            sponsorMiniReel = null;
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
            var result;

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

                SettingsService.register('MR::user', {
                    minireelDefaults: {
                        splash: {
                            ratio: '3-2',
                            theme: 'img-text-overlay'
                        }
                    }
                }, {
                    localSync: false
                });

                SettingsService.register('MR::org', {
                    minireelDefaults: {
                        mode: 'lightbox-ads',
                        autoplay: true
                    }
                }, {
                    localSync: false
                });

                spyOn(EditorService, 'open').and.callThrough();

                result = sponsorMiniReel.afterModel(minireel);
            });

            it('should open the minireel', function() {
                expect(EditorService.open).toHaveBeenCalledWith(minireel);
            });

            it('should return a promise', function() {
                expect(result.then).toEqual(jasmine.any(Function));
            });

            describe('if a minireel is already open', function() {
                beforeEach(function() {
                    $rootScope.$apply(function() {
                        EditorService.open(minireel);
                    });

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
