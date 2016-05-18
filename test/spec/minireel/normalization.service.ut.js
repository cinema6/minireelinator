define(['app'], function(appModule) {
    'use strict';

    describe('NormalizationService', function() {
        var NormalizationService;

        beforeEach(function() {
            module(appModule.name);

            inject(function($injector) {
                NormalizationService = $injector.get('NormalizationService');
            });
        });

        afterAll(function() {
            NormalizationService = null;
        });

        it('should exist', function() {
            expect(NormalizationService).toEqual(jasmine.any(Object));
        });

        describe('methods', function() {
            describe('copy(defaults)', function() {
                it('should return a function', function() {
                    expect(NormalizationService.copy()).toEqual(jasmine.any(Function));
                });

                describe('the returned function', function() {
                    describe('when passed an object and key that is not defined', function() {
                        it('should return the default value', function() {
                            var copyWithDefault = NormalizationService.copy('Default!'),
                                value = copyWithDefault({ id: '123' }, 'name');

                            expect(value).toEqual('Default!');

                            copyWithDefault = NormalizationService.copy({ id: '12345' });
                            value = copyWithDefault({ id: '123' }, 'name');

                            expect(value).toEqual({ id: '12345' });

                            copyWithDefault = NormalizationService.copy(['1','2','3']);
                            value = copyWithDefault({ id: '123' }, 'name');

                            expect(value).toEqual(['1','2','3']);
                        });
                    });

                    describe('when passed an object and key that is defined', function() {
                        it('should return object[key] instead of the default value', function() {
                            var copyProp = NormalizationService.copy('Default!'),
                                value = copyProp({ id: '123' }, 'id');

                            expect(value).toEqual('123');

                            copyProp = NormalizationService.copy({ id: '12345' });
                            value = copyProp({ id: '123' }, 'id');

                            expect(value).toEqual('123');

                            copyProp = NormalizationService.copy(['1','2','3']);
                            value = copyProp({ id: '123' }, 'id');

                            expect(value).toEqual('123');
                        });
                    });
                });
            });

            describe('value(value)', function() {
                it('should return a function', function() {
                    expect(NormalizationService.value()).toEqual(jasmine.any(Function));
                });

                describe('the returned function', function() {
                    it('should always return the provided value', function() {
                        var defaultValue = NormalizationService.value('Value!');

                        expect(defaultValue({ id: '123' })).toEqual('Value!');

                        defaultValue = NormalizationService.value({ id: '123' });

                        expect(defaultValue('Value!')).toEqual({ id: '123' });

                        defaultValue = NormalizationService.value(['1','2','3']);

                        expect(defaultValue('Value!')).toEqual(['1','2','3']);
                    });
                });
            });

            describe('normalize(template, base, target, raw, clean)', function() {
                var template,
                    copy, value;

                beforeEach(function() {
                    copy = NormalizationService.copy;
                    value = NormalizationService.value;

                    template = {
                        id: copy('12345'),
                        categories: [
                            copy('Entertainment'),
                            value('Comedy')
                        ],
                        data: {
                            service: copy(null),
                            params: {
                                sponsor: function(base, key, raw) {
                                    return base[key] || raw.name;
                                },
                                ad: value(true)
                            }
                        },
                        name: copy(null),
                        type: copy('Type'),
                        targeting: function(base, key, raw) {
                            if (this.type) {
                                return this.type;
                            }
                            return {
                                geo: {},
                                demographics: []
                            };
                        }
                    };
                });

                describe('when no base object is set', function() {
                    it('should set all defaults', function() {
                        var result = NormalizationService.normalize(template, null, null, {args: {}});

                        expect(result).toEqual({
                            id: '12345',
                            categories: ['Entertainment','Comedy'],
                            data: {
                                service: null,
                                params: {
                                    sponsor: undefined,
                                    ad: true
                                }
                            },
                            name: null,
                            type: 'Type',
                            targeting: 'Type'
                        });
                    });
                });

                describe('when starting with a base object', function() {
                    var base, result;

                    beforeEach(function() {
                        base = {
                            id: '8888',
                            data: {
                                service: 'youtube',
                                params: {
                                    sponsor: 'Diageo',
                                    ad: false
                                }
                            },
                            type: 'thing',
                            name: 'My Name!'
                        };

                        result = NormalizationService.normalize(template, base, null, {args: {}});
                    });

                    it('should return a new object', function() {
                        expect(result).not.toBe(base);
                    });

                    it('should respect that object', function() {
                        expect(result).toEqual({
                            id: base.id,
                            categories: ['Entertainment', 'Comedy'],
                            data: {
                                service: base.data.service,
                                params: {
                                    sponsor: base.data.params.sponsor,
                                    ad: true
                                }
                            },
                            type: 'thing',
                            name: base.name,
                            targeting: base.type
                        });
                    });
                });

                describe('when an initial target object is provided', function() {
                    var target, result;

                    beforeEach(function() {
                        target = {
                            extra: 'Something unrelated',
                            another: {
                                props: [],
                                params: {
                                    inside: 'inside'
                                }
                            },
                            foo: function() {
                                return 'bar';
                            }
                        };

                        result = NormalizationService.normalize(template, null, target, {args: {}});
                    });

                    it('should return the target', function() {
                        expect(result).toBe(target);
                    });

                    it('should add normalized defaults', function() {
                        expect(result).toEqual({
                            id: '12345',
                            categories: ['Entertainment','Comedy'],
                            data: {
                                service: null,
                                params: {
                                    sponsor: undefined,
                                    ad: true
                                }
                            },
                            name: null,
                            type: 'Type',
                            targeting: 'Type',
                            extra: target.extra,
                            another: target.another,
                            foo: target.foo
                        });
                    });
                });

                describe('when a raw object is provided', function() {
                    it('should be made available to every functional property', function() {
                        var rawObj = {
                            id: '9999',
                            title: 'Something Special',
                            foo: ['bar'],
                            name: 'Top Level Name',
                            card: {
                                id: '1111',
                                data: {
                                    service: 'vimeo',
                                    params: {}
                                }
                            }
                        };

                        var result = NormalizationService.normalize(template, rawObj.card, rawObj.card, {args: rawObj});

                        expect(result).toBe(rawObj.card);

                        expect(result).toEqual({
                            id: '1111',
                            categories: ['Entertainment','Comedy'],
                            data: {
                                service: 'vimeo',
                                params: {
                                    sponsor: 'Top Level Name',
                                    ad: true
                                }
                            },
                            name: null,
                            type: 'Type',
                            targeting: 'Type'
                        });
                    });
                });

                describe('when clean is true', function() {
                    it('should delete all properties that are not on the template', function() {
                        var base = {
                            id: '8888',
                            categories: ['item1','item2','extra'],
                            data: {
                                service: 'youtube',
                                params: {
                                    sponsor: 'Diageo',
                                    ad: false,
                                    extra: 'Remove me'
                                },
                                extra: 'Delete please'
                            },
                            type: 'thing',
                            name: 'My Name!',
                            extra: 'Shoudl be removed'
                        };

                        var result = NormalizationService.normalize(template, base, base, {args: {}, clean: true});

                        expect(result).toBe(base);

                        expect(result.extra).toBeUndefined();
                        expect(result.data.extra).toBeUndefined();
                        expect(result.data.params.extra).toBeUndefined();
                        expect(result.categories.length).toBe(2);
                    });
                });
            });
        });
    });
});
