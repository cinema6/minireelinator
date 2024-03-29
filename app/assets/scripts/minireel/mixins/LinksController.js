define (['angular'],
function( angular ) {
    'use strict';

    var copy = angular.copy;

    function findIndex(array, predicate) {
        var length = array.length;
        var index = 0;

        for ( ; index < length; index++) {
            if (predicate(array[index])) {
                return index;
            }
        }

        return -1;
    }

    LinksController.$inject = ['$scope'];
    function LinksController  ( $scope ) {
        var self = this;

        function Link() {
            this.name = 'Untitled';
            this.href = null;
        }

        function save() {
            return self.save();
        }

        this.newLink = new Link();

        this.initWithModel = function(links) {
            this.model = links;

            this.links = ['Action', 'Website', 'Facebook', 'Twitter', 'Pinterest', 'YouTube']
                .concat(Object.keys(links))
                .filter(function(name, index, names) {
                    return names.indexOf(name) === index;
                })
                .map(function(name) {
                    var href = links[name] || null;

                    return {
                        name: name,
                        href: href
                    };
                });
        };

        this.save = function() {
            /* jshint boss:true */
            return copy(this.links.reduce(function(links, link) {
                if (link.href) {
                    links[link.name] = link.href;
                }

                return links;
            }, {}), this.model);
        };

        this.push = function() {
            var currentIndex = findIndex(this.links, function(link) {
                return link.name === self.newLink.name;
            });

            if (currentIndex < 0) {
                this.links = this.links.concat([this.newLink]);
            } else {
                this.links[currentIndex] = this.newLink;
            }

            /* jshint boss:true */
            return (this.newLink = new Link());
        };

        this.remove = function(link) {
            /* jshint boss:true */
            return (this.links = this.links.filter(function(item) {
                return item !== link;
            }));
        };

        $scope.$on('CampaignCtrl:campaignWillSave', save);
        $scope.$on('$destroy', save);
    }

    return LinksController;
});
