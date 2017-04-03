'use strinct'

const tap = require('tap')
const test = tap.test
const deleteAllMethod = require('../../../lib/methods/deleteAll').deleteAll
const sinon = require('sinon')
const server = require('../../server')

var arrow
var connector
const sandbox = sinon.sandbox
var Model

tap.beforeEach((done) => {
  sandbox.create()
  done()
})

tap.afterEach((done) => {
  sandbox.restore()
  done()
})

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      arrow = inst
      connector = arrow.getConnector('appc.oracledb')
      Model = arrow.getModel('Posts')
      t.ok(arrow, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('### deleteAll method - no results ###', function (t) {
  //Stubs and spies
  const cbSpy = sandbox.spy()
  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })
  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, callback, executor) => {
    executor()
  })

  //Execution
  deleteAllMethod.call(connector, Model, cbSpy)
  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.equals(_queryStub.firstCall.args.length, 3)
  t.equals(_queryStub.firstCall.args[0], 'DELETE FROM Posts')
  t.equals(_queryStub.firstCall.args[1], cbSpy)
  t.ok(cbSpy.calledOnce)
  t.equals(cbSpy.firstCall.args[0], null)
  t.equals(cbSpy.firstCall.args[1], 0)

  t.end()
})

test('### deleteAll method - with results ###', function (t) {
  //Data
  const result = {
    rowsAffected: 1
  }
  //Stubs and spies
  const cbSpy = sandbox.spy()
  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })
  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, callback, executor) => {
    executor('rows', result)
  })

  //Execution
  deleteAllMethod.call(connector, Model, cbSpy)
  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.equals(_queryStub.firstCall.args.length, 3)
  t.equals(_queryStub.firstCall.args[0], 'DELETE FROM Posts')
  t.equals(_queryStub.firstCall.args[1], cbSpy)
  t.ok(cbSpy.calledOnce)
  t.equals(cbSpy.firstCall.args[0], null)
  t.equals(cbSpy.firstCall.args[1], result.rowsAffected)

  t.end()
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
