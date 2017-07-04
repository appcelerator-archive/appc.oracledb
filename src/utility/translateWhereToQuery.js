'use strict';

/**
 * Translates a "where" object in to the relevant portion of a SQL Query.
 * @param where
 * @param values
 * @returns {string}
 */
exports.translateWhereToQuery = function (where, values) {
  var whereQuery = '';
  for (var key in where) {
    if (where.hasOwnProperty(key) && where[key] !== undefined) {
      whereQuery += whereQuery === '' ? ' WHERE' : ' AND';
      whereQuery += ' "' + strip(key).toUpperCase() + '"';
      if (where[key] && where[key].$like) {
        whereQuery += ' LIKE';
        values[strip(key)] = where[key].$like;
      } else {
        whereQuery += ' =';
        values[strip(key)] = where[key];
      }
      whereQuery += ' :' + strip(key);
    }
  }
  return whereQuery;
};

/**
 * Removes non-alphanumeric characters from a column name.
 * @param key
 * @returns {string}
 */
function strip(key) {
  return String(key).replace(/[^a-z0-9_]/ig, '');
}