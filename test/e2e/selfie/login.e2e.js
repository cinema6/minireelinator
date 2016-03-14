'use strict';

fdescribe('login page', function() {
    var LoginPage,
        loginPage;

    beforeEach(function() {
        LoginPage = require('./pages/LoginPage.js')();
        loginPage = new LoginPage();
        loginPage.get();
    });

    it('should show username and password fields', function() {
        expect(loginPage.username.isDisplayed()).toBe(true);
        expect(loginPage.password.isDisplayed()).toBe(true);
    });

    it('should show a Login button', function() {
        expect(loginPage.submit.isDisplayed()).toBe(true);
    });

    it('should show a link to the sign up page', function() {
        expect(loginPage.signUp.isDisplayed()).toBe(true);
    });

    it('should show a link to the forgot password page', function() {
        expect(loginPage.forgotPassword.isDisplayed()).toBe(true);
    });

    describe('clicking Forgot Password link', function() {
        it('should go to forgot password page', function() {
            loginPage.forgotPassword.click();
            expect(browser.getCurrentUrl()).toMatch(/\/pass\/forgot/);
        });
    });

    describe('clicking Sign Up link', function() {
        it('should go to sign up page', function() {
            loginPage.signUp.click();
            expect(browser.getCurrentUrl()).toMatch(/\/signup/);
        });
    });

    describe('logging in', function() {
        describe('when username is not set', function() {
            it('should show error', function() {
                loginPage.password.sendKeys('abcdef');
                loginPage.submit.click();
                expect(element(by.className('alert__failure')).isDisplayed()).toBe(true);
            });
        });

        describe('when password is not set', function() {
            it('should show error', function() {
                loginPage.username.sendKeys('selfie@cinema6.com');
                loginPage.submit.click();
                expect(element(by.className('alert__failure')).isDisplayed()).toBe(true);
            });
        });

        describe('when username and password are set', function() {
            describe('when username is not valid', function() {
                it('should show error', function() {
                    loginPage.username.sendKeys('abcdef@bad.com');
                    loginPage.password.sendKeys('abcdef');
                    loginPage.submit.click();
                    expect(element(by.className('alert__failure')).isDisplayed()).toBe(true);
                });
            });

            describe('when username is valid', function() {
                it('should go to campaign list view', function() {
                    loginPage.username.sendKeys('selfie@cinema6.com');
                    loginPage.password.sendKeys('abcdef');
                    loginPage.submit.click();
                    expect(browser.getCurrentUrl()).toMatch(/\/apps\/selfie\/campaigns/);
                });
            });
        });
    });
});