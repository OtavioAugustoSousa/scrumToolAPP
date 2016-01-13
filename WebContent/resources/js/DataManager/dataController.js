//FIXME Fazer o armazenamento no indexBD

(function(angular){
    'use strict';

    angular.module('app').controller('dataController', dataController);
    dataController.$inject = ['$scope','projetoRepository','$timeout'];

    //EstruturaBase para um controller
    function dataController($scope, projetoRepository,$timeout){
        $scope.nome="";
        $scope.add = function(){
            //just for update a promise
            $timeout(function() {}, 250);
            projetoRepository.open()
                .then(function(e){
                projetoRepository.saveProjeto({'name':$scope.nome}).then(function(s){console.log("salvou")},function(erro){console.log(erro)});
            },function(a){
                console.log("as");
            });
        }
    }

})(window.angular);