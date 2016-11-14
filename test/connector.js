// jscs:disable jsDoc
var should = require('should'),
	async = require('async'),
	_ = require('lodash'),
	base = require('./_base'),
	Arrow = base.Arrow,
	server = base.server,
	connector = base.connector,
	model = require('./capabilities/model.js').model,
	noPkModel = require('./capabilities/model.js').noPkModel;

// Set model's connector
model.setConnector(connector);
noPkModel.setConnector(connector);

describe('Connector', function () {

	it('should require a minimum version of Arrow', function () {
		var mockConnector = {
			Capabilities: {},
			extend: function () {}
		};

		should(function () {
			require('../lib/index').create({
				Connector: mockConnector
			});
		}).throw();
		should(function () {
			require('../lib/index').create({
				Version: '1.2.0',
				Connector: mockConnector
			});
		}).throw();
		should(function () {
			require('../lib/index').create({
				Version: '1.7.0',
				Connector: mockConnector
			});
		}).not.throw();
	});

	it('should getTableSchema', function () {
		var results = connector.getTableSchema('TEST_POST');
		should(results).be.ok;
		should(Object.keys(results).length).be.ok;
	});

	it('should handle connection errors in query', function (next) {
		var _getConnection = connector.getConnection;
		try {
			connector.getConnection = function (cb) {
				cb(new Error('test error'));
			};
			connector._query('SELECT 1', null, function (err) {
				should(err).be.ok;
				next();
			}, null);
		}
		finally {
			connector.getConnection = _getConnection;
		}
	});

	it('should handle connection execution errors in query', function (next) {
		var _getConnection = connector.getConnection;
		try {
			connector.getConnection = function (cb) {
				cb(null, {
					execute: function (query, data, options, cb) {
						cb(new Error('test error'));
					}
				});
			};
			connector._query('SELECT 1', null, function (err) {
				should(err).be.ok;
				next();
			}, null);
		}
		finally {
			connector.getConnection = _getConnection;
		}
	});

	it('should getPrimaryKeyColumn', function () {
		should(connector.getPrimaryKeyColumn({
			getMeta: function () {
				return 'test-pk';
			}
		})).eql('test-pk');
	});

	it('should getTableName', function () {
		should(connector.getTableName({
			_parent: {
				name: 'test-name'
			},
			getMeta: function () {
				return false;
			}
		})).eql('test-name');

		should(connector.getTableName({
			getMeta: function () {
				return false;
			},
			_supermodel: 'test-name'
		})).eql('test-name');

		should(connector.getTableName({
			getMeta: function () {
				return false;
			},
			name: 'test-name'
		})).eql('test-name');

	});

	it('should translateWhereToQuery', function () {

		should(connector.translateWhereToQuery({
			foo: 'bar',
			baz: undefined
		}, {})).eql(' WHERE "FOO" = :foo');

		should(connector.translateWhereToQuery({
			foo: 'bar',
			baz: 'quz'
		}, {})).eql(' WHERE "FOO" = :foo AND "BAZ" = :baz');

		should(connector.translateWhereToQuery({
			foo: {$like: 'bar'}
		}, {})).eql(' WHERE "FOO" LIKE :foo');

	});

	it('should return the number of rows', function (done) {
		connector.create(model, {
			title: 'Nolan',
			content: 'Wright'
		}, function (err) {
			should(err).be.ok;

			connector.count(model, null, function (err, result) {
				should(err).be.ok;
				should(result).equal(1);
				done();
			});
		});
	});

	it('should return undefined when looking for missing record', function (done) {
		connector.findByID(model, -1, function (err, instance) {
			should(err).be.ok;
			should(instance).be.undefined;
			done();
		});
	});

	it('should execute query with useResultSet', function (done) {
		var _getConnection = connector.getConnection;
		try {
			connector.getConnection = function (cb) {
				cb(new Error('test error'));
			};
			connector._query('SELECT 1', {}, {
				useResultSet: true
			}, function (err) {
				should(err).be.ok;
				done();
			}, null);
		}
		finally {
			connector.getConnection = _getConnection;
		}
	});

	it('should getTableSchema', function () {
		var results = connector.getTableSchema('TEST_CATEGORY');
		should(results).be.ok;
		should(Object.keys(results).length).be.ok;
	});

	it('should not return instance when try to delete instance twice', function (done) {
		connector.create(model, {
			title: 'Nolan',
			content: 'Wright'
		}, function (err, instance) {
			should(err).be.ok;

			instance.delete(function (err, result) {
				should(err).be.ok;
				should(result).be.an.Object;

				connector.delete(model, instance, function (err, result) {
					should(err).be.ok;
					should(result).be.undefined;
					done();
				});
			});
		});
	});

	it('should throw error when create instance on model with no primaryKey', function (done) {
		connector.create(noPkModel, {
			category: 'Sports'
		}, function (err) {
			should(err).not.be.ok;
			done();
		});
	});

	it('should should throw error when delete model with no primaryKey', function (done) {
		connector.deleteAll(noPkModel, function (err) {
			should(err).not.be.ok;
			done();
		});
	});

	it('should should throw error when find model with no primaryKey', function (done) {
		connector.findByID(noPkModel, -1, function (err) {
			should(err).not.be.ok;
			done();
		});
	});

});
