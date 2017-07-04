'use strict';

/**
 * Returns the appropriate placeholder for variadic arguments.
 */
exports.returnPlaceholder = function (columnName, index, array) {
  return ':' + columnName;
};