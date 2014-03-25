(function() {
    'use strict';

    define(['editor'], function() {
        describe('EditCardController', function() {
            var $rootScope,
                $scope,
                $controller,
                c6State,
                EditCardCtrl;

            var model;

            beforeEach(function() {
                model = {
                    data: {
                        service: 'youtube',
                        videoid: 'gy1B3agGNxw'
                    }
                };

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $controller = $injector.get('$controller');
                    c6State = $injector.get('c6State');

                    $scope = $rootScope.$new();
                    EditCardCtrl = $controller('EditCardController', { $scope: $scope, cModel: model });
                    $scope.EditCardCtrl = EditCardCtrl;
                });

                spyOn(c6State, 'transitionTo');
            });

            it('should exist', function() {
                expect(EditCardCtrl).toEqual(jasmine.any(Object));
            });

            describe('initialization', function() {
                it('should put a reference to the model on itself', function() {
                    expect(EditCardCtrl.model).toBe(model);
                });
            });

            describe('methods', function() {
                describe('close()', function() {
                    beforeEach(function() {
                        $scope.EditorCtrl = {
                            model: {
                                id: 'e-0aee6dfbdc2786'
                            }
                        };

                        EditCardCtrl.close();
                    });

                    it('should transition back to the editor state', function() {
                        expect(c6State.transitionTo).toHaveBeenCalledWith('editor', { id: 'e-0aee6dfbdc2786' });
                    });
                });
            });

            describe('properties', function() {
                describe('videoUrl', function() {
                    describe('getting', function() {
                        it('should use the service and videoid to formulate a url for the video', function() {
                            expect(EditCardCtrl.videoUrl).toBe('https://www.youtube.com/watch?v=gy1B3agGNxw');

                            $scope.$apply(function() {
                                model.data.service = 'vimeo';
                                model.data.videoid = '89203931';
                            });
                            expect(EditCardCtrl.videoUrl).toBe('http://vimeo.com/89203931');

                            $scope.$apply(function() {
                                model.data.service = 'dailymotion';
                                model.data.videoid = 'x17nw7w';
                            });
                            expect(EditCardCtrl.videoUrl).toBe('http://www.dailymotion.com/video/x17nw7w');
                        });
                    });

                    describe('setting', function() {
                        it('should parse the service and videoid', function() {
                            EditCardCtrl.videoUrl = 'https://www.youtube.com/watch?v=jFJUz1DO20Q&list=PLFD1E8B0910A73A12&index=11';
                            expect(model.data.service).toBe('youtube');
                            expect(model.data.videoid).toBe('jFJUz1DO20Q');

                            EditCardCtrl.videoUrl = 'http://vimeo.com/89495751';
                            expect(model.data.service).toBe('vimeo');
                            expect(model.data.videoid).toBe('89495751');

                            EditCardCtrl.videoUrl = 'http://www.dailymotion.com/video/x120oui_vincent-and-the-doctor-vincent-van-gogh-visits-the-museum-doctor-who-museum-scene_shortfilms?search_algo=2';
                            expect(model.data.service).toBe('dailymotion');
                            expect(model.data.videoid).toBe('x120oui');
                        });

                        it('should not freak out when getting a mangled url', function() {
                            expect(function() {
                                $scope.$apply(function() {
                                    EditCardCtrl.videoUrl = 'apple.com';
                                });
                            }).not.toThrow();
                            expect(EditCardCtrl.videoUrl).toBe('apple.com');
                            expect(model.data.service).toBeNull();

                            expect(function() {
                                $scope.$apply(function() {
                                    EditCardCtrl.videoUrl = '84fh439#';
                                });
                            }).not.toThrow();
                            expect(EditCardCtrl.videoUrl).toBe('84fh439#');
                            expect(model.data.service).toBeNull();

                            expect(function() {
                                $scope.$apply(function() {
                                    EditCardCtrl.videoUrl = 'http://www.youtube.com/';
                                });
                            }).not.toThrow();
                            expect(model.data.service).toBeNull();
                            expect(EditCardCtrl.videoUrl).toBe('http://www.youtube.com/');

                            expect(function() {
                                $scope.$apply(function() {
                                    EditCardCtrl.videoUrl = 'http://www.vimeo.com/';
                                });
                            }).not.toThrow();
                            expect(model.data.service).toBeNull();
                            expect(EditCardCtrl.videoUrl).toBe('http://www.vimeo.com/');

                            expect(function() {
                                $scope.$apply(function() {
                                    EditCardCtrl.videoUrl = 'http://www.dailymotion.com/';
                                });
                            }).not.toThrow();
                            expect(model.data.service).toBeNull();
                            expect(EditCardCtrl.videoUrl).toBe('http://www.dailymotion.com/');

                            expect(function() {
                                $scope.$apply(function() {
                                    EditCardCtrl.videoUrl = 'http://www.youtube.c';
                                });
                            }).not.toThrow();
                            expect(model.data.service).toBeNull();
                        });
                    });
                });
            });
        });
    });
}());
