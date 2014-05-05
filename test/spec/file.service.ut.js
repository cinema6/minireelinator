(function() {
    'use strict';

    define(['services'], function() {
        var noop = angular.noop;

        describe('FileService', function() {
            var $rootScope,
                FileService;

            var $window,
                formData,
                xhr;

            function MockXHR() {
                this.onreadystatechange = null;
                this.readyState = 0;
                this.response = null;
                this.responseText = null;
                this.responseType = '';
                this.status = null;
                this.statusText = null;
                this.timeout = 0;
                this.ontimeout = null;
                this.upload = {
                    onprogress: null
                };
                this.withCredentials = false;

                xhr = this;
            }
            MockXHR.prototype = {
                abort: jasmine.createSpy('xhr.abort()'),
                getAllResponseHeaders: jasmine.createSpy('xhr.getAllResponseHeaders()')
                    .and.returnValue(null),
                getResponseHeader: jasmine.createSpy('xhr.getResponseHeader()')
                    .and.returnValue(null),
                open: jasmine.createSpy('xhr.open()'),
                overrideMimeType: jasmine.createSpy('xhr.overrideMimeType()'),
                send: jasmine.createSpy('xhr.send()'),
                setRequestHeader: jasmine.createSpy('xhr.setRequestHeader()')
            };

            function MockFormData() {
                formData = this;
            }
            MockFormData.prototype = {
                append: jasmine.createSpy('formData.append()')
            };

            beforeEach(function() {
                module('ng', function($provide) {
                    $provide.value('$window', {
                        URL: {
                            createObjectURL: jasmine.createSpy('URL.createObjectURL()')
                        },
                        FormData: MockFormData,
                        XMLHttpRequest: MockXHR,
                        addEventListener: jasmine.createSpy('$window.addEventListener()')
                    });
                });

                module('c6.mrmaker');

                inject(function($injector) {
                    $rootScope = $injector.get('$rootScope');

                    $window = $injector.get('$window');

                    FileService = $injector.get('FileService');
                });
            });

            it('should exist', function() {
                expect(FileService).toEqual(jasmine.any(Object));
            });

            describe('methods', function() {
                describe('open(file)', function() {
                    var url;

                    beforeEach(function() {
                        url = {};

                        $window.URL.createObjectURL.and.returnValue(url);
                    });

                    it('should create a wrapper for the file', function() {
                        var file = {},
                            wrapper = FileService.open(file);

                        expect(wrapper.file).toBe(file);
                        expect(wrapper.url).toBe(url);
                    });

                    it('should return the same object if the same file is passed in', function() {
                        var file = {},
                            wrapper = FileService.open(file);

                        expect(FileService.open(file)).toBe(wrapper);
                    });
                });

                describe('upload(url, fileWrappers)', function() {
                    var success, failure, progress,
                        files, fileWrappers;

                    function simulateComplete() {
                        var state = 1;

                        for ( ; state < 5; state++) {
                            xhr.readyState = state;
                            (xhr.onreadystatechange || noop)();

                            if (state < 4) {
                                expect(success).not.toHaveBeenCalled();
                                expect(failure).not.toHaveBeenCalled();
                            }
                        }
                    }

                    beforeEach(function() {
                        files = [{}, {}, {}];
                        fileWrappers = files.map(function(file) {
                            return FileService.open(file);
                        });

                        success = jasmine.createSpy('upload success');
                        failure = jasmine.createSpy('upload failure');
                        progress = jasmine.createSpy('upload progress');

                        $rootScope.$apply(function() {
                            FileService.upload('/api/collateral', fileWrappers)
                                .then(success, failure, progress);
                        });
                    });

                    it('should create form data and append the files', function() {
                        fileWrappers.forEach(function(wrapper, index) {
                            expect(formData.append).toHaveBeenCalledWith('image' + index, wrapper.file);
                        });
                    });

                    it('should send the form via XHR', function() {
                        expect(xhr.open).toHaveBeenCalledWith('POST', '/api/collateral');
                        expect(xhr.responseType).toBe('json');
                        expect(xhr.send).toHaveBeenCalledWith(formData);
                    });

                    describe('when the request completes', function() {
                        describe('if the status code indicates success', function() {
                            beforeEach(function() {
                                xhr.status = 399;
                                xhr.statusText = '399 OK';
                                xhr.response = { foo: { value: 'bar' } };

                                simulateComplete();
                            });

                            it('should resolve the promise', function() {
                                expect(success).toHaveBeenCalledWith({
                                    data: xhr.response,
                                    status: xhr.status,
                                    statusText: xhr.statusText
                                });
                            });
                        });

                        describe('if the status code indicates failure', function() {
                            beforeEach(function() {
                                xhr.status = 400;
                                xhr.statusText = '400 ERROR';
                                xhr.response = 'There was some kind of error.';

                                simulateComplete();
                            });

                            it('should reject the promise', function() {
                                expect(failure).toHaveBeenCalledWith({
                                    data: xhr.response,
                                    status: xhr.status,
                                    statusText: xhr.statusText
                                });
                            });
                        });
                    });

                    describe('as the upload occurs', function() {
                        function uploadProgress(loaded, total) {
                            (xhr.upload.onprogress || noop)({
                                lengthComputable: !!total,
                                loaded: loaded,
                                total: total
                            });
                        }

                        describe('if the percent can be computed', function() {
                            it('should notify the progress handler', function() {
                                var total = 1024;

                                uploadProgress(10, total);
                                expect(progress).toHaveBeenCalledWith({
                                    uploaded: 10,
                                    total: total,
                                    complete: 10 / total
                                });

                                uploadProgress(105, total);
                                expect(progress).toHaveBeenCalledWith({
                                    uploaded: 105,
                                    total: total,
                                    complete: 105 / total
                                });

                                uploadProgress(457, total);
                                expect(progress).toHaveBeenCalledWith({
                                    uploaded: 457,
                                    total: total,
                                    complete: 457 / total
                                });
                            });
                        });

                        describe('if the percent cannot be computed', function() {
                            it('should notify the progress handler with less information', function() {
                                uploadProgress(34);
                                expect(progress).toHaveBeenCalledWith({
                                    uploaded: 34
                                });

                                uploadProgress(1035);
                                expect(progress).toHaveBeenCalledWith({
                                    uploaded: 1035
                                });
                            });
                        });
                    });
                });
            });

            describe('FileWrapper()', function() {
                describe('close()', function() {
                    it('should remove cached references to the file and wrapper', function() {
                        var file = {},
                            wrapper = FileService.open(file);

                        wrapper.close();

                        expect(FileService.open(file)).not.toBe(wrapper);
                    });
                });
            });
        });
    });
}());
