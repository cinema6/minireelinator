define(['minireel/editor'], function(editorModule) {
    'use strict';

    describe('playerMeta', function() {
        var $injector,
            playerMetaProvider,
            playerMeta,
            $httpBackend;

        var meta;

        beforeEach(function() {
            meta = {
                version: 'beta17-0-983hf',
                date: (new Date()).toString()
            };

            module(editorModule.name, function($injector) {
                playerMetaProvider = $injector.get('playerMetaProvider');
            });

            inject(function(_$injector_) {
                $injector = _$injector_;

                $httpBackend = $injector.get('$httpBackend');
                $httpBackend.expectGET('/apps/rumble/meta.json')
                    .respond(200, meta);
                playerMeta = $injector.get('playerMeta');
            });
        });

        it('should exist', function() {
            expect(playerMeta).toEqual(jasmine.any(Object));
        });

        it('should inherit the meta data when the request is fulfilled', function() {
            $httpBackend.flush();

            expect(playerMeta).toEqual(jasmine.objectContaining(meta));
        });

        describe('methods', function() {
            describe('ensureFulfillment()', function() {
                var success;

                beforeEach(function() {
                    success = jasmine.createSpy('success');
                });

                it('should return the same value every time', function() {
                    expect(playerMeta.ensureFulfillment()).toBe(playerMeta.ensureFulfillment());
                });

                it('should be resolved when the meta data is fetched', function() {
                    playerMeta.ensureFulfillment().then(success);
                    $httpBackend.flush();

                    expect(success).toHaveBeenCalledWith(meta);
                });

                it('should still be resolved if the $http request fails', function() {
                    $httpBackend.expectGET('/apps/rumble/meta.json')
                        .respond(404, 'NOT FOUND');

                    playerMeta = $injector.invoke(playerMetaProvider.$get);
                    playerMeta.ensureFulfillment().then(success);
                    $httpBackend.flush();

                    expect(success).toHaveBeenCalledWith({});
                });
            });
        });
    });
});
