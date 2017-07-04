'use strict';

/**
 * Searches for distinct rows in the database.
 * @param Model
 * @param field
 * @param options
 * @param callback
 */
exports.distinct = function distinct(Model, field, options, callback) {
  var table = this.getTableName(Model);
  var values = {};
  var whereQuery = '';

  field = field.toUpperCase();

  var where = Model.translateKeysForPayload(options.where);
  if (where && Object.keys(where).length > 0) {
    whereQuery = this.translateWhereToQuery(where, values);
  }

  var query = 'SELECT DISTINCT "' + field + '" ' + ' FROM ' + table + whereQuery;

  this._query(query, values, { useResultSet: true }, callback, function (rows) {
    if (rows) {
      callback(null, rows.map(function (element) {
        return element[field];
      }));
    } else {
      callback();
    }
  });
};