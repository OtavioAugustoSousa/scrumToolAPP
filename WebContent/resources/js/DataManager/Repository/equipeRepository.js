(function (angular) {
    'use strict';
    function equipeRepository($q, $rootScope) {
        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        var db = null;
        var lastIndexequipe = 0;

        var open = function () {
            var deferred = $q.defer();
            var version = 10;
            var request = indexedDB.open("scrumToolDB", version);
            request.onupgradeneeded = function (e) {
                db = e.target.result;
                e.target.transaction.onerror = indexedDB.onerror;

                if (db.objectStoreNames.contains("equipe")) {
                    db.deleteObjectSore("equipe");
                }
                db.createObjectStore("equipe", {
                    keyPath: "id"
                });
            }
            request.onsuccess = function (e) {
                db = request.result;
                deferred.resolve();
            };

            request.onerror = function () {
                deferred.reject("An error occurs opening database");
            };

            return deferred.promise;
        }

        var getequipes = function () {
            var deferred = $q.defer();
            if (db === null) {
                deferred.reject("IndexDB is not opened yet!");
            } else {
                var trans = db.transaction(["equipe"], "readwrite");
                var store = trans.objectStore("equipe");
                var equipes = [];

                // Get everything in the store;
                var keyRange = IDBKeyRange.lowerBound(0);
                var cursorRequest = store.openCursor(keyRange);

                cursorRequest.onsuccess = function (e) {
                    var result = e.target.result;
                    if (result === null || result === undefined) {
                        deferred.resolve(equipes);
                    } else {
                    	equipes.push(result.value);
                        if (result.value.id > lastIndexequipe) {
                            lastIndexequipe = result.value.id;
                        }
                        result.continue();
                    }
                };

                cursorRequest.onerror = function (e) {
                    deferred.reject("equipe item couldn't be added!");
                    console.log(e.value);
                    console.log("Something went wrong!!!");
                };
            }

            return deferred.promise;

        };
        
        var getById = function (id) {
            var deferred = $q.defer();
            if (db === null) {
                deferred.reject("IndexDB is not opened yet!");
            } else {
                var trans = db.transaction(["equipe"], "readwrite");
                var store = trans.objectStore("equipe");
                var request = store.get(parseInt(id));

                request.onsuccess = function (e) {
                    $rootScope.$apply(function(){ deferred.resolve(e.target.result);});
                    console.log();
                };

                request.onerror = function (e) {
                    deferred.reject("Backlog item couldn't be found!");
                    console.log(e.value);
                    console.log("Something went wrong!!!");
                };
            }

            return deferred.promise;

        };

        var saveequipe = function (equipe) {
            var deferred = $q.defer();
            if (db === null) {
                deferred.reject("IndexDB is not opened yet!");
            } else {
                var trans = db.transaction(["equipe"], "readwrite");
                var store = trans.objectStore("equipe");
                var request = store.put(equipe);

                request.onsuccess = function (e) {
                    deferred.resolve();
                };

                request.onerror = function (e) {
                    deferred.reject("equipe item couldn't be added!");
                };
            }

            return deferred.promise;
        };
        return {
            open: open,
            getequipes: getequipes,
            getById:getById,
            saveequipe: saveequipe
        }
    }
    angular
        .module('app.repository', [])
        .factory('equipeRepository', equipeRepository);
    equipeRepository.$inject = ['$q','$rootScope'];

})(window.angular);

