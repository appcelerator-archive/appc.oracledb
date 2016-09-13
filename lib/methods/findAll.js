var Arrow = require('arrow');

/**
 * Finds all model instances.  A maximum of 1000 models are returned.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the models.
 */
exports.findAll = function (Model, callback) {
	var self = this,
		table = this.getTableName(Model),
		primaryKeyColumn = this.getPrimaryKeyColumn(Model);

	var keys = Model.payloadKeys();
	var query = 'SELECT ' +
		(primaryKeyColumn && keys.indexOf(primaryKeyColumn) === -1 ? primaryKeyColumn + ', ' : '') + this.escapeKeys(keys).join(', ') +
		' FROM ' + table +
		(primaryKeyColumn ? ' ORDER BY ' + primaryKeyColumn : '');

	this._query(query, {useResultSet: true}, callback, function (results) {
		if (results && results.length) {
			var rows = results.map(function (row) {
				return self.getInstanceFromRow(Model, row);
			});
			callback(null, new Arrow.Collection(Model, rows));
		} else {
			callback();
		}
	});
};
