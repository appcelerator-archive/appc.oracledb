'use strict'

const sinon = require('sinon')
const findAll = require('../../../lib/methods/findAll').findAll
const tap = require('tap')
const test = tap.test
const server = require('../../server')

var arrow
var connector
var Model
const sandbox = sinon.sandbox

tap.beforeEach((done) => {
  sandbox.create()
  done()
})

tap.afterEach((done) => {
  sandbox.restore()
  done()
})

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      arrow = inst
      connector = arrow.getConnector('appc.oracledb')
      Model = arrow.getModel('Posts')
      t.ok(arrow, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('## findAll unit test - _query no results ###', function (t) {
  // Data
  const query = 'SELECT id, "TITLE", "CONTENT", "BOOKS" FROM Posts ORDER BY id'

  // Stubs and spies
  const cbSpy = sandbox.spy()
  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })
  const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
    return 'id'
  })
  const escapeKeysStub = sandbox.stub(connector, 'escapeKeys').callsFake((keys) => {
    return ['"TITLE"', '"CONTENT"', '"BOOKS"']
  })
  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, options, callback, executor) => {
    executor()
  })

  // Execution
  findAll.call(connector, Model, cbSpy)
  t.ok(getTableNameStub.calledOnce)
  t.equals(getTableNameStub.firstCall.args[0], Model)
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.equals(getPrimaryKeyColumnStub.firstCall.args[0], Model)
  t.ok(escapeKeysStub.calledOnce)
  t.deepequal(escapeKeysStub.firstCall.args[0], ["title", "content", "books"])
  t.ok(_queryStub.calledOnce)
  t.equals(_queryStub.firstCall.args.length, 4)
  t.equals(_queryStub.firstCall.args[0], query)
  t.deepequal(_queryStub.firstCall.args[1], { useResultSet: true })
  t.equals(_queryStub.firstCall.args[2], cbSpy)
  t.type(_queryStub.firstCall.args[3], 'function')
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith())

  t.end()
})

test('## findAll unit test - _query with results ###', function (t) {
  // Data
  const rows = ['']
  const instance = Model.instance(rows, true)
  const query = 'SELECT id, "TITLE", "CONTENT", "BOOKS" FROM Posts ORDER BY id'

  // Stubs and spies
  const cbSpy = sandbox.spy()
  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })
  const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
    return 'id'
  })
  const escapeKeysStub = sandbox.stub(connector, 'escapeKeys').callsFake((keys) => {
    return ['"TITLE"', '"CONTENT"', '"BOOKS"']
  })
  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, options, callback, executor) => {
    executor(rows)
  })
  const getInstanceFromRowStub = sandbox.stub(connector, 'getInstanceFromRow').callsFake(() => {
    return instance
  })

  // Execution
  findAll.call(connector, Model, cbSpy)
  t.ok(getTableNameStub.calledOnce)
  t.equals(getTableNameStub.firstCall.args[0], Model)
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.equals(getPrimaryKeyColumnStub.firstCall.args[0], Model)
  t.ok(escapeKeysStub.calledOnce)
  t.deepequal(escapeKeysStub.firstCall.args[0], ["title", "content", "books"])
  t.ok(cbSpy.calledOnce)
  t.equals(cbSpy.firstCall.args[0], null)
  t.deepequal(cbSpy.firstCall.args[1], [instance])
  t.ok(_queryStub.calledOnce)
  t.equals(_queryStub.firstCall.args[0], query)
  t.deepequal(_queryStub.firstCall.args[1], { useResultSet: true })
  t.equals(_queryStub.firstCall.args[2], cbSpy)
  t.type(_queryStub.firstCall.args[3], 'function')

  t.end()
})

test('## findAll unit test - no primary key ###', function (t) {
  // Data
  const rows = ['']
  const instance = Model.instance(rows, true)
  const query = 'SELECT "TITLE", "CONTENT", "BOOKS" FROM Posts'

  // Stubs and spies
  const cbSpy = sandbox.spy()
  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })
  const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
    return null
  })
  const escapeKeysStub = sandbox.stub(connector, 'escapeKeys').callsFake((keys) => {
    return ['"TITLE"', '"CONTENT"', '"BOOKS"']
  })
  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, options, callback, executor) => {
    executor(rows)
  })
  const getInstanceFromRowStub = sandbox.stub(connector, 'getInstanceFromRow').callsFake(() => {
    return instance
  })

  // Execution
  findAll.call(connector, Model, cbSpy)
  t.ok(getTableNameStub.calledOnce)
  t.equals(getTableNameStub.firstCall.args[0], Model)
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.equals(getPrimaryKeyColumnStub.firstCall.args[0], Model)
  t.ok(escapeKeysStub.calledOnce)
  t.deepequal(escapeKeysStub.firstCall.args[0], ["title", "content", "books"])
  t.ok(_queryStub.calledOnce)
  t.equals(_queryStub.firstCall.args[0], query)
  t.deepequal(_queryStub.firstCall.args[1], { useResultSet: true })
  t.equals(_queryStub.firstCall.args[2], cbSpy)
  t.type(_queryStub.firstCall.args[3], 'function')
  t.ok(cbSpy.calledOnce)
  t.equals(cbSpy.firstCall.args[0], null)
  t.deepequal(cbSpy.firstCall.args[1], [instance])

  t.end()
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
