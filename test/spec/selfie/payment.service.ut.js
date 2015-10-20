define(['app','c6uilib'], function(appModule, c6uilib) {
    'use strict';

    describe('PaymentService', function() {
        var $httpBackend,
            PaymentService,
            c6UrlMaker;

        var success,
            failure;

        beforeEach(function() {
            module(c6uilib.name, function($provide) {
                $provide.provider('c6UrlMaker', function(){
                    this.location = jasmine.createSpy('urlMaker.location');
                    this.makeUrl = jasmine.createSpy('urlMaker.makeUrl');
                    this.$get = function(){
                        return jasmine.createSpy('urlMaker.get');
                    };
                });
            });

            module(appModule.name);


            inject(function($injector) {
                $httpBackend = $injector.get('$httpBackend');
                PaymentService = $injector.get('PaymentService');

                c6UrlMaker = $injector.get('c6UrlMaker');
                c6UrlMaker.and.callFake(function(path, base) {
                    return '/' + base + '/' + path;
                });
            });
        });

        it('should be defined', function() {
            expect(PaymentService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('getToken()', function() {
                    beforeEach(function(){
                        success = jasmine.createSpy('get().success');
                        failure = jasmine.createSpy('get().failure');
                    });

                    it('will request and return a token from the API',function(){
                        $httpBackend.expectGET('/api/payments/clientToken')
                            .respond(200, { clientToken:'1234-4321' });

                        PaymentService.getToken().then(success, failure);

                        $httpBackend.flush();

                        expect(success).toHaveBeenCalledWith('1234-4321');
                        expect(failure).not.toHaveBeenCalled();
                    });

                    it('will reject promise if not successful',function(){
                        $httpBackend.expectGET('/api/payments/clientToken')
                            .respond(500, 'Server Error');

                        PaymentService.getToken().then(success, failure);

                        $httpBackend.flush();

                        expect(success).not.toHaveBeenCalled();
                        expect(failure).toHaveBeenCalled();
                    });
                });
        });
    });
})