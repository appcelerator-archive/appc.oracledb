var _ = require('lodash');
/**
 * Executes a query against the database which returns all the rows with no limit count.
 * @param query
 * @param data
 * @param callback
 * @param executor
 * @private
 */
exports._query = function _query(query, data, options, callback, executor) {
	if (arguments.length === 4) {
		executor = callback;
		callback = options;

		// Checks if data contains options
		if (data && data.useResultSet) {
			options = data;
			data = null;
		}
	} else if (arguments.length < 4) {
		if (_.isFunction(data)) {
			executor = options;
			callback = data;
			data = null;
			options = null;
		} else {
			callback = options;
			options = null;
		}
	}

	var self = this,
		queryOptions = {},
		logger = this.logger,
		prefetchRows = 1000,
		maxRows = 1000;

	if (options && options.useResultSet) {
		// Use resultSet if 'useResultSet' option is set
		queryOptions.resultSet = true;
		queryOptions.prefetchRows = prefetchRows;
	} else {
		// Set max rows limit
		queryOptions.maxRows = maxRows;
	}

	logger.trace('ORACLE QUERY=>', query, data);

	this.getConnection(function (err, connection) {
		if (err) {
			return callback(err);
		}

		/**
		 * Row prefetching allows multiple rows to be returned from Oracle Database to Node.js in each
		 * network round-trip. We can control how many rows are prefetched via the prefetchRows property
		 * of either the base driver class or the options object passed to the execute method of a connection.
		 */
		connection.execute(query, data || [], queryOptions, function (err, results) {
			if (err) {
				return callback(err);
			}

			/**
			 * When rows are returned from the database they are queued in an internal buffer.
			 * We can retrieve those rows by invoking either the getRow or getRows methods of the ResultSet class.
			 */
			function fetchRowsFromResultSet() {
				results.resultSet.getRows(prefetchRows, function (err, rows) {
					if (err) {
						results.resultSet.close();
						return callback(err);
					}

					if (rows.length) {
						results.rows = results.rows ? results.rows.concat(rows) : [].concat(rows);

						fetchRowsFromResultSet(); //try to get more rows from the result set

						return; //exit recursive function prior to closing result set
					}

					// Returns the result after all rows being received.
					results.resultSet.close(function (err) {
						if (err) {
							return callback(err);
						} else {
							executor(self.translateResults(results), results);
						}
					});
				});
			}

			// Get another set of rows if 'useResultSet' option is set
			if (options && options.useResultSet) {
				fetchRowsFromResultSet();
			} else {
				// Otherwise returns the results from the query
				executor(self.translateResults(results), results);
			}
		});
	});
};
