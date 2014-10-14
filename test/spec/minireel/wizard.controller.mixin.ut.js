define(['app','minireel/mixins/WizardController'], function(appModule, WizardController) {
    'use strict';

    describe('WizardController mixin', function() {
        var c6State,
            $timeout,
            WizardCtrl;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                c6State = $injector.get('c6State');
                $timeout = $injector.get('$timeout');

                WizardCtrl = $injector.instantiate(WizardController);
            });

            spyOn(c6State, 'goTo');
        });

        it('should exist', function() {
            expect(WizardCtrl).toEqual(jasmine.any(Object));
        });

        describe('in the next tick', function() {
            beforeEach(function() {
                WizardCtrl.tabs = [
                    {
                        name: 'Tab 1',
                        sref: 'Tab1'
                    }
                ];
                $timeout.flush();
            });

            it('should redirect to its first tab', function() {
                expect(c6State.goTo).toHaveBeenCalledWith(WizardCtrl.tabs[0].sref, null, null, true);
            });
        });

        describe('properties', function() {
            describe('tabs', function() {
                it('should be an empty array', function() {
                    expect(WizardCtrl.tabs).toEqual([]);
                });
            });

            describe('currentTab', function() {
                function setState(stateName) {
                    c6State.isActive.and.callFake(function(state) {
                        return state.cName === stateName;
                    });
                }

                beforeEach(function() {
                    spyOn(c6State, 'isActive').and.returnValue(false);
                    spyOn(c6State, 'get').and.callFake(function(name) {
                        return {
                            cName: name
                        };
                    });

                    WizardCtrl.tabs = [
                        {
                            name: 'Tab 1',
                            sref: 'Tab1'
                        },
                        {
                            name: 'Tab 2',
                            sref: 'Tab2'
                        },
                        {
                            name: 'Tab 3',
                            sref: 'Tab3'
                        }
                    ];
                });

                describe('if there is not tab for the current state', function() {
                    it('should be null', function() {
                        ['NotTab', 'AlsoNotTab', 'HAI'].forEach(function(state) {
                            setState(state);
                            expect(WizardCtrl.currentTab).toBeNull();
                        });
                    });
                });

                describe('if there is a tab for the current state', function() {
                    it('should be that tab', function() {
                        expect(WizardCtrl.tabs.length).toBeGreaterThan(0);

                        WizardCtrl.tabs.forEach(function(tab) {
                            setState(tab.sref);
                            expect(WizardCtrl.currentTab).toBe(tab);
                        });
                    });
                });
            });
        });
    });
});
