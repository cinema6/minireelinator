(function() {
    'use strict';

    define(['minireel/app'], function(minireelModule) {
        describe('splashPageSrcFilter(minireel, splash)', function() {
            var splashPageSrcFilter;

            var minireel;

            function filter() {
                return splashPageSrcFilter.apply(null, arguments).$$unwrapTrustedValue();
            }

            function result() {
                var splash = minireel.data.splash;

                return '/collateral/splash/' + splash.theme + '/' + splash.ratio + '.html';
            }

            beforeEach(function() {
                minireel = {
                    id: 'e-1ad6c668af357e',
                    data: {
                        title: 'What\'s Up?!',
                        collateral: {
                            splash: '/collateral/img.jpg'
                        },
                        splash: {
                            ratio: '16-9',
                            theme: 'img-text-overlay'
                        }
                    }
                };

                module(minireelModule.name);

                inject(function($injector) {
                    splashPageSrcFilter = $injector.get('splashPageSrcFilter');
                });
            });

            afterAll(function() {
                splashPageSrcFilter = null;
                minireel = null;
            });

            it('should exist', function() {
                expect(splashPageSrcFilter).toEqual(jasmine.any(Function));
            });

            it('should generate the src of the splash page given a minireel', function() {
                expect(filter(minireel)).toBe(result());
            });
        });
    });
}());
