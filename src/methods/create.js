'use strict';

var Arrow = require('arrow');
var OracleDB = require('oracledb');

/**
 * Creates a new Model or Collection object.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Object} [values] Attributes to set on the new model(s).
 * @param {Function} callback Callback passed an Error object (or null if successful), and the new model or collection.
 * @throws {Error}
 */
exports.create = function (Model, values, callback) {
  var table = this.getTableName(Model);
  var payload = Model.instance(values, false).toPayload();
  var primaryKeyColumn = this.getPrimaryKeyColumn(Model);
  var columns = this.fetchColumns(payload);
  var placeholders = columns.map(this.returnPlaceholder);
  var query;

  if (!primaryKeyColumn) {
    return callback(new Arrow.ORMError('can\'t find primary key column for ' + table));
  }

  query = 'INSERT INTO ' + table + ' (' + this.escapeKeys(columns).join(',') + ')' + ' VALUES (' + placeholders.join(',') + ')' + ' RETURNING "' + primaryKeyColumn + '" INTO :' + primaryKeyColumn;

  payload[primaryKeyColumn] = { type: OracleDB.NUMBER, dir: OracleDB.BIND_OUT };
  this._query(query, payload, callback, function (rows, result) {
    var instance = Model.instance(values);
    if (primaryKeyColumn) {
      instance.setPrimaryKey(result.outBinds[primaryKeyColumn][0]);
    }
    callback(null, instance);
  });
};