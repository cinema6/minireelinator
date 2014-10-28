(function() {
    'use strict';

    define(['minireel/services'], function(servicesModule) {
        describe('VideoService', function() {
            var VideoService;

            beforeEach(function() {
                module(servicesModule.name);

                inject(function($injector) {
                    VideoService = $injector.get('VideoService');
                });
            });

            it('should exist', function() {
                expect(VideoService).toEqual(jasmine.any(Object));
            });

            describe('@public', function() {
                describe('methods', function() {
                    describe('urlFromData(service, id)', function() {
                        function fromData() {
                            return VideoService.urlFromData.apply(VideoService, arguments);
                        }

                        it('should create a youtube url', function() {
                            expect(fromData('youtube', 'xKLRGJYna-8')).toBe('https://www.youtube.com/watch?v=xKLRGJYna-8');
                            expect(fromData('youtube', 'QhMufR7MiqA')).toBe('https://www.youtube.com/watch?v=QhMufR7MiqA');
                            expect(fromData('youtube', '0M1L15hpphQ')).toBe('https://www.youtube.com/watch?v=0M1L15hpphQ');
                        });

                        it('should create a vimeo url', function() {
                            expect(fromData('vimeo', '83486021')).toBe('http://vimeo.com/83486021');
                            expect(fromData('vimeo', '89501438')).toBe('http://vimeo.com/89501438');
                            expect(fromData('vimeo', '26404699')).toBe('http://vimeo.com/26404699');
                        });

                        it('should create a dailymotion url', function() {
                            expect(fromData('dailymotion', 'x17nw7w')).toBe('http://www.dailymotion.com/video/x17nw7w');
                            expect(fromData('dailymotion', 'x1d5q7o')).toBe('http://www.dailymotion.com/video/x1d5q7o');
                            expect(fromData('dailymotion', 'x3pih4')).toBe('http://www.dailymotion.com/video/x3pih4');
                        });

                        it('should create an aol url', function() {
                            expect(fromData('aol', '518483595')).toBe('http://on.aol.com/video/518483595');
                            expect(fromData('aol', '518484938')).toBe('http://on.aol.com/video/518484938');
                            expect(fromData('aol', '518484285')).toBe('http://on.aol.com/video/518484285');
                        });

                        it('should create a yahoo url', function() {
                            expect(fromData('yahoo', 'ebola-york-040000389')).toBe('https://screen.yahoo.com/ebola-york-040000389.html');
                            expect(fromData('yahoo', 'vote-marijuana-034413930')).toBe('https://screen.yahoo.com/vote-marijuana-034413930.html');
                            expect(fromData('yahoo', 'gopro-shows-whisky-bottle-being-085523254')).toBe('https://screen.yahoo.com/gopro-shows-whisky-bottle-being-085523254.html');
                        });
                    });

                    describe('dataFromUrl(url)', function() {
                        function fromUrl() {
                            return VideoService.dataFromUrl.apply(VideoService, arguments);
                        }

                        it('should parse a youtube url', function() {
                            expect(fromUrl('https://www.youtube.com/watch?v=jFJUz1DO20Q&list=PLFD1E8B0910A73A12&index=11')).toEqual({
                                service: 'youtube',
                                id: 'jFJUz1DO20Q'
                            });
                        });

                        it('should parse a vimeo url', function() {
                            expect(fromUrl('http://vimeo.com/89495751')).toEqual({
                                service: 'vimeo',
                                id: '89495751'
                            });
                        });

                        it('should parse a dailymotion url', function() {
                            expect(fromUrl('http://www.dailymotion.com/video/x120oui_vincent-and-the-doctor-vincent-van-gogh-visits-the-museum-doctor-who-museum-scene_shortfilms?search_algo=2')).toEqual({
                                service: 'dailymotion',
                                id: 'x120oui'
                            });
                        });

                        it('should parse an aol url', function() {
                            expect(fromUrl('http://on.aol.com/video/nurses-ebola-quarantine-leads-to-lawsuit-for-christie-518484285?icid=OnNewsC2Wide_Img')).toEqual({
                                service: 'aol',
                                id: '518484285'
                            });
                        });

                        it('should parse a yahoo url', function() {
                            expect(fromUrl('https://screen.yahoo.com/editor-picks/emotions-run-high-claw-machine-160803280.html')).toEqual({
                                service: 'yahoo',
                                id: 'emotions-run-high-claw-machine-160803280'
                            });
                        });

                        it('should return null if the url is not valid', function() {
                            expect(fromUrl('apple.com')).toBeNull();
                            expect(fromUrl('84fh439#')).toBeNull();
                            expect(fromUrl('http://www.youtube.com/')).toBeNull();
                            expect(fromUrl('http://www.vimeo.com/')).toBeNull();
                            expect(fromUrl('http://www.dailymotion.com/')).toBeNull();
                            expect(fromUrl('http://www.youtube.c')).toBeNull();
                        });
                    });

                    describe('embedCodeFromData(service, id)', function() {
                        it('should create an aol embed code', function() {
                            expect(VideoService.embedCodeFromData('aol', '518484285')).toEqual([
                                '<div style="text-align:center">',
                                '    <script src="http://pshared.5min.com/Scripts/PlayerSeed.js?sid=281&width=560&height=450&playList=518484285"></script>',
                                '    <br/>',
                                '</div>'
                            ].join('\n'));
                        });

                        it('should create a Yahoo! embed code', function() {
                            expect(VideoService.embedCodeFromData('yahoo', 'ap-top-stories-august-7-091141329')).toEqual([
                                '<iframe width="100%"',
                                '    height="100%"',
                                '    scrolling="no"',
                                '    frameborder="0"',
                                '    src="https://screen.yahoo.com/ap-top-stories-august-7-091141329.html?format=embed"',
                                '    allowfullscreen="true"',
                                '    mozallowfullscreen="true"',
                                '    webkitallowfullscreen="true"',
                                '    allowtransparency="true">',
                                '</iframe>'
                            ].join('\n'));
                        });
                    });
                });
            });
        });
    });
}());
