'use strict';

var AUTH_ENDPOINT = '/api/auth';
var AUTH_EMAIL = 'selfie@cinema6.com';
var AUTH_PASSWORD = 'password';

var fs = require('fs');
var request = require('request');

module.exports = {
    preparePage: function(url, waitTime) {
        return browser.get(url).then(function() {
            return browser.waitForAngular();
        }).then(function() {
            return browser.sleep(waitTime);
        }).then(function() {
            return browser.executeAsyncScript(function(done) {
                var script = document.createElement('script');
                script.onload = function() {
                    done();
                };
                script.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/html-inspector/0.8.2/html-inspector.js');
                var body = document.getElementsByTagName('body')[0];
                body.appendChild(script);
            });
        });
    },
    login: function(host) {
        return new protractor.promise.Promise(function(resolve, reject) {
            request.post({
                url: host + AUTH_ENDPOINT + '/login',
                json: {
                    email: AUTH_EMAIL,
                    password: AUTH_PASSWORD
                }
            }, function(error, response) {
                if(error || response.statusCode !== 200) {
                    reject(error || response.statusCode);
                } else {
                    resolve();
                }
            });
        });
    },
    logout: function(host) {
        return new protractor.promise.Promise(function(resolve, reject) {
            request.post(host + AUTH_ENDPOINT + '/logout', function(error, response) {
                if(error || response.statusCode !== 204) {
                    reject(error || response.statusCode);
                } else {
                    resolve();
                }
            });
        });
    },
    screenshot: function(filePath) {
        return browser.takeScreenshot().then(function(data) {
            var buffer = new Buffer(data, 'base64');
            fs.writeFile(filePath, buffer);
        });
    },
    inspectHTML: function() {
        return browser.executeAsyncScript(function(done) {
            window.HTMLInspector.inspect({
                useRules: [
                    'duplicate-ids'
                ],
                onComplete: function(errors) {
                    done(errors);
                }
            });
        });
    }
};
