'use strict';

/**
 * Fetches the correct table schema for the model, based on its name.
 * @param tableNameOrModel
 * @returns {*}
 */
exports.getTableSchema = function getTableSchema(tableNameOrModel) {
  if (typeof tableNameOrModel !== 'string') {
    tableNameOrModel = this.getTableName(tableNameOrModel);
  }
  return this.schema.objects[tableNameOrModel.toUpperCase()];
};