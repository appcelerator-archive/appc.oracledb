/**
 * Executes a query against the database.
 * @param query
 * @param data
 * @param callback
 * @param executor
 * @private
 */
exports._query = function _query(query, data, callback, executor) {
	if (arguments.length < 4) {
		executor = callback;
		callback = data;
		data = null;
	}
	var self = this,
		logger = this.logger;

	logger.trace('ORACLE QUERY=>', query, data);
	//console.log(query);
	this.getConnection(function (err, connection) {
		if (err) { return callback(err); }
		connection.execute(query, data || [], function (err, results) {
			if (err) {
				callback(err);
			} else {
				executor(self.translateResults(results), results);
			}
		});
	});
};
