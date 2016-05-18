(function() {
    'use strict';

    define(['minireel/services'], function(servicesModule) {
        describe('CollateralUploadService', function() {
            var $httpBackend,
                CollateralUploadService;

            beforeEach(function() {
                module(servicesModule.name);

                inject(function($injector) {
                    $httpBackend = $injector.get('$httpBackend');

                    CollateralUploadService = $injector.get('CollateralUploadService');
                });
            });

            afterAll(function() {
                $httpBackend = null;
                CollateralUploadService = null;
            });

            it('should exist', function() {
                expect(CollateralUploadService).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                describe('uploadFromUri(uri)', function() {
                    it('should resolve to the path', function() {
                        var success = jasmine.createSpy('success');

                        $httpBackend.expectPOST('/api/collateral/uri', { uri: 'http://foo.com/bar.jpg' })
                            .respond(201, [{ path: 'collateral/userFiles/ce114e4501d2f4e2dcea3e17b546f339.jpg'}]);

                        CollateralUploadService.uploadFromUri('http://foo.com/bar.jpg')
                            .then(success);

                        $httpBackend.flush();

                        expect(success).toHaveBeenCalledWith('/collateral/userFiles/ce114e4501d2f4e2dcea3e17b546f339.jpg');
                    });
                });
            });
        });
    });
}());
