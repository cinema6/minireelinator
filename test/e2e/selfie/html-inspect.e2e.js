'use strict';

var utils = require('../../helpers/html-inspect-utils.js');

var HOST = 'http://localhost:9000';
var WIDTH = 1024;
var HEIGHT = 768;
var E2E_CAMP = 'c-b76ecf45af71cd';
var E2E_PAY = 'pay-a3fbcb1775823a';

describe('the html', function() {
    
    beforeEach(function() {
        browser.driver.manage().window().setSize(WIDTH, HEIGHT);
    });
    
    describe('the login page', function() {
        beforeEach(function(done) {
            utils.logout(HOST).then(function() {
                return utils.preparePage(HOST + '/');
            }).then(function() {
                return browser.sleep(1000);
            }).then(done, done.fail);
        });
        
        it('should be valid HTML', function(done) {
            utils.inspectHTML().then(function(errors) {
                errors.forEach(function(error) {
                    console.log({
                        rule: error.rule,
                        message: error.message
                    });
                });
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
                utils.login(HOST).then(function() {
                    return utils.preparePage(HOST + route);
                }).then(function() {
                    return browser.sleep(1000);
                }).then(done, done.fail);
            });
            
            it('should be valid HTML', function(done) {
                utils.inspectHTML().then(function(errors) {
                    errors.forEach(function(error) {
                        console.log({
                            rule: error.rule,
                            message: error.message
                        });
                    });
                    expect(errors.length).toBe(0);
                }).then(done, done.fail);
            });
        });
    });
});
