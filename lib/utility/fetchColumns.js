var _ = require('lodash');

/**
 * Fetches the columns from the table based on the specified payload.
 * @param table
 * @param payload
 * @returns {*}
 */
exports.fetchColumns = function fetchColumns(table, payload) {
	return Object.keys(payload);
};
