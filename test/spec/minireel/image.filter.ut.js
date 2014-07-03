(function() {
    'use strict';

    define(['minireel/app'], function(minireelModule) {
        describe('imageFilter()', function() {
            var imageFilter;

            var FileService,
                fileWrapper,
                file;

            beforeEach(function() {
                file = {};

                fileWrapper = {
                    url: {}
                };

                module(minireelModule.name, function($provide) {
                    $provide.value('FileService', {
                        open: jasmine.createSpy('FileService.open()')
                            .and.returnValue(fileWrapper)
                    });
                });

                inject(function($injector) {
                    imageFilter = $injector.get('imageFilter');

                    FileService = $injector.get('FileService');
                });
            });

            it('should exist', function() {
                expect(imageFilter).toEqual(jasmine.any(Function));
            });

            it('should return a URL for the file', function() {
                expect(imageFilter(file)).toBe(fileWrapper.url);
                expect(FileService.open).toHaveBeenCalledWith(file);
            });

            it('should return null if something falsy is passed in as the file', function() {
                expect(imageFilter()).toBeNull();
            });
        });
    });
}());
