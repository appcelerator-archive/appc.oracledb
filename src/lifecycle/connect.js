'use strict';

var OracleDB = require('oracledb');

/**
 * Connects to your data store; this connection can later be used by your connector's methods.
 * @param next
 */
exports.connect = function (next) {
  var self = this;
  OracleDB.getConnection(this.config, function (err, connection) {
    if (err) {
      next(err);
    } else {
      self.connection = connection;
      next();
    }
  });
};