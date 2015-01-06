module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path');

    var fn = require('../utils/fn'),
        pluckExcept = fn.pluckExcept,
        withDefaults = fn.withDefaults,
        mapObject = fn.mapObject,
        pluck = fn.pluck,
        extend = fn.extend,
        db = require('../utils/db'),
        idFromPath = db.idFromPath,
        genId = require('../../tasks/resources/helpers').genId;

    function objectPath(type, id) {
        return path.resolve(__dirname, './' + type + '/' + id + '.json');
    }

    function makeArray(length) {
        var array = [];

        while (array.length < length) {
            array[array.length] = undefined;
        }

        return array;
    }

    function randomNumberBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function withAdtechIds(campaign) {
        return extend(
            campaign,
            ['miniReels', 'cards', 'targetMiniReels']
                .reduce(function(object, prop) {
                    object[prop] = campaign[prop].map(function(data) {
                        return extend({
                            adtechId: makeArray(8)
                                .map(function() {
                                    return randomNumberBetween(1, 9);
                                })
                                .join('')
                        }, data);
                    });
                    return object;
                }, {})
        );
    }

    http.whenGET('/api/campaigns', function(request) {
        var filters = pluckExcept(request.query, ['sort', 'limit', 'skip']),
            page = withDefaults(mapObject(pluck(request.query, ['limit', 'skip']), parseFloat), {
                limit: Infinity,
                skip: 0
            }),
            sort = (request.query.sort || null) && request.query.sort.split(','),
            allCampaigns = grunt.file.expand(path.resolve(__dirname, './campaigns/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(campaign) {
                    return Object.keys(filters)
                        .every(function(key) {
                            return filters[key] === campaign[key];
                        });
                }),
            campaigns = allCampaigns
                .filter(function(campaign, index) {
                    var startIndex = page.skip,
                        endIndex = (startIndex + page.limit) - 1;

                    return index >= startIndex && index <= endIndex;
                })
                .sort(function(a, b) {
                    var prop = sort && sort[0],
                        directionInt = parseInt(sort && sort[1]),
                        isDate = ['lastUpdated', 'created'].indexOf(prop) > -1,
                        aProp, bProp;

                    if (!sort) {
                        return 0;
                    }

                    aProp = isDate ? new Date(a[prop]) : a[prop];
                    bProp = isDate ? new Date(b[prop]) : b[prop];

                    if (aProp < bProp) {
                        return directionInt * -1;
                    } else if (bProp < aProp) {
                        return directionInt;
                    }

                    return 0;
                }),
            startPosition = page.skip + 1,
            endPosition = page.skip + Math.min(page.limit, campaigns.length);

        this.respond(200, campaigns)
            .setHeaders({
                'Content-Range': startPosition + '-' + endPosition + '/' + allCampaigns.length
            });
    });

    http.whenGET('/api/campaign/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('campaigns', id),
            campaign = grunt.file.exists(filePath) ? grunt.file.readJSON(filePath) : null;

        if (campaign) {
            this.respond(200, extend(campaign, { id: id }));
        } else {
            this.respond(404, 'NOT FOUND');
        }
    });

    http.whenPOST('/api/campaign', function(request) {
        var id = genId('c'),
            user = require('../auth/user_cache').user,
            currentTime = (new Date()).toISOString(),
            campaign = withAdtechIds(extend({
                miniReels: [],
                cards: [],
                targetMiniReels: []
            }, request.body, {
                created: currentTime,
                user: user.id,
                org: user.org,
                lastUpdated: currentTime
            }));

        grunt.file.write(objectPath('campaigns', id), JSON.stringify(campaign, null, '    '));

        this.respond(201, extend(campaign, { id: id }));
    });

    http.whenPUT('/api/campaign/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('campaigns', id),
            current = grunt.file.readJSON(filePath),
            campaign = withAdtechIds(extend(current, request.body, {
                lastUpdated: (new Date()).toISOString()
            }));

        grunt.file.write(filePath, JSON.stringify(campaign, null, '    '));

        this.respond(200, extend(campaign, {
            id: id
        }));
    });

    http.whenDELETE('/api/campaign/**', function(request) {
        grunt.file.delete(objectPath('campaigns', idFromPath(request.pathname)));

        this.respond(204, '');
    });
};