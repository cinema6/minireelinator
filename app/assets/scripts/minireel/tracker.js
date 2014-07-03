(function(){
    'use strict';

    angular.module('c6.mrmaker')
    .service('tracker',['$window',function($window){

        this.create = function(){
            var args = Array.prototype.slice.call(arguments,0);
            args.unshift('create');
            $window.ga.apply(null,args);
        };

        this.send = function(){
            var args = Array.prototype.slice.call(arguments,0);
            args.unshift('send');
            $window.ga.apply(null,args);
        };

        this.event = function(){
            var args = Array.prototype.slice.call(arguments,0);
            args.unshift('event');
            args.unshift('send');
            if (args.length < 7){
                args.push({ nonInteraction : 1 });
            }

            $window.ga.apply(null,args);
        };

        this.error = function(errObject,pageObject){
            var args = [];
            args.push('send');
            args.push('event');
            args.push('error'); //category
            args.push(errObject.internal ? 'internal' : 'external'); //action
            args.push(errObject.message); // label
            args.push(errObject.code); // value
            if (pageObject) {
                args.push(pageObject);
            } else {
                args.push({ nonInteraction : 1 });
            }
            $window.ga.apply(null,args);
        };
        
        this.pageview = function(){
            var args = Array.prototype.slice.call(arguments,0);
            if (args.length > 1){
                args = [{
                    page  : args[0],
                    title : args[1]
                }];
            }
            args.unshift('pageview');
            args.unshift('send');
            $window.ga.apply(null,args);
        };

    }]);

}());
