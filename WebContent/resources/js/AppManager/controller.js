(function(angular){
    'use strict';
    //EstruturaBase para um controller
    function controllerTest($scope){
        $scope.helo= "Hello World!!!";
    }

    angular.module('app').controller('test', controllerTest);
})(window.angular);