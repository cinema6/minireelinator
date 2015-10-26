define(['app','c6uilib'], function(appModule, c6uilib) {
    'use strict';

    describe('PaymentService', function() {
        var $rootScope,
            $httpBackend,
            PaymentService,
            c6UrlMaker,
            cinema6,
            $q;

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
                $rootScope = $injector.get('$rootScope');
                $httpBackend = $injector.get('$httpBackend');
                PaymentService = $injector.get('PaymentService');
                cinema6 = $injector.get('cinema6');
                $q = $injector.get('$q');

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

            describe('getHistory()', function() {
                var payments;

                beforeEach(function(){
                    success = jasmine.createSpy('get().success');
                    failure = jasmine.createSpy('get().failure');

                    payments = [
                        {
                            id: 'trans-111',
                            campaignId: 'cam-111'
                        },
                        {
                            id: 'trans-222',
                            campaignId: 'cam-222'
                        },
                        {
                            id: 'trans-333',
                            campaignId: 'cam-333'
                        },
                        {
                            id: 'trans-444',
                            campaignId: 'cam-333'
                        }
                    ];
                });

                it('will request all payments', function() {
                    $httpBackend.expectGET('/api/payments')
                        .respond(200, payments);

                    PaymentService.getHistory().then(success, failure);

                    $httpBackend.flush();

                    expect(success).toHaveBeenCalledWith(payments);
                    expect(failure).not.toHaveBeenCalled();
                });

                it('will reject promise if not successful',function(){
                    $httpBackend.expectGET('/api/payments')
                        .respond(500, 'Server Error');

                    PaymentService.getHistory().then(success, failure);

                    $httpBackend.flush();

                    expect(success).not.toHaveBeenCalled();
                    expect(failure).toHaveBeenCalled();
                });
            });
        });
    });
})