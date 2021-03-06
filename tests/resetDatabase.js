'use strict';

(function() {
  var env = require('../src/env.js');
  var dbOptions = require('../database.json')[env];
  var dbConnectionPool = require('../src/dbConnectionPool');
  var async = require('async');

  var resetDatabase = function (callback) {
    var dbWrapper;

    async.series(
      [
        function (callback) {
          dbConnectionPool.acquire(function (err, dbConnection) {
            dbWrapper = dbConnection;
            callback(err);
          });
        },

        function(callback) {
          if (dbOptions.driver === 'sqlite3') {

            async.series(
              [
                function (callback) {
                  dbWrapper.remove('apikey', '1', function (err) {
                    callback(err);
                  });
                },
                function (callback) {
                  dbWrapper.remove('experiment', '1', function (err) {
                    callback(err);
                  });
                },
                function (callback) {
                  dbWrapper.remove('participant', '1', function (err) {
                    callback(err);
                  });
                },
                function (callback) {
                  dbWrapper.remove('variation', '1', function (err) {
                    callback(err);
                  });
                },
                function (callback) {
                  dbWrapper.remove('param', '1', function (err) {
                    callback(err);
                  });
                },
                function (callback) {
                  dbWrapper.remove('participant_experiment_variation', '1', function (err) {
                    callback(err, null);
                  });
                },
                function (callback) {
                  dbWrapper.remove('sqlite_sequence', '1', function (err) {
                    callback(err, null);
                  });
                }
              ],
              function (err, results) {
                callback(err);
              }
            );

          } else if (dbOptions.driver === 'mysql') {

            async.series(
              [
                function (callback) {
                  dbWrapper.fetchOne('TRUNCATE apikey', [], function (err, result) {
                    callback(err, null);
                  });
                },
                function (callback) {
                  dbWrapper.fetchOne('TRUNCATE experiment', [], function (err, result) {
                    callback(err, null);
                  });
                },
                function (callback) {
                  dbWrapper.fetchOne('TRUNCATE participant', [], function (err, result) {
                    callback(err, null);
                  });
                },
                function (callback) {
                  dbWrapper.fetchOne('TRUNCATE variation', [], function (err, result) {
                    callback(err, null);
                  });
                },
                function (callback) {
                  dbWrapper.fetchOne('TRUNCATE param', [], function (err, result) {
                    callback(err, null);
                  });
                },
                function (callback) {
                  dbWrapper.fetchOne('TRUNCATE participant_experiment_variation', [], function (err, result) {
                    callback(err, null);
                  });
                }
              ],
              function (err, results) {
                callback(err);
              }
            );

          }
        },

        function (callback) {
          dbWrapper.insert('apikey', { 'apikey': 'abcd' }, function (err) {
            callback(err, null);
          });
        }

      ],
      function (err, results) {
        dbConnectionPool.release(dbWrapper);
        callback(err);
      }

    );
  }

  module.exports = resetDatabase;
})();
