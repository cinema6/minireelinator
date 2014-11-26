define(['app', 'minireel/services', 'jquery'], function(appModule, servicesModule, $) {
    'use strict';

    describe('VideoSearchController', function() {
        var $rootScope,
            $controller,
            VideoSearchService,
            $q,
            $scope,
            MiniReelService,
            c6State,
            VideoService,
            VideoSearchCtrl,
            EditorCtrl;

        var videoCard;

        function VideoSearchResult(items) {
            this.videos = items;
        }

        beforeEach(function() {
            module('ng', function($provide) {
                $provide.decorator('$log', function($delegate) {
                    $delegate.context = function() {
                        return this;
                    };

                    return $delegate;
                });
            });

            module(servicesModule.name, function($provide) {
                $provide.decorator('MiniReelService', function($delegate) {
                    var createCard = $delegate.createCard;

                    $delegate.createCard = jasmine.createSpy('MiniReelService.createCard()')
                        .and.callFake(function() {
                            return (videoCard = createCard.apply($delegate, arguments));
                        });

                    return $delegate;
                });
            });

            module(appModule.name);

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $controller = $injector.get('$controller');
                $q = $injector.get('$q');
                MiniReelService = $injector.get('MiniReelService');
                VideoSearchService = $injector.get('VideoSearchService');
                c6State = $injector.get('c6State');
                VideoService = $injector.get('VideoService');

                $scope = $rootScope.$new();
                $scope.$apply(function() {
                    $scope.EditorCtrl = EditorCtrl = $controller('EditorController', {
                        $scope: $scope
                    });
                    EditorCtrl.model = {
                        data: {
                            deck: [{}]
                        }
                    };
                    VideoSearchCtrl = $controller('VideoSearchController', { $scope: $scope });
                });
            });

            VideoSearchResult.prototype = {
                next: jasmine.createSpy('result.next()')
                    .and.returnValue($q.defer().promise),
                prev: jasmine.createSpy('result.prev()')
                    .and.returnValue($q.defer().promise),
                page: jasmine.createSpy('result.page()')
                    .and.returnValue($q.defer().promise)
            };
        });

        it('should exist', function() {
            expect(VideoSearchCtrl).toEqual(jasmine.any(Object));
        });

        describe('properties', function() {
            describe('scrollPosition', function() {
                it('should be { y: 0 }', function() {
                    expect(VideoSearchCtrl.scrollPosition).toEqual({ y: 0 });
                });
            });

            describe('result', function() {
                it('should be null', function() {
                    expect(VideoSearchCtrl.result).toBeNull();
                });
            });

            describe('error', function() {
                it('should be null', function() {
                    expect(VideoSearchCtrl.error).toBeNull();
                });
            });

            describe('query', function() {
                it('should be an object', function() {
                    expect(VideoSearchCtrl.query).toEqual({
                        query: '',
                        sites: Object.keys(VideoSearchCtrl.sites).reduce(function(obj, site) {
                            obj[site] = true;
                            return obj;
                        }, {}),
                        hd: false
                    });
                });
            });

            describe('currentPreview', function() {
                it('should be null', function() {
                    expect(VideoSearchCtrl.currentPreview).toBeNull();
                });
            });

            describe('sites', function() {
                it('should be a map of site values to labels', function() {
                    expect(VideoSearchCtrl.sites).toEqual({
                        youtube: 'YouTube',
                        vimeo: 'Vimeo',
                        dailymotion: 'Dailymotion',
                        rumble: 'Rumble',
                        aol: 'AOL On',
                        yahoo: 'Yahoo! Screen'
                    });
                });
            });

            describe('siteItems', function() {
                it('should be an array of items for each site', function() {
                    expect(VideoSearchCtrl.siteItems).toEqual(Object.keys(VideoSearchCtrl.sites).map(function(value) {
                        return {
                            label: VideoSearchCtrl.sites[value],
                            value: value
                        };
                    }));
                });
            });

            describe('showQueryDropdown', function() {
                it('should be false', function() {
                    expect(VideoSearchCtrl.showQueryDropdown).toBe(false);
                });
            });

            describe('addButtonText', function() {
                ['MR:EditCard.Copy', 'MR:EditCard.Video', 'MR:EditCard.Ballot', 'MR:EditCard']
                    .forEach(function(state) {
                        describe('if the state is "' + state + '"', function() {
                            beforeEach(function() {
                                Object.defineProperty(c6State, 'current', {
                                    value: state
                                });
                            });

                            it('should be "Add to Slide"', function() {
                                expect(VideoSearchCtrl.addButtonText).toBe('Add to Slide');
                            });
                        });
                    });

                ['MR:Editor', 'MR:Settings.Autoplay', 'MR:Editor.Settings', 'MR:Editor.Splash']
                    .forEach(function(state) {
                        describe('if the state is "' + state + '"', function() {
                            beforeEach(function() {
                                Object.defineProperty(c6State, 'current', {
                                    value: state
                                });
                            });

                            it('should be "Create Slide"', function() {
                                expect(VideoSearchCtrl.addButtonText).toBe('Create Slide');
                            });
                        });
                    });
            });
        });

        describe('methods', function() {
            describe('embedCodeFor(service, videoid)', function() {
                it('should proxy to VideoService.embedCodeFromData()', function() {
                    [
                        ['aol', 'japans-surprise-recession--economy-shrinks-1-6--518518239'],
                        ['yahoo', 'orleans-saints-fan-quot-zero-204100617']
                    ].forEach(function(args) {
                        expect(VideoSearchCtrl.embedCodeFor.apply(VideoSearchCtrl, args)).toBe(VideoService.embedCodeFromData.apply(VideoService, args));
                    });
                });
            });

            describe('toggleQueryDropdown()', function() {
                it('should toggle the showQueryDropdown property', function() {
                    VideoSearchCtrl.toggleQueryDropdown();
                    expect(VideoSearchCtrl.showQueryDropdown).toBe(true);

                    VideoSearchCtrl.toggleQueryDropdown();
                    expect(VideoSearchCtrl.showQueryDropdown).toBe(false);
                });
            });

            describe('toggleProp(object, prop)', function() {
                describe('if no object is passed in', function() {
                    it('should toggle props on itself', function() {
                        VideoSearchCtrl.toggleProp('foo');
                        expect(VideoSearchCtrl.foo).toBe(true);

                        VideoSearchCtrl.toggleProp('foo');
                        expect(VideoSearchCtrl.foo).toBe(false);
                    });
                });

                describe('if an object is passed in', function() {
                    it('should toggle the prop on the object', function() {
                        VideoSearchCtrl.toggleProp(VideoSearchCtrl.query, 'hd');
                        expect(VideoSearchCtrl.query.hd).toBe(true);

                        VideoSearchCtrl.toggleProp(VideoSearchCtrl.query, 'hd');
                        expect(VideoSearchCtrl.query.hd).toBe(false);
                    });
                });
            });

            describe('search()', function() {
                var result,
                    success, failure;

                beforeEach(function() {
                    success = jasmine.createSpy('success()');
                    failure = jasmine.createSpy('failure()');

                    result = new VideoSearchResult([
                        {
                            title: 'Blah'
                        },
                        {
                            title: 'hey'
                        },
                        {
                            title: 'foo'
                        }
                    ]);

                    VideoSearchCtrl.scrollPosition.y = 20;
                    VideoSearchCtrl.error = 'BLEGH';
                    VideoSearchCtrl.query.query = 'Find Me Something Awesome!';

                    spyOn(VideoSearchService, 'find').and.returnValue($q.when(result));

                    $scope.$apply(function() {
                        VideoSearchCtrl.search().then(success, failure);
                    });
                });

                describe('if there is a failure', function() {
                    beforeEach(function() {
                        VideoSearchService.find.and.returnValue($q.reject('There was a problem.'));

                        $scope.$apply(function() {
                            VideoSearchCtrl.search().then(success, failure);
                        });
                    });

                    it('should set the error', function() {
                        expect(VideoSearchCtrl.error).toBe(failure.calls.mostRecent().args[0]);
                    });

                    it('should reject the promise', function() {
                        expect(failure).toHaveBeenCalledWith('There was a problem.');
                    });
                });

                it('should set the error back to null', function() {
                    expect(VideoSearchCtrl.error).toBeNull();
                });

                it('should scroll back to the top', function() {
                    expect(VideoSearchCtrl.scrollPosition.y).toBe(0);
                });

                it('should search for the video', function() {
                    expect(VideoSearchService.find).toHaveBeenCalledWith({
                        query: VideoSearchCtrl.query.query,
                        sites: Object.keys(VideoSearchCtrl.sites).join(','),
                        hd: undefined
                    });
                });

                it('should resolve to the results', function() {
                    expect(success).toHaveBeenCalledWith(result);
                });

                describe('if there is no query', function() {
                    beforeEach(function() {
                        VideoSearchService.find.calls.reset();

                        VideoSearchCtrl.query.query = '';

                        $scope.$apply(function() {
                            VideoSearchCtrl.search().then(success, failure);
                        });
                    });

                    it('should not trigger a search', function() {
                        expect(VideoSearchService.find).not.toHaveBeenCalled();
                    });

                    it('should resolve to null', function() {
                        expect(success).toHaveBeenCalledWith(null);
                    });
                });

                describe('if hd is true on the query', function() {
                    beforeEach(function() {
                        VideoSearchService.find.calls.reset();
                        VideoSearchCtrl.query.hd = true;

                        $scope.$apply(function() {
                            VideoSearchCtrl.search().then(success, failure);
                        });
                    });

                    it('should search with hd: true', function() {
                        expect(VideoSearchService.find).toHaveBeenCalledWith({
                            query: VideoSearchCtrl.query.query,
                            sites: Object.keys(VideoSearchCtrl.sites).join(','),
                            hd: true
                        });
                    });
                });

                describe('if certain sites are not included', function() {
                    beforeEach(function() {
                        VideoSearchService.find.calls.reset();
                        VideoSearchCtrl.query.sites = {
                            youtube: false,
                            dailymotion: true,
                            vimeo: true
                        };

                        $scope.$apply(function() {
                            VideoSearchCtrl.search().then(success, failure);
                        });
                    });

                    it('should not be included in the query', function() {
                        expect(VideoSearchService.find).toHaveBeenCalledWith({
                            query: VideoSearchCtrl.query.query,
                            sites: 'vimeo,dailymotion',
                            hd: undefined
                        });
                    });
                });

                it('should resolve to the result', function() {
                    expect(success).toHaveBeenCalledWith(result);
                });

                it('should assign the result to its "result" property', function() {
                    expect(VideoSearchCtrl.result).toBe(result);
                });
            });

            describe('pagination methods:', function() {
                beforeEach(function() {
                    spyOn(VideoSearchCtrl, 'togglePreview').and.callThrough();
                    VideoSearchCtrl.scrollPosition.y = 55;
                    VideoSearchCtrl.error = 'UH OH!';
                    VideoSearchCtrl.result = new VideoSearchResult([]);
                });

                ['next', 'prev'].forEach(function(method) {
                    describe(method + 'Page()', function() {
                        var success, failure,
                            pageDeferred;

                        beforeEach(function() {
                            success = jasmine.createSpy('success()');
                            failure = jasmine.createSpy('failure()');

                            pageDeferred = $q.defer();

                            VideoSearchCtrl.result[method]
                                .and.returnValue(pageDeferred.promise);

                            $scope.$apply(function() {
                                VideoSearchCtrl[method + 'Page']().then(success, failure);
                            });
                        });

                        it('should null-out the error', function() {
                            expect(VideoSearchCtrl.error).toBeNull();
                        });

                        it('should clear the currentPreview', function() {
                            expect(VideoSearchCtrl.togglePreview).toHaveBeenCalledWith(null);
                        });

                        describe('if the request fails', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    pageDeferred.reject('THIS IS LAME');
                                });
                            });

                            it('should reject the promise', function() {
                                expect(failure).toHaveBeenCalledWith('THIS IS LAME');
                            });

                            it('should set the error', function() {
                                expect(VideoSearchCtrl.error).toBe(failure.calls.mostRecent().args[0]);
                            });
                        });

                        describe('if the request succeeds', function() {
                            beforeEach(function() {
                                $scope.$apply(function() {
                                    pageDeferred.resolve(VideoSearchCtrl.result);
                                });
                            });

                            it('should resolve to the result', function() {
                                expect(success).toHaveBeenCalledWith(VideoSearchCtrl.result);
                            });

                            it('should scroll to the top', function() {
                                expect(VideoSearchCtrl.scrollPosition.y).toBe(0);
                            });
                        });
                    });
                });
            });

            describe('togglePreview(video)', function() {
                var video,
                    result;

                beforeEach(function() {
                    video = {};

                    $scope.$apply(function() {
                        result = VideoSearchCtrl.togglePreview(video);
                    });
                });

                it('should set the currentPreview property', function() {
                    expect(VideoSearchCtrl.currentPreview).toBe(video);
                });

                it('should return the video', function() {
                    expect(result).toBe(video);
                });

                describe('if called with the current video', function() {
                    beforeEach(function() {
                        $scope.$apply(function() {
                            result = VideoSearchCtrl.togglePreview(video);
                        });
                    });

                    it('should set the currentPreview property to null', function() {
                        expect(VideoSearchCtrl.currentPreview).toBeNull();
                    });

                    it('should return null', function() {
                        expect(result).toBeNull();
                    });
                });
            });

            describe('addVideo(video, id)', function() {
                var video;

                beforeEach(function() {
                    spyOn(c6State, '$emitThroughStates');

                    $scope.$apply(function() {
                        VideoSearchCtrl.addVideo((video = {
                            site: 'youtube',
                            videoid: 'abc',
                            title: 'This Video Rules!',
                            description: 'This video is the best video I\'ve ever seen'
                        }), 'rc-f26330eac44726');
                    });
                });

                it('should create a new video card', function() {
                    expect(MiniReelService.createCard).toHaveBeenCalledWith('video');
                });

                it('should set properties on the card to match the video', function() {
                    expect(videoCard.data.service).toBe('youtube');
                    expect(videoCard.data.videoid).toBe('abc');
                });

                it('should $emit the "VideoSearchCtrl:addVideo" event through the states', function() {
                    expect(c6State.$emitThroughStates).toHaveBeenCalledWith('VideoSearchCtrl:addVideo', videoCard, 'rc-f26330eac44726');
                });
            });

            describe('close()', function() {
                beforeEach(function() {
                    VideoSearchCtrl.currentPreview = {};
                    spyOn(EditorCtrl, 'toggleSearch').and.callThrough();

                    VideoSearchCtrl.close();
                });

                it('should nullify the currentPreview', function() {
                    expect(VideoSearchCtrl.currentPreview).toBeNull();
                });

                it('should toggle the search panel', function() {
                    expect(EditorCtrl.toggleSearch).toHaveBeenCalled();
                });
            });

            describe('idFor(video)', function() {
                var video1, video2, video3;

                beforeEach(function() {
                    video1 = {}; video2 = {}; video3 = {};
                });

                it('should give objects unique IDs', function() {
                    var videos = [video1, video2, video3],
                        ids = videos.map(function(video) {
                            return VideoSearchCtrl.idFor(video);
                        });

                    ids.forEach(function(id) {
                        expect(id).toMatch(/\b[a-z0-9]{5,}\b/);
                    });
                    expect(ids).toEqual(ids.filter(function(id, index) {
                        return ids.indexOf(id) === index;
                    }));

                    expect(ids).toEqual(videos.map(function(video) {
                        return VideoSearchCtrl.idFor(video);
                    }));
                });
            });

            describe('setupDraggables(DragCtrl)', function() {
                var DragCtrl;

                beforeEach(function() {
                    $scope.$apply(function() {
                        DragCtrl = $controller('C6DragSpaceController', {
                            $scope: $scope
                        });
                    });

                    $scope.$apply(function() {
                        VideoSearchCtrl.setupDraggables(DragCtrl);
                    });
                });

                describe('when a draggables are added', function() {
                    var Draggable,
                        video,
                        $element, draggable;

                    beforeEach(inject(function($injector) {
                        video = {
                            title: 'Awesome Video',
                            description: 'Lorem ipsum',
                            site: 'vimeo',
                            videoid: '12345'
                        };

                        Draggable = $injector.get('_Draggable');

                        $element = $('<div class="foo">Hello</div>');
                        $('body').append($element);
                        draggable = new Draggable(VideoSearchCtrl.idFor(video), $element);
                        DragCtrl.addDraggable(draggable);
                    }));

                    afterEach(function() {
                        $element.remove();
                    });

                    describe('when a draggable is dragged', function() {
                        beforeEach(function() {
                            draggable.$element.addClass('c6-dragging');
                            draggable.emit('begin', draggable);
                        });

                        it('should put a clone of the element in the DOM', function() {
                            expect($element.html()).toBe($element.next().html());
                            expect($element.next().hasClass('c6-dragging')).toBe(false);
                        });

                        describe('when a draggable starts being dropped', function() {
                            var Rect;

                            beforeEach(inject(function($injector) {
                                Rect = $injector.get('_Rect');

                                spyOn(VideoSearchCtrl, 'addVideo');
                            }));

                            describe('if not dropped on a card', function() {
                                var $foo;

                                beforeEach(function() {
                                    $foo = $([
                                        '<div id="fkjsjfg">',
                                        '    <span>Hello</span>',
                                        '    <ul>',
                                        '        <li>Sup?</li>',
                                        '    </ul>',
                                        '</div>'
                                    ].join('\n'));
                                    $('body').append($foo);

                                    draggable.display = new Rect($foo.find('li')[0].getBoundingClientRect());
                                    draggable.$element.css({
                                        position: 'fixed',
                                        top: draggable.display.top + 'px',
                                        left: draggable.display.left + 'px',
                                        width: draggable.display.width + 'px',
                                        height: draggable.display.height + 'px'
                                    });

                                    draggable.emit('dropStart', draggable, {
                                        x: draggable.display.left + 1,
                                        y: draggable.display.top + 1
                                    });
                                });

                                afterEach(function() {
                                    $foo.remove();
                                });

                                it('should not add any videos', function() {
                                    expect(VideoSearchCtrl.addVideo).not.toHaveBeenCalled();
                                });
                            });

                            describe('if dropped on a card', function() {
                                var $card;

                                beforeEach(function() {
                                    $card = $([
                                        '<div id="rc-8d2d292232059b">',
                                        '    <div class="card__body">',
                                        '        <div class="card__copy">',
                                        '            <p class="card__summary">Foo bar whatever</p>',
                                        '        </div>',
                                        '    </div>',
                                        '</div>'
                                    ].join('\n'));
                                    $('body').append($card);

                                    draggable.display = new Rect($card.find('p')[0].getBoundingClientRect());
                                    draggable.$element.css({
                                        position: 'fixed',
                                        top: draggable.display.top + 'px',
                                        left: draggable.display.left + 'px',
                                        width: draggable.display.width + 'px',
                                        height: draggable.display.height + 'px'
                                    });

                                    draggable.emit('dropStart', draggable, {
                                        x: draggable.display.left + 1,
                                        y: draggable.display.top + 1
                                    });
                                });

                                afterEach(function() {
                                    $card.remove();
                                });

                                it('should add the video', function() {
                                    expect(VideoSearchCtrl.addVideo).toHaveBeenCalledWith(video, 'rc-8d2d292232059b');
                                });
                            });

                            describe('if dropped on the "new slide" card', function() {
                                var $newSlide;

                                beforeEach(function() {
                                    $newSlide = $([
                                        '<div id="new-slide" class="card__container">',
                                        '    <div class="card__item">',
                                        '        <button class="createNew__button">New</button>',
                                        '    </div>',
                                        '</div>'
                                    ].join('\n'));
                                    $('body').append($newSlide);

                                    draggable.display = new Rect($newSlide.find('button')[0].getBoundingClientRect());
                                    draggable.$element.css({
                                        position: 'fixed',
                                        top: draggable.display.top + 'px',
                                        left: draggable.display.left + 'px',
                                        width: draggable.display.width + 'px',
                                        height: draggable.display.height + 'px'
                                    });

                                    draggable.emit('dropStart', draggable, {
                                        x: draggable.display.left + 1,
                                        y: draggable.display.top + 1
                                    });
                                });

                                afterEach(function() {
                                    $newSlide.remove();
                                });

                                it('should add the video', function() {
                                    expect(VideoSearchCtrl.addVideo).toHaveBeenCalledWith(video);
                                });
                            });

                            describe('if dropped on a card-editing modal', function() {
                                var $modal;

                                beforeEach(function() {
                                    $modal = $([
                                        '<div id="edit-card-modal" class="modal__group">',
                                        '    <header class="modalHeader__group">',
                                        '        <h1 class="modal__title">Editing Card</h1>',
                                        '    </header>',
                                        '</div>'
                                    ].join('\n'));
                                    $('body').append($modal);

                                    draggable.display = new Rect($modal.find('h1')[0].getBoundingClientRect());
                                    draggable.$element.css({
                                        position: 'fixed',
                                        top: draggable.display.top + 'px',
                                        left: draggable.display.left + 'px',
                                        width: draggable.display.width + 'px',
                                        height: draggable.display.height + 'px'
                                    });

                                    draggable.emit('dropStart', draggable, {
                                        x: draggable.display.left + 1,
                                        y: draggable.display.top + 1
                                    });
                                });

                                afterEach(function() {
                                    $modal.remove();
                                });

                                it('should add the video', function() {
                                    expect(VideoSearchCtrl.addVideo).toHaveBeenCalledWith(video);
                                });
                            });
                        });

                        describe('after a draggable is dropped', function() {
                            var $clone;

                            beforeEach(function() {
                                $clone = $element.next();

                                draggable.emit('end', draggable);
                            });

                            it('should remove the clone from the DOM', function() {
                                expect($clone.parent().length).toBe(0);
                            });
                        });
                    });
                });
            });
        });

        describe('$events', function() {
            describe('EditorCtrl:searchQueued', function() {
                beforeEach(function() {
                    spyOn(VideoSearchCtrl, 'search');
                    $scope.$broadcast('EditorCtrl:searchQueued', 'LOLCATS');
                });

                it('should set the query', function() {
                    expect(VideoSearchCtrl.query.query).toBe('LOLCATS');
                });

                it('should trigger a search', function() {
                    expect(VideoSearchCtrl.search).toHaveBeenCalled();
                });
            });
        });
    });
});
