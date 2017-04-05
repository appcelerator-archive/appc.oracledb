var Arrow = require('arrow')

/**
 * Finds a model instance using the primary key.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {string} id ID of the model to find.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the found model.
 */
exports.findByID = function (Model, id, callback) {
  var self = this
  var table = this.getTableName(Model)
  var primaryKeyColumn = this.getPrimaryKeyColumn(Model)
  var keys = Model.payloadKeys()
  var query = 'SELECT ' +
  (primaryKeyColumn && keys.indexOf(primaryKeyColumn.toUpperCase()) === -1 ? primaryKeyColumn + ', ' : '') + this.escapeKeys(keys).join(', ') +
  ' FROM ' + table + ' WHERE ROWNUM <= 1 AND "' + primaryKeyColumn + '" = :id'
  if (!primaryKeyColumn) {
    return callback(new Arrow.ORMError('can\'t find primary key column for ' + table))
  }
  this._query(query, {id: id}, callback, function (rows) {
    if (rows && rows.length) {
      callback(null, self.getInstanceFromRow(Model, rows[0]))
    } else {
      callback()
    }
  })
}
