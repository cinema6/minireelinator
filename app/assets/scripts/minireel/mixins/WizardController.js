define ([],
function() {
    'use strict';

    WizardController.$inject = ['c6State','$timeout'];
    function WizardController  ( c6State , $timeout ) {
        var self = this;

        this.tabs = [];
        Object.defineProperties(this, {
            currentTab: {
                enumerable: true,
                configurable: true,
                get: function() {
                    return this.tabs[this.tabs.map(function(tab) {
                        return c6State.isActive(c6State.get(tab.sref));
                    }).indexOf(true)] || null;
                }
            }
        });

        $timeout(function() {
            c6State.goTo(self.tabs[0].sref, null, null, true);
        });
    }

    return WizardController;
});
