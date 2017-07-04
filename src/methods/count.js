'use strict';

var Arrow = require('arrow');
var _ = require('lodash');

/**
 * Gets the count of the model's instances.
 * @param {Arrow.Model} Model The model class being counted.
 * @param {Arrow.Instance} instance Model instance.
 * @param {Function} callback Callback passed an Error object (or null if successful), and the count of the instances.
 */
exports.count = function (Model, options, callback) {
  var table = this.getTableName(Model);
  var primaryKeyColumn = this.getPrimaryKeyColumn(Model);
  var query;

  if (!primaryKeyColumn) {
    return callback(new Arrow.ORMError('can\'t find primary key column for ' + table));
  }

  query = 'SELECT COUNT(' + primaryKeyColumn + ') AS COUNT FROM ' + table;

  this._query(query, callback, function (result) {
    if (result && result.length) {
      return callback(null, _.sum(result, function (set) {
        return set.COUNT;
      }));
    }
    return callback(null, 0);
  });
};