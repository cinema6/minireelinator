'use strict';

var fs = require('fs');
var request = require('request');

var HOST = 'http://localhost:9000';
var WIDTH = 1024;
var HEIGHT = 768;
var E2E_CAMP = 'c-b76ecf45af71cd';
var E2E_PAY = 'pay-a3fbcb1775823a';

describe('the html', function() {
    function gotoURL(url) {
        return browser.get(url).then(function() {
            return browser.executeAsyncScript(function(done) {
                var script = document.createElement('script');
                script.onload = function() {
                    done();
                };
                script.setAttribute('src', 'https://cdnjs.cloudflare.com/ajax/libs/html-inspector/0.8.2/html-inspector.js');
                var body = document.getElementsByTagName('body')[0];
                body.appendChild(script);
            });
        }).then(function() {
            return browser.waitForAngular();
        });
    }
    
    function login() {
        return new protractor.promise.Promise(function(resolve, reject) {
            request.post({
                url: HOST + '/api/auth/login',
                json: {
                    email: 'selfie@cinema6.com',
                    password: 'password'
                }
            }, function(error) {
                if(error) {
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }
    
    function logout() {
        return new protractor.promise.Promise(function(resolve, reject) {
            request.post(HOST + '/api/auth/logout', function(error) {
                if(error) {
                    reject();
                } else {
                    resolve();
                }
            });
        });
    }
    
    function screenshot(filePath) {
        return browser.sleep(5000).then(function() {
            return browser.takeScreenshot();
        }).then(function(data) {
            var buffer = new Buffer(data, 'base64');
            fs.writeFile(filePath, buffer);
        });
    }
    
    function inspectHTML() {
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
    
    beforeEach(function() {
        browser.driver.manage().window().setSize(WIDTH, HEIGHT);
    });
    
    describe('the login page', function() {
        beforeEach(function(done) {
            logout().then(function() {
                return gotoURL(HOST + '/');
            }).then(function(){
                return screenshot('login');
            }).then(done, done.fail);
        });
        
        it('should be valid HTML', function(done) {
            inspectHTML().then(function(errors) {
                expect(errors.length).toBe(0);
            }).then(done, done.fail);
        });
    });
    
    // Authenticaed routes
    [
        '/',
        '/#/apps/selfie/campaigns/new',
        '/#/apps/selfie/campaigns/edit/' + E2E_CAMP,
        '/#/apps/selfie/campaigns/manage/' + E2E_CAMP + '/manage',
        '/#/apps/selfie/campaigns/manage/' + E2E_CAMP + '/payment',
        '/#/apps/selfie/campaigns/manage/' + E2E_CAMP + '/stats',
        '/#/apps/selfie/campaigns/manage/' + E2E_CAMP + '/admin',
        '/#/apps/selfie/account/overview',
        '/#/apps/selfie/account/email',
        '/#/apps/selfie/account/details',
        '/#/apps/selfie/account/password',
        '/#/apps/selfie/account/payment',
        '/#/apps/selfie/account/payment/new',
        '/#/apps/selfie/account/payment/edit/' + E2E_PAY,
        '/#/apps/selfie/account/payment/history'
    ].forEach(function(route) {
        describe('authenticaed route ' + route, function() {
            beforeEach(function(done) {
                login().then(function() {
                    return gotoURL(HOST + route);
                }).then(function() {
                    return browser.sleep(1000);
                }).then(done, done.fail);
            });
            
            it('should be valid HTML', function(done) {
                inspectHTML().then(function(errors) {
                    expect(errors.length).toBe(0);
                }).then(done, done.fail);
            });
        });
    });
});
