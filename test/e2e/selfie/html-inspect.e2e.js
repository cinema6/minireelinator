'use strict';

var utils = require('../../helpers/html-inspect-utils.js');

var HOST = 'http://localhost:9000';
var WIDTH = 1024;
var HEIGHT = 768;
var E2E_CAMP = 'c-b76ecf45af71cd';
var E2E_PAY = 'pay-a3fbcb1775823a';
var WAIT_TIME = 1000;

describe('the html', function() {

    function expectValidHTML(spec, done) {
        utils.inspectHTML().then(function(errors) {
            if(errors.length > 0) {
                done.fail(JSON.stringify(errors.map(function(error) {
                    return {
                        rule: error.rule,
                        message: error.message
                    };
                })));
            }
        }).then(done, done.fail);
    }

    beforeAll(function() {
        browser.driver.manage().window().setSize(WIDTH, HEIGHT);
    });
    
    describe('the login page', function() {
        beforeEach(function(done) {
            utils.logout(HOST).then(function() {
                return utils.preparePage(HOST + '/', WAIT_TIME);
            }).then(done, done.fail);
        });
        
        it('should be valid HTML', function(done) {
            expectValidHTML(this, done);
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
                    return utils.preparePage(HOST + route, WAIT_TIME);
                }).then(done, done.fail);
            });
            
            it('should be valid HTML', function(done) {
                expectValidHTML(this, done);
            });
        });
    });
});
