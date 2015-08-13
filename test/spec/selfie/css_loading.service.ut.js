define(['app','angular'], function(appModule, angular) {
    'use strict';

    describe('CSSLoadingService', function() {
        var $document,
            CSSLoadingService;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                $document = $injector.get('$document');
                CSSLoadingService = $injector.get('CSSLoadingService');
            });
        });

        it('should exist', function() {
            expect(CSSLoadingService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('load(paths)', function() {
                var stylesheets, loadedStylesheets;

                function checkForStylesheets() {
                    $document.find('link').each(function(i, val) {
                        loadedStylesheets.push(angular.element(val).attr('href'));
                    });

                    stylesheets.forEach(function(path) {
                        expect(stylesheets.indexOf(path) > -1).toBe(true);
                    });
                }

                beforeEach(function() {
                    stylesheets = ['/assets/style.css','http://css.com/style.css','//someurl.com/style.css'];
                    loadedStylesheets = [];
                });

                it('should handle paths as params', function() {
                    CSSLoadingService.load( stylesheets[0], stylesheets[1], stylesheets[2] );

                    checkForStylesheets();
                });

                it('should handle paths as arrays', function() {
                    CSSLoadingService.load( stylesheets );

                    checkForStylesheets();
                });
            });
        });
    });
});