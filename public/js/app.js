var app = angular.module('DemoApp', ['ngRoute'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/index', {
                templateUrl: '../index.html',
                controller: 'demoController'
            })
            .otherwise({
                redirectTo: '/index'
            })
    }])
    .factory('socket', function ($rootScope) {
        var socket = io();
        return {
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var arg = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, arg);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var arg = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, arg);
                        }
                    });
                });
            }
        }
    })
    .controller('DemoController', DemoController)
    .filter('numberEx', ['numberFilter', '$locale',
        function (number, $locale) {

            var formats = $locale.NUMBER_FORMATS;
            return function (input, fractionSize) {
                //Get formatted value
                var formattedValue = number(input, fractionSize);

                //get the decimalSepPosition
                var decimalIdx = formattedValue.indexOf(formats.DECIMAL_SEP);

                //If no decimal just return
                if (decimalIdx == -1) return formattedValue;


                var whole = formattedValue.substring(0, decimalIdx);
                var decimal = (Number(formattedValue.substring(decimalIdx)) || "").toString();

                return whole + decimal.substring(1);
            };
        }
    ]);

function DemoController($scope, socket) {
    socket.on('top_gainers', (data) => {
        $scope.top_gainers = data;
    })
    socket.on('top_loosers', (data) => {
        $scope.top_loosers = data;
    })
}




