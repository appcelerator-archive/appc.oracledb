// jscs:disable jsDoc
var _ = require('lodash');

var goodConfig = require('../../conf/default').connectors['appc.oracledb'];

exports.connect = {
	goodConfig: goodConfig,
	badConfigs: [
		_.defaults({connectString: '192.168.0.256'}, goodConfig),
		_.defaults({password: 'a-bad-password'}, goodConfig)
	]
};
