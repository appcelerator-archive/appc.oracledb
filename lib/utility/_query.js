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
		pool = this.pool,
		logger = this.logger;

	logger.trace('ORACLE QUERY=>', query, data);
	this.getConnection(function (err, connection) {
		if (err) { return callback(err); }
		connection.execute(query, data || [], function (err, results) {
			if (pool) {
				try {
					logger.trace('connection released back to the pool');
					connection.release();
				}
				catch (E) { }
			}
			if (err) {
				callback(err);
			} else {
				executor(self.translateResults(results));
			}
		});
	});
};
