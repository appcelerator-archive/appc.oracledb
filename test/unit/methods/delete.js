'use strinct'

const tap = require('tap')
const test = tap.test
const deleteMethod = require('../../../lib/methods/delete').delete
const sinon = require('sinon')
const server = require('../../server')

var arrow
var connector
const sandbox = sinon.sandbox
var Model

tap.beforeEach((done) => {
  sandbox.create()
  done()
})

tap.afterEach((done) => {
  sandbox.restore()
  done()
})

test('### Start Arrow ###', function (t) {
  server()
    .then((inst) => {
      arrow = inst
      connector = arrow.getConnector('appc.oracledb')
      Model = arrow.getModel('Posts')
      t.ok(arrow, 'Arrow has been started')
      t.end()
    })
    .catch((err) => {
      t.threw(err)
    })
})

test('### delete method - no primary key ###', function (t) {
  // Stubs and spies
  const cbSpy = sandbox.spy()
  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })
  const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
    return null
  })

  // Execution
  deleteMethod.call(connector, Model, 'instance', cbSpy)
  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledWith(Model))
  t.ok(cbSpy.calledOnce)

  t.end()
})

test('### delete method - _query no result ###', function (t) {
  // Data
  const data = {
    id: 40,
    books: [],
    content: 'content',
    title: 'title'
  }
  const instance = Model.instance(data, true)
  instance.setPrimaryKey(data.id)

  // Stubs and spies
  const cbSpy = sandbox.spy()
  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })
  const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
    return 'id'
  })
  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, options, callback, executor) => {
    executor()
  })

  // Execution
  deleteMethod.call(connector, Model, instance, cbSpy)
  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledWith(Model))
  t.ok(_queryStub.calledOnce)
  t.equals(_queryStub.firstCall.args.length, 4)
  t.deepequal(_queryStub.firstCall.args[1], { id: 40 })
  t.equals(_queryStub.firstCall.args[2], cbSpy)
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith())

  t.end()
})

test('### delete method - _query with result ###', function (t) {
  // Data
  const result = {
    rowsAffected: 1
  }
  const data = {
    id: 40,
    books: [],
    content: 'content',
    title: 'title'
  }
  const instance = Model.instance(data, true)
  instance.setPrimaryKey(data.id)

  // Stubs and spies
  const cbSpy = sandbox.spy()
  const getTableNameStub = sandbox.stub(connector, 'getTableName').callsFake((Model) => {
    return 'Posts'
  })
  const getPrimaryKeyColumnStub = sandbox.stub(connector, 'getPrimaryKeyColumn').callsFake((Model) => {
    return 'id'
  })

  const _queryStub = sandbox.stub(connector, '_query').callsFake((query, options, callback, executor) => {
    executor('rows', result)
  })

  // Execution
  deleteMethod.call(connector, Model, instance, cbSpy)
  t.ok(getTableNameStub.calledOnce)
  t.ok(getTableNameStub.calledWith(Model))
  t.ok(getPrimaryKeyColumnStub.calledOnce)
  t.ok(getPrimaryKeyColumnStub.calledWith(Model))
  t.ok(_queryStub.calledOnce)
  t.equals(_queryStub.firstCall.args.length, 4)
  t.deepequal(_queryStub.firstCall.args[1], { id: 40 })
  t.equals(_queryStub.firstCall.args[2], cbSpy)
  t.ok(cbSpy.calledOnce)
  t.ok(cbSpy.calledWith(null, instance))
  t.end()
})

test('### Stop Arrow ###', function (t) {
  arrow.stop(function () {
    t.pass('Arrow has been stopped!')
    t.end()
  })
})
