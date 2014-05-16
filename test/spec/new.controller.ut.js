(function() {
    'use strict';

    define(['manager'], function() {
        describe('NewController', function() {
            var $rootScope,
                $scope,
                $controller,
                NewCtrl;

            var model,
                minireel;

            beforeEach(function() {
                minireel = {
                    data: {
                        title: 'Awesome Videos, Brah!',
                        mode: 'full',
                        autoplay: false
                    }
                };

                model = {
                    modes: [
                        /* jshint quotmark:false */
                        {
                            "value": "lightbox",
                            "modes": [
                                {
                                    "value": "lightbox",
                                    "autoplayable": true
                                },
                                {
                                    "value": "lightbox-ads",
                                    "autoplayable": true
                                }
                            ]
                        },
                        {
                            "value": "inline",
                            "modes": [
                                {
                                    "value": "light",
                                    "autoplayable": true
                                },
                                {
                                    "value": "full",
                                    "autoplayable": false
                                }
                            ]
                        }
                        /* jshint quotmark:single */
                    ],
                    minireel: minireel
                };

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');

                    $scope = $rootScope.$new();
                    $scope.$apply(function() {
                        NewCtrl = $controller('NewController', { $scope: $scope, cModel: model });
                        NewCtrl.model = model;
                    });
                });
            });

            it('should exist', function() {
                expect(NewCtrl).toEqual(jasmine.any(Object));
            });

            describe('properties', function() {
                describe('category', function() {
                    it('should be the category of the MiniReel', function() {
                        expect(NewCtrl.category).toBe(model.modes[1]);
                    });
                });

                describe('mode', function() {
                    it('should be the mode config of the minireel', function() {
                        expect(NewCtrl.mode).toBe(model.modes[1].modes[1]);
                    });
                });

                describe('autoplay', function() {
                    it('should be the autoplay value of the minireel', function() {
                        expect(NewCtrl.autoplay).toBe(minireel.data.autoplay);
                    });
                });

                describe('title', function() {
                    it('should be the title value of the minireel', function() {
                        expect(NewCtrl.title).toBe(minireel.data.title);
                    });
                });
            });

            describe('save()', function() {
                beforeEach(function() {
                    NewCtrl.mode = model.modes[0].modes[0];
                    NewCtrl.autoplay = true;
                    NewCtrl.title = 'Sweet!';

                    NewCtrl.save();
                });

                ['title', 'autoplay'].forEach(function(prop) {
                    it('should copy the ' + prop + ' setting to the minireel', function() {
                        expect(minireel.data[prop]).toBe(NewCtrl[prop]);
                    });
                });

                it('should copy the mode to the minreel', function() {
                    expect(minireel.data.mode).toBe(NewCtrl.mode.value);
                });
            });

            describe('$watchers', function() {
                describe('this.category', function() {
                    it('should set the mode to be the first in the category', function() {
                        $scope.$apply(function() {
                            NewCtrl.category = model.modes[0];
                        });
                        expect(NewCtrl.mode).toBe(model.modes[0].modes[0]);

                        $scope.$apply(function() {
                            NewCtrl.category = model.modes[1];
                        });
                        expect(NewCtrl.mode).toBe(model.modes[1].modes[0]);
                    });
                });

                describe('this.mode', function() {
                    describe('when switching to a non-autoplayable mode', function() {
                        beforeEach(function() {
                            $scope.$apply(function() {
                                minireel.data.autoplay = true;
                                NewCtrl.autoplay = true;
                                NewCtrl.mode = model.modes[0].modes[0];
                            });

                            $scope.$apply(function() {
                                NewCtrl.mode = model.modes[1].modes[1];
                            });
                        });

                        it('should set this.autoplay to false', function() {
                            expect(NewCtrl.autoplay).toBe(false);
                        });
                    });

                    describe('when switching to an autoplayable mode', function() {
                        describe('if the minireel is set to autoplay', function() {
                            beforeEach(function() {
                                minireel.data.autoplay = true;

                                $scope.$apply(function() {
                                    NewCtrl.mode = model.modes[0].modes[0];
                                });
                            });

                            it('should set this.autoplay to true', function() {
                                expect(NewCtrl.autoplay).toBe(true);
                            });
                        });

                        describe('if the minireel is set not to autoplay', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    NewCtrl.mode = model.modes[0].modes[0];
                                });
                            });

                            it('should not change the autoplay property', function() {
                                expect(NewCtrl.autoplay).toBe(false);
                            });
                        });
                    });
                });
            });
        });
    });
}());
