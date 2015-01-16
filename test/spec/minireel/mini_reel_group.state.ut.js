define(['app'], function(appModule) {
    'use strict';

    ['MR:New:MiniReelGroup', 'MR:Edit:MiniReelGroup'].forEach(function(stateName) {
        describe(stateName + ' state', function() {
            var c6State,
                cinema6,
                miniReelGroup;

            var group;

            beforeEach(function() {
                module(appModule.name);

                inject(function($injector) {
                    c6State = $injector.get('c6State');
                    cinema6 = $injector.get('cinema6');

                    miniReelGroup = c6State.get(stateName);
                });

                group = {
                    label: 'Group 2',
                    miniReels: ['e-187976a24a650e', 'e-02cf77efc7bd73']
                        .map(function(id) {
                            return cinema6.db.create('experience', {
                                id: id,
                                data: {
                                    deck: []
                                }
                            });
                        }),
                    cards: ['rc-784075920783d8', 'rc-b8dc29ab62ee5a']
                        .map(function(id) {
                            return cinema6.db.create('card', {
                                id: id,
                                type: 'video',
                                data: {}
                            });
                        })
                };
            });

            it('should exist', function() {
                expect(miniReelGroup).toEqual(jasmine.any(Object));
            });

            describe('group', function() {
                it('should be null', function() {
                    expect(miniReelGroup.group).toBeNull();
                });
            });

            describe('beforeModel()', function() {
                beforeEach(function() {
                    miniReelGroup.cParent.cModel = group;

                    miniReelGroup.beforeModel();
                });

                it('should set its group property to its parent\'s model', function() {
                    expect(miniReelGroup.group).toBe(group);
                });
            });

            describe('model()', function() {
                var result;

                beforeEach(function() {
                    miniReelGroup.cParent.cModel = group;
                    miniReelGroup.beforeModel();

                    result = miniReelGroup.model();
                });

                it('should return a shallow copy of its parent\'s model', function() {
                    expect(result).toEqual(group);
                    expect(result).not.toBe(group);

                    expect(result.miniReels).not.toBe(group.miniReels);
                    expect(result.miniReels).toEqual(group.miniReels);
                    result.miniReels.forEach(function(minireel, index) {
                        expect(minireel).toBe(group.miniReels[index]);
                    });

                    expect(result.cards).not.toBe(group.cards);
                    expect(result.cards).toEqual(group.cards);
                    result.cards.forEach(function(card, index) {
                        expect(card).toBe(group.cards[index]);
                    });
                });
            });

            describe('updateGroup()', function() {
                var result;

                beforeEach(function() {
                    miniReelGroup.cParent.cModel = group;
                    miniReelGroup.beforeModel();
                    miniReelGroup.cModel = miniReelGroup.model();

                    miniReelGroup.cModel.label = 'I Renamed It!';
                    miniReelGroup.cModel.miniReels.push(cinema6.db.create('experience', {
                        id: 'e-b20858ac46a297',
                        data: {
                            deck: []
                        }
                    }));
                    miniReelGroup.cModel.cards.slice(0, 1);

                    result = miniReelGroup.updateGroup();
                });

                it('should shallow copy the model to the group', function() {
                    expect(group).toEqual(miniReelGroup.cModel);
                    expect(miniReelGroup.group).toBe(group);
                    expect(group.miniReels).toBe(miniReelGroup.cModel.miniReels);
                    expect(group.cards).toBe(miniReelGroup.cModel.cards);
                });

                it('should return the group', function() {
                    expect(result).toBe(group);
                });
            });
        });
    });
});
