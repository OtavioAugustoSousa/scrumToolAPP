(function (angular) {
    'use strict';
    function projetoRepository($q) {
        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        var db = null;
        var lastIndexProjeto = 0;

        var open = function () {
            var deferred = $q.defer();
            var version = 10;
            var request = indexedDB.open("scrumToolDB", version);
            request.onupgradeneeded = function (e) {
                db = e.target.result;
                e.target.transaction.onerror = indexedDB.onerror;

                if (db.objectStoreNames.contains("projeto")) {
                    db.deleteObjectSore("projeto");
                }
                db.createObjectStore("projeto", {
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

        var getProjetos = function () {
            var deferred = $q.defer();
            if (db === null) {
                deferred.reject("IndexDB is not opened yet!");
            } else {
                var trans = db.transaction(["projeto"], "readwrite");
                var store = trans.objectStore("projeto");
                var projetos = [];

                // Get everything in the store;
                var keyRange = IDBKeyRange.lowerBound(0);
                var cursorRequest = store.openCursor(keyRange);

                cursorRequest.onsuccess = function (e) {
                    var result = e.target.result;
                    if (result === null || result === undefined) {
                        deferred.resolve(projetos);
                    } else {
                    	projetos.push(result.value);
                        if (result.value.id > lastIndexProjeto) {
                            lastIndexProjeto = result.value.id;
                        }
                        result.continue();
                    }
                };

                cursorRequest.onerror = function (e) {
                    deferred.reject("Projeto item couldn't be added!");
                    console.log(e.value);
                    console.log("Something went wrong!!!");
                };
            }

            return deferred.promise;

        };

        var saveProjeto = function (projeto) {
            var deferred = $q.defer();
            if (db === null) {
                deferred.reject("IndexDB is not opened yet!");
            } else {
                var trans = db.transaction(["projeto"], "readwrite");
                var store = trans.objectStore("projeto");
                var request = store.put(projeto);

                request.onsuccess = function (e) {
                    deferred.resolve();
                };

                request.onerror = function (e) {
                    deferred.reject("Projeto item couldn't be added!");
                };
            }

            return deferred.promise;
        };
        return {
            open: open,
            getProjetos: getProjetos,
            saveProjeto: saveProjeto
        }
    }
    angular
        .module('app.repository', [])
        .factory('projetoRepository', projetoRepository);
    projetoRepository.$inject = ['$q'];

})(window.angular);

