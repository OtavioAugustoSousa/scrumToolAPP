(function (angular) {
    'use strict';

    angular.module('app').controller('backlogController', backlogController);
    backlogController.$inject = ['$scope', 'backlogRepository', '$timeout', '$rootScope', 'factoryBacklog', 'syncRepository'];

    // EstruturaBase para um controller
    function backlogController($scope, backlogRepository, $timeout, $rootScope, factoryBacklog, syncRepository) {
        $scope.itemBacklog = {};
        $scope.nome = "";
        $scope.list_Todo = [];
        $scope.list_Doing = [];
        $scope.list_Done = [];
        $scope.status = "";
        function init() {
            backlogRepository.open().then(function () {
                listAll();
            });
        	syncRepository.open().then(function () {
              	sync();
              });
            
        }
        
        init();

        $scope.createItem = function (status) {
            var ele = $('#createItem');
            ele.modal('show');
            $scope.status = status;
        };

        function listToDo() {
            backlogRepository.getBacklogByStatus("TODO")
                .then(function (sucesso) {
                    $scope.list_Todo = sucesso;
                    angular.forEach( $scope.list_Todo, function(value, key){
                    	 if(navigator.onLine){
                    		 // sync(value);
                    	 }
                });
  
        });
            }

        function listDoing() {
            backlogRepository.getBacklogByStatus("DOING")
                .then(function (sucesso) {
                    $scope.list_Doing = sucesso;
                });
        };

        function listDones() {
            backlogRepository.getBacklogByStatus("DONE")
                .then(function (sucesso) {
                    $scope.list_Done = sucesso;
                });
        };
        function listAll() {
            listToDo();
            listDoing();
            listDones();
        }

        $scope.salvar = function (item) {
            var ele = $('#createItem').modal('hide');
            item.status = $scope.status;
            salvar(item);
            }
            
            $scope.itemBacklog ={};
        
        function salvar(item){ 
        	 var promisse;
        	 if(navigator.onLine){
             	factoryBacklog.salvar(item).then(function(sucesso){
             		 promisse = backlogRepository.saveBacklog(sucesso.data);
             		 promisse.then(
                             function () {
                                 listAll();
                             },
                             function (erro) {
                                 console.log(erro)
                             });
                     
     			}, function(error){
     			});	
             }else{
            	item.id = Date.now();
             	/* Criacao do objeto de sync */
             	var syncObject={};
             	syncObject.id= item.id;
             	syncObject.value= item;
             	syncObject.operacao="save";
             	syncObject.table="backlog";
             	syncRepository.savesync(syncObject);
             	
             	promisse = backlogRepository.saveBacklog(item);
             	promisse.then(
                         function () {
                             listAll();
                         },
                         function (erro) {
                             console.log(erro)
                         });
             	}
         }
        $scope.allowDrop = function (ev) {
            ev.preventDefault();
            ev.currentTarget.style.border = "dashed thin";
            ev.effectAllowed = "copyMove";
        }

        $scope.drag = function (ev) {
            ev.dataTransfer.setData("text", ev.target.id);
        }

        function updateStatus(id, status){
            backlogRepository.getById(id).then(function (sucesso) {
                var obj = sucesso;
                obj.status= status;
                $scope.update(obj);
                if(navigator.onLine){
                   	factoryBacklog.update(obj).then(function(sucesso){
           			}, function(error){
           			});	
                   	}
            });
        }
        $scope.drop = function (ev) {
            ev.preventDefault();
            var container;
            var id = ev.dataTransfer.getData("text");
            var todo = document.getElementById("todo-area");
            var doing = document.getElementById("doing-area");
            var done = document.getElementById("done-area");

            if (contain(todo, ev.target)) {
                todo.appendChild(document.getElementById(id));
                updateStatus(id,"TODO");
            }
            // var cont = ;
            if (contain(doing, ev.target)) {
                doing.appendChild(document.getElementById(id));
                updateStatus(id,"DOING");
            }
            if (contain(done, ev.target)) {
                done.appendChild(document.getElementById(id));
                updateStatus(id,"DONE");
            }
            todo.style.border = "none";
            doing.style.border = "none";
            done.style.border = "none";

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
        $scope.updateItem= function(item){
        	  var ele = $('#updateItem');
              ele.modal('show');
              $scope.itemBacklog =item;    
        }
        $scope.update= function(item){
      	  var ele = $('#updateItem');
            ele.modal('hide');
            var promisse = backlogRepository.saveBacklog(item);
    		 promisse.then(
                    function () {
                        listAll();
                    },
                    function (erro) {
                        console.log(erro)
                    });
           if(navigator.onLine){
           	factoryBacklog.update(item).then(function(sucesso){
           		console.log(sucesso);
   			}, function(error){
   			});	
           
           }else{
        	   var syncObject={};
            	syncObject.id= item.id;
            	syncObject.value= item;
            	syncObject.operacao="update";
            	syncObject.table="backlog";
            	syncRepository.savesync(syncObject);
           }
           $scope.itemBacklog ={};
      }
      
      $scope.delete = function(item) {
    	  if(navigator.onLine){
             	factoryBacklog.remover(item.id).then(function(sucesso){
             		  remove(item);
             		  
     			}, function(error){});	
           }else{
	        	var syncObject={};
	           	syncObject.id= item.id;
	           	syncObject.value= item;
	           	syncObject.operacao="remove";
	           	syncObject.table="backlog";
	           	syncRepository.savesync(syncObject);
	           	remove(item);
           	
           }
	}
      
      function remove(item){
    	var promisse = backlogRepository.removeBacklog(item);
  		 promisse.then(
                  function () {
                      listAll();
                  },
                  function (erro) {
                      console.log(erro)
                  });
      }
      
      function sync() {
    	 syncRepository.getByTable("backlog").then(function(response){
    		 console.log("sync");
    		 if(navigator.onLine){
    		 angular.forEach(response,function(value,key){
    			switch(value.operacao){
    				case "save":
		    			var item = value.value;
		    			 remove(item);
		    			 item.id="";
		       			 console.log(value.value);
		       			 syncRepository.removesync(value);
		       			 salvar(item);
		       			 break;
    				case "remove":
    					  $scope.delete(value.value);
    					  syncRepository.removesync(value);
    					  break;
    				case "update":
  					  $scope.update(value.value);
  					  syncRepository.removesync(value);
  					  break;
       			 }
    		});
    		 }
    	 }, function(erro) {
			console.log(erro);
		});
      	}
      
      window.addEventListener("online", function (e) {
      	syncRepository.open().then(function () {
          	sync();
          });
      }, true);   
      
    }
  
})
(window.angular);

