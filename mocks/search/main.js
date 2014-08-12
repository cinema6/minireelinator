module.exports = function(http) {
    'use strict';

    var queryCache = require('./query_cache');

    var seed = [
        'Here\'s to the crazy ones. The misfits. The rebels. The troublemakers. The round pegs ',
        'in the square holes. The ones who see things differently. They\'re not fond of rules. ',
        'And they have no respect for the status quo. You can quote them, disagree with them, ',
        'glorify or vilify them. About the only thing you can\'t do is ignore them. Because they',
        ' change things. They push the human race forward. And while some may see them as the ',
        'crazy ones, we see genius. Because the people who are crazy enough to think they can ',
        'change the world, are the ones who do.'
    ].join('').replace(/\.|,|;|:/g, '').toLowerCase().split(' ');

    function randomNumberBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function randomMember(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function randomString() {
        return Math.random().toString(34).slice(2);
    }

    function makeArray(length) {
        var array = [];

        while (length--) {
            array[length] = length;
        }

        return array;
    }

    function capitalize(string) {
        return string.slice(0, 1).toUpperCase() + string.slice(1);
    }

    function makeRandomVideo() {
        var id = randomString().slice(20),
            service = randomMember(['youtube', 'vimeo', 'dailymotion']);

        return {
            title: makeArray(randomNumberBetween(5, 10))
                .map(function() {
                    return randomMember(seed);
                })
                .map(capitalize)
                .join(' '),
            link: 'http://www.' + service + '.com/' + id + '.html',
            description: capitalize(makeArray(randomNumberBetween(10, 20))
                .map(function() {
                    return randomMember(seed);
                })
                .join(' ')) + '.',
            thumbnail: {
                src: 'http://lorempixel.com/300/200/',
                width: 300,
                height: 200
            },
            videoid: id,
            type: service,
            hd: randomMember([true, false]),
            duration: randomNumberBetween(30, 300)
        };
    }

    http.whenGET('/api/search/videos', function(request) {
        var query = request.query.query,
            skip = request.query.skip || 0,
            limit = request.query.limit || 10,
            total = queryCache[query] || (queryCache[query] = randomNumberBetween(50, 1000));

        this.respond(200, {
            meta: {
                skipped: skip,
                numResults: limit,
                totalResults: total
            },
            items: makeArray(limit)
                .map(makeRandomVideo)
        });
    });
};
