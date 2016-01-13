(function(angular) {
	'use strict';
	// EstruturaBase para um controller
	function factoryBacklog($http) {
		var baseUrl="http://localhost:8080/scrumtool/backlogs"
		function salvar(objeto) {
			return $http.post(baseUrl,objeto);
		};
		
		function update(objeto) {
			return $http.patch(baseUrl,objeto);
		};
		
		function remover(id) {
			return $http.delete(baseUrl+"/"+id);
		};
		
		function listar(){
			$http.get(baseUrl).then(function(sucesso){
			}, function(error){});
		};
		
		
		return {
			salvar : salvar,
			listar: listar,
			update: update,
			remover: remover
		}
	}

	angular.module('app').factory('factoryBacklog', factoryBacklog);
	factoryBacklog.$inject = [ '$http' ];
})(window.angular);