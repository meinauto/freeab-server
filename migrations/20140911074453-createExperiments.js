var dbm = require('db-migrate');
var type = dbm.dataType;
var async = require('async');

exports.up = function(db, callback) {
  async.series(
    [

      db.createTable.bind(db, 'experiment', {
        id: { type: 'int', primaryKey: true, autoIncrement: true, notNull: true },
        name: { type: 'string', length: '128', notNull: true, unique: true },
        scope: { type: 'real', notNull: true }
      }),

      db.createTable.bind(db, 'variation', {
        id: { type: 'int', primaryKey: true, autoIncrement: true, notNull: true },
        experiment_id: { type: 'int', notNull: true },
        name: { type: 'string', length: '128', notNull: true },
        weight: { type: 'real', notNull: true }
      }),

      db.addIndex.bind(db, 'variation', 'fk_variation_experiment_1', 'experiment_id'),

      db.createTable.bind(db, 'param_name', {
        id: { type: 'int', primaryKey: true, autoIncrement: true, notNull: true },
        variation_id: { type: 'int', notNull: true },
        name: { type: 'string', length: '128', notNull: true }
      }),

      db.addIndex.bind(db, 'param_name', 'fk_param_name_variation_1', 'variation_id'),

      db.createTable.bind(db, 'param_value', {
        id: { type: 'int', primaryKey: true, autoIncrement: true, notNull: true },
        variation_id: { type: 'int', notNull: true },
        param_name_id: { type: 'int', notNull: true },
        value: { type: 'string', length: '128', notNull: true }
      }),

      db.addIndex.bind(db, 'param_value', 'fk_param_value_variation_1', 'variation_id'),

      db.addIndex.bind(db, 'param_value', 'fk_param_value_param_name_1', 'param_name_id'),

    ], callback);
};

exports.down = function(db, callback) {
  async.series(
    [
      db.dropTable.bind(db, 'param_value'),
      db.dropTable.bind(db, 'param_name'),
      db.dropTable.bind(db, 'variation'),
      db.dropTable.bind(db, 'experiment')
    ], callback);
};