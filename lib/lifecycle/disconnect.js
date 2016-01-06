/**
 * Disconnects from your data store.
 * @param next
 */
exports.disconnect = function (next) {
	var self = this;
	self.connection = null;
	next();
};
