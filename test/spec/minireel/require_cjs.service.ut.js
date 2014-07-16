(function() {
    'use strict';

    define(['minireel/services'], function(servicesModule) {
        describe('requireCJS(src)', function() {
            var requireCJS,
                $rootScope,
                $q,
                $httpBackend;

            beforeEach(function() {
                module(servicesModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $q = $injector.get('$q');
                    $httpBackend = $injector.get('$httpBackend');

                    requireCJS = $injector.get('requireCJS');
                });
            });

            it('should exist', function() {
                expect(requireCJS).toEqual(jasmine.any(Function));
            });

            it('should fetch a commonJS-style module and resolve a promise to it', function() {
                var success = jasmine.createSpy('success');

                $httpBackend.expectGET('foo.js')
                    .respond(200, '(' + function() {
                        module.exports = {
                            name: 'Josh',
                            age: 22
                        };
                    }.toString() + '())');

                $rootScope.$apply(function() {
                    requireCJS('foo.js').then(success);
                });

                $httpBackend.flush();

                expect(success).toHaveBeenCalledWith({
                    name: 'Josh',
                    age: 22
                });
            });

            it('should cache the modules by their src', function() {
                var success = jasmine.createSpy('success');

                $httpBackend.expectGET('hey.js')
                    .respond(200, '(' + function() {
                        module.exports = {
                            company: 'Cinema6',
                            CEO: 'Jason Glickman'
                        };
                    }.toString() + '())');

                $rootScope.$apply(function() {
                    requireCJS('hey.js').then(success);
                });

                $httpBackend.flush();

                expect(success).toHaveBeenCalledWith({
                    company: 'Cinema6',
                    CEO: 'Jason Glickman'
                });

                $rootScope.$apply(function() {
                    requireCJS('hey.js').then(success);
                });

                expect(success.calls.mostRecent().args[0]).toBe(success.calls.argsFor(0)[0]);
            });
        });
    });
}());
