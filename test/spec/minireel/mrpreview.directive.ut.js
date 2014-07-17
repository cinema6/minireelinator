(function() {
    'use strict';

    define(['minireel/editor'], function(editorModule) {
        describe('<mr-preview>', function() {
            var $rootScope,
                $scope,
                $compile,
                postMessage,
                experience,
                $sce,
                $preview,
                scope;

            var $sandbox,
                session;

            beforeEach(function() {
                experience = {
                    id: 'foo',
                    data: {
                        deck: [
                            {
                                id: '1'
                            },
                            {
                                id: '2'
                            },
                            {
                                id: '3'
                            }
                        ]
                    }
                };

                module('c6.ui', function($provide) {
                    $provide.decorator('postMessage', function($delegate) {
                        var createSession = $delegate.createSession;

                        spyOn($delegate, 'createSession').and.callFake(function() {
                            /* jshint boss:true */
                            return session = createSession.apply($delegate, arguments);
                        });

                        return $delegate;
                    });
                });

                module(editorModule.name);

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');
                    $compile = $injector.get('$compile');
                    postMessage = $injector.get('postMessage');
                    $sce = $injector.get('$sce');

                    $scope = $rootScope.$new();
                });

                $sandbox = $('<div>');
                $('body').append($sandbox);

                $scope.src = null;
                $scope.exp = null;

                $scope.$apply(function() {
                    $preview = $('<mr-preview src="{{src}}" experience="exp"></mr-preview>');
                    $sandbox.append($preview);
                    $compile($preview)($scope);
                });
                scope = $preview.isolateScope();
                spyOn(scope, '$emit').and.callThrough();
                spyOn(postMessage, 'destroySession').and.callThrough();
            });

            afterEach(function() {
                $sandbox.remove();
            });

            describe('with no provided experience or src', function() {
                it('should not insert an iframe', function() {
                    expect($preview.find('iframe').length).toBe(0);
                });
            });

            describe('with a src but no experience', function() {
                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.src = $sce.trustAsResourceUrl('http://www.cinema6.com');
                    });
                });

                it('should not insert an iframe', function() {
                    expect($preview.find('iframe').length).toBe(0);
                });

                it('should not create a session', function() {
                    expect(postMessage.createSession).not.toHaveBeenCalled();
                });

                it('should not init the experience', function() {
                    expect(scope.$emit).not.toHaveBeenCalled();
                });
            });

            describe('with a src and an experience', function() {
                var $iframe;

                beforeEach(function() {
                    $scope.$apply(function() {
                        $scope.src = $sce.trustAsResourceUrl('http://www.cinema6.com/');
                        $scope.exp = experience;
                    });
                    $iframe = $preview.find('iframe');
                });

                it('should put an iframe into the DOM', function() {
                    expect($iframe.length).toBe(1);
                });

                it('should have a src', function() {
                    expect($iframe.prop('src')).toBe('http://www.cinema6.com/');
                });

                it('should create a session with the iframe', function() {
                    expect(postMessage.createSession).toHaveBeenCalledWith($iframe.prop('contentWindow'));
                });

                it('should $emit the mrPreview:initExperience event', function() {
                    expect(scope.$emit).toHaveBeenCalledWith('mrPreview:initExperience', experience, session);
                });

                describe('if the src changes', function() {
                    var destroySpy, oldSession, oldSessionId;

                    beforeEach(function() {
                        destroySpy = jasmine.createSpy('$destroy');
                        $iframe.on('$destroy', destroySpy);

                        oldSession = session;
                        oldSessionId = session.id;


                        $scope.$apply(function() {
                            $scope.src = $sce.trustAsResourceUrl('http://www.benfolds.com/');
                        });
                    });

                    it('should create a new session', function() {
                        expect(session).not.toBe(oldSession);
                    });

                    it('should clean up the old session', function() {
                        expect(postMessage.destroySession).toHaveBeenCalledWith(oldSessionId);
                    });

                    it('should remove the iframe, change the src, and then reinsert it', function() {
                        expect(destroySpy).toHaveBeenCalled();
                        expect($iframe.parent().length).toBe(1);
                        expect($iframe.prop('src')).toBe('http://www.benfolds.com/');
                    });
                });
            });
        });
    });
}());
