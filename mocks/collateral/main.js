module.exports = function(http) {
    'use strict';

    var Q = require('q');


    http.whenGET('/api/collateral/website-data', function(request) {
        if (!request.query.uri) {
            return this.respond(400, 'BAD REQUEST');
        }

        var website = decodeURIComponent(request.query.uri),
            domain = website.match(/([0-9a-zA-Z\-]+)\.\w+$/)[1],
            nolinks = (/nolinks\.com/).test(website);

        if ((/empty\.com/).test(website)) {
            return this.respond(200, {
                links: {
                    facebook: null,
                    twitter: null,
                    instagram: null,
                    pinterest: null,
                    youtube: null,
                    google: null
                },
                images: {
                    profile: null
                }
            });
        }

        if ((/error\.com/).test(website)) {
            return this.respond(500, 'SERVER ERROR');
        }

        this.respond(201, Q.when({
            links: {
                facebook: nolinks ? null : 'http://facebook.com/' + domain,
                twitter: nolinks ? null : 'http://twitter.com/' + domain,
                instagram: nolinks ? null : 'http://instagram.com/' + domain,
                pinterest: null,
                youtube: nolinks ? null : 'http://youtube.com/' + domain,
                google: null
            },
            images: {
                profile: (/noimage\.com/).test(website) ? null : 'https://platform-staging.reelcontent.com/v1.30.1.rc3-0-ge122f80/styles/selfie/img/rc-logo-square.png'
            }
        }).delay(2500));
    });

    http.whenPOST('/api/collateral/files', function(request) {
        this.respond(400, 'Must provide files to upload.');
        // this.respond(413, [{ code: 413, name: 'fileName', error: 'File is too big.' }]);
        // this.respond(415, [{ code: 415, name: 'fileName', error: 'Unsupported file type.' }]);
        // this.respond(500, [{ code: 500, name: 'fileName', error: 'Error uploading file.' }]);
    });

    http.whenPOST('/api/collateral/uri', function(request) {
        this.respond(400, 'Not a valid URI.');
        // this.respond(413, 'File is too large.');
        // this.respond(408, 'Timed out downloading file.');
        // this.respond(415, 'File is not an image.');
        // this.respond(500, { error: 'Error uploading file.', detail: 'Error uploading file.' });
    });
};
