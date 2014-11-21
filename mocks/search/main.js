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
    ].join('').replace(/\.|,|;|:/g, '').toLowerCase().split(' '),
        videos = require('./videos.json');

    function randomNumberBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    function randomMember(array) {
        return array[Math.floor(Math.random() * array.length)];
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

    function makeRandomVideo(site, hd) {
        var video = randomMember(videos.filter(function(video) {
            return video.type === site;
        }));

        return {
            title: makeArray(randomNumberBetween(5, 10))
                .map(function() {
                    return randomMember(seed);
                })
                .map(capitalize)
                .join(' '),
            link: 'http://www.' + video.type + '.com/' + video.videoid + '.html',
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
            videoid: video.videoid,
            site: video.type,
            hd: hd,
            duration: site !== 'aol' ? randomNumberBetween(30, 300) : undefined
        };
    }

    http.whenGET('/api/search/videos', function(request) {
        var query = request.query.query,
            skip = parseInt(request.query.skip) || 0,
            limit = parseInt(request.query.limit) || 10,
            sites = request.query.sites ?
                request.query.sites.split(',') :
                ['youtube', 'vimeo', 'dailymotion'],
            hd = request.query.hd && (request.query.hd === 'true'),
            total = queryCache[query] || (queryCache[query] = randomNumberBetween(50, 1000));

        this.respond(200, {
            meta: {
                skipped: skip,
                numResults: limit,
                totalResults: total
            },
            items: makeArray(limit)
                .map(function() {
                    return makeRandomVideo(
                        randomMember(sites),
                        (hd !== undefined) ? hd : randomMember([true, false])
                    );
                })
        });
    });
};
