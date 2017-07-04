'use strict';

/**
 * Creates a model instance based on the provided row data.
 * @param Model
 * @param row
 */
exports.getInstanceFromRow = function (Model, row) {
  var translated = {};
  var fields = Object.keys(Model.fields);
  var upperCaseFields = fields.join('|').toUpperCase().split('|');
  Object.keys(row).forEach(function (columnName) {
    var i = upperCaseFields.indexOf(columnName);
    if (i >= 0) {
      translated[fields[i]] = row[columnName];
    }
  });
  var primaryKeyColumn = this.getPrimaryKeyColumn(Model);
  var instance = Model.instance(translated, true);
  // istanbul ignore else
  if (primaryKeyColumn) {
    instance.setPrimaryKey(row[primaryKeyColumn]);
  }
  return instance;
};