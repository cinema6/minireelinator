define(['app','angular'], function(appModule, angular) {
    'use strict';

    function pad(num) {
        var norm = Math.abs(Math.floor(num));
        return (norm < 10 ? '0' : '') + norm;
    }

    describe('datepicker directive', function() {
        var $rootScope,
            $compile,
            $scope,
            $timeout,
            $document,
            $input,
            $;

        beforeEach(function() {
            module(appModule.name);

            $ = angular.element;
            spyOn($.fn, 'datepicker');

            inject(function($injector) {
                $rootScope = $injector.get('$rootScope');
                $compile = $injector.get('$compile');
                $document = $injector.get('$document');
                $timeout = $injector.get('$timeout');
                $scope = $rootScope.$new();
            });

        });

        describe('initializing datepicker jquery ui plugin', function() {
            it('should call the datepicker method with options', function() {
                $input = $compile('<input datepicker min-date="minDate" max-date="maxDate" default-date="defaultDate"></input>')($scope);

                expect($input.datepicker).toHaveBeenCalledWith(jasmine.any(Object));
                expect($input.datepicker).toHaveBeenCalledWith(jasmine.objectContaining({
                    minDate: 0,
                    maxDate: null,
                    defaultDate: null,
                    changeMonth: false,
                    numberOfMonths: 1,
                    prevText: '',
                    nextText: ''
                }));
            });

            describe('when allow-past="true" is set', function() {
                it('should include options from the scope', function() {
                    $scope.minDate = '01/01/2015';
                    $scope.maxDate = '02/01/2015';
                    $scope.defaultDate = '+1m';

                    $input = $compile('<input datepicker allow-past="true" min-date="minDate" max-date="maxDate" default-date="defaultDate"></input>')($scope);

                    expect($input.datepicker).toHaveBeenCalledWith(jasmine.objectContaining({
                        minDate: $scope.minDate,
                        maxDate: $scope.maxDate,
                        defaultDate: $scope.defaultDate
                    }));
                });
            });

            describe('when allow-past="true" is not set', function() {
                it('should include options from the scope', function() {
                    var today = new Date(),
                        todayString = pad(today.getMonth() + 1) + '/' + pad(today.getDate()) + '/' + today.getFullYear();

                    $scope.minDate = '01/01/2015';
                    $scope.maxDate = '02/01/2015';
                    $scope.defaultDate = '+1m';

                    $input = $compile('<input datepicker min-date="minDate" max-date="maxDate" default-date="defaultDate"></input>')($scope);

                    expect($input.datepicker).toHaveBeenCalledWith(jasmine.objectContaining({
                        minDate: todayString,
                        maxDate: $scope.maxDate,
                        defaultDate: $scope.defaultDate
                    }));
                });
            });
        });

        describe('before every show', function() {
            describe('when allow-past="true" is set', function() {
                var beforeShow;

                beforeEach(function() {
                    $scope.$apply(function() {
                        $input = $compile('<input datepicker allow-past="true" min-date="minDate" max-date="maxDate" default-date="defaultDate"></input><div id="ui-datepicker-div"></div>')($scope);

                        $('body').append($input);
                        $('body').append('<div id="ui-datepicker-div"></div>');
                    });

                    beforeShow = $input.datepicker.calls.mostRecent().args[0].beforeShow;
                });

                it('should update the datepicker with the minDate and maxDate', function() {
                    var now = new Date(),
                        laterDate = pad(now.getMonth() + 1) + '/' + pad(now.getDate()) + '/' + (now.getFullYear() + 1),
                        laterDateMin = pad(now.getMonth() + 1) + '/' + pad(now.getDate() + 1) + '/' + (now.getFullYear() + 1),
                        evenLaterDate = pad(now.getMonth() + 1) + '/' + pad(now.getDate()) + '/' + (now.getFullYear() + 2),
                        evenLaterDateMax = pad(now.getMonth() + 1) + '/' + pad(now.getDate() - 1) + '/' + (now.getFullYear() + 2);

                    beforeShow();

                    expect($input.datepicker).toHaveBeenCalledWith('option', 'minDate', undefined);
                    expect($input.datepicker).toHaveBeenCalledWith('option', 'maxDate', null);

                    $scope.minDate = laterDate;
                    $scope.maxDate = evenLaterDate;
                    $scope.$digest();

                    beforeShow();

                    expect($input.datepicker).toHaveBeenCalledWith('option', 'minDate', laterDate);
                    expect($input.datepicker).toHaveBeenCalledWith('option', 'maxDate', evenLaterDate);
                });

                it('should allow a minDate earlier than today', function() {
                    $scope.minDate = '01/01/2000';
                    $scope.$digest();

                    beforeShow();

                    expect($input.datepicker).toHaveBeenCalledWith('option', 'minDate', $scope.minDate);
                });

                it('should calculate and set the datepicker position', function() {
                    var $picker = $('#ui-datepicker-div');
                    $picker.css('width','200px');
                    $picker.css('position','absolute');
                    $picker.css('top','0px');

                    $input.css('position','fixed');
                    $input.css('width','500px');
                    $input.css('left','400px');
                    $input.css('top','0px');
                    $input.css('padding','0');
                    $input.css('border','0');

                    beforeShow();

                    $timeout.flush();

                    expect($picker.css('left')).toEqual('550px');
                });
            });

            describe('when allow-past="true" is not set', function() {
                var beforeShow;

                beforeEach(function() {
                    $scope.$apply(function() {
                        $input = $compile('<input datepicker min-date="minDate" max-date="maxDate" default-date="defaultDate"></input><div id="ui-datepicker-div"></div>')($scope);

                        $('body').append($input);
                        $('body').append('<div id="ui-datepicker-div"></div>');
                    });

                    beforeShow = $input.datepicker.calls.mostRecent().args[0].beforeShow;
                });

                it('should update the datepicker with the minDate and maxDate', function() {
                    var now = new Date(),
                        laterDate = pad(now.getMonth() + 1) + '/' + pad(now.getDate()) + '/' + (now.getFullYear() + 1),
                        laterDateMin = pad(now.getMonth() + 1) + '/' + pad(now.getDate() + 1) + '/' + (now.getFullYear() + 1),
                        evenLaterDate = pad(now.getMonth() + 1) + '/' + pad(now.getDate()) + '/' + (now.getFullYear() + 2),
                        evenLaterDateMax = pad(now.getMonth() + 1) + '/' + pad(now.getDate() - 1) + '/' + (now.getFullYear() + 2);

                    beforeShow();

                    expect($input.datepicker).toHaveBeenCalledWith('option', 'minDate', 0);
                    expect($input.datepicker).toHaveBeenCalledWith('option', 'maxDate', null);

                    $scope.minDate = laterDate;
                    $scope.maxDate = evenLaterDate;
                    $scope.$digest();

                    beforeShow();

                    expect($input.datepicker).toHaveBeenCalledWith('option', 'minDate', laterDate);
                    expect($input.datepicker).toHaveBeenCalledWith('option', 'maxDate', evenLaterDate);
                });

                it('should ensure that minDate is never earlier than today', function() {
                    var now = new Date(),
                        today = pad(now.getMonth() + 1) + '/' + pad(now.getDate()) + '/' + now.getFullYear();

                    $scope.minDate = '01/01/2000';
                    $scope.$digest();

                    beforeShow();

                    expect($input.datepicker).toHaveBeenCalledWith('option', 'minDate', today);
                });

                it('should calculate and set the datepicker position', function() {
                    var $picker = $('#ui-datepicker-div');
                    $picker.css('width','200px');
                    $picker.css('position','absolute');
                    $picker.css('top','0px');

                    $input.css('position','fixed');
                    $input.css('width','500px');
                    $input.css('left','400px');
                    $input.css('top','0px');
                    $input.css('padding','0');
                    $input.css('border','0');

                    beforeShow();

                    $timeout.flush();

                    expect($picker.css('left')).toEqual('550px');
                });
            });
        });
    });
});