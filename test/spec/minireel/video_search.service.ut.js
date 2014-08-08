define(['minireel/services'], function(servicesModule) {
    'use strict';

    ddescribe('VideoSearchService', function() {
        var VideoSearchService;

        beforeEach(function() {
            module(servicesModule.name);

            inject(function($injector) {
                VideoSearchService = $injector.get('VideoSearchService');
            });
        });

        it('should exist', function() {
            expect(VideoSearchService).toEqual(jasmine.any(Object));
        });
    });
});
