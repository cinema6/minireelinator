define (['angular'],
function( angular ) {
    'use strict';

    var equals = angular.equals;

    MiniReelListController.$inject = ['$scope','cState','MiniReelService','c6State'];
    function MiniReelListController  ( $scope , cState , MiniReelService , c6State ) {
        var self = this,
            MiniReelCtrl = $scope.MiniReelCtrl,
            miniReelState = c6State.get('MiniReel');

        function isSame(prop, obj1, obj2) {
            return obj1[prop] === obj2[prop];
        }

        function value(val) {
            return function() {
                return val;
            };
        }

        function juxtapose() {
            var args = Array.prototype.slice.call(arguments),
                longestArray = args.reduce(function(result, array) {
                    return array.length > result.length ? array : result;
                });

            return longestArray.map(function(value, index) {
                return args.map(function(array) {
                    return array[index];
                });
            });
        }

        function DropDownModel() {
            this.shown = false;
        }
        DropDownModel.prototype = {
            show: function() {
                this.shown = true;
            },
            hide: function() {
                this.shown = false;
            },
            toggle: function() {
                this.shown = !this.shown;
            }
        };

        this.filter = cState.filter;
        this.limit = cState.limit;
        this.page = cState.page;
        this.dropDowns = {
            select: new DropDownModel()
        };
        this.limits = [20, 50, 100];
        Object.defineProperties(this, {
            allAreSelected: {
                get: function() {
                    return this.areAllSelected();
                },
                set: function(bool) {
                    return bool ? this.selectAll() : this.selectNone();
                }
            }
        });

        this.refetchMiniReels = function(fromStart) {
            self.model = miniReelState.getMiniReelList(
                self.filter,
                self.limit,
                fromStart ? 1 : self.page,
                self.model
            );
        };

        this.selectAll = function() {
            this.model.selected = this.model.value
                .map(value(true));
        };

        this.selectNone = function() {
            this.model.selected = this.model.value
                .map(value(false));
        };

        this.selectAllWithStatus = function(status) {
            this.model.selected = this.model.value
                .map(function(minireel) {
                    return minireel.status === status;
                });
        };

        this.getSelected = function(status) {
            return juxtapose(this.model.selected, this.model.value)
                .filter(function(pair) {
                    return pair[0] && (status ? pair[1].status === status : true);
                })
                .map(function(pair) {
                    return pair[1];
                });
        };

        this.areAllSelected = function(status) {
            return juxtapose(this.model.selected, this.model.value)
                .filter(function(pair) {
                    return status ? (pair[1].status === status) : true;
                })
                .map(function(pair) {
                    return pair[0];
                })
                .indexOf(false) < 0;
        };

        this.previewUrlOf = function(minireel) {
            return MiniReelService.previewUrlOf(minireel, '/#/preview/minireel');
        };

        this.modeNameFor = function(minireel) {
            return MiniReelService.modeDataOf(
                minireel,
                MiniReelCtrl.model.data.modes
            ).name;
        };

        $scope.$watchCollection(
            function() {
                return [
                    self.page,
                    self.limit,
                    self.filter
                ];
            },
            function(props, prevProps) {
                var samePage = isSame(0, props, prevProps);

                if (equals(props, prevProps)) { return; }

                if (self.page !== 1 && samePage) {
                    /* jshint boss:true */
                    return self.page = 1;
                    /* jshint boss:false */
                }

                return self.refetchMiniReels(samePage);
            }
        );

        $scope.$on('$destroy', function() {
            cState.filter = self.filter;
        });
    }

    return MiniReelListController;
});
