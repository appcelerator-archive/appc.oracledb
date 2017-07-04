"use strict";

/**
 * Fetches the columns from the table based on the specified payload.
 * @param table
 * @param payload
 * @returns {*}
 */
exports.fetchColumns = function fetchColumns(payload) {
  return Object.keys(payload);
};