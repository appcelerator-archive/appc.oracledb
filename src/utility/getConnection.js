"use strict";

/**
 * Gets a connection to the server.
 * @param callback
 */
exports.getConnection = function getConnection(callback) {
  callback(null, this.connection);
};