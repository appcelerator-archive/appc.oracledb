var Arrow = require('arrow');

/**
 * Updates a Model instance.
 * @param {Arrow.Model} Model The model class being updated.
 * @param {Arrow.Instance} instance Model instance to update.
 * @param {Function} callback Callback passed an Error object (or null if successful) and the updated model.
 */
exports.save = function (Model, instance, callback) {
	var table = this.getTableName(Model),
		payload = instance.toPayload(),
		primaryKeyColumn = this.getPrimaryKeyColumn(Model),
		columns = this.fetchColumns(payload),
		placeholders = columns.map(function (name) { return '"' + name.toUpperCase() + '" = :' + name; }),
		query = 'UPDATE "' + table.toUpperCase() + '" SET ' + placeholders.join(',') + ' WHERE "' + primaryKeyColumn + '" = :id';
	if (!primaryKeyColumn) {
		return callback(new Arrow.ORMError('can\'t find primary key column for ' + table));
	}
	payload.id = instance.getPrimaryKey();

	this._query(query, payload, callback, function (rows, result) {
		if (result && result.rowsAffected) {
			callback(null, instance);
		} else {
			callback();
		}
	});
};
