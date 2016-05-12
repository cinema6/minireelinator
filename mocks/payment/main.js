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

    function randomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function makeDefault(id) {
        grunt.file.expand(path.resolve(__dirname, './methods/*.json'))
            .filter(function(path) {
                return path.indexOf(id) === -1;
            })
            .map(function(path) {
                return grunt.file.readJSON(path);
            })
            .map(function(method) {
                method.default = false;

                grunt.file.write(objectPath('methods', method.token), JSON.stringify(method, null, '    '));
            });
    }

    function getAllCredit() {
        return grunt.file.expand(path.resolve(__dirname, './payments/*.json'))
            .map(function(path) {
                return grunt.file.readJSON(path);
            })
            .filter(function(transaction) {
                return transaction.type === 'credit';
            })
            .reduce(function(result, payment) {
                return result + (payment.amount || 0);
            }, 0);
    }

    function getTotalCampaignBudget() {
        var noUpdateRequestTotal = grunt.file.expand(path.resolve(__dirname, '../campaign/campaigns/*.json'))
                .map(function(path) {
                    return grunt.file.readJSON(path);
                })
                .reduce(function(result, campaign) {
                    if ((/active|paused|error|pending/).test(campaign.status) && !campaign.updateRequest) {
                        return result + campaign.pricing.budget;
                    }
                    return result;
                }, 0);
        var updateRequestTotal = grunt.file.expand(path.resolve(__dirname, '../campaign/updates/*.json'))
                .map(function(path) {
                    return grunt.file.readJSON(path);
                })
                .reduce(function(result, updateRequest) {
                    if ((/active|paused|error|pending/).test(updateRequest.data.status)) {
                        return result + ((updateRequest.data && updateRequest.data.pricing && updateRequest.data.pricing.budget) || 0);
                    }
                    return result;
                }, 0);

        return noUpdateRequestTotal + updateRequestTotal;
    }

    http.whenPOST('/api/accounting/credit-check', function(request) {
        var totalCredit = getAllCredit(),
            totalBudget = getTotalCampaignBudget(),
            campaign, updateRequest, budgetChange, spent, deficit;

        if (!request.body.org || !request.body.campaign) {
            return this.respond(400, 'Bad request');
        }

        campaign = grunt.file.readJSON(
            path.resolve(__dirname, '../campaign/campaigns/' + request.body.campaign + '.json')
        );

        budgetChange = (request.body.newBudget || campaign.pricing.budget) - campaign.pricing.budget;

        if (campaign.updateRequest) {
            updateRequest = grunt.file.readJSON(
                path.resolve(__dirname, '../campaign/updates/' + campaign.updateRequest + '.json')
            );

            budgetChange = (request.body.newBudget || updateRequest.data.pricing.budget) - updateRequest.data.pricing.budget;
        }

        if ((/canceled|expired/).test(campaign.status)) {
            spent = Math.floor(Math.random() * campaign.pricing.budget);
        } else {
            spent = (/draft|pending|active|paused/).test(campaign.status) ? 0 : campaign.pricing.budget;
        }

        deficit = (totalBudget + budgetChange - spent) - totalCredit;

        if (deficit > 0) {
            return this.respond(402, {
                message: 'Insufficient funds for campaign',
                depositAmount: (Math.round(Math.abs(deficit)*100)/100)
            });
        }

        return this.respond(200, 'Success, ' + totalBudget + ', ' + budgetChange + ', ' + spent + ', ' + totalCredit);
    });

    http.whenGET('/api/accounting/balance', function(request) {
        return this.respond(200, Q.when({
            balance: getAllCredit(),
            outstandingBudget: getTotalCampaignBudget(),
            totalSpend: 567.87
        }).delay(1000));
    });

    http.whenPOST('/api/payments', function(request) {
        var id = genId('trans'),
            transId = genId('t'),
            user = require('../auth/user_cache').user,
            currentTime = (new Date()).toISOString(),
            method = grunt.file.expand(path.resolve(__dirname, './methods/*.json'))
                .map(function(path) {
                    return grunt.file.readJSON(path);
                })
                .filter(function(method) {
                    return request.body.paymentMethod === method.token;
                })[0],
            payment = {
                createdAt: currentTime,
                updatedAt: currentTime,
                method: method,
                amount: request.body.amount,
                type: 'credit',
                status: 'settled'
            },
            transaction = {
                id: transId,
                created: currentTime,
                transactionTS: currentTime,
                braintreeId: id,
                amount: request.body.amount,
                org: user.org,
                sign: 1,
                units: 1
            };

            if (!method || !request.body.amount || request.body.amount < 1) {
                return this.respond(400, 'Bad request');
            }

            grunt.file.write(objectPath('payments', id), JSON.stringify(payment, null, '    '));
            grunt.file.write(objectPath('transactions', transId), JSON.stringify(transaction, null, '    '));

            this.respond(200, Q.when(extend(payment, {id: id})).delay(1000));
    });

    http.whenGET('/api/payments/clientToken', function(request) {
        var token = 'eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiJ'+
            'mZTA4YmFlODE2ZTY4NjhhOWRjNWQ5ZGI4YmY5YzNmMTczZDA2NjdlM2UzY2ZmOD'+
            'UzMjMzMmViYjIyZTRlOTNjfGNyZWF0ZWRfYXQ9MjAxNS0xMC0xNVQxOTozOTo1M'+
            'y4yOTAwMDA0MzYrMDAwMFx1MDAyNm1lcmNoYW50X2lkPXp0cnBoY2YyODNieGdu'+
            'MmZcdTAwMjZwdWJsaWNfa2V5PXJ6MnBodDdneW42ZDI2NmIiLCJjb25maWdVcmw'+
            'iOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My'+
            '9tZXJjaGFudHMvenRycGhjZjI4M2J4Z24yZi9jbGllbnRfYXBpL3YxL2NvbmZpZ'+
            '3VyYXRpb24iLCJjaGFsbGVuZ2VzIjpbImN2diIsInBvc3RhbF9jb2RlIl0sImVu'+
            'dmlyb25tZW50Ijoic2FuZGJveCIsImNsaWVudEFwaVVybCI6Imh0dHBzOi8vYXB'+
            'pLnNhbmRib3guYnJhaW50cmVlZ2F0ZXdheS5jb206NDQzL21lcmNoYW50cy96dH'+
            'JwaGNmMjgzYnhnbjJmL2NsaWVudF9hcGkiLCJhc3NldHNVcmwiOiJodHRwczovL'+
            '2Fzc2V0cy5icmFpbnRyZWVnYXRld2F5LmNvbSIsImF1dGhVcmwiOiJodHRwczov'+
            'L2F1dGgudmVubW8uc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbSIsImFuYWx'+
            '5dGljcyI6eyJ1cmwiOiJodHRwczovL2NsaWVudC1hbmFseXRpY3Muc2FuZGJveC'+
            '5icmFpbnRyZWVnYXRld2F5LmNvbSJ9LCJ0aHJlZURTZWN1cmVFbmFibGVkIjpmY'+
            'WxzZSwicGF5cGFsRW5hYmxlZCI6dHJ1ZSwicGF5cGFsIjp7ImRpc3BsYXlOYW1l'+
            'IjoiQ2luZW1hNiIsImNsaWVudElkIjpudWxsLCJwcml2YWN5VXJsIjoiaHR0cDo'+
            'vL2V4YW1wbGUuY29tL3BwIiwidXNlckFncmVlbWVudFVybCI6Imh0dHA6Ly9leG'+
            'FtcGxlLmNvbS90b3MiLCJiYXNlVXJsIjoiaHR0cHM6Ly9hc3NldHMuYnJhaW50c'+
            'mVlZ2F0ZXdheS5jb20iLCJhc3NldHNVcmwiOiJodHRwczovL2NoZWNrb3V0LnBh'+
            'eXBhbC5jb20iLCJkaXJlY3RCYXNlVXJsIjpudWxsLCJhbGxvd0h0dHAiOnRydWU'+
            'sImVudmlyb25tZW50Tm9OZXR3b3JrIjp0cnVlLCJlbnZpcm9ubWVudCI6Im9mZm'+
            'xpbmUiLCJ1bnZldHRlZE1lcmNoYW50IjpmYWxzZSwiYnJhaW50cmVlQ2xpZW50S'+
            'WQiOiJtYXN0ZXJjbGllbnQzIiwiYmlsbGluZ0FncmVlbWVudHNFbmFibGVkIjpm'+
            'YWxzZSwibWVyY2hhbnRBY2NvdW50SWQiOiJjaW5lbWE2IiwiY3VycmVuY3lJc29'+
            'Db2RlIjoiVVNEIn0sImNvaW5iYXNlRW5hYmxlZCI6ZmFsc2UsIm1lcmNoYW50SW'+
            'QiOiJ6dHJwaGNmMjgzYnhnbjJmIiwidmVubW8iOiJvZmYifQ==';

        this.respond(200, Q.when({ clientToken: token }).delay(1000) );
    });

    http.whenPOST('/api/payments/methods', function(request) {
        var token = genId('pay'),
            // type = ['creditCard', 'paypal'][randomNum(0,1)],
            type = 'creditCard',
            allPayments = grunt.file.expand(path.resolve(__dirname, './methods/*.json')),
            currentTime = (new Date()).toISOString(),
            paymentMethod = {
                token: token,
                createdAt: currentTime,
                updatedAt: currentTime,
                imageUrl: null,
                default: request.body.makeDefault || !allPayments.length,
                type: type
            };

        if (!request.body.paymentMethodNonce) {
            return this.respond(403, 'Forbidden');
        }

        paymentMethod = extend(paymentMethod, (type === 'creditCard' ? {
            cardType: ['Visa','AmEx'][randomNum(0,1)],
            cardholderName: request.body.cardholderName,
            expirationDate: '11/2019',
            last4: randomNum(1000,9999)
        } : {
            email: 'selfie' + randomNum(100,999) + '@' + ['gmail','aol','cinema6'][randomNum(0,2)] + '.com'
        }));

        if (paymentMethod.default) {
            makeDefault(token);
        }

        grunt.file.write(objectPath('methods', token), JSON.stringify(paymentMethod, null, '    '));

        this.respond(201, paymentMethod);
    });

    http.whenGET('/api/payments/methods', function(request) {
        var filters = pluckExcept(request.query, ['sort', 'limit', 'skip', 'text', 'statuses', 'fields', 'ids']),
            allPayments = grunt.file.expand(path.resolve(__dirname, './methods/*.json'))
            .map(function(path) {
                return grunt.file.readJSON(path);
            })
            .filter(function(method) {
                return Object.keys(filters)
                    .every(function(key) {
                        return !!filters[key].split(',').filter(function(val) {
                            return val === method[key];
                        })[0];
                    });
            });

        this.respond(200, allPayments);
    });

    http.whenPUT('/api/payments/methods/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('methods', id),
            payment = grunt.file.readJSON(filePath),
            propCount = 0;

        for (var prop in request.body) {
            propCount++;
        }

        if (!request.body.paymentMethodNonce && propCount > 1) {
            return this.respond(403, 'Forbidden');
        }

        if (request.body.cardholderName) {
            payment.cardholderName = request.body.cardholderName;
        }

        if (request.body.makeDefault) {
            makeDefault(id);
        }

        payment.default = payment.default || request.body.makeDefault;
        payment.updatedAt = (new Date()).toISOString();

        grunt.file.write(filePath, JSON.stringify(payment, null, '    '));

        this.respond(200, payment);
    });

    http.whenDELETE('/api/payments/methods/**', function(request) {
        var id = idFromPath(request.pathname),
            filePath = objectPath('methods', id),
            payment = grunt.file.readJSON(filePath),
            allCampaigns = grunt.file.expand(path.resolve(__dirname, '../campaign/campaigns/*.json'))
                .map(function(path) {
                    return grunt.file.readJSON(path);
                })
                .filter(function(campaign) {
                    return campaign.paymentMethod === payment.token;
                });

        if (allCampaigns.length) {
            return this.respond(403, 'Forbidden');
        }

        grunt.file.delete(objectPath('methods', idFromPath(request.pathname)));

        this.respond(204, '');
    });

    http.whenGET('/api/payments', function(request) {
        var allTransactions = grunt.file.expand(path.resolve(__dirname, './payments/*.json'))
            .map(function(path) {
                var id = path.match(/[^\/]+(?=\.json)/)[0];

                return extend(grunt.file.readJSON(path), { id: id });
            });

        this.respond(200, allTransactions);
    });

    http.whenGET('/api/transactions', function(request) {
        var filters = pluckExcept(request.query, ['sort','limit','skip','fields']),
            page = withDefaults(mapObject(pluck(request.query, ['limit','skip']), parseFloat), {
                limit: Infinity,
                skip: 0
            }),
            sort = (request.query.sort || null) && request.query.sort.split(','),
            allTransactions = grunt.file.expand(path.resolve(__dirname, './transactions/*.json'))
                .map(function(path) {
                    var id = path.match(/[^\/]+(?=\.json)/)[0];

                    return extend(grunt.file.readJSON(path), { id: id });
                })
                .filter(function(transaction) {
                    return Object.keys(filters)
                        .every(function(key) {
                            return !!filters[key].split(',').filter(function(val) {
                                return val === transaction[key];
                            })[0];
                        });
                })
                .filter(function(transaction) {
                    var ids = request.query.ids,
                        idArray = (ids || '').split(','),
                        id = transaction.id;

                    return !ids || idArray.indexOf(id) > -1;
                }),
            transactions = allTransactions
                .filter(function(transaction, index) {
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
                .map(function(transaction) {
                    var fields = request.query.fields,
                        fieldsArray = (fields || '').split(',');

                    if (!fields) { return transaction; }

                    for (var key in transaction) {
                        if (fieldsArray.indexOf(key) === -1 && key !== 'id') {
                            delete transaction[key];
                        }
                    }

                    return transaction;
                }),
            startPosition = page.skip + 1,
            endPosition = page.skip + Math.min(page.limit, transactions.length);

        return this.respond(200, Q.when(transactions).delay(request.query.limit !== '1' ? 1000 : 0))
            .setHeaders({
                'Content-Range': startPosition + '-' + endPosition + '/' + allTransactions.length
            });
    });
};
