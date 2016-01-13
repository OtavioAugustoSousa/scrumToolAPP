(function (angular) {
    'use strict';
    function syncRepository($q, $rootScope) {
        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        var db = null;
        var lastIndexsync = 0;

        var open = function () {
            var deferred = $q.defer();
            var version = 1;
            var request = indexedDB.open("syncBD", version);
            request.onupgradeneeded = function (e) {
                db = e.target.result;
                e.target.transaction.onerror = indexedDB.onerror;
                db.createObjectStore("sync", {
                    keyPath: "id"
                });
            }
            request.onsuccess = function (e) {
                db = request.result;
                $rootScope.$apply(function(){
                    deferred.resolve();
                });
            };

            request.onerror = function () {
                deferred.reject("An error occurs opening database");
            };

            return deferred.promise;
        }

        var getsyncs = function () {
            var deferred = $q.defer();
            if (db === null) {
                deferred.reject("IndexDB is not opened yet!");
            } else {
                var trans = db.transaction(["sync"], "readwrite");
                var store = trans.objectStore("sync");
                var syncs = [];

                // Get everything in the store;
                var keyRange = IDBKeyRange.lowerBound(0);
                var cursorRequest = store.openCursor(keyRange);

                cursorRequest.onsuccess = function (e) {
                    var result = e.target.result;
                    if (result === null || result === undefined) {
                        $rootScope.$apply(function(){ deferred.resolve(syncs);});
                    } else {
                        syncs.push(result.value);
                        if (result.value.id > lastIndexsync) {
                            lastIndexsync = result.value.id;
                        }
                        result.continue();
                    }
                };

                cursorRequest.onerror = function (e) {
                    deferred.reject("sync item couldn't be found!");
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
                var trans = db.transaction(["sync"], "readwrite");
                var store = trans.objectStore("sync");
                var request = store.get(parseInt(id));

                request.onsuccess = function (e) {
                    $rootScope.$apply(function(){ deferred.resolve(e.target.result);});
                    console.log();
                };

                request.onerror = function (e) {
                    deferred.reject("sync item couldn't be found!");
                    console.log(e.value);
                    console.log("Something went wrong!!!");
                };
            }

            return deferred.promise;

        };
        var savesync = function (sync) {
            var deferred = $q.defer();
            if (db === null) {
                deferred.reject("IndexDB is not opened yet!");
            } else {
                var trans = db.transaction(["sync"], "readwrite");
                var store = trans.objectStore("sync");
                var request = store.put(sync);
                request.onsuccess = function (e) {
                    $rootScope.$apply(function(){  deferred.resolve();});
                };

                request.onerror = function (e) {
                    deferred.reject("sync item couldn't be added!");
                };
            }

            return deferred.promise;
        };
        
        var removesync = function (sync) {
            var deferred = $q.defer();
            if (db === null) {
                deferred.reject("IndexDB is not opened yet!");
            } else {
                var trans = db.transaction(["sync"], "readwrite");
                var store = trans.objectStore("sync");
                var request = store.delete(sync.id);
                request.onsuccess = function (e) {
                    $rootScope.$apply(function(){  deferred.resolve();});
                };

                request.onerror = function (e) {
                    deferred.reject("sync item couldn't be remove!");
                };
            }

            return deferred.promise;
        };
        
        var getByTable = function (table) {
            var deferred = $q.defer();
            if (db === null) {
                deferred.reject("IndexDB is not opened yet!");
            } else {
                var trans = db.transaction(["sync"], "readwrite");
                var store = trans.objectStore("sync");
                var backlogs = [];

                // Get everything in the store;
                var keyRange = IDBKeyRange.lowerBound(0);
                var cursorRequest = store.openCursor(keyRange);

                cursorRequest.onsuccess = function (e) {
                    var result = e.target.result;
                    if (result === null || result === undefined) {
                        $rootScope.$apply(function(){ deferred.resolve(backlogs);});
                    } else {
                        var valor = result.value;
                        if(valor.table ==  table ){
                            backlogs.push(result.value);
                        }
                        if (result.value.id > lastIndexsync) {
                        	lastIndexsync = result.value.id;
                        }
                        result.continue();
                    }
                };

                cursorRequest.onerror = function (e) {
                    deferred.reject("Backlog item couldn't be found!");
                    console.log(e.value);
                    console.log("Something went wrong!!!");
                };
            }

            return deferred.promise;

        };
        return {
            open: open,
            getsyncs: getsyncs,
            savesync: savesync,
            getById: getById,
            removesync:removesync,
            getByTable: getByTable
        }
    }
    angular
        .module('app.repository')
        .factory('syncRepository', syncRepository);
        syncRepository.$inject = ['$q','$rootScope'];

})(window.angular);

