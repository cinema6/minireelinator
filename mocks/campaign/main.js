module.exports = function(http) {
    'use strict';

    var grunt = require('grunt'),
        path = require('path'),
        Q = require('q');

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

    function getCpv(campaign) {
        return [
            campaign.targeting.interests.length,
            campaign.targeting.geo.states.length || campaign.targeting.geo.dmas.length,
            campaign.targeting.demographics.age.length || campaign.targeting.demographics.income.length || campaign.targeting.demographics.gender.length
        ].filter(function(bool) {
            return !!bool;
        }).length * 0.1 + 0.5;
    }

    http.whenGET('/api/campaigns/schema', function(request) {
        var filePath = path.resolve(__dirname, './schema/schema.json');
        var json = grunt.file.readJSON(filePath);
        this.respond(200, json);
    });

    http.whenGET('/api/campaigns/**/updates/**', function(request) {
        var id = idFromPath(request.pathname);
        var filePath = path.resolve(__dirname, './updates/' + id + '.json');
        var json = grunt.file.readJSON(filePath);
        this.respond(200, extend(json, {
            id: id
        }));
    });

    http.whenGET('/api/campaigns/updates', function(request) {
        var allUpdates = grunt.file.expand(path.resolve(__dirname, './updates/*.json'))
            .map(function(path) {
                var id = path.match(/[^\/]+(?=\.json)/)[0];

                return extend(grunt.file.readJSON(path), { id: id });
            })
            .filter(function(update) {
                var ids = request.query.ids,
                    idsArray = (ids || '').split(',');

                return !ids || idsArray.indexOf(update.id) > -1;
            });

        this.respond(200, allUpdates);
    });

    http.whenPUT('/api/campaigns/**/updates/**', function(request) {
        var id = idFromPath(request.pathname),
            campaignId = request.pathname.match(/campaigns\/([\w+-]+)/)[1],
            campaign = grunt.file.readJSON(objectPath('campaigns', campaignId)),
            filePath = objectPath('updates', id),
            currentTime = (new Date()).toISOString(),
            current = grunt.file.readJSON(filePath),
            updateRequest = extend(current, request.body, {
                lastUpdated: currentTime
            });

        if (request.body.status === 'rejected') {
            if(!request.body.rejectionReason) {
                this.respond(400, 'Cannot reject update without a reason');
                return;
            }
            campaign.rejectionReason = request.body.rejectionReason;
            campaign.status = campaign.status === 'pending' ? 'draft' : campaign.status;
            delete campaign.updateRequest;
        } else {
            delete campaign.rejectionReason;
        }

        if (request.body.status === 'approved') {
            campaign = updateRequest.data;
            delete campaign.updateRequest;
            grunt.file.delete(objectPath('updates', id));
        }

        campaign.pricing.cost = getCpv(updateRequest.data);
        campaign.lastUpdated = currentTime;
        grunt.file.write(objectPath('campaigns', campaign.id), JSON.stringify(campaign, null, '    '));

        if (request.body.status !== 'approved') {
            grunt.file.write(filePath, JSON.stringify(updateRequest, null, '    '));
        }

        this.respond(200, extend(updateRequest, {
            id: id
        }));
    });

    http.whenPOST('/api/campaigns/**/updates', function(request) {
        var id = genId('ur'),
            campaign = grunt.file.readJSON(objectPath('campaigns', request.body.campaign)),
            user = require('../auth/user_cache').user,
            currentTime = (new Date()).toISOString(),
            updateRequest = extend({
                status: 'pending'
            }, request.body, {
                created: currentTime,
                user: user.id,
                org: user.org,
                lastUpdated: currentTime
            });

        if (request.body.data.paymentMethod !== campaign.paymentMethod) {
            campaign.paymentMethod = request.body.data.paymentMethod;
            updateRequest.status = 'approved';
        } else {
            campaign.updateRequest = id;
            campaign.status = campaign.status === 'draft' ? 'pending' : campaign.status;
        }

        campaign.lastUpdated = currentTime;
        delete campaign.rejectionReason;
        grunt.file.write(objectPath('campaigns', updateRequest.campaign), JSON.stringify(campaign, null, '    '));

        grunt.file.write(objectPath('updates', id), JSON.stringify(updateRequest, null, '    '));

        this.respond(201, Q.when(extend(updateRequest, { id: id })).delay(1000));
    });

    http.whenGET('/api/campaigns', function(request) {
        var filters = pluckExcept(request.query, ['sort', 'limit', 'skip', 'text', 'statuses', 'fields', 'ids','excludeOrgs','pendingUpdate']),
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
                            return !!filters[key].split(',').filter(function(val) {
                                return val === campaign[key];
                            })[0];
                        });
                })
                .filter(function(campaign) {
                    var ids = request.query.ids,
                        idArray = (ids || '').split(','),
                        id = campaign.id;

                    return !ids || idArray.indexOf(id) > -1;
                })
                .filter(function(campaign) {
                    var statuses = request.query.statuses,
                        statusArray = (statuses || '').split(','),
                        status = campaign.status;

                    return !statuses || statusArray.indexOf(status) > -1;
                })
                .filter(function(campaign) {
                    var text = request.query.text,
                        name = (campaign.name || '').toLowerCase(),
                        displayName = (campaign.advertiserDisplayName || '').toLowerCase();

                    return !text ||
                        (name.indexOf(text.toLowerCase()) > -1 ||
                        displayName.indexOf(text.toLowerCase()) > -1);
                })
                .filter(function(campaign) {
                    var exclusions = request.query.excludeOrgs,
                        exclusionsArray = (exclusions || '').split(','),
                        org = campaign.org;

                    return !exclusions || exclusionsArray.indexOf(org) === -1;
                })
                .filter(function(campaign) {
                    var pending = request.query.pendingUpdate;

                    return !pending || campaign.updateRequest;
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
                })
                .map(function(campaign) {
                    var fields = request.query.fields,
                        fieldsArray = (fields || '').split(',');

                    if (!fields) { return campaign; }

                    for (var key in campaign) {
                        if (fieldsArray.indexOf(key) === -1 && key !== 'id') {
                            delete campaign[key];
                        }
                    }

                    return campaign;
                }),
            startPosition = page.skip + 1,
            endPosition = page.skip + Math.min(page.limit, campaigns.length);

        if (request.query.limit !== '1') {
            // return this.respond(500, Q.when('NOT FOUND').delay(3000));
        }

        this.respond(200, Q.when(campaigns).delay(request.query.limit !== '1' ? 1000 : 0))
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
            cardId = genId('rc'),
            user = require('../auth/user_cache').user,
            currentTime = (new Date()).toISOString(),
            campaign = extend({
                miniReels: []
            }, request.body, {
                created: currentTime,
                user: user.id,
                org: user.org,
                lastUpdated: currentTime,
                status: 'draft'
            });

        var cpv = getCpv(campaign);

        if (campaign.cards[0]) {
            campaign.cards[0].id = cardId;
            campaign.cards[0].data.moat = {
                campaign: id,
                advertiser: campaign.advertiserId,
                creative: cardId
            };

            if (campaign.cards[0].type !== 'video') {
                campaign.cards[0].data.duration = Math.floor(Math.random() * (120 - 15)) + 15;
            }
        }

        if (campaign.pricing.budget) {
            campaign.pricing.cost = cpv;
        }

        grunt.file.write(objectPath('campaigns', id), JSON.stringify(campaign, null, '    '));

        this.respond(201, Q.when(extend(campaign, { id: id })).delay(2500));
    });

    http.whenPUT('/api/campaign/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('campaigns', id),
            current = grunt.file.readJSON(filePath),
            rejectFlag = current.rejectFlag,
            campaign = extend(current, request.body, {
                lastUpdated: (new Date()).toISOString()
            }),
            badDate = false;

        function handleDate(obj) {
            var now = new Date(),
                endDateTime;

            if (obj.endDate) {
                endDateTime = new Date(obj.endDate).getTime();
                if (endDateTime < now.getTime()) {
                    badDate = true;
                }
            } else {
                now.setYear(now.getFullYear() + 1);
                obj.endDate = now.toISOString();
            }
        }

        (campaign.miniReels || []).forEach(handleDate);
        (campaign.cards || []).forEach(handleDate);

        (campaign.cards || []).forEach(function(card) {
            if (!card.id) {
                card.id = genId('rc');
            }
        });

        if (badDate) {
            this.respond(400, 'BAD REQUEST');
            return;
        }

        if (campaign.name === 'Unauthorized') {
            if (!rejectFlag) {
                campaign.rejectFlag = true;
                rejectFlag = true;
            } else {
                campaign.rejectFlag = false;
                rejectFlag = false;
            }
        } else {
            delete campaign.rejectFlag;
        }

        var cpv = getCpv(campaign);

        if (campaign.pricing.budget) {
            campaign.pricing.cost = cpv;
        }

        grunt.file.write(filePath, JSON.stringify(campaign, null, '    '));

        if (campaign.name === 'fail') {
            return this.respond(500, Q.when('server error').delay(1000));
        }
        if (rejectFlag) {
            return this.respond(401, Q.when('Not Authorized').delay(1000));
        }

        if (!campaign.cards[0].data.duration && campaign.cards[0].type !== 'video') {
            campaign.cards[0].data.duration = Math.floor(Math.random() * (120 - 15)) + 15;
        }

        this.respond(200, Q.when(extend(campaign, {
            id: id
        })).delay(2000));
    });

    http.whenDELETE('/api/campaign/**', function(request) {
        grunt.file.delete(objectPath('campaigns', idFromPath(request.pathname)));

        this.respond(204, '');
    });
};
