'use strict';

var HOST = 'http://localhost:9000';
var ROUTES = ['/'];

describe('the html', function() {
    ROUTES.forEach(function(route) {
        var url = HOST + route;

        describe(url, function() {
            beforeEach(function(done) {
                browser.get(url).then(function() {
                    return browser.executeAsyncScript(function(done) {
                        var script = document.createElement('script');
                        script.onload = function() {
                            done();
                        };
                        script.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/html-inspector/0.8.2/html-inspector.js');
                        var body = document.getElementsByTagName('body')[0];
                        body.appendChild(script);
                    });
                }).then(done, done.fail);
            });
            
            it('should be valid', function(done) {
                return browser.executeAsyncScript(function(done) {
                    window.HTMLInspector.inspect({
                        useRules: [
                            'duplicate-ids'
                        ],
                        onComplete: function(errors) {
                            done(errors);
                        }
                    });
                }).then(function(errors) {
                    errors.forEach(function(error) {
                        console.log(error);
                    });
                    expect(errors.length).toBe(0);
                }).then(done, done.fail);
            });
        });
    });
});
