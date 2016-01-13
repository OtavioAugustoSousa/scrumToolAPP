(function(angular) {
	'use strict';

	angular.module('app').controller('equipeController', equipeController);
	equipeController.$inject = [ '$scope', 'equipeRepository','$timeout', '$rootScope' ];

	function equipeController($scope, equipeRepository, $timeout, $rootScope) {
		$scope.pessoa={};
		$scope.pessoas=[];
		$scope.createPessoa = function() {
			var ele = $('#createPessoa');
			ele.modal('show');
		}
		
		function init() {
			equipeRepository.open().then(function() {
				listEquipes();
			});
		}
		init();

		function listEquipes() {
			var promisse = equipeRepository.getequipes();
			promisse.then(function(sucess) {
				$scope.pessoas = sucess;
				console.log(sucess);
			}, function(erro) {
				console.log(erro)
			});
		}
		$scope.salvar = function(pessoa) {
			pessoa.papel="PESSOAS";
			var ele = $('#createPessoa').modal('hide');
			salvar(pessoa);
		};
		
		function salvar(pessoa) {
			var promisse = equipeRepository.saveequipe(pessoa);
			promisse.then(function() {
				listEquipes();
			}, function(erro) {
				console.log(erro)
			});
		}
		
		 function updatePapel(id, papel){
			 equipeRepository.getById(id).then(function (sucesso) {
	                var obj = sucesso;
	                obj.papel= papel;
	                salvar(obj);
	            });
	        }
		
		   $scope.allowDrop = function (ev) {
	            ev.preventDefault();
	            ev.currentTarget.style.border = "dashed thin";
	            ev.effectAllowed = "copyMove";
	        }

	        $scope.drag = function (ev) {
	            ev.dataTransfer.setData("text", ev.target.id);
	        }

	        $scope.drop = function (ev) {
	            ev.preventDefault();
	            var container;
	            var id = ev.dataTransfer.getData("text");
	            var productOwner = document.getElementById("productOwner");
	            var stakeholders = document.getElementById("stakeholders");
	            var equipe = document.getElementById("equipe");
	            var pessoas = document.getElementById("pessoas");

	            if (contain(productOwner, ev.target)) {
	                productOwner.appendChild(document.getElementById(id));
	                updatePapel(id, "PRODUCTOWNER")
	            }
	            //var cont = ;
	            if (contain(stakeholders, ev.target)) {
	                stakeholders.appendChild(document.getElementById(id));
	                updatePapel(id, "STAKEHOLDER");
	            }
	            if (contain(equipe, ev.target)) {
	                equipe.appendChild(document.getElementById(id));
	                updatePapel(id, "EQUIPE")
	            }
	            if (contain(pessoas, ev.target)) {
	                pessoas.appendChild(document.getElementById(id));
	                updatePapel(id, "PESSOAS")
	            }
	            productOwner.style.border = "none";
	            stakeholders.style.border = "none";
	            equipe.style.border = "none";
	            pessoas.style.border = "none";

	        }
	        function contain(parent, child) {
	            if (child == null) {
	                return false
	            }
	            if (parent == child) return true;
	            return contain(parent, child.parentNode);
	        }


	        function isDescendant(parent, child) {
	            var node = child.parentNode;
	            while (node != null) {
	                if (node == parent) {
	                    return true;
	                }
	                node = node.parentNode;
	            }
	            return false;
	        }


	};
})(window.angular);
