module.exports = function() {
    'use strict';

    function LoginPage() {
        this.username = element(by.id('c6-username'));
        this.password = element(by.id('c6-password'));
        this.submit = element(by.buttonText('Login'));
        this.signUp = element(by.linkText('Sign up Now!'));
        this.forgotPassword = element(by.linkText('Forgot Password?'));

        this.get = function() {
            browser.driver.get('http://localhost:9000/');
        };
    }

    return LoginPage;
}