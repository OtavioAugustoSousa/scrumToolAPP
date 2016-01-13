(function (angular) {
    'use strict';
    function backlogRepository($q, $rootScope) {
        var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        var db = null;
        var lastIndexBacklog = 0;

        var open = function () {
            var deferred = $q.defer();
            var version = 10;
            var request = indexedDB.open("scrumToolDB", version);
            request.onupgradeneeded = function (e) {
                db = e.target.result;
                e.target.transaction.onerror = indexedDB.onerror;
                db.deleteObjectStore("backlog");
                db.createObjectStore("backlog", {
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

        var getBacklogs = function () {
            var deferred = $q.defer();
            if (db === null) {
                deferred.reject("IndexDB is not opened yet!");
            } else {
                var trans = db.transaction(["backlog"], "readwrite");
                var store = trans.objectStore("backlog");
                var backlogs = [];

                // Get everything in the store;
                var keyRange = IDBKeyRange.lowerBound(0);
                var cursorRequest = store.openCursor(keyRange);

                cursorRequest.onsuccess = function (e) {
                    var result = e.target.result;
                    if (result === null || result === undefined) {
                        $rootScope.$apply(function(){ deferred.resolve(backlogs);});
                    } else {
                        backlogs.push(result.value);
                        if (result.value.id > lastIndexBacklog) {
                            lastIndexBacklog = result.value.id;
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
        var getBacklogByStatus = function (status) {
            var deferred = $q.defer();
            if (db === null) {
                deferred.reject("IndexDB is not opened yet!");
            } else {
                var trans = db.transaction(["backlog"], "readwrite");
                var store = trans.objectStore("backlog");
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
                        if(valor.status ==  status){
                            backlogs.push(result.value);
                        }
                        if (result.value.id > lastIndexBacklog) {
                            lastIndexBacklog = result.value.id;
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
        var getById = function (id) {
            var deferred = $q.defer();
            if (db === null) {
                deferred.reject("IndexDB is not opened yet!");
            } else {
                var trans = db.transaction(["backlog"], "readwrite");
                var store = trans.objectStore("backlog");
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
        var saveBacklog = function (backlog) {
            var deferred = $q.defer();
            if (db === null) {
                deferred.reject("IndexDB is not opened yet!");
            } else {
                var trans = db.transaction(["backlog"], "readwrite");
                var store = trans.objectStore("backlog");
                var request = store.put(backlog);
                request.onsuccess = function (e) {
                    $rootScope.$apply(function(){  deferred.resolve();});
                };

                request.onerror = function (e) {
                    deferred.reject("Backlog item couldn't be added!");
                };
            }

            return deferred.promise;
        };
        
        var removeBacklog = function (backlog) {
            var deferred = $q.defer();
            if (db === null) {
                deferred.reject("IndexDB is not opened yet!");
            } else {
                var trans = db.transaction(["backlog"], "readwrite");
                var store = trans.objectStore("backlog");
                var request = store.delete(backlog.id);
                request.onsuccess = function (e) {
                    $rootScope.$apply(function(){  deferred.resolve();});
                };

                request.onerror = function (e) {
                    deferred.reject("Backlog item couldn't be remove!");
                };
            }

            return deferred.promise;
        };
        return {
            open: open,
            getbacklogs: getBacklogs,
            saveBacklog: saveBacklog,
            getBacklogByStatus: getBacklogByStatus,
            getById: getById,
            removeBacklog:removeBacklog
        }
    }
    angular
        .module('app.repository')
        .factory('backlogRepository', backlogRepository);
        backlogRepository.$inject = ['$q','$rootScope'];

})(window.angular);

