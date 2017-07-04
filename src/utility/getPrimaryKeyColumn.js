'use strict';

/**
 * Gets the primary key column for the provided model.
 * @param Model
 * @returns {*}
 */
exports.getPrimaryKeyColumn = function getPrimaryKeyColumn(Model) {
  var pk = Model.getMeta('primarykey');
  if (pk) {
    return pk;
  }
  var name = this.getTableName(Model);
  return this.schema.primary_keys[name.toUpperCase()];
};