module.exports = function(http) {
    'use strict';

    var path = require('path'),
        grunt = require('grunt'),
        Q = require('q');

    var fn = require('../utils/fn'),
        db = require('../utils/db'),
        pluckExcept = fn.pluckExcept,
        idFromPath = db.idFromPath,
        extend = fn.extend,
        genId = require('../../tasks/resources/helpers').genId;

    function objectPath(type, id) {
        return path.resolve(__dirname, './' + type + '/' + id + '.json');
    }

    http.whenGET('/api/promotions/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('promotions', id);

        try {
            this.respond(200, Q.when(extend(grunt.file.readJSON(filePath), { id: id })).delay(1000));
        } catch(e) {
            this.respond(404, 'Not Found');
        }
    });

    http.whenGET('/api/promotions', function(request) {
        var allPromotions = grunt.file.expand(path.resolve(__dirname, './promotions/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(promotion) {
                    var ids = request.query.ids,
                        idArray = (ids || '').split(','),
                        id = promotion.id;

                    return !ids || idArray.indexOf(id) > -1;
                })
                .filter(function(promotion) {
                    var name = request.query.name;

                    return !name || name === promotion.name;
                })
                .filter(function(promotion) {
                    var type = request.query.type;

                    return !type || type === promotion.type;
                });

        try {
            this.respond(200, Q.when(allPromotions).delay(1500));
        } catch(e) {
            this.respond(404, 'Not Found');
        }
    });

    http.whenPUT('/api/promotions/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('promotions', id),
            current = grunt.file.readJSON(filePath),
            updated = extend(current, request.body, {
                lastUpdated: (new Date()).toISOString()
            });

        if (updated.type === 'signUpReward' && (!updated.data.rewardAmount && updated.data.rewardAmount !== 0)) {
            return this.respond(400, 'Sign up reward requires an amount');
        }

        grunt.file.write(filePath, JSON.stringify(updated, null, '    '));

        this.respond(200, Q.when(extend(updated, {id: id})).delay(1500));
    });

    http.whenPOST('/api/promotions', function(request) {
        var id = genId('promo'),
            currentTime = (new Date()).toISOString(),
            promotion = extend(request.body, {
                created: currentTime,
                lastUpdated: currentTime,
                status: 'active'
            });

        if (promotion.type === 'signUpReward' && (!promotion.data.rewardAmount && promotion.data.rewardAmount !== 0)) {
            return this.respond(400, 'Sign up reward requires an amount');
        }

        grunt.file.write(objectPath('promotions', id), JSON.stringify(promotion, null, '    '));

        this.respond(201, Q.when(extend(promotion, { id: id })).delay(1500));
    });

    http.whenDELETE('/api/promotions/**', function(request) {
        grunt.file.delete(objectPath('promotions', idFromPath(request.pathname)));

        this.respond(204, Q.when('').delay(1000));
    });
};
